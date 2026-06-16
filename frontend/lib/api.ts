const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function fetchMatches(date: string) {
  const res = await fetch(`${BASE}/api/matches?date=${date}`)
  if (!res.ok) throw new Error("Failed to fetch matches")
  return res.json()
}

export async function fetchScreenings(date: string, city?: string) {
  const url = city
    ? `${BASE}/api/screenings?date=${date}&city=${encodeURIComponent(city)}`
    : `${BASE}/api/screenings?date=${date}`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch screenings")
  return res.json()
}

export async function sendChat(payload: {
  message: string
  date: string
  context: object
  history: { role: string; content: string }[]
}) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Failed to send message")
  return res.json()
}
