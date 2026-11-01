
import {
  EventPlan,
  BudgetOptimizationResponse,
  ChatMessage,
  LastMinutePlan,
  Guest,
  Expense,
} from '../types';

// Local development uses Vite's proxy.
// Production uses the Vercel environment variable.
const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || '/api'
).replace(/\/+$/, '');

export const api = {
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);

      if (!res.ok) {
        throw new Error('Health check failed');
      }

      return await res.json();
    } catch {
      return {
        status: 'offline',
        ai_providers: {
          groq_configured: false,
          grok_configured: false,
        },
      };
    }
  },

  async generateEvent(params: {
    event_type: string;
    event_date?: string;
    event_location?: string;
    guest_count: number;
    budget: number;
    preferred_theme?: string;
    food_preferences?: string;
    decoration_preferences?: string;
    venue_preferences?: string;
    freeform_prompt?: string;
  }): Promise<EventPlan> {
    const res = await fetch(`${API_BASE}/events/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Failed to generate event plan: ${res.statusText}`);
    }

    return await res.json();
  },

  async getEvents(): Promise<EventPlan[]> {
    const res = await fetch(`${API_BASE}/events`);

    if (!res.ok) {
      throw new Error('Failed to fetch events');
    }

    return await res.json();
  },

  async getEvent(id: string): Promise<EventPlan> {
    const res = await fetch(`${API_BASE}/events/${id}`);

    if (!res.ok) {
      throw new Error('Event not found');
    }

    return await res.json();
  },

  async updateEvent(
    id: string,
    updates: Partial<EventPlan>
  ): Promise<EventPlan> {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      throw new Error('Failed to update event');
    }

    return await res.json();
  },

  async deleteEvent(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error('Failed to delete event');
    }
  },

  async chatWithAI(
    eventContext: any,
    history: ChatMessage[],
    message: string
  ): Promise<{
    response: string;
    suggested_actions?: string[];
    updated_event_patch?: any;
  }> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_context: eventContext,
        conversation_history: history.map((h) => ({
          role: h.role,
          content: h.content,
        })),
        message,
      }),
    });

    if (!res.ok) {
      throw new Error('AI chat failed');
    }

    return await res.json();
  },

  async optimizeBudget(
    current_budget: number,
    current_allocations: any[],
    user_instruction: string
  ): Promise<BudgetOptimizationResponse> {
    const res = await fetch(`${API_BASE}/ai/optimise-budget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_budget,
        current_allocations,
        user_instruction,
      }),
    });

    if (!res.ok) {
      throw new Error('Budget optimization failed');
    }

    return await res.json();
  },

  async getLastMinutePlan(params: {
    event_type: string;
    hours_left?: number;
    guest_count?: number;
    budget?: number;
    location?: string;
  }): Promise<LastMinutePlan> {
    const res = await fetch(`${API_BASE}/ai/last-minute-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error('Failed to generate last-minute rescue');
    }

    return await res.json();
  },

  // EXPENSES

  async getExpenses(eventId: string): Promise<Expense[]> {
    const res = await fetch(
      `${API_BASE}/expenses?event_id=${encodeURIComponent(eventId)}`
    );

    if (!res.ok) return [];

    return await res.json();
  },

  async addExpense(expense: Expense): Promise<Expense> {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });

    if (!res.ok) {
      throw new Error('Failed to add expense');
    }

    return await res.json();
  },

  async updateExpense(
    id: string,
    updates: Partial<Expense>
  ): Promise<Expense> {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      throw new Error('Failed to update expense');
    }

    return await res.json();
  },

  async deleteExpense(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error('Failed to delete expense');
    }
  },

  // GUESTS

  async getGuests(eventId: string): Promise<Guest[]> {
    const res = await fetch(
      `${API_BASE}/guests?event_id=${encodeURIComponent(eventId)}`
    );

    if (!res.ok) return [];

    return await res.json();
  },

  async addGuest(guest: Guest): Promise<Guest> {
    const res = await fetch(`${API_BASE}/guests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(guest),
    });

    if (!res.ok) {
      throw new Error('Failed to add guest');
    }

    return await res.json();
  },

  async updateGuest(
    id: string,
    updates: Partial<Guest>
  ): Promise<Guest> {
    const res = await fetch(`${API_BASE}/guests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      throw new Error('Failed to update guest');
    }

    return await res.json();
  },

  async deleteGuest(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/guests/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error('Failed to delete guest');
    }
  },
};
