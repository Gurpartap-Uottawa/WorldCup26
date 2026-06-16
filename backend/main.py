import asyncio
import os
import time
from datetime import datetime, timedelta
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel

from data.schedule import (
    COUNTRY_FLAGS, FIFA_FAN_FESTIVALS, MATCH_ID_TO_VENUE, MATCHES,
    POPULAR_WATCH_SPOTS, STADIUM_LOCATIONS,
)

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
SERPER_API_KEY = os.getenv("SERPER_API_KEY", "")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")
FOOTBALL_DATA_API_KEY = os.getenv("FOOTBALL_DATA_API_KEY", "")

# UTC offsets (summer/DST) for each host city
_CITY_UTC_OFFSET: dict[str, int] = {
    "New York": -4, "Boston": -4, "Philadelphia": -4,
    "Atlanta": -4, "Toronto": -4, "Miami": -4,
    "Dallas": -5, "Kansas City": -5, "Houston": -5,
    "Mexico City": -5, "Guadalajara": -5, "Monterrey": -5,
    "Los Angeles": -7, "San Francisco": -7, "Seattle": -7, "Vancouver": -7,
}
_TZ_ABBR: dict[int, str] = {-4: "ET", -5: "CT", -7: "PT"}

def _utc_to_local(time_utc: str, city: str | None = None) -> str:
    """Convert 'HH:MM' UTC to Eastern Time (ET) for Canadian users."""
    try:
        h, m = int(time_utc[:2]), int(time_utc[3:5])
        et_h = (h - 4) % 24  # EDT = UTC-4 (summer)
        period = "AM" if et_h < 12 else "PM"
        display_h = et_h % 12 or 12
        return f"{display_h}:{m:02d} {period} ET"
    except Exception:
        return time_utc

# ── Live match cache ──────────────────────────────────────────────────────────
_matches_cache: dict = {"ts": 0.0, "data": []}
_CACHE_TTL = 1800  # refresh every 30 min

def _map_stage(s: str) -> str:
    return {
        "GROUP_STAGE":    "Group Stage",
        "LAST_32":        "Round of 32",
        "LAST_16":        "Round of 16",
        "QUARTER_FINALS": "Quarterfinal",
        "SEMI_FINALS":    "Semifinal",
        "THIRD_PLACE":    "Third Place",
        "FINAL":          "Final",
    }.get(s, s)

def _map_group(g: str | None) -> str:
    if g and g.startswith("GROUP_"):
        return g[6:]
    return g or ""

async def _fetch_all_wc_matches() -> list[dict]:
    """Return all 104 WC2026 matches, cached for 30 min."""
    now = time.time()
    if now - _matches_cache["ts"] < _CACHE_TTL and _matches_cache["data"]:
        return _matches_cache["data"]

    if not FOOTBALL_DATA_API_KEY:
        return MATCHES  # fall back to static data

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.football-data.org/v4/competitions/WC/matches",
                headers={"X-Auth-Token": FOOTBALL_DATA_API_KEY},
                params={"season": "2026"},
                timeout=15.0,
            )
            resp.raise_for_status()
            raw = resp.json()
    except Exception:
        return _matches_cache["data"] or MATCHES

    matches: list[dict] = []
    for m in raw.get("matches", []):
        utc = m["utcDate"]
        time_utc = utc[11:16]
        # Convert to ET date so matches show under the correct day for Canadian/US users
        utc_dt = datetime(int(utc[:4]), int(utc[5:7]), int(utc[8:10]),
                          int(utc[11:13]), int(utc[14:16]))
        et_dt = utc_dt - timedelta(hours=4)  # EDT = UTC-4
        date_str = et_dt.strftime("%Y-%m-%d")
        stage = _map_stage(m.get("stage", ""))
        group = _map_group(m.get("group"))
        home = (m["homeTeam"].get("name") or "TBD")
        away = (m["awayTeam"].get("name") or "TBD")
        venue_info = MATCH_ID_TO_VENUE.get(m["id"], {})
        venue = venue_info.get("venue", "TBD")
        city = venue_info.get("city", "TBD")
        score = m.get("score", {})
        ft = score.get("fullTime", {})
        matches.append({
            "id": m["id"],
            "date": date_str,
            "group": group,
            "home": home,
            "away": away,
            "time_utc": time_utc,
            "time_local": _utc_to_local(time_utc, city),
            "venue": venue,
            "city": city,
            "stage": stage,
            "status": m.get("status", "SCHEDULED"),
            "score_home": ft.get("home"),
            "score_away": ft.get("away"),
        })

    _matches_cache["ts"] = now
    _matches_cache["data"] = matches
    return matches
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app = FastAPI(title="World Cup 2026 Free Screenings API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None


# ── /api/matches ──────────────────────────────────────────────────────────────

@app.get("/api/matches")
async def get_matches(date: str = Query(..., description="YYYY-MM-DD")):
    all_matches = await _fetch_all_wc_matches()
    day_matches = [m for m in all_matches if m["date"] == date]
    enriched = []
    for m in day_matches:
        enriched.append({
            **m,
            "home_flag": COUNTRY_FLAGS.get(m["home"], "🏳"),
            "away_flag": COUNTRY_FLAGS.get(m["away"], "🏳"),
            "stadium_lat": STADIUM_LOCATIONS.get(m["venue"], {}).get("lat"),
            "stadium_lng": STADIUM_LOCATIONS.get(m["venue"], {}).get("lng"),
        })
    return {"date": date, "matches": enriched}


# ── /api/screenings ───────────────────────────────────────────────────────────

async def _serper_search(client: httpx.AsyncClient, query: str) -> list[dict]:
    if not SERPER_API_KEY:
        return []
    try:
        resp = await client.post(
            "https://google.serper.dev/search",
            headers={"X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json"},
            json={"q": query, "num": 5},
            timeout=10.0,
        )
        resp.raise_for_status()
        data = resp.json()
        results = []
        for item in data.get("organic", []):
            results.append({
                "name": item.get("title", ""),
                "address": item.get("snippet", ""),
                "lat": None,
                "lng": None,
                "source_url": item.get("link", ""),
                "description": item.get("snippet", ""),
                "google_place_url": None,
                "source": "web_search",
            })
        return results
    except Exception:
        return []


@app.get("/api/screenings")
async def get_screenings(
    date: str = Query(..., description="YYYY-MM-DD"),
    city: str = Query(None, description="City name (optional)"),
):
    all_matches = await _fetch_all_wc_matches()
    day_matches = [m for m in all_matches if m["date"] == date]
    host_cities = list({m["city"] for m in day_matches})
    if city:
        host_cities = [c for c in host_cities if c.lower() == city.lower()] or [city]

    all_screenings: list[dict] = []

    # 1. Official FIFA Fan Festivals for host cities playing that day
    for c in host_cities:
        for fest in FIFA_FAN_FESTIVALS.get(c, []):
            maps_q = fest["address"].replace(" ", "+")
            all_screenings.append({
                **fest,
                "city": c,
                "source": "official_fan_festival",
                "google_place_url": f"https://www.google.com/maps/search/?api=1&query={maps_q}",
            })

    # 2. Popular public watch spots across ALL major US + Canada cities
    spots_source = POPULAR_WATCH_SPOTS
    if city:
        spots_source = {k: v for k, v in POPULAR_WATCH_SPOTS.items()
                        if k.lower() == city.lower()}
    for c, spots in spots_source.items():
        for spot in spots:
            maps_q = spot["address"].replace(" ", "+")
            all_screenings.append({
                **spot,
                "city": c,
                "source": "popular_watch_spot",
                "google_place_url": f"https://www.google.com/maps/search/?api=1&query={maps_q}",
            })

    # 3. Dynamic Serper search for host cities on this date
    if SERPER_API_KEY:
        async with httpx.AsyncClient() as client:
            tasks = []
            for c in host_cities:
                tasks.append(_serper_search(client, f"free World Cup 2026 screening {c} {date}"))
                tasks.append(_serper_search(client, f"FIFA Fan Festival {c} 2026 watch party"))
            results = await asyncio.gather(*tasks)
            for batch in results:
                all_screenings.extend(batch)

    return {"date": date, "cities": host_cities, "screenings": all_screenings}


# ── /api/geocode ──────────────────────────────────────────────────────────────

@app.get("/api/geocode")
async def geocode(address: str = Query(...)):
    if not GOOGLE_MAPS_API_KEY:
        raise HTTPException(status_code=503, detail="Google Maps API key not configured")
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://maps.googleapis.com/maps/api/geocode/json",
            params={"address": address, "key": GOOGLE_MAPS_API_KEY},
            timeout=10.0,
        )
        resp.raise_for_status()
        data = resp.json()
        if data.get("status") != "OK" or not data.get("results"):
            raise HTTPException(status_code=404, detail="Address not found")
        result = data["results"][0]
        loc = result["geometry"]["location"]
        place_id = result.get("place_id", "")
        return {
            "lat": loc["lat"],
            "lng": loc["lng"],
            "place_id": place_id,
            "google_maps_url": f"https://www.google.com/maps/search/?api=1&query={address.replace(' ', '+')}",
        }


# ── /api/chat ─────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    date: str
    context: dict[str, Any] = {}
    history: list[ChatMessage] = []


@app.post("/api/chat")
async def chat(req: ChatRequest):
    if not groq_client:
        raise HTTPException(status_code=503, detail="Groq API key not configured")

    matches_text = ""
    if req.context.get("matches"):
        for m in req.context["matches"]:
            matches_text += f"  - {m['home']} vs {m['away']} at {m['time_local']} ({m['venue']}, {m['city']})\n"

    screenings_text = ""
    if req.context.get("screenings"):
        for s in req.context["screenings"][:10]:
            screenings_text += f"  - {s['name']}: {s.get('address', '')}\n"

    system_prompt = f"""You are an enthusiastic FIFA World Cup 2026 assistant. You help fans find free public screenings, answer questions about matches, teams, and the tournament.

Today's date: {req.date}

Today's matches:
{matches_text or "  No matches scheduled for this date."}

Free screenings today:
{screenings_text or "  Search for screenings using the screenings panel."}

World Cup 2026 key facts:
- Tournament runs June 11 – July 19, 2026
- 48 teams competing (expanded format)
- Hosted across USA, Canada, and Mexico
- 16 host cities total
- Format: 12 groups of 4, top 2 + 8 best 3rd-place teams advance to Round of 32

You can answer questions about team squads, match schedules, host cities, fan festivals, and general football knowledge. Be friendly and enthusiastic. Keep answers concise (2-4 sentences max unless asked for details).

SCREENINGS GUIDANCE: When a user asks about free screenings, watch parties, or where to watch in a specific city, give a helpful answer. Use the free screenings data above if available. If no screening data is loaded for that city, still help by:
- Mentioning that FIFA Fan Festivals are free and open-air in every host city (Los Angeles, New York/New Jersey, Dallas, San Francisco Bay Area, Seattle, Miami, Houston, Kansas City, Philadelphia, Boston, Atlanta, Guadalajara, Monterrey, Mexico City, Toronto, Vancouver)
- Advising them to use the Screenings Finder in this app (pick the date and city) for a live, up-to-date list
- Suggesting common free viewing spots like public parks, sports bars with no cover, and official FIFA watch zones
Always encourage them to use the app's Screenings Finder for the most accurate and current listings.

STRICT RULE: You ONLY answer questions related to football (soccer), the FIFA World Cup 2026, or this app's features (screenings, fan festivals, match schedules). If the user asks about anything else — politics, cooking, coding, celebrities, other sports, etc. — politely decline and redirect them: tell them you're a World Cup assistant and can only help with football topics. Do not answer off-topic questions under any circumstances."""

    messages = [{"role": "system", "content": system_prompt}]
    for msg in req.history[-10:]:  # last 10 turns for context
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": req.message})

    response = await asyncio.to_thread(
        groq_client.chat.completions.create,
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=512,
        temperature=0.7,
    )

    return {"reply": response.choices[0].message.content}


@app.get("/api/schedule")
async def get_full_schedule():
    from collections import defaultdict
    all_matches = await _fetch_all_wc_matches()
    grouped: dict[str, list] = defaultdict(list)
    for m in all_matches:
        grouped[m["date"]].append({
            **m,
            "home_flag": COUNTRY_FLAGS.get(m["home"], "🏳"),
            "away_flag": COUNTRY_FLAGS.get(m["away"], "🏳"),
            "stadium_lat": STADIUM_LOCATIONS.get(m["venue"], {}).get("lat"),
            "stadium_lng": STADIUM_LOCATIONS.get(m["venue"], {}).get("lng"),
        })
    return {"schedule": dict(grouped), "total_matches": len(all_matches)}


@app.get("/")
async def root():
    return {"status": "ok", "service": "World Cup 2026 Free Screenings API"}
