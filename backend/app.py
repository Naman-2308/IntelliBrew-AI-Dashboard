from flask import send_from_directory
import os
from app import create_app, db

app = create_app()

with app.app_context():
    db.create_all()

@app.route("/")
def home():
    return {"message": "TeaBiz AI backend running"}


if __name__ == "__main__":
    app.run(debug=True)

