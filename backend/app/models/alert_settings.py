from datetime import datetime

from app import db


class AlertSettings(db.Model):
    """Singleton row (id=1): WhatsApp low-stock alert preferences."""

    __tablename__ = "alert_settings"

    id = db.Column(db.Integer, primary_key=True)
    enabled = db.Column(db.Boolean, nullable=False, default=False)
    phone_number = db.Column(db.String(40), nullable=False, default="")
    last_alert_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "enabled": bool(self.enabled),
            "phone_number": self.phone_number or "",
            "last_alert_at": self.last_alert_at.isoformat() + "Z"
            if self.last_alert_at
            else None,
        }


def get_alert_settings() -> AlertSettings:
    row = db.session.get(AlertSettings, 1)
    if row is None:
        row = AlertSettings(id=1, enabled=False, phone_number="")
        db.session.add(row)
        db.session.commit()
    return row
