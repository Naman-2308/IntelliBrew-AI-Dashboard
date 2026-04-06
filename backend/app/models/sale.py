from app import db
from datetime import datetime

class Sale(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("product.id"),
        nullable=False
    )

    quantity_kg = db.Column(db.Float, nullable=False)
    total_price = db.Column(db.Float, nullable=False)

    # ✅ REQUIRED FOR ANALYTICS & AI
    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    product = db.relationship("Product")

    def to_dict(self):
        cost_per_kg = 0.0
        if self.product is not None:
            cost_per_kg = self.product.cost_per_kg or 0.0
        profit = self.total_price - (cost_per_kg * self.quantity_kg)
        return {
            "id": self.id,
            "product_id": self.product_id,
            "quantity_kg": self.quantity_kg,
            "total_price": self.total_price,
            "profit": round(profit, 2),
            "created_at": self.created_at.isoformat(),
        }

