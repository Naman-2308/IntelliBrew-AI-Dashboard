from flask import Blueprint, request, jsonify
from app import db
from app.models.product import Product

products_bp = Blueprint("products", __name__, url_prefix="/products")

@products_bp.route("/", methods=["GET"])
def get_products():
    products = Product.query.all()
    return jsonify([p.to_dict() for p in products])

@products_bp.route("/", methods=["POST"])
def add_product():
    data = request.json

    product = Product(
        name=data["name"],
        category=data["category"],
        price_per_kg=float(data["price_per_kg"]),
        cost_per_kg=float(data.get("cost_per_kg") or 0),
        stock_kg=float(data["stock_kg"]),
    )

    db.session.add(product)
    db.session.commit()

    return jsonify(product.to_dict()), 201

