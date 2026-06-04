export interface Match {
  id: number
  date: string
  group: string
  home: string
  away: string
  home_flag: string
  away_flag: string
  time_utc: string
  time_local: string
  venue: string
  city: string
  stage: string
  stadium_lat?: number
  stadium_lng?: number
}

export interface Screening {
  name: string
  address: string
  lat?: number
  lng?: number
  city?: string
  source_url?: string
  google_place_url?: string
  description?: string
  source?: string
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}
