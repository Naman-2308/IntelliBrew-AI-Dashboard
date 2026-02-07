from flask import Blueprint, request, jsonify
from app import db
from app.models.product import Product
from app.models.sale import Sale
from datetime import datetime

sales_bp = Blueprint("sales", __name__, url_prefix="/sales")


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
        created_at=datetime.utcnow()
    )

    product.stock_kg -= quantity

    db.session.add(sale)
    db.session.commit()

    return jsonify(sale.to_dict()), 201


# -------------------------------
# 2️⃣ SALES HISTORY (GET)
# -------------------------------
@sales_bp.route("/", methods=["GET"])
def get_sales():
    sales = (
        Sale.query
        .order_by(Sale.created_at.desc())
        .all()
    )

    result = []
    for s in sales:
        result.append({
            "id": s.id,
            "product": s.product.name,
            "quantity_kg": s.quantity_kg,
            "total_price": s.total_price,
            "created_at": s.created_at.strftime("%Y-%m-%d %H:%M")
        })

    return jsonify(result)

