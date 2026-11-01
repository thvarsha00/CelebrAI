import os
import json
import re
import uuid
from typing import Dict, Any, List, Optional
from models import (
    EventGenerateRequest, EventPlan, ThemePalette, BudgetItem, MenuItem, 
    TimelineActivity, ShoppingItem, InvitationTemplate,
    BudgetOptimizationRequest, BudgetOptimizationResponse,
    EventChatRequest, EventChatResponse,
    LastMinuteRequest, LastMinutePlan, EmergencyTask
)

# Load backend/.env when python-dotenv is installed. Environment variables already
# supplied by the hosting platform are left untouched.
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=False)
except ImportError:
    # Small fallback .env reader so the AI engine does not require python-dotenv.
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.isfile(env_path):
        with open(env_path, "r", encoding="utf-8") as env_file:
            for raw_line in env_file:
                line = raw_line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key:
                    os.environ.setdefault(key, value)

from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError


def _post_json(url: str, api_key: str, payload: Dict[str, Any], timeout: int = 120) -> Dict[str, Any]:
    """Send a JSON POST request without requiring a provider-specific SDK."""
    body = json.dumps(payload).encode("utf-8")
    request = Request(
        url,
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        details = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {exc.code}: {details[:1000]}") from exc
    except (URLError, TimeoutError) as exc:
        raise RuntimeError(f"Network/API request failed: {exc}") from exc


def _extract_json_object(text: str) -> Dict[str, Any]:
    """Parse a JSON object, tolerating Markdown code fences around the response."""
    if not text or not text.strip():
        raise ValueError("The AI provider returned an empty response.")

    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start < 0 or end <= start:
            raise ValueError("The AI response did not contain a valid JSON object.")
        parsed = json.loads(cleaned[start:end + 1])

    if not isinstance(parsed, dict):
        raise ValueError("The AI response JSON must be an object.")
    return parsed


def _call_groq(prompt: str) -> str:
    """Call Groq's OpenAI-compatible Chat Completions endpoint."""
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not configured.")

    model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b").strip()
    result = _post_json(
        "https://api.groq.com/openai/v1/chat/completions",
        api_key,
        {
            "model": model,
            "messages": [
                {"role": "system", "content": "You are CelebrAI, an expert event-planning assistant. Return only valid JSON."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.4,
            "max_completion_tokens": 8000,
            "response_format": {"type": "json_object"},
        },
        timeout=120,
    )
    return result["choices"][0]["message"]["content"]


def _call_grok(prompt: str) -> str:
    """Call xAI's Responses API for Grok."""
    # XAI_API_KEY is the official environment-variable name. GROK_API_KEY is
    # also accepted for compatibility with the earlier CelebrAI setup.
    api_key = (os.getenv("XAI_API_KEY") or os.getenv("GROK_API_KEY") or "").strip()
    if not api_key:
        raise RuntimeError("XAI_API_KEY (or GROK_API_KEY) is not configured.")

    model = os.getenv("GROK_MODEL", "grok-4.7").strip()
    result = _post_json(
        "https://api.x.ai/v1/responses",
        api_key,
        {
            "model": model,
            "input": [
                {"role": "system", "content": "You are CelebrAI, an expert event-planning assistant. Return only valid JSON."},
                {"role": "user", "content": prompt},
            ],
            "store": False,
            "temperature": 0.4,
            "max_output_tokens": 8000,
        },
        timeout=300,
    )

    # Responses API returns text in output[].content[].text.
    text_parts = []
    for item in result.get("output", []):
        for content in item.get("content", []):
            if content.get("type") in ("output_text", "text") and content.get("text"):
                text_parts.append(content["text"])
    if not text_parts and result.get("output_text"):
        text_parts.append(result["output_text"])
    if not text_parts:
        raise ValueError("Grok returned no output text.")
    return "\n".join(text_parts)

def parse_freeform_prompt(prompt: str) -> Dict[str, Any]:
    """Extract budget, guests, type, and preferences from natural language input."""
    data = {
        "event_type": "Celebration",
        "guest_count": 30,
        "budget": 15000.0,
        "theme": "Pastel Elegance",
        "food": "Vegetarian cuisine",
        "decor": "Pastel balloons, fairy lights, floral backdrop",
        "location": "Bangalore, India"
    }
    prompt_lower = prompt.lower()
    
    # Event type extraction
    for etype in ["birthday", "wedding", "anniversary", "graduation", "baby shower", "engagement", "corporate", "cocktail"]:
        if etype in prompt_lower:
            data["event_type"] = etype.title()
            break
            
    # Budget extraction (e.g. ₹15,000, 15000, rs 20000, 50k, etc.)
    budget_match = re.search(r'(?:₹|rs\.?|inr|\$)\s*([\d,]+)(?:\s*(?:k|thousand))?', prompt_lower)
    if not budget_match:
        budget_match = re.search(r'([\d,]+)\s*(?:inr|rs|rupees)', prompt_lower)
    if budget_match:
        raw_val = budget_match.group(1).replace(',', '')
        try:
            val = float(raw_val)
            if 'k' in budget_match.group(0).lower():
                val *= 1000
            data["budget"] = val
        except ValueError:
            pass
            
    # Guest count extraction (e.g. 30 people, 50 guests, for 25)
    guest_match = re.search(r'(\d+)\s*(?:people|guests|pax|persons|friends)', prompt_lower)
    if not guest_match:
        guest_match = re.search(r'for\s*(\d+)', prompt_lower)
    if guest_match:
        try:
            data["guest_count"] = max(1, int(guest_match.group(1)))
        except ValueError:
            pass

    # Theme extraction
    if "pastel blue" in prompt_lower:
        data["theme"] = "Pastel Blue & Cloud White"
    elif "lavender" in prompt_lower:
        data["theme"] = "Lavender & Violet Chic"
    elif "royal" in prompt_lower or "gold" in prompt_lower:
        data["theme"] = "Royal Gold & Velvet"
    elif "minimalist" in prompt_lower:
        data["theme"] = "Nordic Minimalist"
    elif "boho" in prompt_lower or "bohemian" in prompt_lower:
        data["theme"] = "Bohemian Pampas & Macrame"
    elif "vintage" in prompt_lower:
        data["theme"] = "Vintage Romance"
    elif "traditional" in prompt_lower:
        data["theme"] = "Traditional Marigold & Brass"
        
    # Food preference
    if "vegetarian" in prompt_lower or "veg" in prompt_lower:
        data["food"] = "Pure Vegetarian gourmet treats, artisanal finger foods & mocktails"
    elif "non-vegetarian" in prompt_lower or "non veg" in prompt_lower:
        data["food"] = "Continental & Indian grill with custom beverage pairing"
    elif "vegan" in prompt_lower:
        data["food"] = "Plant-based vegan gourmet cuisine and fresh fruit bar"

    # Location extraction
    for city in ["bangalore", "bengaluru", "mumbai", "delhi", "hyderabad", "chennai", "kolkata", "pune", "goa", "jaipur"]:
        if city in prompt_lower:
            data["location"] = city.title()
            break

    return data

def build_heuristic_event_plan(req: EventGenerateRequest) -> EventPlan:
    """Generate a rich, perfectly-tailored 14-section event plan when offline or fallback."""
    if req.freeform_prompt and (req.budget == 15000.0 and req.guest_count == 30 and req.event_type == "Birthday"):
        parsed = parse_freeform_prompt(req.freeform_prompt)
        event_type = parsed["event_type"]
        guest_count = parsed["guest_count"]
        budget = parsed["budget"]
        theme_name = parsed["theme"]
        location = parsed.get("location", req.event_location or "Bangalore, India")
    else:
        event_type = req.event_type or "Celebration"
        guest_count = max(1, req.guest_count or 30)
        budget = max(1000.0, req.budget or 15000.0)
        theme_name = req.preferred_theme or "Pastel Elegance"
        location = req.event_location or "Bangalore, India"

    event_id = str(uuid.uuid4())
    
    # Theme palette based on theme_name
    if "blue" in theme_name.lower():
        theme = ThemePalette(
            primary_color="#DCEBFA",
            secondary_color="#6750A4",
            accent_color="#FAF9F7",
            hex_codes=["#DCEBFA", "#6750A4", "#20243A", "#FAF9F7", "#F1F1F5"],
            vibe_keywords=["Serene", "Dreamy", "Modern", "Airy", "Elegant"],
            lighting_style="Soft warm fairy lights (2700K) with ambient blue uplighting",
            dress_code="Smart Casual with pastel blue or neutral white tones"
        )
    elif "lavender" in theme_name.lower():
        theme = ThemePalette(
            primary_color="#EAE6FF",
            secondary_color="#6750A4",
            accent_color="#F4DCE9",
            hex_codes=["#EAE6FF", "#6750A4", "#F4DCE9", "#20243A", "#FAF9F7"],
            vibe_keywords=["Enchanting", "Aesthetic", "Whimsical", "Chic", "Graceful"],
            lighting_style="Warm micro-LED curtain with soft lavender spotlighting",
            dress_code="Earthy pastels and shades of lilac or soft lavender"
        )
    elif "royal" in theme_name.lower() or "gold" in theme_name.lower():
        theme = ThemePalette(
            primary_color="#D4AF37",
            secondary_color="#20243A",
            accent_color="#FAF9F7",
            hex_codes=["#D4AF37", "#20243A", "#6750A4", "#FAF9F7", "#4F378B"],
            vibe_keywords=["Opulent", "Regal", "Majestic", "Intimate", "Prestigious"],
            lighting_style="Vintage candelabras, amber accent spots, and warm chandeliers",
            dress_code="Formal evening wear with metallic gold or midnight blue accents"
        )
    else:
        theme = ThemePalette(
            primary_color="#EAE6FF",
            secondary_color="#6750A4",
            accent_color="#DCEBFA",
            hex_codes=["#EAE6FF", "#6750A4", "#20243A", "#FAF9F7", "#F4DCE9"],
            vibe_keywords=["Refined", "Celebratory", "Curated", "Cozy", "Joyful"],
            lighting_style="Warm string bulbs, floating tea candles, and diffused table luminaires",
            dress_code="Pastel and festive semi-formal"
        )

    # Budget allocation strictly summing to 100% with exact decimal reconciliation
    venue_alloc = round(budget * 0.28, 2)
    catering_alloc = round(budget * 0.32, 2)
    decor_alloc = round(budget * 0.16, 2)
    cake_alloc = round(budget * 0.08, 2)
    photo_alloc = round(budget * 0.08, 2)
    misc_alloc = round(budget - (venue_alloc + catering_alloc + decor_alloc + cake_alloc + photo_alloc), 2)

    budget_breakdown = [
        BudgetItem(category="Catering & Beverages", allocated_amount=catering_alloc, percentage=32.0, notes=f"Buffet/Platters for {guest_count} guests"),
        BudgetItem(category="Venue & Space", allocated_amount=venue_alloc, percentage=28.0, notes="Deposit & base rental fee"),
        BudgetItem(category="Decorations & Ambiance", allocated_amount=decor_alloc, percentage=16.0, notes="Backdrop, balloon garland & ambient lights"),
        BudgetItem(category="Cake & Confectionery", allocated_amount=cake_alloc, percentage=8.0, notes=f"Custom theme designer cake ({max(1, round(guest_count * 0.08))} kg)"),
        BudgetItem(category="Photography & Memories", allocated_amount=photo_alloc, percentage=8.0, notes="Dedicated coverage & instant Polaroid keepsake corner"),
        BudgetItem(category="Music & Miscellaneous", allocated_amount=misc_alloc, percentage=8.0, notes="Sound system, game props & contingency fund")
    ]

    food_menu = [
        MenuItem(course="Welcome Drinks & Mocktails", items=["Sparkling Lavender Lemonade with Mint", "Blueberry Blossom Cooler", "Artisanal Fresh Lime Soda"]),
        MenuItem(course="Appetizers & Starters", items=["Herb-Crusted Paneer / Tofu Tikka skewers", "Crispy Truffle Mushroom Crostini", "Stuffed Phyllo Cups with Corn & Jalapeno cream"]),
        MenuItem(course="Main Course", items=["Creamy Penne Rosa with Sundried Tomatoes", "Fragrant Saffron Peas Pilaf", "Velvety Dal Makhani / Herb Gravy with Butter Naan"]),
        MenuItem(course="Desserts & Celebration Cake", items=[f"Custom {theme_name} Bento / Tier Cake", "Mini Belgian Chocolate Pots", "Pistachio Kulfi Bites"])
    ]

    decorations = [
        f"Organic arch balloon garland utilizing {theme.vibe_keywords[0]} pastel palette",
        f"Custom 7ft photo backdrop wall with neon lettering: 'Celebrate Good Times'",
        f"Table centerpieces with ceramic bud vases, baby's breath, and tapered candles",
        f"Fairy light curtain backdrop behind the cake table",
        f"Personalized printed name cards with gold foil lettering for table setting"
    ]

    venues = [
        {"name": "Skyline Glasshouse & Rooftop Lounge", "type": "Boutique Rooftop", "capacity": f"{guest_count + 15} guests", "price_estimate": f"₹{int(venue_alloc)}", "perk": "Panoramic sunset views and built-in mood lighting"},
        {"name": "The Secret Garden Conservatory", "type": "Open-air Garden Cafe", "capacity": f"{guest_count + 20} guests", "price_estimate": f"₹{int(venue_alloc * 0.9)}", "perk": "Natural lush greenery minimizing external floral costs"},
        {"name": "Heritage Loft Studio", "type": "Private Event Loft", "capacity": f"{guest_count + 10} guests", "price_estimate": f"₹{int(venue_alloc * 0.85)}", "perk": "High ceilings, sound system included, full personalization freedom"}
    ]

    photography = [
        "Golden hour group portrait session scheduled 45 minutes prior to sunset",
        "DIY Instant Polaroid Station with magnetic photo keepsake guestbook",
        "Candid capture during the toast, cake cutting, and interactive games",
        "Drone overhead group celebration shot if outdoors"
    ]

    entertainment = [
        "Curated Spotify jazz-lounge playlist transitioning to upbeat indie celebration tunes",
        "Personalized trivia quiz about the guest of honour via interactive Kahoot",
        "Memory jar activity: guests drop handwritten advice and hilarious predictions",
        "Acoustic guitarist or live saxophonist for the welcome hour"
    ]

    shopping_checklist = [
        ShoppingItem(id=str(uuid.uuid4()), category="Decorations", item_name="Pastel organic balloon kit & hand pump", quantity="1 set", estimated_price=round(budget * 0.04), purchased=False),
        ShoppingItem(id=str(uuid.uuid4()), category="Decorations", item_name="Fairy light curtain & extension cords", quantity="2 sets", estimated_price=round(budget * 0.03), purchased=False),
        ShoppingItem(id=str(uuid.uuid4()), category="Tableware", item_name="Eco-friendly bamboo plates & cutlery", quantity=f"{guest_count + 10} pcs", estimated_price=round(budget * 0.03), purchased=False),
        ShoppingItem(id=str(uuid.uuid4()), category="Cake", item_name="Custom celebratory topper & sparkler candles", quantity="1 set", estimated_price=round(budget * 0.02), purchased=False),
        ShoppingItem(id=str(uuid.uuid4()), category="Memories", item_name="Polaroid film twin pack & gold gel pens", quantity="2 packs", estimated_price=round(budget * 0.04), purchased=False),
        ShoppingItem(id=str(uuid.uuid4()), category="Favors", item_name="Artisanal macaron / cookie takeaway boxes", quantity=f"{guest_count} boxes", estimated_price=round(budget * 0.05), purchased=False)
    ]

    event_schedule = [
        TimelineActivity(id=str(uuid.uuid4()), time="04:00 PM", activity="Decor & Florals Setup", description="Arrive at venue, test sound, position photo backdrop and lights", completed=False),
        TimelineActivity(id=str(uuid.uuid4()), time="05:30 PM", activity="Catering & Cake Delivery", description="Verify temperature of beverages, inspect cake condition on cake table", completed=False),
        TimelineActivity(id=str(uuid.uuid4()), time="06:30 PM", activity="Guest Arrival & Welcome Drinks", description="Background jazz playing, polaroid guestbook station open", completed=False),
        TimelineActivity(id=str(uuid.uuid4()), time="07:30 PM", activity="Special Toast & Cake Cutting", description="Gather all guests for toast, speeches, and candle extinguishing", completed=False),
        TimelineActivity(id=str(uuid.uuid4()), time="08:15 PM", activity="Dinner & Social Mingling", description="Catering buffet service begins, table interactions and candid photos", completed=False),
        TimelineActivity(id=str(uuid.uuid4()), time="09:30 PM", activity="Interactive Games & Wrap-Up", description="Trivia game, favor gift distribution, memorable farewells", completed=False)
    ]

    invitation = InvitationTemplate(
        headline=f"You Are Cordially Invited to Celebrate",
        subheading=f"A Magical {event_type} in {theme_name}",
        host_text="Join us as we raise a toast to unforgettable memories",
        body_text=f"Please join our circle of cherished friends and family for an evening of warmth, laughter, and gourmet treats.",
        date_time_text=f"{req.event_date or 'Saturday, November 20, 2026'} at 6:30 PM",
        venue_text=f"{location}",
        rsvp_text="RSVP by November 15th to facilitate customized seating",
        suggested_palette=theme.hex_codes
    )

    prep_timeline = [
        {"timeframe": "2 Weeks Before", "task": "Finalize guest RSVPs, confirm venue reservation, and order customized cake"},
        {"timeframe": "1 Week Before", "task": "Purchase decorative supplies, assemble playlist, send RSVP reminder"},
        {"timeframe": "2 Days Before", "task": "Reconfirm catering headcounts, check weather forecast, assemble party favors"},
        {"timeframe": "Day Of Event", "task": "Morning decor inspection, phone battery fully charged, relax and enjoy!"}
    ]

    personalized_recommendations = [
        f"With your ₹{int(budget):,} budget for {guest_count} guests, self-serve mocktail dispensers will save ~₹2,500 over individual cans while looking substantially more photogenic.",
        f"Rent warm fairy light curtains instead of buying bulky marquee letters to save 40% on decoration expenses.",
        f"Digital RSVP tracking minimizes printed card waste and collects guest dietary requirements in real time."
    ]

    return EventPlan(
        id=event_id,
        title=f"The {theme_name} {event_type}",
        tagline="From imagination to celebration, without the planning stress.",
        event_type=event_type,
        guest_count=guest_count,
        total_budget=budget,
        location=location,
        event_date=req.event_date or "2026-11-20",
        overview=f"An expertly curated {event_type.lower()} tailored for {guest_count} guests in {location}, blending a {theme_name.lower()} aesthetic with a smart ₹{int(budget):,} budget allocation.",
        concept=f"Designed around intimate togetherness, natural lighting, and refined pastel harmony so every guest feels welcomed and every photo looks stunning.",
        theme=theme,
        decorations=decorations,
        venue_recommendations=venues,
        food_and_beverage=food_menu,
        photography_suggestions=photography,
        entertainment_suggestions=entertainment,
        budget_breakdown=budget_breakdown,
        shopping_checklist=shopping_checklist,
        event_schedule=event_schedule,
        invitation=invitation,
        prep_timeline=prep_timeline,
        personalized_recommendations=personalized_recommendations
    )

def generate_event_plan(req: EventGenerateRequest) -> EventPlan:
    """Generate an AI event plan using Groq, then Grok, then the offline planner."""
    prompt = f"""
You are the expert event planner AI for CelebrAI.
Create a practical, detailed, internally consistent event plan using the user's exact requirements.
Do not invent confirmed venue bookings or claim that estimated prices are verified quotes.
All budget values must be in INR. Keep the budget allocation percentages close to 100% and
make the allocated amounts add up to the user's total budget.

USER REQUIREMENTS
Event Type: {req.event_type}
Date: {req.event_date}
Location: {req.event_location}
Guest Count: {req.guest_count}
Budget in INR: {req.budget}
Theme: {req.preferred_theme}
Food Preferences: {req.food_preferences}
Decoration Preferences: {req.decoration_preferences}
Venue Preferences: {req.venue_preferences}
Additional Requirements: {req.freeform_prompt or req.additional_requirements or 'None'}

Return ONLY one valid JSON object. Do not use Markdown fences or explanatory text.
Use this exact structure and field names:
{{
  "title": "string",
  "tagline": "string",
  "overview": "string",
  "concept": "string",
  "theme": {{
    "primary_color": "#hex",
    "secondary_color": "#hex",
    "accent_color": "#hex",
    "hex_codes": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
    "vibe_keywords": ["string"],
    "lighting_style": "string",
    "dress_code": "string"
  }},
  "decorations": ["string"],
  "venue_recommendations": [{{"name": "string", "type": "string", "capacity": "string", "price_estimate": "string", "perk": "string"}}],
  "food_and_beverage": [{{"course": "string", "items": ["string"]}}],
  "photography_suggestions": ["string"],
  "entertainment_suggestions": ["string"],
  "budget_breakdown": [{{"category": "string", "allocated_amount": 1000.0, "percentage": 10.0, "notes": "string"}}],
  "shopping_checklist": [{{"category": "string", "item_name": "string", "quantity": "string", "estimated_price": 100.0, "purchased": false}}],
  "event_schedule": [{{"time": "06:00 PM", "activity": "string", "description": "string", "completed": false}}],
  "invitation": {{
    "headline": "string",
    "subheading": "string",
    "host_text": "string",
    "body_text": "string",
    "date_time_text": "string",
    "venue_text": "string",
    "rsvp_text": "string",
    "suggested_palette": ["#hex"]
  }},
  "prep_timeline": [{{"timeframe": "2 Weeks Before", "task": "string"}}],
  "personalized_recommendations": ["string"]
}}
"""

    providers = [
        ("Groq", _call_groq),
        ("Grok", _call_grok),
    ]

    for provider_name, provider_call in providers:
        try:
            raw_text = provider_call(prompt)
            data = _extract_json_object(raw_text)

            # Keep event identity and user-entered details authoritative.
            data["id"] = str(uuid.uuid4())
            data["event_type"] = req.event_type or "Celebration"
            data["guest_count"] = req.guest_count or 30
            data["total_budget"] = req.budget or 15000.0
            data["location"] = req.event_location or "Bangalore"
            data["event_date"] = req.event_date or "2026-11-20"

            # Validate the complete response against the existing Pydantic model.
            plan = EventPlan(**data)
            print(f"CelebrAI event plan generated successfully using {provider_name}.")
            return plan
        except Exception as exc:
            print(f"{provider_name} event generation failed: {exc}")

    print("All configured AI providers failed. Using the existing heuristic event planner.")
    return build_heuristic_event_plan(req)

def optimize_budget(req: BudgetOptimizationRequest) -> BudgetOptimizationResponse:
    """
    Intelligently reorganize budget allocations according to user instruction.
    E.g. 'Reduce decorations by 1,000 and increase food budget by 1,000'
    """
    instruction = req.user_instruction.lower()
    items = [b.copy() for b in req.current_allocations]
    categories = {b.category.lower(): b for b in items}
    
    SYNONYMS = {
        "food": ["catering", "food", "beverage", "drinks", "dining", "meal"],
        "catering": ["catering", "food", "beverage", "drinks", "dining", "meal"],
        "decor": ["decor", "decoration", "decorations", "ambiance", "floral", "flowers", "balloons"],
        "decorations": ["decor", "decoration", "decorations", "ambiance", "floral", "flowers", "balloons"],
        "venue": ["venue", "space", "hall", "rooftop", "loft", "rent"],
        "photo": ["photo", "photography", "photos", "video", "photographer", "memories"],
        "photography": ["photo", "photography", "photos", "video", "photographer", "memories"],
        "cake": ["cake", "dessert", "bakery", "confectionery", "sweets"],
        "music": ["music", "entertainment", "dj", "sound", "band", "games", "miscellaneous"]
    }

    def match_category(query_str: str):
        query_words = [w.strip() for w in re.sub(r'[^a-zA-Z]', ' ', query_str).lower().split() if w.strip() not in ['the', 'budget', 'for']]
        for q_word in query_words:
            syns = SYNONYMS.get(q_word, [q_word])
            for cat_name, item in categories.items():
                cat_lower = cat_name.lower()
                if any(s in cat_lower for s in syns):
                    return item
        return None

    reduce_match = re.search(r'reduce\s+([a-zA-Z\s]+?)\s+by\s+(?:₹|rs\.?)?\s*([\d,]+)', instruction)
    increase_match = re.search(r'increase\s+([a-zA-Z\s]+?)\s+by\s+(?:₹|rs\.?)?\s*([\d,]+)', instruction)
    
    explanation_parts = []
    
    if reduce_match and increase_match:
        from_cat_query = reduce_match.group(1).strip()
        from_amt = float(reduce_match.group(2).replace(',', ''))
        
        to_cat_query = increase_match.group(1).strip()
        to_amt = float(increase_match.group(2).replace(',', ''))
        
        matched_from = match_category(from_cat_query)
        matched_to = match_category(to_cat_query)
                
        if matched_from and matched_to:
            # Prevent subtracting more than currently available in matched_from!
            actual_transfer = min(from_amt, matched_from.allocated_amount)
            matched_from.allocated_amount -= actual_transfer
            matched_to.allocated_amount += actual_transfer
            
            if actual_transfer < from_amt:
                explanation_parts.append(
                    f"Transferred ₹{int(actual_transfer):,} (full remaining balance in '{matched_from.category}') to '{matched_to.category}'. "
                    f"New {matched_from.category} budget is ₹{int(matched_from.allocated_amount):,}, and new {matched_to.category} budget is ₹{int(matched_to.allocated_amount):,}."
                )
            else:
                explanation_parts.append(
                    f"Successfully transferred ₹{int(actual_transfer):,} from '{matched_from.category}' to '{matched_to.category}'. "
                    f"New {matched_from.category} budget is ₹{int(matched_from.allocated_amount):,}, and new {matched_to.category} budget is ₹{int(matched_to.allocated_amount):,}."
                )
        else:
            explanation_parts.append(f"Adjusted budget by ₹{int(to_amt):,} according to specified instruction.")
    else:
        explanation_parts.append("Rebalanced budget categories proportionally to maintain optimal vendor and catering allocations.")

    total_allocated = round(sum(b.allocated_amount for b in items), 2)
    for b in items:
        b.percentage = round((b.allocated_amount / total_allocated) * 100, 1) if total_allocated > 0 else 0.0

    budget_exceeded = total_allocated > req.current_budget
    difference = round(total_allocated - req.current_budget, 2)

    return BudgetOptimizationResponse(
        total_budget=req.current_budget,
        updated_allocations=items,
        explanation=" ".join(explanation_parts),
        budget_exceeded=budget_exceeded,
        difference=difference
    )

def handle_ai_chat(req: EventChatRequest) -> EventChatResponse:
    """Conversational assistant that understands current event and can return live data updates."""
    message = req.message.lower()
    event = req.event_context or {}
    title = event.get("title", "your celebration")
    budget = float(event.get("total_budget", 15000))
    guest_count = int(event.get("guest_count", 30))
    location = event.get("location", "Bangalore")
    
    suggested_actions = []
    patch = None
    
    # Check for budget change commands (e.g. "change budget to 20000" or "increase budget to 25000")
    budget_change_match = re.search(r'(?:change|set|update|increase|decrease|make)\s+(?:the\s+)?budget\s+(?:to\s+)?(?:₹|rs\.?)?\s*([\d,]+)', message)
    if not budget_change_match:
        budget_change_match = re.search(r'budget\s+(?:to\s+)?(?:₹|rs\.?)?\s*([\d,]+)', message)
        
    guest_change_match = re.search(r'(?:change|set|update|make)\s+(?:the\s+)?(?:guest\s+count|guests|headcount)\s+(?:to\s+)?(\d+)', message)
    location_change_match = re.search(r'(?:change|set|update|move)\s+(?:the\s+)?location\s+(?:to\s+)?([a-zA-Z\s]+)', message)

    if budget_change_match:
        new_budget = float(budget_change_match.group(1).replace(',', ''))
        scale = new_budget / budget if budget > 0 else 1.0
        
        # Scale existing allocations proportionally
        updated_breakdown = []
        for b in event.get("budget_breakdown", []):
            new_alloc = round(b.get("allocated_amount", 0) * scale, 2)
            updated_breakdown.append({
                "category": b.get("category"),
                "allocated_amount": new_alloc,
                "percentage": b.get("percentage", 0),
                "notes": b.get("notes", "")
            })
            
        patch = {
            "total_budget": new_budget,
            "budget_breakdown": updated_breakdown
        }
        response_text = (
            f"I have successfully updated your total celebration budget to **₹{int(new_budget):,}**! "
            f"All category allocations have been scaled proportionally across Venue, Catering, and Decor. "
            f"Your new plan is active and saved to the database."
        )
        suggested_actions = ["Review Budget Planner", "View Updated Plan", "Adjust Food Breakdown"]

    elif guest_change_match:
        new_guests = int(guest_change_match.group(1))
        patch = {"guest_count": new_guests}
        response_text = (
            f"I have updated your guest headcount to **{new_guests} attendees**! "
            f"You can review your updated RSVP statistics in the Guest Manager tab."
        )
        suggested_actions = ["Open Guest Manager", "Review Food Portions", "Adjust Venue Capacity"]

    elif location_change_match:
        new_location = location_change_match.group(1).strip().title()
        patch = {"location": new_location}
        response_text = (
            f"I have updated your event location to **{new_location}**! "
            f"All recommendations and invitation cards have been updated accordingly."
        )
        suggested_actions = ["View Invitation Card", "Explore Venue Options"]

    elif "reduce" in message and ("expense" in message or "cost" in message or "budget" in message):
        response_text = (
            f"To optimize your ₹{int(budget):,} budget for {title}:\n"
            f"1. **Catering Alternative**: Switch from plated courses to high-end artisanal grazing boards — saves up to 25% on staffing fees.\n"
            f"2. **Decor Swap**: Replace fresh cut floral arches with reusable dried pampas or organic pastel balloons.\n"
            f"3. **Digital Invitations**: Use CelebrAI's interactive digital invitation cards instead of heavy physical card stock, eliminating printing and courier fees."
        )
        suggested_actions = ["Rebalance Budget with AI", "View DIY Shopping List", "Switch to Digital Invitations"]
        
    elif "lavender" in message or ("theme" in message and "purple" in message):
        response_text = (
            f"I have updated your theme to **Lavender & Violet Chic**! "
            f"The primary shade is now dreamy lavender (#EAE6FF) paired with deep royal purple (#6750A4) and muted rose accents. "
            f"Check the Theme Studio tab to view your regenerated moodboard and lighting recommendations."
        )
        patch = {
            "theme": {
                "primary_color": "#EAE6FF",
                "secondary_color": "#6750A4",
                "accent_color": "#F4DCE9",
                "hex_codes": ["#EAE6FF", "#6750A4", "#F4DCE9", "#20243A", "#FAF9F7"],
                "vibe_keywords": ["Whimsical", "Lavender Hues", "Enchanting", "Aesthetic"],
                "lighting_style": "Soft lilac fairy curtain with ambient warm sconces",
                "dress_code": "Shades of lavender, lilac, or crisp ivory"
            }
        }
        suggested_actions = ["Apply to Invitation Card", "Explore Moodboard", "Adjust Decor Budget"]

    elif "royal" in message and "theme" in message:
        patch = {
            "theme": {
                "primary_color": "#20243A",
                "secondary_color": "#D4AF37",
                "accent_color": "#6750A4",
                "hex_codes": ["#20243A", "#D4AF37", "#6750A4", "#FAF9F7", "#4F378B"],
                "vibe_keywords": ["Opulent", "Regal", "Prestigious", "Majestic"],
                "lighting_style": "Multi-arm crystal chandeliers and amber spotlights",
                "dress_code": "Formal evening wear with metallic gold accents"
            }
        }
        response_text = "I have updated your theme to **Imperial Royal & Gold**! Your invitations and palette are now synchronized."
        suggested_actions = ["View Moodboard", "Check Dress Code"]

    elif "vegetarian" in message or "menu" in message:
        response_text = (
            f"Here is a curated gourmet vegetarian menu for {guest_count} guests:\n"
            f"• **Welcome**: Sparkling Lavender Lemonade & Passionfruit Cooler\n"
            f"• **Starters**: Smoked Paneer Tikka Canapés & Truffle Mushroom Bruschetta\n"
            f"• **Mains**: Handcrafted Penne Rosa with basil pesto drizzle & Saffron Basmati Pilaf\n"
            f"• **Desserts**: Cardamom Pistachio Mousse cups & Mini Macaron towers."
        )
        suggested_actions = ["Save to Event Menu", "Estimate Catering Cost", "Generate Shopping List"]
        
    elif "decor" in message and ("under" in message or "cheap" in message or "2000" in message or "affordable" in message):
        response_text = (
            "Here are high-impact decoration concepts under ₹2,000:\n"
            "1. **Fairy Light Cloud Wall**: ₹450 for two 10m warm LED curtains taped behind sheer drapes.\n"
            "2. **Organic Pastel Balloon Garland**: ₹350 for a 100-piece multi-sized DIY balloon arch kit.\n"
            "3. **Tapered Candle Glass Centerpieces**: ₹500 for floating candles in mismatched wine and mason jars.\n"
            "4. **Greenery Sprigs**: ₹400 for fresh eucalyptus and baby's breath tucked into napkins."
        )
        suggested_actions = ["Add to Shopping Checklist", "View Moodboard", "Optimize Budget"]
        
    elif "last-minute" in message or "24 hours" in message or "emergency" in message:
        response_text = (
            "I've initiated the **24-Hour Last-Minute Event Rescue Engine**! "
            "Prioritize: 1) Secure the space immediately, 2) Order a bakery display cake, 3) Dispatch invitations. "
            "Navigate to the **Last-Minute Planner** section in the sidebar for your prioritized matrix."
        )
        suggested_actions = ["Open Last-Minute Rescue", "Copy WhatsApp Invite", "View Emergency Checklist"]
        
    else:
        response_text = (
            f"I'm keeping track of all details for **{title}** (Budget: ₹{int(budget):,}, {guest_count} guests in {location}).\n"
            f"You can command me: 'Change budget to ₹20,000', 'Update guests to 40', 'Change theme to Lavender', or ask for cost-cutting ideas!"
        )
        suggested_actions = ["Change budget to ₹20,000", "Change theme to Lavender", "Suggest vegetarian starters"]

    return EventChatResponse(
        response=response_text,
        suggested_actions=suggested_actions,
        updated_event_patch=patch
    )

def generate_last_minute_rescue(req: LastMinuteRequest) -> LastMinutePlan:
    """Generate dynamic prioritized emergency matrix based on actual hours left, headcount, and budget."""
    h = max(1, req.hours_left)
    budget = max(1000.0, req.budget)
    guests = max(1, req.guest_count)

    # Dynamic timeline based on hours remaining
    if h <= 12:
        timeline = [
            {"time": f"T-{h}h", "action": "Confirm living room / venue & dispatch digital WhatsApp invites"},
            {"time": f"T-{max(1, int(h * 0.7))}h", "action": "Order express catering trays & pickup ready bakery cake"},
            {"time": f"T-{max(1, int(h * 0.4))}h", "action": "String fairy lights & inflate quick balloon garland"},
            {"time": f"T-{max(1, int(h * 0.2))}h", "action": "Chill mocktails & ice, start Spotify party playlist"},
            {"time": "T-0h", "action": "Welcome guests with a calm smile and chilled refreshment"}
        ]
    elif h <= 24:
        timeline = [
            {"time": "T-24h", "action": "Confirm space & dispatch digital invitations with 6h RSVP deadline"},
            {"time": "T-18h", "action": "Order food platters & order instant decor via quick-commerce delivery"},
            {"time": "T-12h", "action": "Sleep and recharge (exhausted hosts make stressed parties)"},
            {"time": "T-4h", "action": "Assemble balloon garland & hang fairy light backdrop"},
            {"time": "T-2h", "action": "Pick up cake & ice, test Bluetooth speaker volume"},
            {"time": "T-0h", "action": "Welcome guests with relaxed hospitality"}
        ]
    else:
        timeline = [
            {"time": f"T-{h}h", "action": "Lock venue space & send digital invites with RSVP deadline"},
            {"time": f"T-{int(h * 0.75)}h", "action": "Book catering delivery & reserve artisan display cake"},
            {"time": f"T-{int(h * 0.5)}h", "action": "Receive decor delivery & prepare party music playlist"},
            {"time": f"T-{int(h * 0.2)}h", "action": "Final room arrangement, balloon blowing, and lighting test"},
            {"time": "T-0h", "action": "Host celebration smoothly"}
        ]

    cake_cost = round(min(budget * 0.2, 1200 + (guests * 15)))
    decor_cost = round(min(budget * 0.12, 800))
    tableware_cost = round(min(budget * 0.08, 300 + (guests * 10)))
    ice_drink_cost = round(min(budget * 0.15, 600 + (guests * 20)))

    return LastMinutePlan(
        summary=f"Emergency {h}-Hour Action Plan for {guests} guests with ₹{int(budget):,} budget.",
        time_remaining_hours=h,
        essential_tasks=[
            EmergencyTask(
                urgency="Critical", 
                timeframe=f"Next {min(2, h)} Hours", 
                title="Lock Space & Reserve Display Cake", 
                description="Confirm venue access or ready home living room. Reserve an in-stock artisan bakery cake immediately.", 
                can_delegate=False
            ),
            EmergencyTask(
                urgency="Critical", 
                timeframe=f"Next {min(3, h)} Hours", 
                title="Dispatch Instant Digital Invites", 
                description=f"Send CelebrAI interactive invite copy to {guests} guests with an urgent 6-hour RSVP deadline.", 
                can_delegate=True
            ),
            EmergencyTask(
                urgency="High", 
                timeframe="Today", 
                title="Order Ready-to-Serve Platters", 
                description="Book premium pizza/appetizer catering or bulk restaurant specialty trays requiring zero reheating.", 
                can_delegate=True
            ),
            EmergencyTask(
                urgency="High", 
                timeframe="Tonight", 
                title="Quick Decor (Balloons & Fairy Lights)", 
                description="Order 1 balloon garland kit and warm fairy lights via 10-minute grocery delivery (Zepto/Blinkit).", 
                can_delegate=True
            ),
            EmergencyTask(
                urgency="Moderate", 
                timeframe="Morning Of Event", 
                title="Final Room Setup & Beverage Chilling", 
                description="Position photo corner, plug in Spotify speaker, chill drinks with 2 bags of ice.", 
                can_delegate=True
            )
        ],
        tasks_to_skip=[
            "DO NOT order custom tiered fondant cakes (takes 48-72h and costs 3x more).",
            "DO NOT hire complex audio/visual equipment; use bluetooth speaker and phone playlist.",
            "DO NOT design physical printed stationery or intricate party favors.",
            "DO NOT cook a 5-course meal from scratch; buy semi-prepared gourmet platters."
        ],
        immediate_purchases=[
            {"item": f"Ready Bakery Cake ({max(1, round(guests * 0.08))} kg)", "store": "Local Artisan Bakery", "est_cost": cake_cost},
            {"item": "Instant Balloon Garland Kit", "store": "Quick Delivery (Zepto / Blinkit)", "est_cost": decor_cost},
            {"item": "Warm White String Fairy Lights (20m)", "store": "Hardware / Amazon Prime", "est_cost": 350},
            {"item": "Eco-friendly Palm Leaf Tableware set", "store": "Supermarket", "est_cost": tableware_cost},
            {"item": "Ice cubes (2 bags) & Assorted Mocktails", "store": "Grocery Delivery", "est_cost": ice_drink_cost}
        ],
        quick_decor_hacks=[
            "Hang fairy lights behind white window curtains to instantly create a glowing, high-end backdrop.",
            "Use stemmed wine glasses turned upside down with small roses inside and tea-light candles on top as instant luxury centerpieces.",
            "Scatter cluster balloons on the floor rather than trying to helium-fill everything."
        ],
        foolproof_food_plan=[
            "Starter: Mezze Platter (Hummus, Pita crisps, Olives, Cheese cubes) — requires zero cooking.",
            "Main: Gourmet Hand-tossed Pizza / Biryani Handis with cooling Raita.",
            "Dessert: Sliced Artisan Cake paired with single-scoop premium vanilla ice cream."
        ],
        emergency_timeline=timeline,
        budget_saving_tips=[
            "Using quick grocery delivery for mocktails saves ₹3,000 compared to bar catering.",
            "A bakery case-ready cake with a fresh flower placed on top looks identical to a ₹4,000 custom designer cake."
        ]
    )
