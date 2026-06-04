# World Cup 2026 — Free Screenings Finder

Find free public screenings and FIFA Fan Festivals near you for every World Cup 2026 match.

## Features

- Full match schedule for all 79 games (June 11 – July 19, 2026)
- Free screening search powered by Serper (Google Search)
- Official FIFA Fan Festival locations for all 15 host cities
- Interactive dark-theme Google Maps with stadium + screening markers
- AI chatbot powered by Groq (llama-3.3-70b-versatile) — ask about squads, schedules, screenings
- Date picker locked to World Cup dates
- Filter matches by host city

## Project Structure

```
worldcup2026/
├── backend/          # FastAPI Python backend
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── data/
│       └── schedule.py   # hardcoded full schedule + fan festival locations
└── frontend/         # Next.js 16 + Tailwind CSS 4
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── globals.css
    ├── components/
    │   ├── MatchesPanel.tsx
    │   ├── MapPanel.tsx
    │   └── Chatbot.tsx
    └── lib/
        ├── api.ts
        └── types.ts
```

## Setup

### 1. Get API Keys

| Key | Where to get |
|-----|-------------|
| `GROQ_API_KEY` | https://console.groq.com |
| `SERPER_API_KEY` | https://serper.dev (free tier: 2500 searches/month) |
| `GOOGLE_MAPS_API_KEY` | https://console.cloud.google.com — enable Maps JavaScript API + Geocoding API |

### 2. Backend

```bash
cd backend

# Copy and fill in your keys
cp .env.example .env
# Edit .env with your API keys

# Install & run
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs at http://localhost:8000  
API docs at http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend

# Copy and fill in your keys
cp .env.local.example .env.local
# Edit .env.local with your Google Maps API key

# Install & run
npm install
npm run dev
```

Frontend runs at http://localhost:3000

### 4. Run Both Together

```bash
chmod +x run.sh
./run.sh
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/matches?date=YYYY-MM-DD` | All matches for a date |
| `GET /api/screenings?date=YYYY-MM-DD&city=CityName` | Free screenings (Serper + hardcoded Fan Festivals) |
| `POST /api/chat` | Groq AI chat with match context |
| `GET /api/geocode?address=...` | Google Maps geocoding proxy |

## Notes

- The match schedule is hardcoded based on the best available published draw information. Group assignments and exact kickoff times for the later rounds (Round of 32 onwards) will only be confirmed after the group stage.
- Serper searches run in parallel for all host cities on a given match day.
- The chatbot includes current-day matches and screenings as context in every message.
- Without a Google Maps key, the map panel shows a fallback list of screenings.
