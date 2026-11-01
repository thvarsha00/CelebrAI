import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { 
  Sparkles, 
  Download, 
  Share2, 
  Copy, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Palette, 
  Utensils, 
  Camera, 
  Music, 
  Clock, 
  CheckSquare, 
  Mail, 
  Check, 
  ChevronDown, 
  ChevronUp,
  ArrowRight,
  Printer,
  Edit2
} from 'lucide-react';

export const EventPlanView: React.FC = () => {
  const { currentEvent, updateCurrentEvent, setActiveTab, addToast } = useEventContext();
  const [copied, setCopied] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(currentEvent?.title || '');

  if (!currentEvent) {
    return (
      <div className="text-center py-20 bg-white dark:bg-[#1B1E2E] rounded-3xl border border-brand-lavender p-8 max-w-xl mx-auto">
        <Sparkles className="w-10 h-10 text-brand-purple mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-lg font-bold">No Active Celebration Selected</h3>
        <p className="text-xs text-gray-500 mt-1 mb-4">Create your first AI-generated event plan in seconds.</p>
        <button
          onClick={() => setActiveTab('create-event')}
          className="px-5 py-2.5 bg-brand-purple text-white text-xs font-semibold rounded-xl shadow-premium"
        >
          Create New Event
        </button>
      </div>
    );
  }

  const handleCopySummary = () => {
    const summary = `CELEBRAI MASTER PLAN: ${currentEvent.title}\nDate: ${currentEvent.event_date}\nBudget: ₹${currentEvent.total_budget}\nGuests: ${currentEvent.guest_count}\nTheme: ${currentEvent.theme.vibe_keywords.join(', ')}\n\nOverview:\n${currentEvent.overview}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    addToast('success', 'Plan Copied', 'Summary copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(currentEvent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentEvent.title.toLowerCase().replace(/\s+/g, '-')}-plan.json`;
    a.click();
    addToast('info', 'Exported JSON', 'Event data downloaded successfully');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      updateCurrentEvent({ title: editedTitle });
      setIsEditingTitle(false);
      addToast('success', 'Title Updated', 'Event title saved.');
    }
  };

  const filterTabs = [
    'All 14 Sections',
    'Concept & Theme',
    'Decor & Venue',
    'Catering & Entertainment',
    'Budget & Shopping',
    'Schedule & Invites'
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 print:p-0">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-lavender/60 via-white to-brand-powder-blue/40 dark:from-[#1E2235] dark:via-[#1B1E2E] dark:to-[#171A29] border border-brand-lavender dark:border-white/10 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6 print:border-none print:shadow-none">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-brand-purple dark:text-brand-lavender">
              14-Section AI Master Plan
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-powder-blue dark:bg-white/10 text-brand-navy dark:text-brand-lavender">
              Pydantic Validated
            </span>
          </div>

          {/* Editable Title */}
          {isEditingTitle ? (
            <div className="flex items-center space-x-2 mt-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="font-serif text-2xl font-bold bg-white dark:bg-[#141622] border border-brand-purple rounded-xl px-3 py-1 text-brand-navy dark:text-brand-warm-white focus:outline-none"
              />
              <button
                onClick={handleSaveTitle}
                className="px-3 py-1 bg-brand-purple text-white text-xs font-semibold rounded-lg"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 mt-1 group">
              <h1 className="font-serif text-2xl sm:text-4xl font-bold text-brand-navy dark:text-brand-warm-white">
                {currentEvent.title}
              </h1>
              <button
                onClick={() => {
                  setEditedTitle(currentEvent.title);
                  setIsEditingTitle(true);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-brand-purple transition-opacity print:hidden"
                title="Edit Title"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 italic font-serif">
            "{currentEvent.tagline}"
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-300 mt-4">
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-purple" />
              <span>{currentEvent.event_date}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-purple" />
              <span>{currentEvent.location}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-brand-purple" />
              <span>{currentEvent.guest_count} Guests</span>
            </span>
            <span className="flex items-center space-x-1.5 font-bold text-brand-purple dark:text-brand-lavender">
              <DollarSign className="w-3.5 h-3.5" />
              <span>₹{Number(currentEvent.total_budget).toLocaleString()}</span>
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 print:hidden self-start md:self-auto">
          <button
            onClick={handleCopySummary}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1B1E2E] border border-brand-lavender dark:border-white/10 text-xs font-semibold text-brand-navy dark:text-brand-warm-white hover:bg-brand-lavender/40 flex items-center space-x-1.5 transition-all shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownloadJSON}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1B1E2E] border border-brand-lavender dark:border-white/10 text-xs font-semibold text-brand-navy dark:text-brand-warm-white hover:bg-brand-lavender/40 flex items-center space-x-1.5 transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1B1E2E] border border-brand-lavender dark:border-white/10 text-xs font-semibold text-brand-navy dark:text-brand-warm-white hover:bg-brand-lavender/40 flex items-center space-x-1.5 transition-all shadow-xs"
            title="Print or Save PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Navigation Filter Tabs for 14 Sections */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 print:hidden">
        {filterTabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveCategoryFilter(tab)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeCategoryFilter === tab
                ? 'bg-brand-purple text-white shadow-xs'
                : 'bg-white dark:bg-[#1B1E2E] border border-brand-lavender dark:border-white/10 text-gray-500 hover:text-brand-navy dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid of 14 Sections */}
      <div className="space-y-6">
        {/* Sections 1 & 2: Overview & Concept */}
        {(activeCategoryFilter === 'All 14 Sections' || activeCategoryFilter === 'Concept & Theme') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl saas-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple">Section 1</span>
              <h3 className="font-serif text-lg font-bold mt-1">Event Overview</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                {currentEvent.overview}
              </p>
            </div>

            <div className="p-6 rounded-2xl saas-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple">Section 2</span>
              <h3 className="font-serif text-lg font-bold mt-1">Design & Experience Concept</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                {currentEvent.concept}
              </p>
            </div>
          </div>
        )}

        {/* Section 3: Theme and Colour Palette */}
        {(activeCategoryFilter === 'All 14 Sections' || activeCategoryFilter === 'Concept & Theme') && (
          <div className="p-6 rounded-2xl saas-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple">Section 3</span>
                <h3 className="font-serif text-lg font-bold mt-1">Theme & Colour Palette</h3>
              </div>
              <button
                onClick={() => setActiveTab('theme-studio')}
                className="text-xs font-semibold text-brand-purple hover:underline flex items-center space-x-1 print:hidden"
              >
                <span>Theme Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="text-xs font-medium text-gray-400">Palette Swatches</span>
                <div className="flex space-x-2 mt-2">
                  {currentEvent.theme.hex_codes.map((hex, i) => (
                    <div key={i} className="text-center">
                      <div 
                        className="w-10 h-10 rounded-xl shadow-xs border border-black/10"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="text-[10px] font-mono text-gray-400 mt-1 block">{hex}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-gray-400">Lighting & Atmosphere</span>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                  {currentEvent.theme.lighting_style}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-gray-400">Guest Dress Code</span>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                  {currentEvent.theme.dress_code}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sections 4 & 5: Decorations & Venues */}
        {(activeCategoryFilter === 'All 14 Sections' || activeCategoryFilter === 'Decor & Venue') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl saas-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple">Section 4</span>
              <h3 className="font-serif text-lg font-bold mt-1 mb-3">Decoration Suggestions</h3>
              <ul className="space-y-2.5">
                {currentEvent.decorations.map((d, i) => (
                  <li key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-purple mt-1.5 flex-shrink-0" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-2xl saas-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple">Section 5</span>
              <h3 className="font-serif text-lg font-bold mt-1 mb-3">Venue Recommendations</h3>
              <div className="space-y-3">
                {currentEvent.venue_recommendations.map((v, i) => (
                  <div key={i} className="p-3 rounded-xl bg-brand-warm-white dark:bg-white/5 border border-brand-lavender/50 dark:border-white/5">
                    <div className="flex justify-between items-start">
                      <h5 className="text-xs font-semibold">{v.name}</h5>
                      <span className="text-xs font-semibold text-brand-purple">{v.price_estimate}</span>
                    </div>
                    <div className="flex space-x-3 text-[11px] text-gray-400 mt-1">
                      <span>{v.type}</span>
                      <span>•</span>
                      <span>{v.capacity}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 italic">{v.perk}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sections 6, 7 & 8: Food, Photography & Entertainment */}
        {(activeCategoryFilter === 'All 14 Sections' || activeCategoryFilter === 'Catering & Entertainment') && (
          <>
            <div className="p-6 rounded-2xl saas-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple">Section 6</span>
              <h3 className="font-serif text-lg font-bold mt-1 mb-4">Curated Food & Beverage Menu</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentEvent.food_and_beverage.map((course, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-brand-warm-white dark:bg-white/5 border border-brand-lavender/40 dark:border-white/5">
                    <h5 className="text-xs font-semibold text-brand-purple mb-2">{course.course}</h5>
                    <ul className="space-y-1.5">
                      {course.items.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-600 dark:text-gray-300">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl saas-card">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple">Section 7</span>
                <h3 className="font-serif text-lg font-bold mt-1 mb-3">Photography & Memories</h3>
                <ul className="space-y-2">
                  {currentEvent.photography_suggestions.map((p, i) => (
                    <li key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-start space-x-2">
                      <Camera className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 rounded-2xl saas-card">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple">Section 8</span>
                <h3 className="font-serif text-lg font-bold mt-1 mb-3">Entertainment & Engagement</h3>
                <ul className="space-y-2">
                  {currentEvent.entertainment_suggestions.map((e, i) => (
                    <li key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-start space-x-2">
                      <Music className="w-3.5 h-3.5 text-brand-purple mt-0.5 flex-shrink-0" />
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}

        {/* Sections 9 & 10: Budget Breakdown & Shopping Checklist */}
        {(activeCategoryFilter === 'All 14 Sections' || activeCategoryFilter === 'Budget & Shopping') && (
          <>
            <div className="p-6 rounded-2xl saas-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple">Section 9</span>
                  <h3 className="font-serif text-lg font-bold mt-1">Balanced Budget Breakdown</h3>
                </div>
                <button
                  onClick={() => setActiveTab('budget')}
                  className="text-xs font-semibold text-brand-purple hover:underline flex items-center space-x-1 print:hidden"
                >
                  <span>Interactive Optimizer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {currentEvent.budget_breakdown.map((b, i) => (
                  <div key={i} className="p-3 rounded-xl bg-brand-warm-white dark:bg-white/5 border border-brand-lavender/40 dark:border-white/5">
                    <span className="text-[10px] text-gray-400 block truncate">{b.category}</span>
                    <span className="text-sm font-bold text-brand-purple block mt-1">₹{Number(b.allocated_amount).toLocaleString()}</span>
                    <span className="text-[10px] text-gray-500">{b.percentage}% allocation</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl saas-card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple">Section 10</span>
                  <h3 className="font-serif text-base font-bold mt-1">Shopping Supplies Checklist</h3>
                </div>
                <button
                  onClick={() => setActiveTab('shopping')}
                  className="text-xs font-semibold text-brand-purple hover:underline print:hidden"
                >
                  Manage Checklist →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentEvent.shopping_checklist.map((s, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-brand-warm-white dark:bg-white/5 border border-brand-lavender/40 dark:border-white/5 flex items-center justify-between text-xs">
                    <span className="truncate max-w-[170px]">{s.item_name}</span>
                    <span className="text-brand-purple font-semibold font-mono">₹{s.estimated_price}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Sections 11, 12, 13 & 14: Schedule, Invites, Prep, Recommendations */}
        {(activeCategoryFilter === 'All 14 Sections' || activeCategoryFilter === 'Schedule & Invites') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl saas-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple">Section 11</span>
              <h3 className="font-serif text-base font-bold mt-1 mb-3">Event Schedule</h3>
              <div className="space-y-2">
                {currentEvent.event_schedule.map((t, i) => (
                  <div key={i} className="text-xs flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-white/5">
                    <span className="truncate">{t.activity}</span>
                    <span className="text-brand-purple font-mono text-[11px] font-semibold">{t.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl saas-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple">Section 12</span>
              <h3 className="font-serif text-base font-bold mt-1 mb-2">Invitation Preview</h3>
              <div className="p-3.5 rounded-xl bg-brand-lavender/30 dark:bg-white/5 border border-brand-lavender dark:border-white/10 text-center">
                <span className="text-[10px] uppercase tracking-wider text-brand-purple font-semibold">{currentEvent.invitation.headline}</span>
                <h5 className="font-serif text-sm font-bold mt-1">{currentEvent.invitation.subheading}</h5>
                <p className="text-[11px] text-gray-500 mt-1">{currentEvent.invitation.date_time_text}</p>
              </div>
              <button onClick={() => setActiveTab('invitations')} className="text-xs font-semibold text-brand-purple hover:underline mt-3 block print:hidden">
                Open Invitation Studio Designer →
              </button>
            </div>

            <div className="p-6 rounded-2xl saas-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple">Section 13</span>
              <h3 className="font-serif text-base font-bold mt-1 mb-3">Preparation Timeline</h3>
              <div className="space-y-2">
                {currentEvent.prep_timeline.map((p, i) => (
                  <div key={i} className="p-2 rounded-xl bg-brand-warm-white dark:bg-white/5 border border-brand-lavender/40 dark:border-white/5 text-xs">
                    <span className="font-semibold text-brand-purple block">{p.timeframe}</span>
                    <span className="text-gray-600 dark:text-gray-300">{p.task}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl saas-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple">Section 14</span>
              <h3 className="font-serif text-base font-bold mt-1 mb-3">Personalized Recommendations</h3>
              <div className="space-y-2">
                {currentEvent.personalized_recommendations.map((rec, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-brand-powder-blue/30 dark:bg-white/5 border border-brand-powder-blue/60 text-xs text-brand-navy dark:text-brand-warm-white">
                    💡 {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
