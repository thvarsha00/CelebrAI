import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor, cleanup } from '@testing-library/react';
import { EventProvider, useEventContext } from './EventContext';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    getEvents: vi.fn(),
    updateEvent: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <EventProvider>{children}</EventProvider>
);

describe('EventContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getEvents).mockResolvedValue([]);
    vi.mocked(api.updateEvent).mockResolvedValue({} as never);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('initializes with the default sample event', async () => {
    const { result } = renderHook(() => useEventContext(), { wrapper });

    expect(result.current.currentEvent?.id).toBe('demo-event-001');
    expect(result.current.currentEvent?.title).toBe(
      'The Pastel Blue 25th Birthday Gala'
    );
    expect(result.current.activeTab).toBe('overview');
    expect(result.current.isLanding).toBe(true);
    expect(result.current.darkMode).toBe(false);
    expect(result.current.isDemoAuth).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('loads events from the API and selects the first event', async () => {
    const remoteEvent = {
      id: 'remote-001',
      title: 'Remote Birthday Event',
    };

    vi.mocked(api.getEvents).mockResolvedValue([remoteEvent] as never);

    const { result } = renderHook(() => useEventContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.events[0].id).toBe('remote-001');
      expect(result.current.currentEvent?.id).toBe('remote-001');
    });
  });

  it('changes the active dashboard tab', async () => {
    const { result } = renderHook(() => useEventContext(), { wrapper });

    act(() => {
      result.current.setActiveTab('budget');
    });

    expect(result.current.activeTab).toBe('budget');
  });

  it('toggles dark mode and updates the document class', async () => {
    const { result } = renderHook(() => useEventContext(), { wrapper });

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(result.current.darkMode).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(result.current.darkMode).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('adds and removes toast notifications', async () => {
    const { result } = renderHook(() => useEventContext(), { wrapper });

    act(() => {
      result.current.addToast('success', 'Test notification', 'Test description');
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Test notification');

    const toastId = result.current.toasts[0].id;

    act(() => {
      result.current.removeToast(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('updates the current event and calls the API', async () => {
    const { result } = renderHook(() => useEventContext(), { wrapper });

    await act(async () => {
      await result.current.updateCurrentEvent({
        title: 'Updated Celebration',
      });
    });

    expect(result.current.currentEvent?.title).toBe('Updated Celebration');
    expect(api.updateEvent).toHaveBeenCalledWith(
      'demo-event-001',
      expect.objectContaining({ title: 'Updated Celebration' })
    );
    expect(result.current.toasts.some(t => t.title === 'Event updated')).toBe(true);
  });

  it('keeps the local update when the API request fails', async () => {
    vi.mocked(api.updateEvent).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useEventContext(), { wrapper });

    await act(async () => {
      await result.current.updateCurrentEvent({
        title: 'Local Updated Event',
      });
    });

    expect(result.current.currentEvent?.title).toBe('Local Updated Event');
    expect(result.current.toasts).toHaveLength(0);
  });

  it('handles event loading failures without crashing', async () => {
    vi.mocked(api.getEvents).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useEventContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.currentEvent?.id).toBe('demo-event-001');
  });

  it('throws an error when used outside EventProvider', () => {
    expect(() => {
      renderHook(() => useEventContext());
    }).toThrow('useEventContext must be used within EventProvider');
  });
});
