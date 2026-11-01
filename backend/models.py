from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

# Event Generation Input
class EventGenerateRequest(BaseModel):
    event_type: str = Field(..., description="e.g. Birthday, Wedding, Anniversary, Baby Shower, Corporate")
    event_date: Optional[str] = "2026-11-20"
    event_location: Optional[str] = "Bangalore, India"
    guest_count: int = Field(default=30, ge=1)
    budget: float = Field(default=15000.0, description="Budget in INR")
    preferred_theme: Optional[str] = "Pastel Elegance"
    food_preferences: Optional[str] = "Vegetarian with artisanal desserts"
    decoration_preferences: Optional[str] = "Pastel blue and lavender balloons, fairy lights, floral backdrop"
    venue_preferences: Optional[str] = "Boutique rooftop cafe or banquet garden"
    additional_requirements: Optional[str] = None
    freeform_prompt: Optional[str] = None

# Structured Event Plan Components
class ThemePalette(BaseModel):
    primary_color: str
    secondary_color: str
    accent_color: str
    hex_codes: List[str]
    vibe_keywords: List[str]
    lighting_style: str
    dress_code: str

class BudgetItem(BaseModel):
    category: str
    allocated_amount: float
    percentage: float
    notes: Optional[str] = ""

class MenuItem(BaseModel):
    course: str # Starters, Mains, Desserts, Beverages
    items: List[str]
    special_notes: Optional[str] = None

class TimelineActivity(BaseModel):
    id: Optional[str] = None
    time: str
    activity: str
    description: str
    completed: bool = False

class ShoppingItem(BaseModel):
    id: Optional[str] = None
    category: str
    item_name: str
    quantity: str
    estimated_price: float
    purchased: bool = False

class InvitationTemplate(BaseModel):
    headline: str
    subheading: str
    host_text: str
    body_text: str
    date_time_text: str
    venue_text: str
    rsvp_text: str
    suggested_palette: List[str]

class EventPlan(BaseModel):
    id: Optional[str] = None
    title: str
    tagline: str
    event_type: str
    guest_count: int
    total_budget: float
    location: str
    event_date: str
    
    # 14 required sections
    overview: str
    concept: str
    theme: ThemePalette
    decorations: List[str]
    venue_recommendations: List[Dict[str, Any]]
    food_and_beverage: List[MenuItem]
    photography_suggestions: List[str]
    entertainment_suggestions: List[str]
    budget_breakdown: List[BudgetItem]
    shopping_checklist: List[ShoppingItem]
    event_schedule: List[TimelineActivity]
    invitation: InvitationTemplate
    prep_timeline: List[Dict[str, str]]
    personalized_recommendations: List[str]
    created_at: Optional[str] = None

# Budget Optimization
class BudgetOptimizationRequest(BaseModel):
    current_budget: float
    current_allocations: List[BudgetItem]
    user_instruction: str # e.g. "Reduce decorations by 1,000 and increase food budget by 1,000"

class BudgetOptimizationResponse(BaseModel):
    total_budget: float
    updated_allocations: List[BudgetItem]
    explanation: str
    budget_exceeded: bool
    difference: float

# Context-Aware AI Chat
class ChatMessage(BaseModel):
    role: str # user, assistant, system
    content: str
    timestamp: Optional[str] = None

class EventChatRequest(BaseModel):
    event_context: Optional[Dict[str, Any]] = None
    conversation_history: List[ChatMessage] = []
    message: str

class EventChatResponse(BaseModel):
    response: str
    suggested_actions: Optional[List[str]] = []
    updated_event_patch: Optional[Dict[str, Any]] = None # optional live patch applied to event

# Guest
class Guest(BaseModel):
    id: Optional[str] = None
    event_id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    category: str = "Family" # Family, Friends, Colleague, VIP
    rsvp_status: str = "Pending" # Confirmed, Declined, Pending
    dietary_preferences: Optional[str] = "Vegetarian"
    plus_ones: int = 0
    invitation_sent: bool = False

# Expense
class Expense(BaseModel):
    id: Optional[str] = None
    event_id: str
    category: str
    item_name: str
    allocated_amount: float
    actual_amount: float
    notes: Optional[str] = None
    paid: bool = False

# Last Minute Emergency Matrix
class LastMinuteRequest(BaseModel):
    event_type: str
    hours_left: int = 24
    guest_count: int = 20
    budget: float = 10000.0
    location: Optional[str] = "Home"

class EmergencyTask(BaseModel):
    urgency: str # Critical, High, Moderate
    timeframe: str # e.g. "Next 2 Hours", "Morning Of"
    title: str
    description: str
    can_delegate: bool = True

class LastMinutePlan(BaseModel):
    summary: str
    time_remaining_hours: int
    essential_tasks: List[EmergencyTask]
    tasks_to_skip: List[str]
    immediate_purchases: List[Dict[str, Any]]
    quick_decor_hacks: List[str]
    foolproof_food_plan: List[str]
    emergency_timeline: List[Dict[str, str]]
    budget_saving_tips: List[str]
