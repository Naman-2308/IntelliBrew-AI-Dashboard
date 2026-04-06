from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import inspect, text
from config import Config

db = SQLAlchemy()


def _ensure_sqlite_product_cost_column():
    if "sqlite" not in str(db.engine.url).lower():
        return
    insp = inspect(db.engine)
    if not insp.has_table("product"):
        return
    cols = {c["name"] for c in insp.get_columns("product")}
    if "cost_per_kg" in cols:
        return
    with db.engine.begin() as conn:
        conn.execute(text("ALTER TABLE product ADD COLUMN cost_per_kg FLOAT DEFAULT 0"))


def _ensure_alert_settings_schema():
    """Rename legacy columns alerts_enabled / whatsapp_phone if present (SQLite)."""
    if "sqlite" not in str(db.engine.url).lower():
        return
    insp = inspect(db.engine)
    if not insp.has_table("alert_settings"):
        return
    cols = {c["name"] for c in insp.get_columns("alert_settings")}
    with db.engine.begin() as conn:
        if "alerts_enabled" in cols and "enabled" not in cols:
            conn.execute(
                text("ALTER TABLE alert_settings RENAME COLUMN alerts_enabled TO enabled")
            )
        if "whatsapp_phone" in cols and "phone_number" not in cols:
            conn.execute(
                text("ALTER TABLE alert_settings RENAME COLUMN whatsapp_phone TO phone_number")
            )


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)

    from app.routes.product_routes import products_bp
    from app.routes.sales_routes import sales_bp
    from app.routes.analytics_routes import analytics_bp
    from app.routes.settings_routes import settings_bp
    from app.models import alert_settings as _alert_settings_model  # noqa: F401

    app.register_blueprint(products_bp)
    app.register_blueprint(sales_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(settings_bp)

    with app.app_context():
        db.create_all()
        _ensure_sqlite_product_cost_column()
        _ensure_alert_settings_schema()

    return app

