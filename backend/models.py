
from typing import List, Dict, Optional, Any, Literal

from pydantic import (
    BaseModel,
    Field,
    ConfigDict,
    field_validator,
    EmailStr,
    AliasChoices,
)


# Shared validation constants
MAX_BUDGET = 1_000_000_000
MAX_GUESTS = 10_000


# Event Generation Input
class EventGenerateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    event_type: str = Field(..., min_length=1, max_length=80)
    event_date: Optional[str] = Field(default="2026-11-20", max_length=50)
    event_location: Optional[str] = Field(
        default="Bangalore, India", max_length=250
    )
    guest_count: int = Field(default=30, ge=1, le=MAX_GUESTS)
    budget: float = Field(
        default=15000.0,
        ge=0,
        le=MAX_BUDGET,
        allow_inf_nan=False,
    )
    preferred_theme: Optional[str] = Field(
        default="Pastel Elegance", max_length=150
    )
    food_preferences: Optional[str] = Field(
        default="Vegetarian with artisanal desserts", max_length=500
    )
    decoration_preferences: Optional[str] = Field(
        default="Pastel blue and lavender balloons, fairy lights, floral backdrop",
        max_length=1000,
    )
    venue_preferences: Optional[str] = Field(
        default="Boutique rooftop cafe or banquet garden", max_length=500
    )
    additional_requirements: Optional[str] = Field(
        default=None, max_length=2000
    )
    freeform_prompt: Optional[str] = Field(
        default=None, max_length=5000
    )


# Structured Event Plan Components
class ThemePalette(BaseModel):
    model_config = ConfigDict(extra="forbid")

    primary_color: str
    secondary_color: str
    accent_color: str
    hex_codes: List[str]
    vibe_keywords: List[str]
    lighting_style: str
    dress_code: str


class BudgetItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    category: str
    allocated_amount: float = Field(
        ..., ge=0, le=MAX_BUDGET, allow_inf_nan=False
    )
    percentage: float = Field(
        ..., ge=0, le=100, allow_inf_nan=False
    )
    notes: Optional[str] = Field(default="", max_length=1000)


class MenuItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    course: str
    items: List[str]
    special_notes: Optional[str] = None


class TimelineActivity(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: Optional[str] = None
    time: str
    activity: str
    description: str
    completed: bool = False


class ShoppingItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: Optional[str] = None
    category: str
    item_name: str
    quantity: str
    estimated_price: float = Field(
        ..., ge=0, le=MAX_BUDGET, allow_inf_nan=False
    )
    purchased: bool = False


class InvitationTemplate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    headline: str
    subheading: str
    host_text: str
    body_text: str
    date_time_text: str
    venue_text: str
    rsvp_text: str
    suggested_palette: List[str]


# Basic event creation model.
# Allows additional generated-plan fields without requiring every field
# from EventPlan when creating a simple event.
class EventCreateRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    title: str = Field(..., min_length=1, max_length=200)
    event_type: str = Field(..., min_length=1, max_length=80)
    guest_count: int = Field(..., ge=1, le=MAX_GUESTS)
    total_budget: float = Field(
        ...,
        ge=0,
        le=MAX_BUDGET,
        allow_inf_nan=False,
    )
    location: str = Field(..., min_length=1, max_length=250)
    event_date: str = Field(..., min_length=1, max_length=50)


class EventPlan(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: Optional[str] = None
    title: str
    tagline: str
    event_type: str
    guest_count: int = Field(..., ge=1, le=MAX_GUESTS)
    total_budget: float = Field(
        ..., ge=0, le=MAX_BUDGET, allow_inf_nan=False
    )
    location: str
    event_date: str

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
    model_config = ConfigDict(extra="forbid")

    current_budget: float = Field(
        ..., ge=0, le=MAX_BUDGET, allow_inf_nan=False
    )
    current_allocations: List[BudgetItem] = Field(
        ..., max_length=100
    )
    user_instruction: str = Field(
        ..., min_length=1, max_length=2000
    )


class BudgetOptimizationResponse(BaseModel):
    total_budget: float
    updated_allocations: List[BudgetItem]
    explanation: str
    budget_exceeded: bool
    difference: float


# Context-Aware AI Chat
class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    # System instructions must be controlled by the backend.
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=4000)
    timestamp: Optional[str] = Field(default=None, max_length=64)


class EventChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    event_context: Optional[Dict[str, Any]] = None
    conversation_history: List[ChatMessage] = Field(
        default_factory=list, max_length=30
    )
    message: str = Field(..., min_length=1, max_length=4000)


class EventChatResponse(BaseModel):
    response: str
    suggested_actions: List[str] = Field(default_factory=list)
    updated_event_patch: Optional[Dict[str, Any]] = None


# Last Minute Planning
class LastMinuteRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    event_type: str = Field(..., min_length=1, max_length=80)

    # Accept both the existing frontend/backend field name and the
    # alternate name used by earlier versions.
    hours_left: int = Field(
        ...,
        ge=0,
        le=720,
        validation_alias=AliasChoices(
            "hours_left",
            "hours_remaining",
        ),
    )

    guest_count: int = Field(
        default=0,
        ge=0,
        le=MAX_GUESTS,
    )

    budget: float = Field(
        default=0,
        ge=0,
        le=MAX_BUDGET,
        allow_inf_nan=False,
    )

    location: str = Field(
        default="Not specified",
        max_length=250,
    )


class EmergencyTask(BaseModel):
    urgency: str
    timeframe: str
    title: str
    description: str
    can_delegate: bool


class LastMinutePlan(BaseModel):
    summary: str
    time_remaining_hours: int
    essential_tasks: List[EmergencyTask]
    tasks_to_skip: List[str]
    immediate_purchases: List[Dict[str, Any]]
    quick_decor_hacks: List[str]
    foolproof_food_plan: List[str]
    emergency_timeline: List[Dict[str, Any]]
    budget_saving_tips: List[str]


# Guest Management
class Guest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    event_id: str = Field(..., min_length=1, max_length=100)
    name: str = Field(..., min_length=1, max_length=150)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=30)
    category: Optional[str] = Field(default="General", max_length=50)
    rsvp_status: Literal["Pending", "Confirmed", "Declined"] = "Pending"
    dietary_preferences: Optional[str] = Field(default=None, max_length=500)
    plus_ones: int = Field(default=0, ge=0, le=100)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_empty_email(cls, value):
        if isinstance(value, str) and not value.strip():
            return None
        return value


class GuestUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=30)
    category: Optional[str] = Field(default=None, max_length=50)
    rsvp_status: Optional[
        Literal["Pending", "Confirmed", "Declined"]
    ] = None
    dietary_preferences: Optional[str] = Field(default=None, max_length=500)
    plus_ones: Optional[int] = Field(default=None, ge=0, le=100)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_empty_email(cls, value):
        if isinstance(value, str) and not value.strip():
            return None
        return value


# Expense Management
class ExpenseCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    event_id: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1, max_length=100)
    item_name: str = Field(..., min_length=1, max_length=200)
    allocated_amount: float = Field(
        ..., ge=0, le=MAX_BUDGET, allow_inf_nan=False
    )
    actual_amount: float = Field(
        default=0, ge=0, le=MAX_BUDGET, allow_inf_nan=False
    )
    notes: Optional[str] = Field(default=None, max_length=2000)


class ExpenseUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    category: Optional[str] = Field(
        default=None, min_length=1, max_length=100
    )
    item_name: Optional[str] = Field(
        default=None, min_length=1, max_length=200
    )
    allocated_amount: Optional[float] = Field(
        default=None, ge=0, le=MAX_BUDGET, allow_inf_nan=False
    )
    actual_amount: Optional[float] = Field(
        default=None, ge=0, le=MAX_BUDGET, allow_inf_nan=False
    )
    paid: Optional[bool] = None
    notes: Optional[str] = Field(default=None, max_length=2000)
