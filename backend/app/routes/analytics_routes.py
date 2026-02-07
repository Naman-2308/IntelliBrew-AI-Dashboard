from flask import Blueprint, jsonify
from datetime import datetime, timedelta
from app import db
from sqlalchemy import func
from app.models.sale import Sale
from app.models.product import Product

analytics_bp = Blueprint("analytics", __name__, url_prefix="/analytics")


# -------------------------------
# TOTAL REVENUE
# -------------------------------
@analytics_bp.route("/revenue", methods=["GET"])
def total_revenue():
    total = db.session.query(db.func.sum(Sale.total_price)).scalar()
    return jsonify({"total_revenue": total or 0})

@analytics_bp.route("/last-7-days", methods=["GET"])
def last_7_days_sales():
    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    results = (
        db.session.query(
            func.date(Sale.created_at).label("date"),
            func.sum(Sale.total_price).label("total")
        )
        .filter(Sale.created_at >= seven_days_ago)
        .group_by(func.date(Sale.created_at))
        .order_by(func.date(Sale.created_at))
        .all()
    )

    return jsonify([
        {
            "date": str(r.date),
            "total": float(r.total)
        }
        for r in results
    ])




# -------------------------------
# AI DEMAND PREDICTION (7 DAYS)
# -------------------------------
@analytics_bp.route("/demand", methods=["GET"])
def demand_prediction():
    days = 7
    since = datetime.utcnow() - timedelta(days=days)

    response = []

    products = Product.query.all()

    for product in products:
        sales = (
            Sale.query
            .filter(Sale.product_id == product.id)
            .filter(Sale.created_at >= since)
            .all()
        )

        total_sold = sum(s.quantity_kg for s in sales)
        avg_daily_sale = round(total_sold / days, 2)
        predicted_demand = round(avg_daily_sale * 7, 2)

        status = "SAFE"
        if product.stock_kg <= predicted_demand:
            status = "REORDER"
        elif product.stock_kg <= predicted_demand * 1.5:
            status = "LOW"

        response.append({
            "product": product.name,
            "avg_daily_sale": avg_daily_sale,
            "predicted_7_day_demand": predicted_demand,
            "current_stock": product.stock_kg,
            "status": status
        })

    return jsonify(response)

