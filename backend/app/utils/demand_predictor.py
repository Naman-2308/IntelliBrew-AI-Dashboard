def predict_demand(avg_daily_sales):
    if avg_daily_sales >= 20:
        return "High Demand"
    elif avg_daily_sales >= 10:
        return "Medium Demand"
    return "Low Demand"

