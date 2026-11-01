import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventPlan } from '../types';
import { api } from '../services/api';

export type DashboardTab = 
  | 'overview' 
  | 'my-events' 
  | 'create-event' 
  | 'event-plan'
  | 'budget' 
  | 'theme-studio' 
  | 'invitations' 
  | 'guests' 
  | 'timeline' 
  | 'ai-assistant' 
  | 'shopping' 
  | 'last-minute' 
  | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description?: string;
}

interface EventContextType {
  currentEvent: EventPlan | null;
  events: EventPlan[];
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  isLanding: boolean;
  setIsLanding: (val: boolean) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, description?: string) => void;
  removeToast: (id: string) => void;
  setCurrentEvent: (event: EventPlan | null) => void;
  refreshEvents: () => Promise<void>;
  updateCurrentEvent: (patch: Partial<EventPlan>) => Promise<void>;
  loading: boolean;
  isDemoAuth: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

// Initial sample event if DB is initially empty
const defaultSampleEvent: EventPlan = {
  id: "demo-event-001",
  title: "The Pastel Blue 25th Birthday Gala",
  tagline: "Every celebration deserves a perfect plan.",
  event_type: "Birthday",
  guest_count: 30,
  total_budget: 15000,
  location: "Skyline Glasshouse Rooftop, Bangalore",
  event_date: "2026-11-20",
  overview: "A sophisticated pastel blue and lavender 25th birthday soirée organized for 30 close friends and family, optimized for memorable photography and relaxed elegance.",
  concept: "Built around gentle atmospheric fairy lighting, artisanal vegetarian tapas, and an interactive Polaroid memory station.",
  theme: {
    primary_color: "#DCEBFA",
    secondary_color: "#6750A4",
    accent_color: "#FAF9F7",
    hex_codes: ["#DCEBFA", "#6750A4", "#20243A", "#FAF9F7", "#F1F1F5"],
    vibe_keywords: ["Serene", "Dreamy", "Modern", "Airy", "Elegant"],
    lighting_style: "Soft warm fairy lights (2700K) with ambient lavender sconces",
    dress_code: "Smart Casual with pastel blue or neutral white tones"
  },
  decorations: [
    "Organic arch balloon garland with pastel blue, soft lilac, and chrome gold accents",
    "7ft matte photo backdrop wall with warm neon typography: 'Forever Young'",
    "Glass bud vases with baby's breath and tapered candles on each cocktail table",
    "Fairy light curtain backdrop with draped semi-sheer chiffon behind cake table",
    "Custom gold-foiled welcome easel board at the entryway"
  ],
  venue_recommendations: [
    { name: "Skyline Glasshouse & Rooftop Lounge", type: "Boutique Rooftop", capacity: "45 guests", price_estimate: "₹4,200", perk: "Panoramic sunset views and built-in ambient lighting" },
    { name: "The Secret Garden Conservatory", type: "Open-air Garden Cafe", capacity: "50 guests", price_estimate: "₹3,800", perk: "Natural lush greenery minimizing external floral costs" },
    { name: "Heritage Loft Studio", type: "Private Event Loft", capacity: "35 guests", price_estimate: "₹3,500", perk: "High ceilings, sound system included, full personalization freedom" }
  ],
  food_and_beverage: [
    { course: "Welcome Drinks & Mocktails", items: ["Sparkling Lavender Lemonade with Mint", "Blueberry Blossom Cooler", "Artisanal Fresh Lime Soda"] },
    { course: "Appetizers & Starters", items: ["Herb-Crusted Paneer Tikka Skewers", "Crispy Truffle Mushroom Crostini", "Stuffed Phyllo Cups with Corn & Jalapeno cream"] },
    { course: "Main Course", items: ["Creamy Penne Rosa with Sundried Tomatoes", "Fragrant Saffron Peas Pilaf", "Velvety Dal Makhani with Butter Naan"] },
    { course: "Desserts & Celebration Cake", items: ["Custom 2-tier Pastel Blue Buttercream Cake", "Mini Belgian Chocolate Pots", "Pistachio Kulfi Bites"] }
  ],
  photography_suggestions: [
    "Golden hour group portrait session scheduled 45 minutes prior to sunset",
    "DIY Instant Polaroid Station with magnetic photo keepsake guestbook",
    "Candid capture during the toast, cake cutting, and interactive games"
  ],
  entertainment_suggestions: [
    "Curated Spotify jazz-lounge playlist transitioning to upbeat indie celebration tunes",
    "Personalized trivia quiz about the guest of honour via interactive Kahoot",
    "Memory jar activity: guests drop handwritten advice and hilarious predictions"
  ],
  budget_breakdown: [
    { category: "Catering & Beverages", allocated_amount: 4800, percentage: 32.0, notes: "Buffet & welcome drinks for 30 guests" },
    { category: "Venue & Space", allocated_amount: 4200, percentage: 28.0, notes: "Deposit & base rooftop rental fee" },
    { category: "Decorations & Ambiance", allocated_amount: 2400, percentage: 16.0, notes: "Backdrop, balloon garland & fairy lights" },
    { category: "Cake & Confectionery", allocated_amount: 1200, percentage: 8.0, notes: "Custom 2-tier pastel designer cake" },
    { category: "Photography & Memories", allocated_amount: 1200, percentage: 8.0, notes: "Instant Polaroid film twin packs & props" },
    { category: "Music & Miscellaneous", allocated_amount: 1200, percentage: 8.0, notes: "Sound system, game props & contingency fund" }
  ],
  shopping_checklist: [
    { id: "s-1", category: "Decorations", item_name: "Pastel blue balloon garland kit & hand pump", quantity: "1 set", estimated_price: 600, purchased: true },
    { id: "s-2", category: "Decorations", item_name: "Warm white fairy light curtains (3x3m)", quantity: "2 sets", estimated_price: 450, purchased: false },
    { id: "s-3", category: "Tableware", item_name: "Eco-friendly bamboo plates & cutlery", quantity: "40 pcs", estimated_price: 450, purchased: true },
    { id: "s-4", category: "Cake", item_name: "Celebratory gold mirror acrylic cake topper", quantity: "1 pc", estimated_price: 300, purchased: false },
    { id: "s-5", category: "Memories", item_name: "Polaroid instant film twin packs & gold markers", quantity: "2 packs", estimated_price: 600, purchased: false }
  ],
  event_schedule: [
    { id: "t-1", time: "04:30 PM", activity: "Decor & Lighting Setup", description: "Arrive at rooftop, string fairy lights, arrange welcome board", completed: true },
    { id: "t-2", time: "05:45 PM", activity: "Cake & Food Delivery Check", description: "Inspect cake details, chill beverages, test sound system", completed: false },
    { id: "t-3", time: "06:30 PM", activity: "Guest Arrival & Welcome Mocktails", description: "Background jazz playing, polaroid guestbook station open", completed: false },
    { id: "t-4", time: "07:30 PM", activity: "Toast & Cake Cutting Ceremony", description: "Speeches, candle extinguishing, group photo moment", completed: false },
    { id: "t-5", time: "08:15 PM", activity: "Dinner Buffet & Social Mingling", description: "Dinner buffet opens, table conversations and trivia", completed: false },
    { id: "t-6", time: "09:30 PM", activity: "Games & Favors Farewell", description: "Hand out takeaway cookie favors, wrap up event", completed: false }
  ],
  invitation: {
    headline: "You Are Cordially Invited to Celebrate",
    subheading: "A Magical 25th Birthday in Pastel Blue",
    host_text: "Join us as we raise a toast to unforgettable memories",
    body_text: "Please join our circle of cherished friends and family for an evening of warmth, laughter, and gourmet treats.",
    date_time_text: "Saturday, November 20, 2026 at 6:30 PM",
    venue_text: "Skyline Glasshouse Lounge, Bangalore",
    rsvp_text: "RSVP by November 15th to facilitate customized seating",
    suggested_palette: ["#DCEBFA", "#6750A4", "#20243A"]
  },
  prep_timeline: [
    { timeframe: "2 Weeks Before", task: "Finalize guest RSVPs, confirm venue reservation, and order customized cake" },
    { timeframe: "1 Week Before", task: "Purchase decorative supplies, assemble playlist, send RSVP reminder" },
    { timeframe: "2 Days Before", task: "Reconfirm catering headcounts, check weather forecast, assemble party favors" },
    { timeframe: "Day Of Event", task: "Morning decor inspection, phone battery fully charged, relax and enjoy!" }
  ],
  personalized_recommendations: [
    "With your ₹15,000 budget for 30 guests, self-serve mocktail dispensers will save ~₹2,500 over individual cans while looking substantially more photogenic.",
    "Rent warm fairy light curtains instead of buying bulky marquee letters to save 40% on decoration expenses.",
    "Consider digital WhatsApp RSVP tracking to minimize printed invitation waste and get real-time dietary requirements."
  ]
};

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentEvent, setCurrentEvent] = useState<EventPlan | null>(defaultSampleEvent);
  const [events, setEvents] = useState<EventPlan[]>([defaultSampleEvent]);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isLanding, setIsLanding] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const isDemoAuth = true;

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const addToast = (type: 'success' | 'info' | 'warning' | 'error', title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshEvents = async () => {
    try {
      setLoading(true);
      const list = await api.getEvents();
      if (list && list.length > 0) {
        setEvents(list);
        if (!currentEvent || !list.some(e => e.id === currentEvent.id)) {
          setCurrentEvent(list[0]);
        }
      }
    } catch {
      // Fallback keeping current state
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentEvent = async (patch: Partial<EventPlan>) => {
    if (!currentEvent) return;
    const updated = { ...currentEvent, ...patch };
    setCurrentEvent(updated);
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
    try {
      await api.updateEvent(currentEvent.id, updated);
      addToast('success', 'Event updated', 'Changes have been saved to database.');
    } catch {
      // Local state updated anyway
    }
  };

  useEffect(() => {
    refreshEvents();
  }, []);

  return (
    <EventContext.Provider value={{
      currentEvent,
      events,
      activeTab,
      setActiveTab,
      isLanding,
      setIsLanding,
      darkMode,
      toggleDarkMode,
      toasts,
      addToast,
      removeToast,
      setCurrentEvent,
      refreshEvents,
      updateCurrentEvent,
      loading,
      isDemoAuth
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) throw new Error('useEventContext must be used within EventProvider');
  return context;
};
