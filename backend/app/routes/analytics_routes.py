import math
from collections import defaultdict
from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from app import db
from sqlalchemy import func
from sqlalchemy.orm import joinedload
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
            func.sum(Sale.total_price).label("total"),
        )
        .filter(Sale.created_at >= seven_days_ago)
        .group_by(func.date(Sale.created_at))
        .order_by(func.date(Sale.created_at))
        .all()
    )

    return jsonify(
        [
            {
                "date": str(r.date),
                "total": float(r.total),
            }
            for r in results
        ]
    )


def _daterange_days(days: int):
    days = max(1, min(int(days), 365))
    end = datetime.utcnow().date()
    start = end - timedelta(days=days - 1)
    return days, start, end


def _build_daily_series(start, end, daily_rev, daily_prof):
    out = []
    d = start
    while d <= end:
        key = d.isoformat()
        out.append(
            {
                "date": key,
                "revenue": round(daily_rev.get(key, 0.0), 2),
                "profit": round(daily_prof.get(key, 0.0), 2),
            }
        )
        d += timedelta(days=1)
    return out


# -------------------------------
# PROFIT + PERIOD ANALYTICS
# -------------------------------
@analytics_bp.route("/profit-summary", methods=["GET"])
def profit_summary():
    raw_days = request.args.get("days", "7")
    try:
        days = int(raw_days)
    except ValueError:
        days = 7

    days, start, end = _daterange_days(days)
    since = datetime.combine(start, datetime.min.time())

    sales = (
        Sale.query.options(joinedload(Sale.product))
        .filter(Sale.created_at >= since)
        .order_by(Sale.created_at)
        .all()
    )

    daily_rev = defaultdict(float)
    daily_prof = defaultdict(float)
    total_rev = 0.0
    total_prof = 0.0

    for s in sales:
        cpk = (s.product.cost_per_kg or 0.0) if s.product else 0.0
        profit = s.total_price - cpk * s.quantity_kg
        dkey = s.created_at.date().isoformat()
        daily_rev[dkey] += s.total_price
        daily_prof[dkey] += profit
        total_rev += s.total_price
        total_prof += profit

    return jsonify(
        {
            "days": days,
            "total_revenue": round(total_rev, 2),
            "total_profit": round(total_prof, 2),
            "daily": _build_daily_series(start, end, daily_rev, daily_prof),
        }
    )


# -------------------------------
# AI DEMAND PREDICTION (7 DAYS)
# -------------------------------
@analytics_bp.route("/demand", methods=["GET"])
def demand_prediction():
    window_days = 7
    since = datetime.utcnow() - timedelta(days=window_days)

    response = []

    products = Product.query.all()

    for product in products:
        sales = (
            Sale.query.filter(Sale.product_id == product.id)
            .filter(Sale.created_at >= since)
            .order_by(Sale.created_at)
            .all()
        )

        total_sold = sum(s.quantity_kg for s in sales)
        avg_daily_sale = round(total_sold / window_days, 2)
        predicted_demand = round(avg_daily_sale * 7, 2)

        status = "SAFE"
        if product.stock_kg <= predicted_demand:
            status = "REORDER"
        elif product.stock_kg <= predicted_demand * 1.5:
            status = "LOW"

        if avg_daily_sale > 0:
            days_until_stockout = int(math.ceil(product.stock_kg / avg_daily_sale))
        else:
            days_until_stockout = None

        # Demand trend: first half of window vs second half (by calendar day buckets)
        by_day = defaultdict(float)
        for s in sales:
            by_day[s.created_at.date().isoformat()] += s.quantity_kg
        sorted_days = sorted(by_day.keys())
        if len(sorted_days) >= 2:
            mid = len(sorted_days) // 2
            first = sum(by_day[d] for d in sorted_days[:mid])
            second = sum(by_day[d] for d in sorted_days[mid:])
            if second > first * 1.15:
                demand_trend = "increasing"
            elif second < first * 0.85:
                demand_trend = "decreasing"
            else:
                demand_trend = "stable"
        else:
            demand_trend = "stable"

        if status == "REORDER" and days_until_stockout is not None:
            insight = f"Stock will run out in {days_until_stockout} days"
        elif status == "LOW" and days_until_stockout is not None:
            insight = f"Low coverage — about {days_until_stockout} days of stock at current pace"
        elif demand_trend == "increasing" and status == "SAFE":
            insight = "Demand increasing — monitor stock"
        elif status == "SAFE":
            insight = "Safe stock level"
        else:
            insight = "Review reorder timing"

        response.append(
            {
                "product": product.name,
                "avg_daily_sale": avg_daily_sale,
                "predicted_7_day_demand": predicted_demand,
                "current_stock": product.stock_kg,
                "days_until_stockout": days_until_stockout,
                "demand_trend": demand_trend,
                "status": status,
                "insight": insight,
            }
        )

    return jsonify(response)


