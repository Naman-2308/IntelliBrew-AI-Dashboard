from flask import Blueprint, jsonify, request

from app import db
from app.models.alert_settings import get_alert_settings
from app.utils.low_stock_alerts import notify_low_stock_if_needed
from app.utils.whatsapp_client import (
    detect_provider,
    provider_is_configured,
    send_whatsapp_message,
)

settings_bp = Blueprint("settings", __name__, url_prefix="/settings")


def _alerts_payload():
    s = get_alert_settings()
    name = detect_provider()
    return {
        **s.to_dict(),
        "provider_configured": provider_is_configured(),
        "provider_name": name,
    }


@settings_bp.route("/alerts", methods=["GET"])
def get_alerts():
    return jsonify(_alerts_payload())


@settings_bp.route("/alerts", methods=["PUT"])
def put_alerts():
    data = request.get_json(silent=True) or {}
    s = get_alert_settings()
    if "enabled" in data:
        s.enabled = bool(data["enabled"])
    if "phone_number" in data:
        s.phone_number = str(data["phone_number"] or "").strip()[:40]
    db.session.add(s)
    db.session.commit()
    return jsonify(_alerts_payload())


@settings_bp.route("/alerts/evaluate", methods=["POST"])
def post_evaluate_alerts():
    result = notify_low_stock_if_needed()
    return jsonify(result)


@settings_bp.route("/alerts/test", methods=["POST"])
def post_test_alert():
    """
    One-off test message; does not use cooldown and does not update last_alert_at.
    """
    s = get_alert_settings()
    if not s.enabled:
        return jsonify({"ok": False, "error": "alerts_disabled"}), 400
    phone = (s.phone_number or "").strip()
    if not phone:
        return jsonify({"ok": False, "error": "no_phone"}), 400
    if not provider_is_configured():
        return jsonify({"ok": False, "error": "no_provider"}), 400
    res = send_whatsapp_message(
        phone,
        "TeaBiz: test notification — your WhatsApp alerts are configured correctly.",
    )
    return jsonify(res)
