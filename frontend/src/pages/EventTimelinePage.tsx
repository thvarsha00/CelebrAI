import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { TimelineActivity } from '../types';
import { 
  Clock, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit3, 
  Calendar, 
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Filter
} from 'lucide-react';

export const EventTimelinePage: React.FC = () => {
  const { currentEvent, updateCurrentEvent, addToast } = useEventContext();

  const [schedule, setSchedule] = useState<TimelineActivity[]>(
    currentEvent?.event_schedule || []
  );

  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');

  // Add activity modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [time, setTime] = useState('06:00 PM');
  const [activity, setActivity] = useState('');
  const [description, setDescription] = useState('');

  const syncSchedule = (newSchedule: TimelineActivity[]) => {
    setSchedule(newSchedule);
    updateCurrentEvent({ event_schedule: newSchedule });
  };

  const handleToggleComplete = (idx: number) => {
    const updated = [...schedule];
    updated[idx].completed = !updated[idx].completed;
    syncSchedule(updated);
    addToast('info', updated[idx].completed ? 'Activity Marked Complete' : 'Activity Reopened');
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim()) {
      addToast('warning', 'Title required', 'Please enter an activity name.');
      return;
    }
    const newAct: TimelineActivity = {
      id: `t-${Date.now()}`,
      time: time.trim() || '12:00 PM',
      activity: activity.trim(),
      description: description.trim(),
      completed: false
    };
    const updated = [...schedule, newAct];
    syncSchedule(updated);
    setShowAddModal(false);
    setActivity('');
    setDescription('');
    addToast('success', 'Timeline Item Added', `${time} - ${newAct.activity}`);
  };

  const handleDeleteActivity = (idx: number) => {
    const updated = schedule.filter((_, i) => i !== idx);
    syncSchedule(updated);
    addToast('info', 'Item Removed');
  };

  const handleMove = (idx: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === schedule.length - 1)) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updated = [...schedule];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    syncSchedule(updated);
  };

  const handleSortChronologically = () => {
    const sorted = [...schedule].sort((a, b) => {
      // Basic 12h time conversion
      const parseTime = (tStr: string) => {
        const parts = tStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!parts) return 0;
        let h = parseInt(parts[1], 10);
        const m = parseInt(parts[2], 10);
        const isPM = parts[3].toUpperCase() === 'PM';
        if (isPM && h !== 12) h += 12;
        if (!isPM && h === 12) h = 0;
        return h * 60 + m;
      };
      return parseTime(a.time) - parseTime(b.time);
    });
    syncSchedule(sorted);
    addToast('success', 'Chronologically Sorted', 'Timeline ordered by event time.');
  };

  const completedCount = schedule.filter(s => s.completed).length;
  const progressPercent = schedule.length > 0 ? Math.round((completedCount / schedule.length) * 100) : 0;

  const filteredSchedule = schedule.filter(item => {
    if (filterMode === 'pending') return !item.completed;
    if (filterMode === 'completed') return item.completed;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-brand-purple">
            Day-of Execution
          </span>
          <h1 className="font-serif text-3xl font-bold text-brand-navy dark:text-brand-warm-white mt-1">
            Smart Event Timeline & Run of Show
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {currentEvent?.event_date || 'Celebration Day'} • Interactive schedule sequence with status tracking
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={handleSortChronologically}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#1B1E2E] border border-brand-lavender dark:border-white/10 text-xs font-semibold text-brand-navy dark:text-brand-warm-white hover:bg-brand-lavender/40 flex items-center space-x-1.5 transition-all shadow-xs"
            title="Auto sort by time"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sort by Time</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-semibold shadow-premium flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="p-6 rounded-2xl saas-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-serif text-base font-bold">Event Day Completion Progress</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-lavender text-brand-purple font-mono">
              {completedCount} / {schedule.length} Milestones
            </span>
          </div>
          <p className="text-xs text-gray-400">Keep vendors, hosts and caterers synchronized</p>
        </div>

        <div className="w-full sm:w-60">
          <div className="flex justify-between text-xs font-semibold mb-1 text-brand-purple">
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-brand-purple h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 text-xs">
        {[
          { id: 'all', label: `All Milestones (${schedule.length})` },
          { id: 'pending', label: `Pending (${schedule.length - completedCount})` },
          { id: 'completed', label: `Completed (${completedCount})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterMode(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              filterMode === tab.id
                ? 'bg-brand-purple text-white font-semibold'
                : 'bg-white dark:bg-[#1B1E2E] border border-brand-lavender dark:border-white/10 text-gray-500 hover:text-brand-navy'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Interactive Timeline List */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-brand-lavender dark:before:bg-white/10">
        {filteredSchedule.map((item, idx) => (
          <div 
            key={item.id || idx}
            className={`relative p-5 rounded-2xl border transition-all duration-200 ${
              item.completed 
                ? 'bg-brand-lavender/20 dark:bg-white/5 border-brand-lavender/60 dark:border-white/10 opacity-75' 
                : 'bg-white dark:bg-[#1B1E2E] border-brand-lavender/70 dark:border-white/10 shadow-xs'
            }`}
          >
            {/* Timeline node */}
            <button
              onClick={() => handleToggleComplete(idx)}
              className={`absolute -left-6 sm:-left-8 top-5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                item.completed
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white dark:bg-[#1B1E2E] border-2 border-brand-purple text-brand-purple'
              }`}
              title="Click to toggle completion"
            >
              {item.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-2.5 h-2.5 fill-brand-purple" />}
            </button>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-lavender/70 dark:bg-white/10 text-brand-purple dark:text-brand-lavender">
                    {item.time}
                  </span>
                  <h4 className={`font-serif text-sm font-bold ${item.completed ? 'line-through text-gray-400' : 'text-brand-navy dark:text-brand-warm-white'}`}>
                    {item.activity}
                  </h4>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-1 self-end sm:self-start">
                <button
                  onClick={() => handleMove(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 text-gray-400 hover:text-brand-purple disabled:opacity-20"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMove(idx, 'down')}
                  disabled={idx === schedule.length - 1}
                  className="p-1 text-gray-400 hover:text-brand-purple disabled:opacity-20"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteActivity(idx)}
                  className="p-1 text-gray-400 hover:text-rose-500 transition-colors ml-1"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1B1E2E] p-6 rounded-3xl max-w-md w-full border border-brand-lavender dark:border-white/10 shadow-2xl">
            <h3 className="font-serif text-lg font-bold mb-4">Add Schedule Activity</h3>
            <form onSubmit={handleAddActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Time Slot *</label>
                <input
                  type="text"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 07:30 PM"
                  className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Activity Title *</label>
                <input
                  type="text"
                  required
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="e.g. Special Toast & Cake Cutting"
                  className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Host speech, cue spotlight, gather family for photo moment"
                  className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-purple text-white shadow-premium"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
