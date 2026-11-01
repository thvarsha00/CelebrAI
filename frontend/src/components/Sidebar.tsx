import React from 'react';
import { useEventContext, DashboardTab } from '../context/EventContext';
import { 
  LayoutDashboard, 
  CalendarDays, 
  PlusCircle, 
  FileText,
  PieChart, 
  Palette, 
  Mail, 
  Users, 
  Clock, 
  Bot, 
  CheckSquare, 
  Flame, 
  Settings,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface NavGroup {
  label: string;
  items: {
    id: DashboardTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[];
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentEvent } = useEventContext();

  const groups: NavGroup[] = [
    {
      label: 'Core Workflow',
      items: [
        { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'my-events', label: 'My Celebrations', icon: <CalendarDays className="w-4 h-4" /> },
        { id: 'create-event', label: 'Plan New Event', icon: <PlusCircle className="w-4 h-4 text-brand-purple" />, badge: 'AI' },
        { id: 'event-plan', label: '14-Section Plan', icon: <FileText className="w-4 h-4" /> },
      ]
    },
    {
      label: 'Design & Budget Studios',
      items: [
        { id: 'budget', label: 'Budget Planner', icon: <PieChart className="w-4 h-4" /> },
        { id: 'theme-studio', label: 'Theme Studio', icon: <Palette className="w-4 h-4" /> },
        { id: 'invitations', label: 'Invitation Studio', icon: <Mail className="w-4 h-4" /> },
      ]
    },
    {
      label: 'Coordination & Ops',
      items: [
        { id: 'guests', label: 'Guest Manager', icon: <Users className="w-4 h-4" /> },
        { id: 'timeline', label: 'Event Timeline', icon: <Clock className="w-4 h-4" /> },
        { id: 'shopping', label: 'Shopping Checklist', icon: <CheckSquare className="w-4 h-4" /> },
      ]
    },
    {
      label: 'Autonomous AI',
      items: [
        { id: 'ai-assistant', label: 'AI Assistant', icon: <Bot className="w-4 h-4 text-brand-purple" /> },
        { id: 'last-minute', label: '24h Emergency Rescue', icon: <Flame className="w-4 h-4 text-rose-500" />, badge: 'Rescue' },
        { id: 'settings', label: 'Settings & Status', icon: <Settings className="w-4 h-4" /> },
      ]
    }
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-brand-lavender/60 dark:border-white/10 bg-white/70 dark:bg-[#151722]/90 backdrop-blur-md p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-5">
        {/* Active Celebration Card */}
        {currentEvent && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-brand-lavender/60 to-brand-powder-blue/30 dark:from-[#1E2235] dark:to-[#171A29] border border-brand-lavender dark:border-white/10 shadow-xs">
            <span className="text-[9px] font-bold text-brand-purple dark:text-brand-lavender uppercase tracking-widest">
              Active Context
            </span>
            <h4 className="text-xs font-bold text-brand-navy dark:text-brand-warm-white truncate mt-1">
              {currentEvent.title}
            </h4>
            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 pt-1.5 border-t border-brand-lavender/40 dark:border-white/10">
              <span>{currentEvent.guest_count} guests</span>
              <span className="font-bold text-brand-purple dark:text-brand-lavender">
                ₹{Number(currentEvent.total_budget).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Grouped Navigation */}
        <nav aria-label="Main navigation" className="space-y-4">
          {groups.map((grp, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400 px-3 block">
                {grp.label}
              </span>
              {grp.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 ${
                      isActive
                        ? 'bg-brand-purple text-white font-semibold shadow-xs'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-brand-lavender/40 dark:hover:bg-white/5 hover:text-brand-navy dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className={`${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.badge === 'Rescue'
                              ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-brand-lavender text-brand-purple dark:bg-brand-purple/20 dark:text-brand-lavender'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3 h-3 text-white/70" />}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-brand-lavender/40 dark:border-white/10 text-[11px] text-gray-400 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>CelebrAI Engine</span>
        </div>
        <span className="font-mono text-[10px]">v1.0 • SaaS</span>
      </div>
    </aside>
  );
};
