from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="GastoTrack AI Service", version="1.0.0")

# ── CORS Configuration ────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://localhost:3000",
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Pydantic Models ──────────────────────────────────────────────────────────
class TransactionData(BaseModel):
    merchant: str
    amount: float
    category: str
    date: datetime
    notes: Optional[str] = None


class AnalyzeRequest(BaseModel):
    """Analyze spending patterns"""
    transactions: List[TransactionData]
    budgets: Optional[dict] = None


class PredictionRequest(BaseModel):
    """Predict next month's spending"""
    spending_history: List[float]
    months_back: int = 3


class RecommendationRequest(BaseModel):
    """Get AI recommendations"""
    total_spent: float
    category_breakdown: dict
    income: float


# ── AI Analysis Functions ────────────────────────────────────────────────────
def analyze_spending_patterns(transactions: List[TransactionData]) -> dict:
    """Analyze spending patterns from transaction data"""
    if not transactions:
        return {"error": "No transactions provided"}
    
    categories = {}
    total = 0
    
    for tx in transactions:
        cat = tx.category.lower()
        categories[cat] = categories.get(cat, 0) + tx.amount
        total += tx.amount
    
    # Calculate percentage breakdown
    breakdown = {
        cat: round((amount / total * 100), 2) 
        for cat, amount in categories.items()
    }
    
    # Find highest spending category
    highest = max(categories.items(), key=lambda x: x[1]) if categories else None
    
    return {
        "total_spent": round(total, 2),
        "categories": categories,
        "percentage_breakdown": breakdown,
        "highest_category": highest[0] if highest else None,
        "highest_amount": round(highest[1], 2) if highest else 0,
    }


def predict_next_month(spending_history: List[float], months_back: int = 3) -> dict:
    """Predict next month's spending using simple averaging"""
    if not spending_history or len(spending_history) < months_back:
        return {"error": "Insufficient data for prediction"}
    
    recent = spending_history[-months_back:]
    average = sum(recent) / len(recent)
    
    # Calculate trend (simple linear trend)
    if len(recent) > 1:
        trend = (recent[-1] - recent[0]) / (len(recent) - 1)
    else:
        trend = 0
    
    predicted = average + trend
    
    return {
        "predicted_spending": round(max(predicted, 0), 2),
        "average_spending": round(average, 2),
        "trend": round(trend, 2),
        "confidence": "medium" if len(recent) >= 3 else "low",
    }


def get_recommendations(total_spent: float, category_breakdown: dict, income: float) -> List[str]:
    """Generate AI-powered financial recommendations"""
    recommendations = []
    
    # Check spending to income ratio
    if income > 0:
        ratio = (total_spent / income) * 100
        if ratio > 80:
            recommendations.append("⚠️ You're spending more than 80% of your income. Consider reducing expenses.")
        elif ratio > 60:
            recommendations.append("💡 Your spending is at 60% of income. Try to increase savings.")
        else:
            recommendations.append("✅ Good spending to income ratio. Keep it up!")
    
    # Check for high categories
    if category_breakdown:
        for category, amount in category_breakdown.items():
            if total_spent > 0:
                pct = (amount / total_spent) * 100
                if pct > 40:
                    recommendations.append(f"📊 {category.title()} is {pct:.0f}% of your spending. Consider budgeting this category.")
                elif pct > 30:
                    recommendations.append(f"💰 {category.title()} represents {pct:.0f}% of spending. Monitor this closely.")
    
    # General recommendations
    if total_spent == 0:
        recommendations.append("📝 Start tracking your expenses to get personalized insights.")
    else:
        recommendations.append("🎯 Set category budgets to better manage your finances.")
        recommendations.append("📱 Review your transactions regularly to identify savings opportunities.")
    
    return recommendations


# ── Routes ───────────────────────────────────────────────────────────────────
@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "GastoTrack AI Service",
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/analyze")
def analyze_spending(request: AnalyzeRequest):
    """Analyze spending patterns"""
    try:
        analysis = analyze_spending_patterns(request.transactions)
        return {
            "success": True,
            "data": analysis,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error analyzing spending: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict")
def predict_spending(request: PredictionRequest):
    """Predict next month's spending"""
    try:
        prediction = predict_next_month(
            request.spending_history,
            request.months_back,
        )
        return {
            "success": True,
            "data": prediction,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error predicting spending: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommendations")
def get_ai_recommendations(request: RecommendationRequest):
    """Get AI-powered financial recommendations"""
    try:
        recommendations = get_recommendations(
            request.total_spent,
            request.category_breakdown,
            request.income,
        )
        return {
            "success": True,
            "recommendations": recommendations,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/categorize")
def categorize_transaction(merchant: str):
    """Suggest category for a transaction based on merchant name"""
    # Simple merchant-to-category mapping
    merchant_categories = {
        "mcdonald": "food",
        "starbucks": "food",
        "jollibee": "food",
        "grab": "transport",
        "uber": "transport",
        "gogo": "transport",
        "netflix": "entertainment",
        "spotify": "entertainment",
        "lazada": "shopping",
        "shopee": "shopping",
        "mercury": "utilities",
        "meralco": "utilities",
        "water": "utilities",
        "gym": "health",
        "pharmacy": "health",
        "hospital": "health",
    }
    
    merchant_lower = merchant.lower()
    
    for keyword, category in merchant_categories.items():
        if keyword in merchant_lower:
            return {
                "merchant": merchant,
                "suggested_category": category,
                "confidence": "high" if keyword == merchant_lower else "medium",
            }
    
    return {
        "merchant": merchant,
        "suggested_category": "other",
        "confidence": "low",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
