import React from 'react';
import { useEventContext } from '../context/EventContext';
import { 
  Sparkles, 
  Calendar, 
  PieChart as PieChartIcon, 
  Users, 
  Clock, 
  PlusCircle, 
  ArrowUpRight, 
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Palette,
  Flame,
  ArrowRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export const DashboardOverview: React.FC = () => {
  const { currentEvent, events, setActiveTab, setCurrentEvent } = useEventContext();

  const totalBudget = currentEvent ? currentEvent.total_budget : 15000;
  const allocatedBudget = currentEvent 
    ? currentEvent.budget_breakdown.reduce((acc, curr) => acc + curr.allocated_amount, 0)
    : 15000;
  const actualSpent = currentEvent ? Math.round(allocatedBudget * 0.45) : 6750;
  const remainingBudget = totalBudget - actualSpent;

  // Pie chart data
  const pieData = currentEvent?.budget_breakdown.map((item, idx) => ({
    name: item.category.split('&')[0].trim(),
    value: item.allocated_amount,
    color: ['#6750A4', '#8C6EE0', '#B39DDB', '#DCEBFA', '#F4DCE9', '#20243A'][idx % 6]
  })) || [
    { name: 'Catering', value: 4800, color: '#6750A4' },
    { name: 'Venue', value: 4200, color: '#8C6EE0' },
    { name: 'Decor', value: 2400, color: '#B39DDB' },
    { name: 'Cake', value: 1200, color: '#DCEBFA' },
    { name: 'Photos', value: 1200, color: '#F4DCE9' },
    { name: 'Music', value: 1200, color: '#20243A' },
  ];

  const comparisonData = [
    { category: 'Venue', Planned: 4200, Actual: 4000 },
    { category: 'Catering', Planned: 4800, Actual: 2500 },
    { category: 'Decor', Planned: 2400, Actual: 1500 },
    { category: 'Cake', Planned: 1200, Actual: 1200 },
    { category: 'Photos', Planned: 1200, Actual: 600 },
  ];

  const pendingTasks = currentEvent?.event_schedule.filter(t => !t.completed).length || 5;

  return (
    <div className="space-y-8 pb-12">
      {/* Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-brand-lavender/70 via-white to-brand-powder-blue/40 dark:from-[#1E2235] dark:via-[#1B1E2E] dark:to-[#171A29] border border-brand-lavender dark:border-white/10 shadow-subtle">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-brand-purple dark:text-brand-lavender">
              Executive Control Center
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-powder-blue text-brand-navy">
              Live
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy dark:text-brand-warm-white mt-1">
            Good morning, let's make something memorable.
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center space-x-2">
            <span>Managing <strong className="text-brand-purple dark:text-brand-lavender">{currentEvent?.title || "Active Celebration"}</strong></span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-brand-purple" />
              <span>{currentEvent?.event_date || "Nov 20, 2026"}</span>
            </span>
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('create-event')}
            className="px-4 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-semibold shadow-premium flex items-center space-x-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generate Event</span>
          </button>
          <button
            onClick={() => setActiveTab('last-minute')}
            className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-semibold flex items-center space-x-1.5 hover:bg-rose-100 transition-all"
          >
            <Flame className="w-4 h-4 text-rose-500" />
            <span>24h Rescue</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl saas-card">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium">Total Budget</span>
            <DollarSign className="w-4 h-4 text-brand-purple" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold font-serif text-brand-navy dark:text-brand-warm-white">
              ₹{totalBudget.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 flex items-center space-x-1 font-medium">
            <span>₹{allocatedBudget.toLocaleString()} allocated</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl saas-card">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium">Actual Spent</span>
            <PieChartIcon className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold font-serif text-brand-navy dark:text-brand-warm-white">
              ₹{actualSpent.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {Math.round((actualSpent / totalBudget) * 100)}% of ceiling cap
          </p>
        </div>

        <div className="p-4 rounded-2xl saas-card">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium">Guest Headcount</span>
            <Users className="w-4 h-4 text-brand-purple" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold font-serif text-brand-navy dark:text-brand-warm-white">
              {currentEvent?.guest_count || 30}
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">
            24 confirmed RSVPs
          </p>
        </div>

        <div className="p-4 rounded-2xl saas-card">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium">Pending Tasks</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold font-serif text-brand-navy dark:text-brand-warm-white">
              {pendingTasks}
            </span>
          </div>
          <p className="text-[11px] text-amber-500 mt-1 font-medium">
            Milestones in schedule
          </p>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Budget Allocation (Pie Chart) */}
        <div className="p-6 rounded-2xl saas-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-base font-bold text-brand-navy dark:text-brand-warm-white">
                Expense Category Allocation
              </h3>
              <p className="text-xs text-gray-400">Proportional budget distribution</p>
            </div>
            <button 
              onClick={() => setActiveTab('budget')} 
              className="text-xs text-brand-purple hover:underline flex items-center space-x-1"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Allocated']}
                  contentStyle={{ backgroundColor: '#1B1E2E', borderColor: '#6750A4', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-gray-100 dark:border-white/5 text-[11px]">
            {pieData.slice(0, 6).map((item, i) => (
              <div key={i} className="flex items-center space-x-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate text-gray-500 dark:text-gray-400">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Budget vs Actual Spending (Bar Chart) */}
        <div className="p-6 rounded-2xl saas-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-base font-bold text-brand-navy dark:text-brand-warm-white">
                Planned vs. Actual Spending
              </h3>
              <p className="text-xs text-gray-400">Real-time expenditure tracking</p>
            </div>
            <button 
              onClick={() => setActiveTab('budget')} 
              className="text-xs text-brand-purple hover:underline flex items-center space-x-1"
            >
              <span>Add Expense</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#1B1E2E', borderColor: '#6750A4', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="Planned" fill="#DCEBFA" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#6750A4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center space-x-6 mt-2 pt-3 border-t border-gray-100 dark:border-white/5 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded bg-brand-powder-blue" />
              <span className="text-gray-500">Planned Budget</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded bg-brand-purple" />
              <span className="text-gray-500">Actual Realized</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Activities & Fast Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Timeline Steps */}
        <div className="lg:col-span-2 p-6 rounded-2xl saas-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-base font-bold text-brand-navy dark:text-brand-warm-white">
                Upcoming Timeline Activities
              </h3>
              <p className="text-xs text-gray-400">Day-of event schedule checklist</p>
            </div>
            <button 
              onClick={() => setActiveTab('timeline')}
              className="text-xs font-semibold text-brand-purple hover:underline"
            >
              View Full Timeline
            </button>
          </div>

          <div className="space-y-3">
            {currentEvent?.event_schedule.slice(0, 4).map((item, idx) => (
              <div 
                key={idx}
                className="flex items-start space-x-3 p-3 rounded-xl bg-brand-warm-white dark:bg-white/5 border border-brand-lavender/50 dark:border-white/5"
              >
                <div className="mt-0.5">
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-brand-purple" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand-navy dark:text-brand-warm-white">{item.activity}</span>
                    <span className="text-[11px] font-mono text-brand-purple dark:text-brand-lavender font-bold">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Launch Shortcuts */}
        <div className="p-6 rounded-2xl saas-card flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-brand-navy dark:text-brand-warm-white mb-1">
              CelebrAI Quick Actions
            </h3>
            <p className="text-xs text-gray-400 mb-4">Jump directly into specialized studios</p>

            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('theme-studio')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-lavender/40 hover:bg-brand-lavender dark:bg-white/5 dark:hover:bg-white/10 text-left transition-all"
              >
                <div className="flex items-center space-x-2.5">
                  <Palette className="w-4 h-4 text-brand-purple" />
                  <span className="text-xs font-semibold">Explore Themes & Moodboard</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => setActiveTab('invitations')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-powder-blue/40 hover:bg-brand-powder-blue dark:bg-white/5 dark:hover:bg-white/10 text-left transition-all"
              >
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold">Customize Invitation Card</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => setActiveTab('ai-assistant')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-muted-pink/40 hover:bg-brand-muted-pink dark:bg-white/5 dark:hover:bg-white/10 text-left transition-all"
              >
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4 text-pink-600" />
                  <span className="text-xs font-semibold">Ask Context-Aware AI</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-white/5 text-[11px] text-gray-400">
            Aesthetic vibe: <span className="text-brand-purple dark:text-brand-lavender font-semibold">{currentEvent?.theme.vibe_keywords.join(', ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
