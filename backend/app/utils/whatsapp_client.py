"""
WhatsApp outbound: Twilio → Meta Cloud → webhook → CallMeBot (env-based).

Stdlib only (urllib). See env list at bottom of this file.
"""

from __future__ import annotations

import base64
import json
import logging
import os
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Literal, Optional

logger = logging.getLogger(__name__)

ProviderName = Literal["twilio", "meta_cloud", "webhook", "callmebot"]


def _twilio_ready() -> bool:
    print("TWILIO_ACCOUNT_SID:", os.environ.get("TWILIO_ACCOUNT_SID"))
    print("TWILIO_AUTH_TOKEN:", os.environ.get("TWILIO_AUTH_TOKEN"))
    print("TWILIO_WHATSAPP_FROM:", os.environ.get("TWILIO_WHATSAPP_FROM"))

    return bool(
        os.environ.get("TWILIO_ACCOUNT_SID", "").strip()
        and os.environ.get("TWILIO_AUTH_TOKEN", "").strip()
        and os.environ.get("TWILIO_WHATSAPP_FROM", "").strip()
    )

def _meta_cloud_ready() -> bool:
    return bool(
        os.environ.get("WHATSAPP_CLOUD_TOKEN", "").strip()
        and os.environ.get("WHATSAPP_CLOUD_PHONE_NUMBER_ID", "").strip()
    )


def _webhook_ready() -> bool:
    return bool(os.environ.get("WHATSAPP_WEBHOOK_URL", "").strip())


def _callmebot_ready() -> bool:
    return bool(os.environ.get("CALLMEBOT_APIKEY", "").strip())


def detect_provider() -> Optional[ProviderName]:
    """
    First matching provider by priority:
    1. Twilio  2. Meta Cloud  3. webhook  4. CallMeBot
    """
    if _twilio_ready():
        return "twilio"
    if _meta_cloud_ready():
        return "meta_cloud"
    if _webhook_ready():
        return "webhook"
    if _callmebot_ready():
        return "callmebot"
    return None


def provider_is_configured() -> bool:
    return detect_provider() is not None


def _digits_phone(phone: str) -> str:
    return "".join(c for c in (phone or "") if c.isdigit())


def send_whatsapp_message(phone_number: str, message: str) -> dict[str, Any]:
    """
    Send one text message. Returns:
    { ok: bool, provider?: str, error?: str, detail?: str }
    """
    phone_number = (phone_number or "").strip()
    message = (message or "").strip()
    if not phone_number:
        return {"ok": False, "error": "missing_phone", "detail": "No recipient phone number."}
    if not message:
        return {"ok": False, "error": "missing_message", "detail": "Empty message."}

    name = detect_provider()
    if name is None:
        return {
            "ok": False,
            "error": "no_provider",
            "detail": "No WhatsApp provider configured in server environment.",
        }

    if name == "twilio":
        return _send_twilio(phone_number, message)
    if name == "meta_cloud":
        return _send_meta_cloud(phone_number, message)
    if name == "webhook":
        return _send_webhook(phone_number, message)
    return _send_callmebot(phone_number, message)


def _send_callmebot(to_phone: str, message: str) -> dict[str, Any]:
    apikey = os.environ["CALLMEBOT_APIKEY"].strip()
    phone_digits = _digits_phone(to_phone)
    if not phone_digits:
        return {"ok": False, "provider": "callmebot", "error": "invalid_phone", "detail": to_phone}
    q = urllib.parse.urlencode(
        {"phone": phone_digits, "text": message, "apikey": apikey},
        quote_via=urllib.parse.quote,
    )
    url = f"https://api.callmebot.com/whatsapp.php?{q}"
    try:
        with urllib.request.urlopen(url, timeout=20) as resp:
            status = resp.status
            raw = resp.read().decode("utf-8", errors="replace")
        upper = raw.upper()
        ok = status == 200 and "ERROR" not in upper and "NOT SENT" not in upper
        if not ok:
            logger.warning("CallMeBot response: %s", raw[:500])
        return {
            "ok": ok,
            "provider": "callmebot",
            "detail": raw[:200] if raw else None,
        }
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")[:300]
        logger.exception("CallMeBot HTTP error")
        return {"ok": False, "provider": "callmebot", "error": "http_error", "detail": body}
    except Exception as e:
        logger.exception("CallMeBot request failed")
        return {"ok": False, "provider": "callmebot", "error": "request_failed", "detail": str(e)}


def _send_twilio(to_phone: str, message: str) -> dict[str, Any]:
    sid = os.environ["TWILIO_ACCOUNT_SID"].strip()
    token = os.environ["TWILIO_AUTH_TOKEN"].strip()
    from_wa = os.environ["TWILIO_WHATSAPP_FROM"].strip()
    if to_phone.strip().lower().startswith("whatsapp:"):
        dest = to_phone.strip()
    else:
        d = _digits_phone(to_phone)
        dest = f"whatsapp:+{d}" if d else ""
    if not dest:
        return {"ok": False, "provider": "twilio", "error": "invalid_phone", "detail": to_phone}
    url = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"
    body = urllib.parse.urlencode(
        {"From": from_wa, "To": dest, "Body": message}
    ).encode()
    req = urllib.request.Request(url, data=body, method="POST")
    auth = base64.b64encode(f"{sid}:{token}".encode()).decode()
    req.add_header("Authorization", f"Basic {auth}")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
        data = json.loads(raw) if raw else {}
        err = data.get("message") or data.get("error_message")
        ok = resp.status == 201 and not err
        return {"ok": ok, "provider": "twilio", "detail": err or data.get("sid")}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")[:400]
        return {"ok": False, "provider": "twilio", "error": "http_error", "detail": body}
    except Exception as e:
        logger.exception("Twilio request failed")
        return {"ok": False, "provider": "twilio", "error": "request_failed", "detail": str(e)}


def _send_meta_cloud(to_phone: str, message: str) -> dict[str, Any]:
    token = os.environ["WHATSAPP_CLOUD_TOKEN"].strip()
    pnid = os.environ["WHATSAPP_CLOUD_PHONE_NUMBER_ID"].strip()
    digits = _digits_phone(to_phone)
    url = f"https://graph.facebook.com/v21.0/{pnid}/messages"
    payload = {
        "messaging_product": "whatsapp",
        "to": digits,
        "type": "text",
        "text": {"preview_url": False, "body": message},
    }
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
        j = json.loads(raw) if raw else {}
        ok = resp.status == 200 and "error" not in j
        return {"ok": ok, "provider": "meta_cloud", "detail": raw[:200]}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")[:400]
        return {"ok": False, "provider": "meta_cloud", "error": "http_error", "detail": body}
    except Exception as e:
        logger.exception("Meta Cloud request failed")
        return {"ok": False, "provider": "meta_cloud", "error": "request_failed", "detail": str(e)}


def _send_webhook(to_phone: str, message: str) -> dict[str, Any]:
    hook = os.environ["WHATSAPP_WEBHOOK_URL"].strip()
    payload = json.dumps({"to": to_phone, "message": message}).encode()
    req = urllib.request.Request(hook, data=payload, method="POST")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
        ok = 200 <= resp.status < 300
        return {"ok": ok, "provider": "webhook", "detail": raw[:200] if raw else str(resp.status)}
    except Exception as e:
        logger.exception("Webhook request failed")
        return {"ok": False, "provider": "webhook", "error": "request_failed", "detail": str(e)}


# --- Environment variables (set on server) ---
# Twilio:     TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
# Meta:       WHATSAPP_CLOUD_TOKEN, WHATSAPP_CLOUD_PHONE_NUMBER_ID
# Webhook:    WHATSAPP_WEBHOOK_URL  (POST JSON {"to","message"})
# CallMeBot:  CALLMEBOT_APIKEY
