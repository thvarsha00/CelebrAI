import React, { useState } from 'react';
import { useEventContext, DashboardTab } from '../context/EventContext';
import { 
  Sparkles, 
  Moon, 
  Sun, 
  Plus, 
  Calendar, 
  Home, 
  CheckCircle2, 
  Menu, 
  X,
  LayoutDashboard,
  CalendarDays,
  FileText,
  PieChart,
  Palette,
  Mail,
  Users,
  Clock,
  CheckSquare,
  Bot,
  Flame,
  Settings,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentEvent, 
    events, 
    setCurrentEvent, 
    activeTab, 
    setActiveTab, 
    isLanding, 
    setIsLanding, 
    darkMode, 
    toggleDarkMode,
    isDemoAuth 
  } = useEventContext();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mobileNavItems: { id: DashboardTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'my-events', label: 'My Celebrations', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'create-event', label: 'Create New Event', icon: <Plus className="w-4 h-4 text-brand-purple" />, badge: 'AI' },
    { id: 'event-plan', label: '14-Section Plan', icon: <FileText className="w-4 h-4" /> },
    { id: 'budget', label: 'Budget Planner', icon: <PieChart className="w-4 h-4" /> },
    { id: 'theme-studio', label: 'Theme Studio', icon: <Palette className="w-4 h-4" /> },
    { id: 'invitations', label: 'Invitation Studio', icon: <Mail className="w-4 h-4" /> },
    { id: 'guests', label: 'Guest Manager', icon: <Users className="w-4 h-4" /> },
    { id: 'timeline', label: 'Event Timeline', icon: <Clock className="w-4 h-4" /> },
    { id: 'shopping', label: 'Shopping Checklist', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'ai-assistant', label: 'AI Assistant', icon: <Bot className="w-4 h-4 text-brand-purple" /> },
    { id: 'last-minute', label: '24h Emergency Rescue', icon: <Flame className="w-4 h-4 text-rose-500" />, badge: 'Rescue' },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleMobileNav = (tab: DashboardTab) => {
    setActiveTab(tab);
    setIsLanding(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-brand-lavender/70 dark:border-white/10 bg-white/85 dark:bg-[#131520]/85 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand identity */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => {
              setIsLanding(true);
              setMobileMenuOpen(false);
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-purple to-[#8C6EE0] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-brand-navy dark:text-brand-warm-white">
                  Celebr<span className="text-brand-purple italic">AI</span>
                </span>
                <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-brand-lavender text-brand-purple dark:bg-brand-purple/20 dark:text-brand-lavender border border-brand-purple/15">
                  PROMPTWARS
                </span>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-sans hidden sm:block -mt-0.5">
                Every celebration deserves a perfect plan.
              </p>
            </div>
          </div>

          {/* Center & Right Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {isLanding ? (
              <button
                onClick={() => {
                  setIsLanding(false);
                  setActiveTab('overview');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white shadow-subtle hover:shadow-premium transition-all flex items-center space-x-2"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Launch App Dashboard</span>
              </button>
            ) : (
              <>
                {/* Event Selector Pill */}
                <div className="hidden sm:flex items-center space-x-2 bg-brand-warm-white dark:bg-[#1B1E2E] border border-brand-lavender dark:border-white/10 rounded-xl px-3 py-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <select
                    value={currentEvent?.id || ''}
                    onChange={(e) => {
                      const found = events.find(ev => ev.id === e.target.value);
                      if (found) setCurrentEvent(found);
                    }}
                    className="bg-transparent text-xs font-semibold text-brand-navy dark:text-brand-warm-white focus:outline-none max-w-[150px] md:max-w-[190px] truncate cursor-pointer"
                  >
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id} className="text-brand-navy dark:text-brand-navy bg-white dark:bg-white">
                        {ev.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* New Event CTA */}
                <button
                  onClick={() => {
                    setActiveTab('create-event');
                    setIsLanding(false);
                  }}
                  className="hidden sm:flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-brand-lavender dark:bg-brand-purple/20 text-brand-purple dark:text-brand-lavender hover:bg-brand-purple hover:text-white transition-all border border-brand-purple/10"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Plan Event</span>
                </button>

                <button
                  onClick={() => setIsLanding(true)}
                  className="p-2 rounded-xl text-gray-500 hover:text-brand-purple hover:bg-brand-lavender/50 dark:hover:bg-white/5 transition-all"
                  title="Landing Page Overview"
                >
                  <Home className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Demo Status Pill */}
            {isDemoAuth && (
              <div className="hidden lg:flex items-center space-x-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Demo Mode</span>
              </div>
            )}

            {/* Dark/Light Mode Switcher */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-brand-navy dark:text-brand-warm-white hover:bg-brand-lavender/50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-brand-lavender/80"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-brand-purple" />}
            </button>

            {/* Mobile Drawer Hamburger Button */}
            {!isLanding && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-brand-navy dark:text-brand-warm-white hover:bg-brand-lavender/50 transition-colors"
                aria-label="Open Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Sheet */}
      {mobileMenuOpen && !isLanding && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#171926] p-5 h-full overflow-y-auto max-w-xs border-r border-brand-lavender dark:border-white/10 shadow-2xl">
            {/* Active event in mobile */}
            {currentEvent && (
              <div className="p-3 mb-4 rounded-xl bg-brand-lavender/50 dark:bg-white/5 border border-brand-lavender/60 dark:border-white/10">
                <span className="text-[9px] font-bold text-brand-purple uppercase tracking-wider">Active Event</span>
                <h4 className="text-xs font-bold text-brand-navy dark:text-brand-warm-white truncate mt-0.5">
                  {currentEvent.title}
                </h4>
                <div className="flex justify-between text-[11px] text-gray-500 mt-1">
                  <span>{currentEvent.guest_count} guests</span>
                  <span className="font-bold text-brand-purple">₹{Number(currentEvent.total_budget).toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider px-2 block mb-1">
                Navigation Modules
              </span>
              {mobileNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNav(item.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-brand-purple text-white font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-brand-lavender/40 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-brand-lavender text-brand-purple'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
