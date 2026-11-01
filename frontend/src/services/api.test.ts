import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';

const mockFetch = vi.fn();

function jsonResponse(data: unknown, ok = true): Response {
  return {
    ok,
    statusText: ok ? 'OK' : 'Internal Server Error',
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response;
}

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('API service', () => {
  it('returns backend health when the health check succeeds', async () => {
    const health = { status: 'online' };
    mockFetch.mockResolvedValue(jsonResponse(health));

    await expect(api.getHealth()).resolves.toEqual(health);
    expect(mockFetch).toHaveBeenCalledWith('/api/health');
  });

  it('returns a safe offline status when the health check fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network unavailable'));

    await expect(api.getHealth()).resolves.toEqual({
      status: 'offline',
      ai_providers: {
        groq_configured: false,
        grok_configured: false,
      },
    });
  });

  it('fetches the events collection', async () => {
    const events = [{ id: 'event-1', title: 'Test Event' }];
    mockFetch.mockResolvedValue(jsonResponse(events));

    await expect(api.getEvents()).resolves.toEqual(events);
    expect(mockFetch).toHaveBeenCalledWith('/api/events');
  });

  it('sends event generation parameters as JSON', async () => {
    const params = {
      event_type: 'Birthday',
      guest_count: 30,
      budget: 10000,
    };
    const result = { id: 'event-1', title: 'Birthday' };
    mockFetch.mockResolvedValue(jsonResponse(result));

    await expect(api.generateEvent(params)).resolves.toEqual(result);

    expect(mockFetch).toHaveBeenCalledWith('/api/events/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  });

  it('maps chat history into the backend request format', async () => {
    const result = { response: 'Here is a suggestion.' };
    mockFetch.mockResolvedValue(jsonResponse(result));

    await expect(
      api.chatWithAI(
        { event_type: 'Birthday' },
        [{ id: 'msg-1', role: 'user', content: 'Suggest a theme', timestamp: new Date().toISOString() }],
        'Suggest a theme'
      )
    ).resolves.toEqual(result);

    const request = JSON.parse(mockFetch.mock.calls[0][1].body);

    expect(request.conversation_history).toEqual([
      { role: 'user', content: 'Suggest a theme' },
    ]);
    expect(request.message).toBe('Suggest a theme');
  });

  it('sends budget optimization parameters as JSON', async () => {
    const result = { optimized_allocations: [] };
    mockFetch.mockResolvedValue(jsonResponse(result));

    await expect(
      api.optimizeBudget(10000, [], 'Reduce decoration costs')
    ).resolves.toEqual(result);

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/ai/optimise-budget',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          current_budget: 10000,
          current_allocations: [],
          user_instruction: 'Reduce decoration costs',
        }),
      })
    );
  });

  it('encodes the event ID when fetching expenses', async () => {
    const expenses = [{ id: 'expense-1' }];
    mockFetch.mockResolvedValue(jsonResponse(expenses));

    await expect(api.getExpenses('event 1')).resolves.toEqual(expenses);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/expenses?event_id=event%201'
    );
  });

  it('returns an empty array when expense fetching fails', async () => {
    mockFetch.mockResolvedValue(jsonResponse({}, false));

    await expect(api.getExpenses('event-1')).resolves.toEqual([]);
  });

  it('returns an empty array when guest fetching fails', async () => {
    mockFetch.mockResolvedValue(jsonResponse({}, false));

    await expect(api.getGuests('event-1')).resolves.toEqual([]);
  });

  it('throws when event fetching fails', async () => {
    mockFetch.mockResolvedValue(jsonResponse({}, false));

    await expect(api.getEvents()).rejects.toThrow(
      'Failed to fetch events'
    );
  });
});


