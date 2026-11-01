import React from 'react';
import { useEventContext } from '../context/EventContext';
import { api } from '../services/api';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Trash2, 
  Check, 
  PlusCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const MyEventsPage: React.FC = () => {
  const { events, currentEvent, setCurrentEvent, setActiveTab, refreshEvents, addToast } = useEventContext();

  const handleDelete = async (id: string, title: string) => {
    if (events.length <= 1) {
      addToast('warning', 'Cannot delete', 'You must maintain at least one celebration.');
      return;
    }
    try {
      await api.deleteEvent(id);
      await refreshEvents();
      addToast('info', 'Event deleted', `${title} was removed.`);
    } catch {
      addToast('error', 'Error', 'Failed to delete event');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-brand-purple">
            Event Portfolio
          </span>
          <h1 className="font-serif text-3xl font-bold text-brand-navy dark:text-brand-warm-white mt-1">
            My Celebrations ({events.length})
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Switch between plans or launch specialized planning studios
          </p>
        </div>

        <button
          onClick={() => setActiveTab('create-event')}
          className="px-4 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-semibold shadow-premium flex items-center space-x-1.5 self-start sm:self-auto transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Celebration</span>
        </button>
      </div>

      {/* Grid of events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((ev) => {
          const isActive = currentEvent?.id === ev.id;
          return (
            <div
              key={ev.id}
              className={`p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? 'bg-white dark:bg-brand-navy border-brand-purple ring-2 ring-brand-purple/20 shadow-premium'
                  : 'bg-white dark:bg-brand-navy border-brand-lavender/70 dark:border-brand-navy-light shadow-subtle hover:shadow-premium'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-lavender dark:bg-brand-navy-light text-brand-purple dark:text-brand-lavender">
                    {ev.event_type}
                  </span>
                  {isActive && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                      Currently Active
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-xl font-bold text-brand-navy dark:text-brand-warm-white mt-3">
                  {ev.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                  {ev.overview}
                </p>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-white/5 text-xs text-gray-500">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-purple" />
                    <span>{ev.event_date}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-brand-purple" />
                    <span>{ev.guest_count} Guests</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-brand-purple" />
                    <span className="font-semibold text-brand-purple">₹{Number(ev.total_budget).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-brand-purple" />
                    <span className="truncate">{ev.location}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-5 mt-4 border-t border-gray-100 dark:border-white/5">
                <button
                  onClick={() => {
                    setCurrentEvent(ev);
                    setActiveTab('event-plan');
                  }}
                  className="px-4 py-2 rounded-xl bg-brand-lavender hover:bg-brand-purple hover:text-white text-brand-purple font-semibold text-xs transition-all flex items-center space-x-1.5"
                >
                  <span>Open Master Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(ev.id, ev.title)}
                  className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                  title="Delete event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
