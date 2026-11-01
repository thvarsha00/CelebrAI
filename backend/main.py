
import os
from typing import List, Dict, Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

from models import (
    EventGenerateRequest,
    EventPlan,
    BudgetOptimizationRequest,
    BudgetOptimizationResponse,
    EventChatRequest,
    EventChatResponse,
    LastMinuteRequest,
    LastMinutePlan,
    Guest,
    Expense,
)

import database as db
import ai_engine as ai


# --------------------------------------------------
# FASTAPI APPLICATION
# --------------------------------------------------

app = FastAPI(
    title="CelebrAI API",
    description=(
        "Backend engine for CelebrAI - "
        "AI-Powered Celebration & Event Planning Platform"
    ),
    version="1.0.0",
)


# --------------------------------------------------
# CORS CONFIGURATION
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/api/health")
def health_check():
    groq_active = bool(os.getenv("GROQ_API_KEY"))

    grok_active = bool(
        os.getenv("XAI_API_KEY") or os.getenv("GROK_API_KEY")
    )

    return {
        "status": "healthy",
        "service": "CelebrAI Backend",
        "version": "1.0.0",
        "ai_providers": {
            "primary": "Groq",
            "fallback": "Grok",
            "groq_configured": groq_active,
            "grok_configured": grok_active,
            "offline_fallback": True,
        },
        "database": "SQLite (Supabase Ready)",
    }


# --------------------------------------------------
# EVENT MANAGEMENT ENDPOINTS
# --------------------------------------------------

@app.post("/api/events/generate", response_model=EventPlan)
def generate_event(req: EventGenerateRequest):
    """
    Generate a comprehensive 14-section event plan
    using the configured AI provider.
    """
    try:
        plan = ai.generate_event_plan(req)

        # Automatically persist generated event
        saved_plan = db.save_event(plan.model_dump())

        return saved_plan

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate event: {str(e)}",
        )


@app.get("/api/events", response_model=List[Dict[str, Any]])
def get_all_events():
    return db.list_events()


@app.post("/api/events")
def create_event(event: Dict[str, Any]):
    return db.save_event(event)


@app.get("/api/events/{event_id}")
def get_event_by_id(event_id: str):
    plan = db.get_event(event_id)

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Event not found",
        )

    return plan


@app.put("/api/events/{event_id}")
def update_event(event_id: str, updates: Dict[str, Any]):
    existing = db.get_event(event_id)

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Event not found",
        )

    existing.update(updates)
    existing["id"] = event_id

    return db.save_event(existing)


@app.delete("/api/events/{event_id}")
def delete_event(event_id: str):
    success = db.delete_event(event_id)

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Event not found",
        )

    return {"message": "Event deleted successfully"}


# --------------------------------------------------
# AI FEATURES
# --------------------------------------------------

@app.post("/api/ai/chat", response_model=EventChatResponse)
def chat_ai(req: EventChatRequest):
    try:
        return ai.handle_ai_chat(req)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI chat failed: {str(e)}",
        )


@app.post(
    "/api/ai/optimise-budget",
    response_model=BudgetOptimizationResponse,
)
def optimize_budget_endpoint(req: BudgetOptimizationRequest):
    try:
        return ai.optimize_budget(req)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Budget optimization failed: {str(e)}",
        )


@app.post(
    "/api/ai/last-minute-plan",
    response_model=LastMinutePlan,
)
def last_minute_plan_endpoint(req: LastMinuteRequest):
    try:
        return ai.generate_last_minute_rescue(req)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Last-minute planning failed: {str(e)}",
        )


# --------------------------------------------------
# EXPENSE MANAGEMENT
# --------------------------------------------------

@app.get("/api/expenses", response_model=List[Dict[str, Any]])
def get_expenses(event_id: str = Query(...)):
    return db.list_expenses(event_id)


@app.post("/api/expenses", response_model=Dict[str, Any])
def add_new_expense(expense: Expense):
    return db.add_expense(expense.model_dump())


@app.put("/api/expenses/{expense_id}")
def update_existing_expense(
    expense_id: str,
    updates: Dict[str, Any],
):
    result = db.update_expense(expense_id, updates)

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Expense not found",
        )

    return result


@app.delete("/api/expenses/{expense_id}")
def remove_expense(expense_id: str):
    success = db.delete_expense(expense_id)

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Expense not found",
        )

    return {"message": "Expense deleted"}


# --------------------------------------------------
# GUEST MANAGEMENT
# --------------------------------------------------

@app.get("/api/guests", response_model=List[Dict[str, Any]])
def get_guests(event_id: str = Query(...)):
    return db.list_guests(event_id)


@app.post("/api/guests", response_model=Dict[str, Any])
def add_new_guest(guest: Guest):
    return db.add_guest(guest.model_dump())


@app.put("/api/guests/{guest_id}")
def update_existing_guest(
    guest_id: str,
    updates: Dict[str, Any],
):
    result = db.update_guest(guest_id, updates)

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Guest not found",
        )

    return result


@app.delete("/api/guests/{guest_id}")
def remove_guest(guest_id: str):
    success = db.delete_guest(guest_id)

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Guest not found",
        )

    return {"message": "Guest deleted"}


# --------------------------------------------------
# APPLICATION ENTRY POINT
# --------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
