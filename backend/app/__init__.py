from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)

    from app.routes.product_routes import products_bp
    from app.routes.sales_routes import sales_bp
    from app.routes.analytics_routes import analytics_bp

    app.register_blueprint(products_bp)
    app.register_blueprint(sales_bp)
    app.register_blueprint(analytics_bp)

    return app

