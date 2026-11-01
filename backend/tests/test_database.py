import os
import tempfile

# Ensure importing the database module never initializes the real app database.
os.environ["CELEBRAI_DB_FILE"] = os.path.join(
    tempfile.gettempdir(),
    f"celebrai_pytest_import_{os.getpid()}.db"
)

import pytest
from backend import database as db


@pytest.fixture(autouse=True)
def isolated_database(tmp_path, monkeypatch):
    """Give every test its own temporary SQLite database."""
    test_db = tmp_path / "test_celebrai.db"
    monkeypatch.setattr(db, "DB_FILE", str(test_db))
    db.init_db()
    yield


def sample_event():
    return {
        "id": "event-test-001",
        "title": "Test Birthday",
        "event_type": "Birthday",
        "guest_count": 25,
        "total_budget": 20000,
        "location": "Hyderabad",
        "event_date": "2026-12-15",
        "budget_breakdown": [
            {
                "category": "Food",
                "allocated_amount": 5000,
                "notes": "Dinner"
            }
        ],
        "event_schedule": [
            {
                "time": "06:00 PM",
                "activity": "Cake cutting",
                "description": "Birthday cake ceremony"
            }
        ]
    }


def test_save_get_and_list_event():
    event = sample_event()

    saved = db.save_event(event)

    assert saved["id"] == "event-test-001"
    assert db.get_event("event-test-001")["title"] == "Test Birthday"
    assert len(db.list_events()) == 1


def test_update_existing_event():
    db.save_event(sample_event())

    updated_event = sample_event()
    updated_event["title"] = "Updated Birthday"
    updated_event["total_budget"] = 25000

    db.save_event(updated_event)

    result = db.get_event("event-test-001")
    assert result["title"] == "Updated Birthday"
    assert result["total_budget"] == 25000
    assert len(db.list_events()) == 1


def test_event_deletion_removes_related_records():
    db.save_event(sample_event())

    db.add_guest({
        "event_id": "event-test-001",
        "name": "Test Guest"
    })

    db.add_expense({
        "event_id": "event-test-001",
        "category": "Decorations",
        "item_name": "Balloons",
        "allocated_amount": 1000,
        "actual_amount": 500
    })

    assert len(db.list_expenses("event-test-001")) == 2
    assert len(db.list_guests("event-test-001")) == 1

    assert db.delete_event("event-test-001") is True

    assert db.get_event("event-test-001") is None
    assert db.list_expenses("event-test-001") == []
    assert db.list_guests("event-test-001") == []

    with db.get_connection() as conn:
        task_count = conn.execute(
            "SELECT COUNT(*) FROM tasks WHERE event_id = ?",
            ("event-test-001",)
        ).fetchone()[0]

    assert task_count == 0


def test_deleting_nonexistent_event_returns_false():
    assert db.delete_event("does-not-exist") is False


def test_expense_create_update_and_delete():
    db.save_event(sample_event())

    expense = db.add_expense({
        "event_id": "event-test-001",
        "category": "Food",
        "item_name": "Dinner",
        "allocated_amount": 3000,
        "actual_amount": 2500,
        "paid": False
    })

    expense_id = expense["id"]

    updated = db.update_expense(expense_id, {
        "actual_amount": 2800,
        "paid": True
    })

    assert updated is not None
    assert updated["actual_amount"] == 2800
    assert updated["paid"] == 1

    assert db.delete_expense(expense_id) is True
    assert db.delete_expense(expense_id) is False


def test_guest_create_list_update_and_delete():
    db.save_event(sample_event())

    guest = db.add_guest({
        "event_id": "event-test-001",
        "name": "Test Guest",
        "email": "guest@example.com",
        "category": "Friends"
    })

    guest_id = guest["id"]

    guests = db.list_guests("event-test-001")
    assert len(guests) == 1
    assert guests[0]["name"] == "Test Guest"

    updated = db.update_guest(guest_id, {
        "name": "Updated Guest",
        "rsvp_status": "Confirmed"
    })

    assert updated is not None
    assert updated["name"] == "Updated Guest"
    assert updated["rsvp_status"] == "Confirmed"

    assert db.delete_guest(guest_id) is True
    assert db.delete_guest(guest_id) is False
    assert db.list_guests("event-test-001") == []

def test_expense_update_can_clear_nullable_notes():
    db.save_event(sample_event())

    expense = db.add_expense({
        "event_id": "event-test-001",
        "category": "Food",
        "item_name": "Dinner",
        "allocated_amount": 3000,
        "actual_amount": 2500,
        "notes": "Initial notes"
    })

    updated = db.update_expense(expense["id"], {"notes": None})

    assert updated is not None
    assert updated["notes"] is None
    assert updated["item_name"] == "Dinner"


def test_guest_update_can_clear_nullable_fields():
    db.save_event(sample_event())

    guest = db.add_guest({
        "event_id": "event-test-001",
        "name": "Test Guest",
        "email": "guest@example.com",
        "phone": "9876543210",
        "dietary_preferences": "Vegetarian"
    })

    updated = db.update_guest(guest["id"], {
        "email": None,
        "phone": None,
        "dietary_preferences": None
    })

    assert updated is not None
    assert updated["email"] is None
    assert updated["phone"] is None
    assert updated["dietary_preferences"] is None
    assert updated["name"] == "Test Guest"


def test_expense_partial_update_preserves_other_fields():
    db.save_event(sample_event())

    expense = db.add_expense({
        "event_id": "event-test-001",
        "category": "Food",
        "item_name": "Dinner",
        "allocated_amount": 3000,
        "actual_amount": 2500,
        "notes": "Keep these notes",
        "paid": False
    })

    updated = db.update_expense(expense["id"], {
        "actual_amount": 2800
    })

    assert updated["actual_amount"] == 2800
    assert updated["allocated_amount"] == 3000
    assert updated["notes"] == "Keep these notes"
    assert updated["paid"] == 0


def test_updates_for_missing_records_return_none():
    assert db.update_expense(
        "missing-expense",
        {"notes": None}
    ) is None

    assert db.update_guest(
        "missing-guest",
        {"email": None}
    ) is None

