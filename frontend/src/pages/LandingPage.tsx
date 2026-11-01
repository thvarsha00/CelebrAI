import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  PieChart, 
  Palette, 
  Mail, 
  Users, 
  Flame, 
  Bot, 
  ShieldCheck, 
  Star,
  Zap,
  Calendar,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  const { setIsLanding, setActiveTab } = useEventContext();
  const [activePreviewTab, setActivePreviewTab] = useState<'palette' | 'budget' | 'guests'>('palette');

  const handleStartPlanning = (promptPreset?: string) => {
    setIsLanding(false);
    setActiveTab('create-event');
  };

  const handleExploreDashboard = () => {
    setIsLanding(false);
    setActiveTab('overview');
  };

  const heroPromptChips = [
    "Pastel blue 25th birthday for 30 guests • ₹15,000",
    "Royal gold engagement party • 50 guests • ₹50,000",
    "Nordic minimalist graduation dinner • 20 guests • ₹12,000"
  ];

  const categories = [
    { name: "Birthdays", count: "120+ Styles", img: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&auto=format&fit=crop&q=80" },
    { name: "Weddings", count: "Royal & Minimal", img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80" },
    { name: "Anniversaries", count: "Romantic Evenings", img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80" },
    { name: "Baby Showers", count: "Pastel Aesthetics", img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&auto=format&fit=crop&q=80" },
    { name: "Graduations", count: "Milestone Bashes", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80" },
    { name: "Corporate Galas", count: "Executive Mixers", img: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80" },
  ];

  const features = [
    {
      icon: <Sparkles className="w-5 h-5 text-brand-purple" />,
      title: "One-Prompt Event Creation",
      desc: "Describe your dream celebration in conversational English and receive a complete 14-section structured plan validated by Pydantic."
    },
    {
      icon: <PieChart className="w-5 h-5 text-brand-purple" />,
      title: "Intelligent Budget Optimizer",
      desc: "Reallocate vendor expenses verbally ('Reduce decor by ₹1,000 and increase food') with strict zero-budget-creep enforcement."
    },
    {
      icon: <Palette className="w-5 h-5 text-brand-purple" />,
      title: "AI Moodboard & Theme Studio",
      desc: "Explore 9 bespoke celebration aesthetics with dynamic hex palettes, lighting schemes, table styling, and cake designs."
    },
    {
      icon: <Mail className="w-5 h-5 text-brand-purple" />,
      title: "Interactive Invitation Studio",
      desc: "Customize AI-crafted wording, font pairings, and card templates with live preview and one-click high-resolution PNG export."
    },
    {
      icon: <Flame className="w-5 h-5 text-rose-500" />,
      title: "24-Hour Emergency Rescue",
      desc: "Short on time? An automated triage matrix distinguishes critical-path steps from time-wasting distractions to eliminate panic."
    },
    {
      icon: <Bot className="w-5 h-5 text-brand-purple" />,
      title: "Context-Aware Assistant",
      desc: "An intelligent copilot that maintains continuous situational awareness of your active event and executes live data modifications on command."
    }
  ];

  const testimonials = [
    {
      name: "Aanya Mehta",
      role: "Host • 30th Birthday Soirée",
      content: "CelebrAI felt like having a ₹50,000 wedding & event planner in my pocket. The budget rebalancing alone saved us ₹4,500 on catering extras!",
      rating: 5
    },
    {
      name: "Rohan & Sneha",
      role: "Couple • Pastel Garden Engagement",
      content: "The moodboards and invitation designer blew our guests away. Everyone assumed we spent months with an agency; CelebrAI generated it in 30 seconds.",
      rating: 5
    },
    {
      name: "Vikram Sengupta",
      role: "VP • Annual Corporate Mixer",
      content: "The timeline scheduler and guest RSVP tracking kept 80 attendees synchronized without a single hiccup. Truly enterprise-grade SaaS quality.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-brand-warm-white dark:bg-[#131520] text-brand-navy dark:text-brand-warm-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 bg-pastel-mesh border-b border-brand-lavender/50 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-lavender/80 dark:bg-white/10 border border-brand-purple/20 text-brand-purple dark:text-brand-lavender text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>PromptWars Challenge 5 • AI Celebration & Event Planner</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-brand-navy dark:text-brand-warm-white leading-[1.08]"
            >
              Make Every Moment <br />
              <span className="italic bg-gradient-to-r from-brand-purple to-[#8C6EE0] bg-clip-text text-transparent">
                Extraordinary.
              </span>
            </motion.h1>

            {/* Supporting text */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-sans max-w-2xl mx-auto leading-relaxed"
            >
              Your personal AI event planner. From the first idea to the final celebration, plan everything effortlessly with intelligent budgeting, curated themes, and interactive invitations.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3"
            >
              <button
                onClick={() => handleStartPlanning()}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-purple hover:bg-brand-purple-dark text-white font-semibold text-xs shadow-premium flex items-center justify-center space-x-2 group transition-all"
              >
                <span>Plan Your Celebration</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleExploreDashboard}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white dark:bg-[#1B1E2E] border border-brand-lavender dark:border-white/10 text-brand-navy dark:text-brand-warm-white font-semibold text-xs shadow-xs hover:bg-brand-lavender/30 transition-all"
              >
                Explore Features
              </button>
            </motion.div>

            {/* Quick interactive prompt pills */}
            <div className="pt-2">
              <span className="text-[11px] text-gray-400 block mb-2 font-medium">Or try one-click prompt templates:</span>
              <div className="flex flex-wrap justify-center gap-2">
                {heroPromptChips.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleStartPlanning(chip)}
                    className="text-[11px] px-3 py-1.5 rounded-full bg-white/70 dark:bg-white/5 border border-brand-lavender/60 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-brand-purple hover:text-brand-purple transition-all shadow-2xs"
                  >
                    ✨ {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Philosophy quote */}
            <p className="text-xs italic text-gray-400 dark:text-gray-500 pt-1 font-serif">
              "From imagination to celebration, without the planning stress."
            </p>
          </div>

          {/* Floating UI Preview with Interactive Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12 max-w-5xl mx-auto rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-brand-lavender/60 via-white to-white dark:from-[#1E2235] dark:via-[#1B1E2E] dark:to-[#171A29] border border-brand-lavender dark:border-white/10 shadow-2xl"
          >
            <div className="bg-white dark:bg-[#141622] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10 gap-3">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                  <span className="text-xs font-mono text-gray-400 ml-2">celebrAI://studio/live-preview</span>
                </div>

                {/* Tab Switcher on Preview */}
                <div className="flex items-center space-x-1 p-1 bg-brand-warm-white dark:bg-[#1B1E2E] border border-brand-lavender/60 dark:border-white/5 rounded-xl">
                  <button
                    onClick={() => setActivePreviewTab('palette')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      activePreviewTab === 'palette' ? 'bg-brand-purple text-white' : 'text-gray-500'
                    }`}
                  >
                    Theme & Decor
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('budget')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      activePreviewTab === 'budget' ? 'bg-brand-purple text-white' : 'text-gray-500'
                    }`}
                  >
                    Budget Engine
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('guests')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      activePreviewTab === 'guests' ? 'bg-brand-purple text-white' : 'text-gray-500'
                    }`}
                  >
                    Guest RSVP
                  </button>
                </div>
              </div>

              {/* Sample Plan Preview Mockup */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
                <div className={`p-4 rounded-2xl border transition-all ${
                  activePreviewTab === 'palette' ? 'border-brand-purple bg-brand-lavender/30 ring-2 ring-brand-purple/20' : 'border-brand-lavender/60 dark:border-white/5 bg-brand-lavender/20 dark:bg-white/5'
                }`}>
                  <span className="text-[10px] uppercase font-bold text-brand-purple tracking-wider">Concept & Palette</span>
                  <h4 className="text-sm font-semibold font-serif mt-1">Pastel Blue & Cloud White</h4>
                  <div className="flex space-x-1.5 mt-3">
                    {["#DCEBFA", "#6750A4", "#FAF9F7", "#F4DCE9", "#20243A"].map((c, i) => (
                      <span key={i} className="w-5 h-5 rounded-full shadow-xs border border-white/50" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Soft fairy lights (2700K) with ambient lilac uplighting</p>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${
                  activePreviewTab === 'budget' ? 'border-brand-purple bg-brand-powder-blue/30 ring-2 ring-brand-purple/20' : 'border-brand-lavender/60 dark:border-white/5 bg-brand-powder-blue/20 dark:bg-white/5'
                }`}>
                  <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Budget Balance</span>
                  <h4 className="text-sm font-semibold mt-1">₹15,000 Allocation Cap</h4>
                  <div className="w-full bg-gray-200 dark:bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
                    <div className="bg-brand-purple h-2 rounded-full w-[100%]"></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Allocated: ₹15,000</span>
                    <span className="text-emerald-600 font-semibold">100% Balanced</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${
                  activePreviewTab === 'guests' ? 'border-brand-purple bg-brand-muted-pink/30 ring-2 ring-brand-purple/20' : 'border-brand-lavender/60 dark:border-white/5 bg-brand-muted-pink/20 dark:bg-white/5'
                }`}>
                  <span className="text-[10px] uppercase font-bold text-pink-600 tracking-wider">Guest & RSVP</span>
                  <h4 className="text-sm font-semibold mt-1">30 Confirmed Attendees</h4>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium text-[11px]">24 Yes</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-medium text-[11px]">4 Pending</span>
                    <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-medium text-[11px]">2 No</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">WhatsApp RSVP Tracker Synchronized</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Event Categories */}
      <section className="py-20 border-b border-brand-lavender/40 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest font-semibold text-brand-purple">
              Tailored For Every Milestone
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2">
              Every Celebration, Intelligently Crafted
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              From intimate birthday dinners to grand weddings and high-profile corporate galas.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <div 
                key={i} 
                onClick={() => handleStartPlanning()}
                className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-premium transition-all duration-300 border border-brand-lavender/50 dark:border-white/10"
              >
                <div className="h-44 w-full overflow-hidden">
                  <img 
                    src={cat.img} 
                    alt={cat.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/40 to-transparent"></div>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-serif text-base font-semibold">{cat.name}</h3>
                  <p className="text-[11px] text-brand-lavender/90">{cat.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-20 bg-white/60 dark:bg-white/5 border-b border-brand-lavender/40 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest font-semibold text-brand-purple">
              Architectural Capabilities
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2">
              Built Like An Elite SaaS Platform
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Combining Google Gemini AI, rigorous Pydantic schemas, and bespoke interactive tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <div 
                key={i} 
                className="p-6 rounded-2xl saas-card"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-lavender/70 dark:bg-white/10 flex items-center justify-center mb-4">
                  {feat.icon}
                </div>
                <h3 className="font-serif text-base font-bold text-brand-navy dark:text-brand-warm-white">
                  {feat.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-b border-brand-lavender/40 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest font-semibold text-brand-purple">
              Intuitive Workflow
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2">
              From Idea to Celebration in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-6 rounded-2xl saas-card text-center">
              <div className="w-9 h-9 rounded-full bg-brand-purple text-white font-serif font-bold text-sm flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h4 className="font-serif text-base font-semibold">Express Your Vision</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Describe your dream event in simple English or utilize our guided wizard with guest count, budget, and location.
              </p>
            </div>

            <div className="p-6 rounded-2xl saas-card text-center">
              <div className="w-9 h-9 rounded-full bg-brand-purple text-white font-serif font-bold text-sm flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h4 className="font-serif text-base font-semibold">AI Generates 14 Structured Modules</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Receive customized themes, decor concepts, menu courses, photography shot lists, and a balanced budget breakdown.
              </p>
            </div>

            <div className="p-6 rounded-2xl saas-card text-center">
              <div className="w-9 h-9 rounded-full bg-brand-purple text-white font-serif font-bold text-sm flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h4 className="font-serif text-base font-semibold">Fine-Tune & Host Effortlessly</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Download interactive invitations, manage RSVPs, check off items, and command the AI assistant to adjust live parameters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-brand-lavender/20 dark:bg-white/5 border-b border-brand-lavender/40 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest font-semibold text-brand-purple">
              User Experiences
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2">
              Cherished By Hosts Everywhere
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">
              (Sample host feedback demonstrating platform capabilities)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div 
                key={i} 
                className="p-6 rounded-2xl saas-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex space-x-1 text-amber-400 mb-3">
                    {[...Array(t.rating)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 italic leading-relaxed">
                    "{t.content}"
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-white/5">
                  <h5 className="font-semibold text-xs">{t.name}</h5>
                  <span className="text-[11px] text-gray-400">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 bg-pastel-mesh text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold">
            Ready To Create An Unforgettable Event?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            Experience the future of intelligent celebration planning with CelebrAI. No spreadsheets, no stress, just extraordinary moments.
          </p>
          <div className="pt-2">
            <button
              onClick={() => handleStartPlanning()}
              className="px-8 py-4 rounded-2xl bg-brand-purple hover:bg-brand-purple-dark text-white font-semibold text-xs shadow-premium inline-flex items-center space-x-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch CelebrAI Planner</span>
            </button>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="border-t border-brand-lavender/60 dark:border-white/10 py-10 bg-white dark:bg-[#11131c] text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-serif text-base font-bold text-brand-navy dark:text-brand-warm-white">
              Celebr<span className="text-brand-purple italic">AI</span>
            </span>
            <span>• PromptWars Virtual Hackathon • Challenge 5</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <span>FastAPI • Gemini AI • React TypeScript</span>
            <span className="text-emerald-500 font-semibold">Demo Mode Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
