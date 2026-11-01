import os
import sys
import tempfile
from pathlib import Path

# Keep API imports away from the real application database.
os.environ["CELEBRAI_DB_FILE"] = os.path.join(
    tempfile.gettempdir(),
    f"celebrai_api_import_{os.getpid()}.db"
)

BACKEND_DIR = str(Path(__file__).resolve().parents[1])
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from fastapi.testclient import TestClient
import main as api_main

client = TestClient(api_main.app)


def test_health_endpoint():
    response = client.get("/api/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "CelebrAI Backend"
    assert "ai_providers" in data


def test_missing_event_returns_404(monkeypatch):
    monkeypatch.setattr(
        api_main.db,
        "get_event",
        lambda event_id: None
    )

    response = client.get("/api/events/missing-event")

    assert response.status_code == 404
    assert response.json()["detail"] == "Event not found"


def test_create_and_retrieve_event(monkeypatch):
    stored_events = {}

    def fake_save_event(event):
        event = dict(event)
        event["id"] = event.get("id", "api-event-001")
        stored_events[event["id"]] = event
        return event

    def fake_get_event(event_id):
        return stored_events.get(event_id)

    monkeypatch.setattr(api_main.db, "save_event", fake_save_event)
    monkeypatch.setattr(api_main.db, "get_event", fake_get_event)

    event = {
        "title": "API Test Birthday",
        "event_type": "Birthday",
        "guest_count": 20,
        "total_budget": 15000,
        "location": "Hyderabad",
        "event_date": "2026-12-15"
    }

    create_response = client.post("/api/events", json=event)

    assert create_response.status_code == 200
    created = create_response.json()
    assert created["id"] == "api-event-001"

    get_response = client.get("/api/events/api-event-001")

    assert get_response.status_code == 200
    assert get_response.json()["title"] == "API Test Birthday"


def test_invalid_event_generation_returns_422():
    response = client.post(
        "/api/events/generate",
        json={
            "event_type": "Birthday",
            "guest_count": 0
        }
    )

    assert response.status_code == 422


def test_invalid_expense_creation_returns_422():
    response = client.post(
        "/api/expenses",
        json={
            "event_id": "event-001",
            "item_name": "Decoration",
            "allocated_amount": 1000,
            "actual_amount": 500
        }
    )

    assert response.status_code == 422


def test_invalid_guest_creation_returns_422():
    response = client.post(
        "/api/guests",
        json={
            "event_id": "event-001",
            "email": "guest@example.com"
        }
    )

    assert response.status_code == 422


def test_missing_expense_returns_404(monkeypatch):
    monkeypatch.setattr(
        api_main.db,
        "update_expense",
        lambda expense_id, updates: None
    )

    response = client.put(
        "/api/expenses/missing-expense",
        json={"actual_amount": 500}
    )

    assert response.status_code == 404


def test_missing_guest_returns_404(monkeypatch):
    monkeypatch.setattr(
        api_main.db,
        "update_guest",
        lambda guest_id, updates: None
    )

    response = client.put(
        "/api/guests/missing-guest",
        json={"rsvp_status": "Confirmed"}
    )

    assert response.status_code == 404



def test_ai_error_does_not_expose_internal_details(monkeypatch, caplog):
    secret_error = "INTERNAL_API_KEY_FAILURE_12345"

    def failing_chat(req):
        raise RuntimeError(secret_error)

    monkeypatch.setattr(api_main.ai, "handle_ai_chat", failing_chat)

    with caplog.at_level("ERROR"):
        response = client.post(
            "/api/ai/chat",
            json={"message": "Help me plan my birthday"}
        )

    assert response.status_code == 500
    assert secret_error not in response.text
    assert "temporarily unavailable" in response.text
    assert secret_error in caplog.text



def test_expense_update_rejects_unknown_fields():
    response = client.put(
        "/api/expenses/expense-001",
        json={"allocated_amount": 500, "event_id": "another-event"}
    )
    assert response.status_code == 422


def test_expense_update_rejects_negative_amount():
    response = client.put(
        "/api/expenses/expense-001",
        json={"actual_amount": -500}
    )
    assert response.status_code == 422


def test_guest_update_rejects_invalid_rsvp_status():
    response = client.put(
        "/api/guests/guest-001",
        json={"rsvp_status": "Maybe"}
    )
    assert response.status_code == 422


def test_guest_partial_update_preserves_only_supplied_fields(monkeypatch):
    captured = {}

    def fake_update_guest(guest_id, updates):
        captured["id"] = guest_id
        captured["updates"] = updates
        return {"id": guest_id, **updates}

    monkeypatch.setattr(api_main.db, "update_guest", fake_update_guest)

    response = client.put(
        "/api/guests/guest-001",
        json={"rsvp_status": "Confirmed"}
    )

    assert response.status_code == 200
    assert captured["id"] == "guest-001"
    assert captured["updates"] == {"rsvp_status": "Confirmed"}
