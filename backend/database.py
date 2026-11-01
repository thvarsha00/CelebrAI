import sqlite3
import json
import os
import uuid
from typing import List, Optional, Dict, Any

DB_FILE = os.path.join(os.path.dirname(__file__), "celebrai.db")

def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Events table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        event_type TEXT NOT NULL,
        guest_count INTEGER NOT NULL,
        total_budget REAL NOT NULL,
        location TEXT NOT NULL,
        event_date TEXT NOT NULL,
        plan_data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Expenses table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        category TEXT NOT NULL,
        item_name TEXT NOT NULL,
        allocated_amount REAL NOT NULL,
        actual_amount REAL NOT NULL DEFAULT 0.0,
        notes TEXT,
        paid INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
    """)
    
    # Guests table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS guests (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        category TEXT DEFAULT 'Friends',
        rsvp_status TEXT DEFAULT 'Pending',
        dietary_preferences TEXT,
        plus_ones INTEGER DEFAULT 0,
        invitation_sent INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
    """)
    
    # Tasks table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        time_slot TEXT,
        activity TEXT NOT NULL,
        description TEXT,
        completed INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
    """)
    
    conn.commit()
    conn.close()

# Event repository functions
def save_event(event_dict: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    
    event_id = event_dict.get("id") or str(uuid.uuid4())
    event_dict["id"] = event_id
    
    title = event_dict.get("title", "Untitled Celebration")
    event_type = event_dict.get("event_type", "Celebration")
    guest_count = int(event_dict.get("guest_count", 20))
    total_budget = float(event_dict.get("total_budget", 15000.0))
    location = event_dict.get("location", "Bangalore")
    event_date = event_dict.get("event_date", "2026-11-20")
    plan_json = json.dumps(event_dict)
    
    cursor.execute("""
    INSERT INTO events (id, title, event_type, guest_count, total_budget, location, event_date, plan_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        title=excluded.title,
        event_type=excluded.event_type,
        guest_count=excluded.guest_count,
        total_budget=excluded.total_budget,
        location=excluded.location,
        event_date=excluded.event_date,
        plan_data=excluded.plan_data,
        updated_at=CURRENT_TIMESTAMP
    """, (event_id, title, event_type, guest_count, total_budget, location, event_date, plan_json))
    
    # Synchronize expenses from budget_breakdown
    for b in event_dict.get("budget_breakdown", []):
        cat = b.get("category", "General")
        alloc = float(b.get("allocated_amount", 0))
        cursor.execute("SELECT id FROM expenses WHERE event_id = ? AND category = ?", (event_id, cat))
        existing_exp = cursor.fetchone()
        if existing_exp:
            cursor.execute("UPDATE expenses SET allocated_amount = ? WHERE id = ?", (alloc, existing_exp["id"]))
        else:
            expense_id = str(uuid.uuid4())
            cursor.execute("""
            INSERT INTO expenses (id, event_id, category, item_name, allocated_amount, actual_amount, notes, paid)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (expense_id, event_id, cat, f"{cat} Package", alloc, 0.0, b.get("notes", ""), 0))
            
    # Synchronize tasks from event_schedule if table empty
    cursor.execute("SELECT COUNT(*) as cnt FROM tasks WHERE event_id = ?", (event_id,))
    if cursor.fetchone()["cnt"] == 0:
        for t in event_dict.get("event_schedule", []):
            t_id = t.get("id") or str(uuid.uuid4())
            cursor.execute("""
            INSERT INTO tasks (id, event_id, time_slot, activity, description, completed)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (t_id, event_id, t.get("time", "12:00 PM"), t.get("activity", "Event"), t.get("description", ""), 1 if t.get("completed") else 0))

    conn.commit()
    conn.close()
    return event_dict

def get_event(event_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT plan_data FROM events WHERE id = ?", (event_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return json.loads(row["plan_data"])
    return None

def list_events() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT plan_data FROM events ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [json.loads(row["plan_data"]) for row in rows]

def delete_event(event_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM events WHERE id = ?", (event_id,))
    cursor.execute("DELETE FROM expenses WHERE event_id = ?", (event_id,))
    cursor.execute("DELETE FROM guests WHERE event_id = ?", (event_id,))
    cursor.execute("DELETE FROM tasks WHERE event_id = ?", (event_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

# Expenses CRUD
def list_expenses(event_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM expenses WHERE event_id = ? ORDER BY created_at ASC", (event_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def add_expense(expense: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    expense_id = expense.get("id") or str(uuid.uuid4())
    expense["id"] = expense_id
    cursor.execute("""
    INSERT INTO expenses (id, event_id, category, item_name, allocated_amount, actual_amount, notes, paid)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (expense_id, expense["event_id"], expense["category"], expense["item_name"],
          float(expense.get("allocated_amount", 0)), float(expense.get("actual_amount", 0)),
          expense.get("notes", ""), 1 if expense.get("paid") else 0))
    conn.commit()
    conn.close()
    return expense

def update_expense(expense_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE expenses SET
        category = COALESCE(?, category),
        item_name = COALESCE(?, item_name),
        allocated_amount = COALESCE(?, allocated_amount),
        actual_amount = COALESCE(?, actual_amount),
        notes = COALESCE(?, notes),
        paid = COALESCE(?, paid)
    WHERE id = ?
    """, (updates.get("category"), updates.get("item_name"), updates.get("allocated_amount"),
          updates.get("actual_amount"), updates.get("notes"),
          1 if updates.get("paid") is True else (0 if updates.get("paid") is False else None),
          expense_id))
    conn.commit()
    cursor.execute("SELECT * FROM expenses WHERE id = ?", (expense_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def delete_expense(expense_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
    affected = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return affected

# Guests CRUD
def list_guests(event_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM guests WHERE event_id = ? ORDER BY created_at DESC", (event_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def add_guest(guest: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    guest_id = guest.get("id") or str(uuid.uuid4())
    guest["id"] = guest_id
    cursor.execute("""
    INSERT INTO guests (id, event_id, name, email, phone, category, rsvp_status, dietary_preferences, plus_ones, invitation_sent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (guest_id, guest["event_id"], guest["name"], guest.get("email"), guest.get("phone"),
          guest.get("category", "Friends"), guest.get("rsvp_status", "Pending"),
          guest.get("dietary_preferences", "None"), int(guest.get("plus_ones", 0)),
          1 if guest.get("invitation_sent") else 0))
    conn.commit()
    conn.close()
    return guest

def update_guest(guest_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE guests SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        category = COALESCE(?, category),
        rsvp_status = COALESCE(?, rsvp_status),
        dietary_preferences = COALESCE(?, dietary_preferences),
        plus_ones = COALESCE(?, plus_ones),
        invitation_sent = COALESCE(?, invitation_sent)
    WHERE id = ?
    """, (updates.get("name"), updates.get("email"), updates.get("phone"), updates.get("category"),
          updates.get("rsvp_status"), updates.get("dietary_preferences"), updates.get("plus_ones"),
          1 if updates.get("invitation_sent") is True else (0 if updates.get("invitation_sent") is False else None),
          guest_id))
    conn.commit()
    cursor.execute("SELECT * FROM guests WHERE id = ?", (guest_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def delete_guest(guest_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM guests WHERE id = ?", (guest_id,))
    affected = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return affected

# Initialize database on module import
init_db()
