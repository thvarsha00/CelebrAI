import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { api } from '../services/api';
import { 
  Sparkles, 
  Send, 
  Calendar, 
  MapPin, 
  Users, 
  IndianRupee, 
  Palette, 
  Utensils, 
  Home, 
  CheckCircle,
  HelpCircle,
  ArrowRight,
  AlertCircle,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CreateEventPage: React.FC = () => {
  const { setCurrentEvent, setActiveTab, addToast, refreshEvents } = useEventContext();
  
  const [mode, setMode] = useState<'freeform' | 'guided'>('freeform');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Free-form prompt state
  const [freeformPrompt, setFreeformPrompt] = useState(
    'Plan a beautiful birthday celebration for 30 people with a pastel blue aesthetic, vegetarian food, elegant decorations and a total budget of ₹15,000.'
  );

  // Guided form state
  const [eventType, setEventType] = useState('Birthday');
  const [eventDate, setEventDate] = useState('2026-11-20');
  const [location, setLocation] = useState('Bangalore, India');
  const [guestCount, setGuestCount] = useState<number | ''>(30);
  const [budget, setBudget] = useState<number | ''>(15000);
  const [theme, setTheme] = useState('Pastel Blue & Lavender');
  const [food, setFood] = useState('Vegetarian appetizers, artisanal mains, and designer dessert bar');
  const [decor, setDecor] = useState('Pastel organic balloon arch, fairy light curtain, gold table accents');
  const [venue, setVenue] = useState('Boutique rooftop cafe or private garden loft');

  // Validation error state
  const [errorMsg, setErrorMsg] = useState('');

  const samplePrompts = [
    { title: "Pastel Blue Birthday", text: "Plan a beautiful birthday celebration for 30 people with a pastel blue aesthetic, vegetarian food, elegant decorations and a total budget of ₹15,000." },
    { title: "Romantic Anniversary", text: "Intimate 1st wedding anniversary dinner for 12 guests with romantic candlelight, Italian pasta & dessert with ₹20,000 budget." },
    { title: "Royal Gold Engagement", text: "Modern royal gold engagement party for 50 guests in Bangalore with live acoustic music and ₹50,000 budget." },
    { title: "Outdoor Graduation", text: "Minimalist outdoor graduation celebration for 25 friends with gourmet sliders, mocktail bar and ₹12,000 budget." }
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Form validations
    if (mode === 'freeform') {
      if (!freeformPrompt.trim()) {
        setErrorMsg('Please describe your event ideas before generating.');
        return;
      }
      if (freeformPrompt.trim().length < 15) {
        setErrorMsg('Please provide a slightly more descriptive prompt (at least 15 characters).');
        return;
      }
    } else {
      if (!guestCount || Number(guestCount) < 1) {
        setErrorMsg('Guest count must be at least 1.');
        return;
      }
      if (!budget || Number(budget) < 1000) {
        setErrorMsg('Total budget must be at least ₹1,000 to plan an event.');
        return;
      }
    }

    setLoading(true);
    setLoadingProgress(15);

    try {
      setLoadingStep('Analyzing event parameters & aesthetic vision...');
      await new Promise(r => setTimeout(r, 450));
      setLoadingProgress(45);

      setLoadingStep('Balancing budget allocation & vendor packages...');
      await new Promise(r => setTimeout(r, 450));
      setLoadingProgress(80);

      setLoadingStep('Synthesizing 14-section event master plan...');

      let plan;
      if (mode === 'freeform') {
        plan = await api.generateEvent({
          event_type: 'Birthday',
          guest_count: 30,
          budget: 15000,
          freeform_prompt: freeformPrompt,
        });
      } else {
        plan = await api.generateEvent({
          event_type: eventType,
          event_date: eventDate,
          event_location: location,
          guest_count: Number(guestCount),
          budget: Number(budget),
          preferred_theme: theme,
          food_preferences: food,
          decoration_preferences: decor,
          venue_preferences: venue,
        });
      }

      setLoadingProgress(100);
      setCurrentEvent(plan);
      await refreshEvents();

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 }
        });
      } catch {}

      addToast('success', 'Plan Generated Successfully!', 'Your 14-section celebration plan is ready.');
      setActiveTab('event-plan');
    } catch (err: any) {
      setErrorMsg(err.message || 'Generation failed. Please try again.');
      addToast('error', 'Generation Error', err.message || 'Please check backend connection');
    } finally {
      setLoading(false);
      setLoadingStep('');
      setLoadingProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-lavender dark:bg-brand-purple/20 text-brand-purple dark:text-brand-lavender text-xs font-semibold mb-3 border border-brand-purple/15">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Core AI Feature • Natural Language Generation</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy dark:text-brand-warm-white">
          Create Your Celebration Plan
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
          Express your ideas in natural language or configure individual details. CelebrAI builds your comprehensive, 14-section master plan instantly.
        </p>

        {/* Mode switch */}
        <div className="flex items-center justify-center p-1 bg-brand-lavender/60 dark:bg-white/5 border border-brand-lavender dark:border-white/10 rounded-2xl w-fit mx-auto mt-6">
          <button
            onClick={() => {
              setMode('freeform');
              setErrorMsg('');
            }}
            className={`px-5 py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === 'freeform'
                ? 'bg-white dark:bg-brand-purple text-brand-purple dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-brand-navy dark:hover:text-white'
            }`}
          >
            One-Prompt Natural Language (AI)
          </button>
          <button
            onClick={() => {
              setMode('guided');
              setErrorMsg('');
            }}
            className={`px-5 py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === 'guided'
                ? 'bg-white dark:bg-brand-purple text-brand-purple dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-brand-navy dark:hover:text-white'
            }`}
          >
            Guided Creation Form
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1B1E2E] border border-brand-lavender dark:border-white/10 shadow-premium relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/95 dark:bg-[#1B1E2E]/95 backdrop-blur-md z-30 flex flex-col items-center justify-center space-y-4 p-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-lavender flex items-center justify-center text-white shadow-premium animate-bounce">
              <Sparkles className="w-7 h-7 text-white animate-spin" />
            </div>
            <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-brand-warm-white">
              CelebrAI Architect at Work
            </h3>
            <p className="text-xs text-brand-purple font-medium text-center animate-pulse max-w-sm">
              {loadingStep}
            </p>

            {/* Progress indicator */}
            <div className="w-56 bg-gray-100 dark:bg-white/10 h-2 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-brand-purple h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error notification banner if validation fails */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center space-x-2 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-6">
          {mode === 'freeform' ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Describe Your Dream Celebration
                  </label>
                  <span className="text-[11px] text-gray-400">
                    {freeformPrompt.length} chars
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={freeformPrompt}
                    onChange={(e) => {
                      setFreeformPrompt(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="e.g. Plan a 30th birthday for 25 people with pastel lavender theme, vegetarian finger food, fairy lights and ₹15,000 budget in Bangalore..."
                    className="w-full p-4 rounded-2xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-sm text-brand-navy dark:text-brand-warm-white focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                    required
                  />
                  <div className="absolute right-3 bottom-3 text-[11px] font-mono text-gray-400 pointer-events-none">
                    Gemini AI Powered
                  </div>
                </div>
              </div>

              {/* Sample Quick Chips */}
              <div>
                <span className="text-[11px] font-semibold text-gray-400 block mb-2">
                  Click a prompt template to try:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {samplePrompts.map((p, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => {
                        setFreeformPrompt(p.text);
                        setErrorMsg('');
                      }}
                      className="text-[11px] text-left p-3 rounded-xl bg-brand-lavender/40 hover:bg-brand-lavender text-brand-navy dark:bg-white/5 dark:hover:bg-white/10 dark:text-brand-lavender transition-all border border-brand-lavender/50 dark:border-white/5 flex flex-col justify-between group"
                    >
                      <span className="font-semibold text-brand-purple dark:text-brand-lavender block mb-1">
                        ✨ {p.title}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 line-clamp-2">
                        "{p.text}"
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Event Type
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs font-medium cursor-pointer"
                >
                  <option>Birthday</option>
                  <option>Wedding</option>
                  <option>Anniversary</option>
                  <option>Baby Shower</option>
                  <option>Graduation Party</option>
                  <option>Engagement Ceremony</option>
                  <option>Corporate Gala</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Guest Count
                </label>
                <input
                  type="number"
                  min={1}
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="30"
                  className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Total Budget (INR ₹)
                </label>
                <input
                  type="number"
                  step={500}
                  min={1000}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="15000"
                  className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Event Location / City
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bangalore, India"
                  className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Preferred Theme & Aesthetic
                </label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g. Pastel Blue & Lavender"
                  className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Food & Beverage Preferences
                </label>
                <input
                  type="text"
                  value={food}
                  onChange={(e) => setFood(e.target.value)}
                  placeholder="e.g. Vegetarian appetizers, mocktail bar, artisan dessert"
                  className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Decoration & Venue Preferences
                </label>
                <input
                  type="text"
                  value={decor}
                  onChange={(e) => setDecor(e.target.value)}
                  placeholder="e.g. Fairy light backdrop, organic balloons, rooftop cafe"
                  className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs font-medium"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-gray-400">
              Validated with strict Pydantic JSON schemas
            </span>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-brand-purple hover:bg-brand-purple-dark text-white font-semibold text-xs shadow-premium flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate 14-Section Event Plan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
