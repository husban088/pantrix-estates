"""Pantrix Estates - Python valuation service (port 8001)."""
from flask import Flask, jsonify, request

app = Flask(__name__)

CITY_RATE = {"dubai": 420, "london": 520, "islamabad": 150, "lahore": 120, "karachi": 110}
CATEGORY_FACTOR = {"penthouse": 1.5, "villa": 1.25, "apartment": 1.0, "house": 1.0, "commercial": 1.1, "land": 0.6}


def num(name, default=0.0):
    try:
        return float(request.args.get(name, default))
    except (TypeError, ValueError):
        return float(default)


@app.after_request
def cors(resp):
    resp.headers["Access-Control-Allow-Origin"] = "*"
    return resp


@app.get("/health")
def health():
    return jsonify(ok=True, service="python-valuation")


@app.get("/mortgage")
def mortgage():
    price, down, rate, years = num("price"), num("down"), num("rate", 6), max(num("years", 20), 1)
    principal = max(price - down, 0)
    r, n = rate / 100 / 12, int(years * 12)
    monthly = principal / n if r == 0 else principal * r * (1 + r) ** n / ((1 + r) ** n - 1)
    return jsonify(
        monthly=round(monthly),
        principal=round(principal),
        totalPaid=round(monthly * n),
        totalInterest=round(monthly * n - principal),
    )


@app.get("/estimate")
def estimate():
    city = request.args.get("city", "").lower()
    category = request.args.get("category", "house").lower()
    sqft, beds = num("sqft"), min(num("beds"), 8)
    per_sqft = CITY_RATE.get(city, 140) * CATEGORY_FACTOR.get(category, 1.0)
    value = per_sqft * sqft * (1 + beds * 0.02)
    return jsonify(
        estimate=round(value),
        low=round(value * 0.92),
        high=round(value * 1.08),
        perSqft=round(per_sqft),
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001)
