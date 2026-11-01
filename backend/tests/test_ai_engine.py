import sys
from pathlib import Path

import pytest

# Make backend modules importable when pytest runs from the project root.
BACKEND_DIR = str(Path(__file__).resolve().parents[1])
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from ai_engine import (
    _extract_json_object,
    parse_freeform_prompt,
    optimize_budget,
    handle_ai_chat,
    generate_last_minute_rescue,
)

from models import (
    BudgetItem,
    BudgetOptimizationRequest,
    EventChatRequest,
    LastMinuteRequest,
)


def test_extract_valid_json():
    result = _extract_json_object('{"event": "Birthday", "guests": 30}')
    assert result["event"] == "Birthday"
    assert result["guests"] == 30


def test_extract_json_from_markdown_fence():
    response = '```json\n{"event": "Wedding"}\n```'
    result = _extract_json_object(response)
    assert result["event"] == "Wedding"


def test_extract_json_with_surrounding_text():
    response = 'Here is the plan: {"budget": 25000} Hope you like it!'
    result = _extract_json_object(response)
    assert result["budget"] == 25000


def test_extract_json_rejects_empty_response():
    with pytest.raises(ValueError):
        _extract_json_object("   ")


def test_extract_json_rejects_array():
    with pytest.raises(ValueError, match="must be an object"):
        _extract_json_object('[{"event": "Birthday"}]')


def test_parse_freeform_prompt():
    result = parse_freeform_prompt(
        "Plan a birthday for 45 guests with a budget of INR 50k, "
        "lavender theme in Hyderabad"
    )

    assert result["event_type"] == "Birthday"
    assert result["guest_count"] == 45
    assert result["budget"] == 50000
    assert result["theme"] == "Lavender & Violet Chic"
    assert result["location"] == "Hyderabad"


def test_parse_freeform_prompt_uses_defaults():
    result = parse_freeform_prompt("Please plan a celebration")

    assert result["event_type"] == "Celebration"
    assert result["guest_count"] == 30
    assert result["budget"] == 15000.0


def test_optimize_budget_transfers_between_categories():
    request = BudgetOptimizationRequest(
        current_budget=10000,
        current_allocations=[
            BudgetItem(
                category="Decorations",
                allocated_amount=3000,
                percentage=30,
                notes=""
            ),
            BudgetItem(
                category="Food",
                allocated_amount=5000,
                percentage=50,
                notes=""
            ),
        ],
        user_instruction=(
            "Reduce decorations by 1000 and increase food by 1000"
        )
    )

    result = optimize_budget(request)
    allocations = {
        item.category: item.allocated_amount
        for item in result.updated_allocations
    }

    assert allocations["Decorations"] == 2000
    assert allocations["Food"] == 6000
    assert sum(allocations.values()) == 8000


def test_optimize_budget_does_not_make_allocation_negative():
    request = BudgetOptimizationRequest(
        current_budget=10000,
        current_allocations=[
            BudgetItem(
                category="Decorations",
                allocated_amount=500,
                percentage=5,
                notes=""
            ),
            BudgetItem(
                category="Food",
                allocated_amount=4500,
                percentage=45,
                notes=""
            ),
        ],
        user_instruction=(
            "Reduce decorations by 1000 and increase food by 1000"
        )
    )

    result = optimize_budget(request)
    allocations = {
        item.category: item.allocated_amount
        for item in result.updated_allocations
    }

    assert allocations["Decorations"] >= 0
    assert allocations["Decorations"] == 0
    assert allocations["Food"] == 5000


def test_chat_updates_budget_and_allocations():
    request = EventChatRequest(
        message="Change budget to 20000",
        event_context={
            "title": "Birthday",
            "total_budget": 10000,
            "guest_count": 30,
            "location": "Hyderabad",
            "budget_breakdown": [
                {
                    "category": "Food",
                    "allocated_amount": 4000,
                    "percentage": 40,
                    "notes": ""
                },
                {
                    "category": "Decorations",
                    "allocated_amount": 6000,
                    "percentage": 60,
                    "notes": ""
                }
            ]
        }
    )

    result = handle_ai_chat(request)

    assert result.updated_event_patch["total_budget"] == 20000
    assert result.updated_event_patch["budget_breakdown"][0]["allocated_amount"] == 8000


def test_chat_updates_guest_count():
    request = EventChatRequest(
        message="Update guests to 50",
        event_context={"guest_count": 30}
    )

    result = handle_ai_chat(request)

    assert result.updated_event_patch["guest_count"] == 50
    assert result.suggested_actions


def test_chat_updates_location():
    request = EventChatRequest(
        message="Change location to Hyderabad",
        event_context={}
    )

    result = handle_ai_chat(request)

    assert result.updated_event_patch["location"] == "Hyderabad"


def test_chat_returns_helpful_default_response():
    request = EventChatRequest(
        message="Hello",
        event_context={
            "title": "My Birthday",
            "total_budget": 15000,
            "guest_count": 25,
            "location": "Hyderabad"
        }
    )

    result = handle_ai_chat(request)

    assert result.response
    assert result.updated_event_patch is None
    assert len(result.suggested_actions) > 0


@pytest.mark.parametrize(
    "hours",
    [5, 18, 48]
)
def test_last_minute_plan_supports_different_time_limits(hours):
    request = LastMinuteRequest(
        event_type="Birthday",
        hours_left=hours,
        guest_count=40,
        budget=12000,
        location="Hyderabad"
    )

    result = generate_last_minute_rescue(request)

    assert result.time_remaining_hours == hours
    assert len(result.essential_tasks) > 0
    assert len(result.emergency_timeline) > 0
    assert len(result.immediate_purchases) > 0
    assert result.summary


def test_last_minute_plan_clamps_invalid_low_values():
    request = LastMinuteRequest(
        event_type="Birthday",
        hours_left=0,
        guest_count=0,
        budget=0
    )

    result = generate_last_minute_rescue(request)

    assert result.time_remaining_hours == 1
    assert "1 guests" in result.summary
    assert "1,000" in result.summary
import ai_engine
from models import EventGenerateRequest


def test_groq_success_does_not_call_grok(monkeypatch):
    monkeypatch.setattr(ai_engine, "_call_groq", lambda prompt: '{"title": "Groq Plan"}')
    monkeypatch.setattr(
        ai_engine, "_call_grok",
        lambda prompt: pytest.fail("Grok should not be called")
    )
    monkeypatch.setattr(ai_engine, "EventPlan", lambda **data: data)

    result = ai_engine.generate_event_plan(
        EventGenerateRequest(event_type="Birthday")
    )

    assert result["title"] == "Groq Plan"
    assert result["event_type"] == "Birthday"


def test_groq_failure_uses_grok(monkeypatch):
    monkeypatch.setattr(
        ai_engine, "_call_groq",
        lambda prompt: (_ for _ in ()).throw(RuntimeError("Groq unavailable"))
    )
    monkeypatch.setattr(
        ai_engine, "_call_grok",
        lambda prompt: '{"title": "Grok Plan"}'
    )
    monkeypatch.setattr(ai_engine, "EventPlan", lambda **data: data)

    result = ai_engine.generate_event_plan(
        EventGenerateRequest(event_type="Wedding")
    )

    assert result["title"] == "Grok Plan"
    assert result["event_type"] == "Wedding"


def test_both_providers_failing_uses_offline_fallback(monkeypatch):
    fallback_result = {"title": "Offline Plan"}

    monkeypatch.setattr(
        ai_engine, "_call_groq",
        lambda prompt: (_ for _ in ()).throw(RuntimeError("Groq unavailable"))
    )
    monkeypatch.setattr(
        ai_engine, "_call_grok",
        lambda prompt: (_ for _ in ()).throw(RuntimeError("Grok unavailable"))
    )
    monkeypatch.setattr(
        ai_engine, "build_heuristic_event_plan",
        lambda req: fallback_result
    )

    result = ai_engine.generate_event_plan(
        EventGenerateRequest(event_type="Birthday")
    )

    assert result == fallback_result


def test_invalid_groq_json_tries_grok(monkeypatch):
    monkeypatch.setattr(ai_engine, "_call_groq", lambda prompt: "not valid JSON")
    monkeypatch.setattr(
        ai_engine, "_call_grok",
        lambda prompt: '{"title": "Recovered Grok Plan"}'
    )
    monkeypatch.setattr(ai_engine, "EventPlan", lambda **data: data)

    result = ai_engine.generate_event_plan(
        EventGenerateRequest(event_type="Anniversary")
    )

    assert result["title"] == "Recovered Grok Plan"


def test_missing_provider_keys_are_handled(monkeypatch):
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    monkeypatch.delenv("XAI_API_KEY", raising=False)
    monkeypatch.delenv("GROK_API_KEY", raising=False)

    with pytest.raises(RuntimeError, match="GROQ_API_KEY"):
        ai_engine._call_groq("test prompt")

    with pytest.raises(RuntimeError, match="not configured"):
        ai_engine._call_grok("test prompt")


@pytest.mark.parametrize(
    ("prompt", "expected"),
    [
        ("Plan a non-vegetarian birthday", "Continental & Indian grill with custom beverage pairing"),
        ("Plan a non veg wedding", "Continental & Indian grill with custom beverage pairing"),
        ("Plan a vegan birthday", "Plant-based vegan gourmet cuisine and fresh fruit bar"),
        ("Plan a vegetarian wedding", "Pure Vegetarian gourmet treats, artisanal finger foods & mocktails"),
    ],
)
def test_food_preference_parsing(prompt, expected):
    result = parse_freeform_prompt(prompt)
    assert result["food"] == expected


def test_budget_transfer_uses_smaller_requested_amount():
    request = BudgetOptimizationRequest(
        current_budget=10000,
        current_allocations=[
            BudgetItem(category="Decorations", allocated_amount=3000, percentage=30),
            BudgetItem(category="Food", allocated_amount=5000, percentage=50),
        ],
        user_instruction="Reduce decorations by 1000 and increase food by 500",
    )

    result = optimize_budget(request)
    allocations = {item.category: item.allocated_amount for item in result.updated_allocations}

    assert allocations["Decorations"] == 2500
    assert allocations["Food"] == 5500
    assert sum(allocations.values()) == 8000


def test_budget_transfer_does_not_transfer_to_same_category():
    request = BudgetOptimizationRequest(
        current_budget=10000,
        current_allocations=[
            BudgetItem(category="Decorations", allocated_amount=3000, percentage=30),
            BudgetItem(category="Food", allocated_amount=5000, percentage=50),
        ],
        user_instruction="Reduce decorations by 1000 and increase decorations by 1000",
    )

    result = optimize_budget(request)
    allocations = {item.category: item.allocated_amount for item in result.updated_allocations}

    assert allocations["Decorations"] == 3000
    assert allocations["Food"] == 5000
    assert "same budget category" in result.explanation


def test_unknown_budget_category_does_not_claim_transfer():
    request = BudgetOptimizationRequest(
        current_budget=10000,
        current_allocations=[
            BudgetItem(category="Decorations", allocated_amount=3000, percentage=30),
            BudgetItem(category="Food", allocated_amount=5000, percentage=50),
        ],
        user_instruction="Reduce unknowncategory by 1000 and increase food by 1000",
    )

    result = optimize_budget(request)
    allocations = {item.category: item.allocated_amount for item in result.updated_allocations}

    assert allocations["Decorations"] == 3000
    assert allocations["Food"] == 5000
    assert "No transfer was made" in result.explanation

