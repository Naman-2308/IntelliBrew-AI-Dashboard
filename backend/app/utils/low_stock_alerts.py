"""Low-stock WhatsApp alerts with cooldown."""

from __future__ import annotations

import os
from datetime import datetime

from app import db
from app.models.alert_settings import AlertSettings, get_alert_settings
from app.models.product import Product
from app.utils.whatsapp_client import provider_is_configured, send_whatsapp_message


def _cooldown_seconds() -> int:
    try:
        return max(300, int(os.environ.get("ALERT_COOLDOWN_SECONDS", "7200")))
    except ValueError:
        return 7200


def build_low_stock_message(products: list[Product]) -> str:
    lines = [
        "TeaBiz Alert:",
        "The following products are low in stock:",
    ]
    for p in products[:20]:
        lines.append(f"- {p.name}: {p.stock_kg} kg")
    if len(products) > 20:
        lines.append(f"- …and {len(products) - 20} more.")
    lines.append("Please reorder soon.")
    return "\n".join(lines)


def notify_low_stock_if_needed(*, force: bool = False) -> dict:
    """
    If enabled, phone set, low stock, provider OK, and cooldown OK — send WhatsApp
    and set last_alert_at on success.
    """
    settings: AlertSettings = get_alert_settings()
    if not settings.enabled:
        return {"sent": False, "reason": "alerts_disabled"}
    phone = (settings.phone_number or "").strip()
    if not phone:
        return {"sent": False, "reason": "no_phone"}

    low = Product.query.filter(Product.stock_kg < 50).order_by(Product.stock_kg).all()
    if not low:
        return {"sent": False, "reason": "no_low_stock"}

    if not provider_is_configured():
        return {"sent": False, "reason": "no_provider"}

    now = datetime.utcnow()
    if not force and settings.last_alert_at:
        delta = (now - settings.last_alert_at).total_seconds()
        cd = _cooldown_seconds()
        if delta < cd:
            return {
                "sent": False,
                "reason": "cooldown",
                "retry_after_seconds": int(cd - delta),
            }

    msg = build_low_stock_message(low)
    result = send_whatsapp_message(phone, msg)
    if result.get("ok"):
        settings.last_alert_at = now
        db.session.add(settings)
        db.session.commit()
    return {
        "sent": bool(result.get("ok")),
        "reason": "dispatched" if result.get("ok") else "send_failed",
        "provider": result.get("provider"),
        "detail": result.get("detail"),
        "error": result.get("error"),
        "low_stock_count": len(low),
    }
