from flask import Blueprint, request, jsonify
from sqlalchemy.orm import joinedload
from app import db
from app.models.product import Product
from app.models.sale import Sale
from datetime import datetime

from app.utils.low_stock_alerts import notify_low_stock_if_needed

sales_bp = Blueprint("sales", __name__, url_prefix="/sales")


def _sale_profit(total_price: float, quantity_kg: float, cost_per_kg: float | None) -> float:
    cpk = cost_per_kg or 0.0
    return round(total_price - cpk * quantity_kg, 2)


# -------------------------------
# 1️⃣ RECORD A SALE (POST)
# -------------------------------
@sales_bp.route("/", methods=["POST"])
def record_sale():
    data = request.get_json()

    product_id = data.get("product_id")
    quantity = float(data.get("quantity_kg", 0))

    if quantity <= 0:
        return jsonify({"error": "Invalid quantity"}), 400

    product = Product.query.get(product_id)

    if not product:
        return jsonify({"error": "Product not found"}), 404

    if product.stock_kg < quantity:
        return jsonify({"error": "Insufficient stock"}), 400

    total_price = quantity * product.price_per_kg

    sale = Sale(
        product_id=product.id,
        quantity_kg=quantity,
        total_price=total_price,
        created_at=datetime.utcnow(),
    )

    product.stock_kg -= quantity

    db.session.add(sale)
    db.session.commit()

    db.session.refresh(sale)
    payload = {
        "id": sale.id,
        "product": product.name,
        "quantity_kg": sale.quantity_kg,
        "total_price": sale.total_price,
        "profit": _sale_profit(sale.total_price, sale.quantity_kg, product.cost_per_kg),
        "created_at": sale.created_at.strftime("%Y-%m-%d %H:%M"),
    }
    try:
        notify_low_stock_if_needed()
    except Exception:
        pass
    return jsonify(payload), 201


# -------------------------------
# 2️⃣ SALES HISTORY (GET)
# -------------------------------
@sales_bp.route("/", methods=["GET"])
def get_sales():
    sales = (
        Sale.query.options(joinedload(Sale.product))
        .order_by(Sale.created_at.desc())
        .all()
    )

    result = []
    for s in sales:
        cpk = s.product.cost_per_kg if s.product else 0.0
        result.append(
            {
                "id": s.id,
                "product": s.product.name,
                "quantity_kg": s.quantity_kg,
                "total_price": s.total_price,
                "profit": _sale_profit(s.total_price, s.quantity_kg, cpk),
                "created_at": s.created_at.strftime("%Y-%m-%d %H:%M"),
            }
        )

    return jsonify(result)
