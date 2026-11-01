export interface ThemePalette {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  hex_codes: string[];
  vibe_keywords: string[];
  lighting_style: string;
  dress_code: string;
}

export interface BudgetItem {
  category: string;
  allocated_amount: number;
  percentage: number;
  notes?: string;
}

export interface BudgetOptimizationResponse {
  total_budget: number;
  updated_allocations: BudgetItem[];
  explanation: string;
  budget_exceeded: boolean;
  difference: number;
}

export interface MenuItem {
  course: string;
  items: string[];
  special_notes?: string;
}

export interface TimelineActivity {
  id?: string;
  time: string;
  activity: string;
  description: string;
  completed?: boolean;
}

export interface ShoppingItem {
  id?: string;
  category: string;
  item_name: string;
  quantity: string;
  estimated_price: number;
  purchased?: boolean;
}

export interface InvitationTemplate {
  headline: string;
  subheading: string;
  host_text: string;
  body_text: string;
  date_time_text: string;
  venue_text: string;
  rsvp_text: string;
  suggested_palette: string[];
}

export interface VenueRecommendation {
  name: string;
  type: string;
  capacity: string;
  price_estimate: string;
  perk: string;
}

export interface PrepTimelineItem {
  timeframe: string;
  task: string;
}

export interface EventPlan {
  id: string;
  title: string;
  tagline: string;
  event_type: string;
  guest_count: number;
  total_budget: number;
  location: string;
  event_date: string;
  overview: string;
  concept: string;
  theme: ThemePalette;
  decorations: string[];
  venue_recommendations: VenueRecommendation[];
  food_and_beverage: MenuItem[];
  photography_suggestions: string[];
  entertainment_suggestions: string[];
  budget_breakdown: BudgetItem[];
  shopping_checklist: ShoppingItem[];
  event_schedule: TimelineActivity[];
  invitation: InvitationTemplate;
  prep_timeline: PrepTimelineItem[];
  personalized_recommendations: string[];
  created_at?: string;
}

export interface Guest {
  id?: string;
  event_id: string;
  name: string;
  email?: string;
  phone?: string;
  category: 'Family' | 'Friends' | 'Colleague' | 'VIP';
  rsvp_status: 'Confirmed' | 'Declined' | 'Pending';
  dietary_preferences?: string;
  plus_ones: number;
  invitation_sent?: boolean;
}

export interface Expense {
  id?: string;
  event_id: string;
  category: string;
  item_name: string;
  allocated_amount: number;
  actual_amount: number;
  notes?: string;
  paid?: boolean;
}

export interface EmergencyTask {
  urgency: 'Critical' | 'High' | 'Moderate';
  timeframe: string;
  title: string;
  description: string;
  can_delegate: boolean;
}

export interface LastMinutePlan {
  summary: string;
  time_remaining_hours: number;
  essential_tasks: EmergencyTask[];
  tasks_to_skip: string[];
  immediate_purchases: Array<{ item: string; store: string; est_cost: number }>;
  quick_decor_hacks: string[];
  foolproof_food_plan: string[];
  emergency_timeline: Array<{ time: string; action: string }>;
  budget_saving_tips: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggested_actions?: string[];
}
