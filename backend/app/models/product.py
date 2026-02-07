from app import db

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    category = db.Column(db.String(50))
    price_per_kg = db.Column(db.Float)
    stock_kg = db.Column(db.Float)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "price_per_kg": self.price_per_kg,
            "cost_per_kg" = db.Column(db.Float),
            "stock_kg": self.stock_kg,
            "low_stock": self.stock_kg < 50  
        }
