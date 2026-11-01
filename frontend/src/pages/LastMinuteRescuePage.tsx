import React, { useState, useEffect } from 'react';
import { useEventContext } from '../context/EventContext';
import { api } from '../services/api';
import { LastMinutePlan } from '../types';
import { 
  Flame, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShoppingBag, 
  Utensils, 
  Lightbulb, 
  ArrowRight,
  Printer,
  ShieldAlert
} from 'lucide-react';

export const LastMinuteRescuePage: React.FC = () => {
  const { currentEvent, addToast } = useEventContext();

  const [hoursLeft, setHoursLeft] = useState(24);
  const [guestCount, setGuestCount] = useState(20);
  const [budget, setBudget] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'critical' | 'delegable'>('all');

  // Simulated live countdown timer for dramatic realism
  const [secondsRemaining, setSecondsRemaining] = useState(24 * 3600);

  useEffect(() => {
    setSecondsRemaining(hoursLeft * 3600);
  }, [hoursLeft]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const [plan, setPlan] = useState<LastMinutePlan | null>({
    summary: "Emergency 24-Hour Action Plan for 20 guests with ₹10,000 budget.",
    time_remaining_hours: 24,
    essential_tasks: [
      { urgency: "Critical", timeframe: "Next 2 Hours", title: "Lock Venue & Call Local Bakeries", description: "Confirm venue access or ready home living room. Reserve an in-stock artisan bakery cake before 4 PM.", can_delegate: false },
      { urgency: "Critical", timeframe: "Next 3 Hours", title: "Send Instant Digital WhatsApp Invites", description: "Send CelebrAI interactive invite link to guests with strict 6-hour RSVP deadline.", can_delegate: true },
      { urgency: "High", timeframe: "This Evening", title: "Order Ready-to-Serve Catering Platters", description: "Book premium pizza/appetizer catering or pre-order bulk restaurant specialty trays.", can_delegate: true },
      { urgency: "High", timeframe: "Tonight", title: "Pickup Fast Decor (Balloons & Fairy Lights)", description: "Buy 1 balloon arch kit and fairy lights; blow up balloons tonight so morning is calm.", can_delegate: true },
      { urgency: "Moderate", timeframe: "Morning Of Event", title: "Final Setup & Ice/Beverage Stock", description: "Set up photo corner, plug in Spotify speaker, chill drinks with 2 bags of ice.", can_delegate: true }
    ],
    tasks_to_skip: [
      "DO NOT order custom tiered fondant cakes (takes 48-72h and costs 3x more).",
      "DO NOT hire complex audio/visual equipment; use bluetooth speaker and phone playlist.",
      "DO NOT design physical printed stationery or intricate party favors.",
      "DO NOT cook a 5-course meal from scratch; buy semi-prepared gourmet platters."
    ],
    immediate_purchases: [
      { item: "Ready Bakery Cake (1.5 kg)", store: "Local Artisan Bakery", est_cost: 1200 },
      { item: "Instant Balloon Garland Kit", store: "Blinkit / Zepto / Party Shop", est_cost: 450 },
      { item: "Warm White String Fairy Lights (20m)", store: "Amazon Prime / Local Hardware", est_cost: 350 },
      { item: "Eco-friendly Palm Leaf Tableware set", store: "Supermarket", est_cost: 500 },
      { item: "Ice cubes (2 bags) & Assorted Mocktails", store: "Grocery Delivery", est_cost: 600 }
    ],
    quick_decor_hacks: [
      "Hang fairy lights behind white window curtains to instantly create a glowing, high-end backdrop.",
      "Use stemmed wine glasses turned upside down with small roses inside and tea-light candles on top as instant luxury centerpieces.",
      "Scatter cluster balloons on the floor rather than trying to helium-fill everything."
    ],
    foolproof_food_plan: [
      "Starter: Mezze Platter (Hummus, Pita crisps, Olives, Cheese cubes) — requires zero cooking.",
      "Main: Gourmet Hand-tossed Pizza / Biryani Handis with cooling Raita.",
      "Dessert: Sliced Artisan Cake paired with single-scoop premium vanilla ice cream."
    ],
    emergency_timeline: [
      { time: "T-24h", action: "Confirm space & send WhatsApp invitations" },
      { time: "T-18h", action: "Order food platters & purchase instant decor items" },
      { time: "T-12h", action: "Sleep and recharge (exhausted hosts make stressed parties)" },
      { time: "T-4h", action: "Assemble balloon garland & string lights" },
      { time: "T-2h", action: "Pick up cake & ice, test music sound level" },
      { time: "T-0h", action: "Welcome guests with a chilled beverage and relaxed smile" }
    ],
    budget_saving_tips: [
      "Using quick grocery delivery for mocktails saves ₹3,000 compared to bar catering.",
      "A bakery case-ready cake with a fresh flower placed on top looks identical to a ₹4,000 custom designer cake."
    ]
  });

  const handleRegenerateEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.getLastMinutePlan({
        event_type: currentEvent?.event_type || 'Birthday',
        hours_left: hoursLeft,
        guest_count: guestCount,
        budget: budget,
        location: currentEvent?.location || 'Bangalore'
      });
      setPlan(res);
      addToast('success', 'Emergency Matrix Recalculated', `Plan adjusted for ${hoursLeft} hours remaining.`);
    } catch (err: any) {
      addToast('error', 'Error generating rescue plan', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredTasks = plan?.essential_tasks.filter(t => {
    if (taskFilter === 'critical') return t.urgency === 'Critical';
    if (taskFilter === 'delegable') return t.can_delegate;
    return true;
  }) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 print:p-0">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-50 via-white to-amber-50 dark:from-rose-950/40 dark:via-[#1B1E2E] dark:to-amber-950/20 border border-rose-200 dark:border-rose-900/60 shadow-premium flex flex-col md:flex-row items-start md:items-center justify-between gap-6 print:border-none">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-rose-600 dark:text-rose-400">
              High-Stress Event Rescue
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              Standout Hackathon Feature #5
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-brand-navy dark:text-brand-warm-white mt-1">
            24-Hour Last-Minute Event Rescue
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-xl">
            Triage system for eleventh-hour planning. Distinguishes critical path tasks from time-wasting distractions so you host with complete calm.
          </p>
        </div>

        {/* Live Countdown Clock */}
        <div className="flex items-center space-x-3 print:hidden">
          <button
            onClick={handlePrint}
            className="p-3 rounded-2xl bg-white dark:bg-[#1B1E2E] border border-rose-200 dark:border-rose-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-rose-50 flex items-center space-x-1.5 transition-all shadow-xs"
            title="Print Emergency Run of Show"
          >
            <Printer className="w-4 h-4 text-rose-500" />
            <span className="hidden sm:inline">Print Plan</span>
          </button>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#1B1E2E] border border-rose-200 dark:border-rose-800 text-center min-w-[150px] shadow-xs">
            <div className="flex items-center justify-center space-x-1.5 text-rose-500 mb-0.5">
              <Clock className="w-4 h-4 animate-spin" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Countdown</span>
            </div>
            <span className="text-2xl font-mono font-bold text-rose-600 tracking-tight">
              {formatCountdown(secondsRemaining)}
            </span>
            <span className="text-[9px] text-gray-400 block mt-0.5">Time to Event Start</span>
          </div>
        </div>
      </div>

      {/* Emergency Config Form */}
      <div className="p-6 rounded-2xl saas-card print:hidden">
        <h3 className="font-serif text-base font-bold mb-3">Adjust Emergency Parameters</h3>
        <form onSubmit={handleRegenerateEmergency} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Hours Remaining</label>
            <select
              value={hoursLeft}
              onChange={(e) => setHoursLeft(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs font-semibold cursor-pointer"
            >
              <option value={12}>12 Hours (Ultra Rapid)</option>
              <option value={24}>24 Hours (Next Day)</option>
              <option value={48}>48 Hours (Weekend Rush)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Guest Headcount</label>
            <input
              type="number"
              min={1}
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Emergency Budget (₹)</label>
            <input
              type="number"
              step={500}
              min={500}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-brand-lavender dark:border-white/10 bg-brand-warm-white dark:bg-[#141622] text-xs font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-premium flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
          >
            <Flame className="w-4 h-4" />
            <span>{loading ? 'Recalculating...' : 'Recalculate Rescue'}</span>
          </button>
        </form>
      </div>

      {plan && (
        <div className="space-y-6">
          {/* Critical Tasks vs Tasks to Skip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Essential Tasks */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1B1E2E] border border-emerald-200 dark:border-emerald-900/60 shadow-subtle">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="font-serif text-base font-bold">1. Critical Path (Must Do)</h3>
                </div>

                <div className="flex space-x-1 text-[10px] print:hidden">
                  <button
                    onClick={() => setTaskFilter('all')}
                    className={`px-2 py-0.5 rounded-md ${taskFilter === 'all' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-400'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setTaskFilter('critical')}
                    className={`px-2 py-0.5 rounded-md ${taskFilter === 'critical' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-400'}`}
                  >
                    Critical
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredTasks.map((task, i) => (
                  <div key={i} className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 uppercase">
                        {task.urgency} • {task.timeframe}
                      </span>
                      {task.can_delegate && (
                        <span className="text-[10px] text-gray-400 bg-white dark:bg-black/20 px-1.5 py-0.5 rounded">Can Delegate</span>
                      )}
                    </div>
                    <h5 className="text-xs font-semibold mt-1 text-brand-navy dark:text-brand-warm-white">{task.title}</h5>
                    <p className="text-[11px] text-gray-500 mt-0.5">{task.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks to Skip */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1B1E2E] border border-rose-200 dark:border-rose-900/60 shadow-subtle">
              <div className="flex items-center space-x-2 text-rose-600 mb-3">
                <XCircle className="w-5 h-5" />
                <h3 className="font-serif text-base font-bold">2. Distraction Filter (Skip These!)</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                These tasks consume huge time with negligible impact on guest enjoyment. Eliminate them immediately.
              </p>
              <div className="space-y-2.5">
                {plan.tasks_to_skip.map((skip, i) => (
                  <div key={i} className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-200 flex items-start space-x-2">
                    <span className="font-bold flex-shrink-0">✕</span>
                    <span>{skip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick decor hacks & Foolproof food */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl saas-card">
              <div className="flex items-center space-x-2 text-amber-500 mb-3">
                <Lightbulb className="w-5 h-5" />
                <h3 className="font-serif text-base font-bold">3. 15-Minute Decor Hacks</h3>
              </div>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                {plan.quick_decor_hacks.map((hack, i) => (
                  <li key={i} className="p-2.5 rounded-xl bg-brand-warm-white dark:bg-white/5 border border-brand-lavender/40 dark:border-white/5">
                    💡 {hack}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-2xl saas-card">
              <div className="flex items-center space-x-2 text-blue-600 mb-3">
                <Utensils className="w-5 h-5" />
                <h3 className="font-serif text-base font-bold">4. Zero-Stress Food Blueprint</h3>
              </div>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                {plan.foolproof_food_plan.map((food, i) => (
                  <li key={i} className="p-2.5 rounded-xl bg-brand-warm-white dark:bg-white/5 border border-brand-lavender/40 dark:border-white/5">
                    🍽️ {food}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Hour-by-Hour Countdown & Immediate Purchases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl saas-card">
              <div className="flex items-center space-x-2 text-brand-purple mb-3">
                <Clock className="w-5 h-5" />
                <h3 className="font-serif text-base font-bold">5. Countdown Run of Show</h3>
              </div>
              <div className="space-y-2 text-xs">
                {plan.emergency_timeline.map((step, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-brand-warm-white dark:bg-white/5">
                    <span className="font-mono font-bold text-brand-purple">{step.time}</span>
                    <span className="text-gray-600 dark:text-gray-300">{step.action}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl saas-card">
              <div className="flex items-center space-x-2 text-emerald-600 mb-3">
                <ShoppingBag className="w-5 h-5" />
                <h3 className="font-serif text-base font-bold">6. Quick-Buy Supplies</h3>
              </div>
              <div className="space-y-2 text-xs">
                {plan.immediate_purchases.map((pur, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-brand-warm-white dark:bg-white/5">
                    <div>
                      <span className="font-semibold block">{pur.item}</span>
                      <span className="text-[10px] text-gray-400">{pur.store}</span>
                    </div>
                    <span className="font-bold font-mono text-brand-purple">₹{pur.est_cost}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
