"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { LiquidButton } from "@/components/ui/liquid-glass-button"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const WC_MONTHS = [
  { year: 2026, month: 5, label: "June 2026" },
  { year: 2026, month: 6, label: "July 2026" },
]

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const STAGE_COLORS: Record<string, string> = {
  "Group Stage":    "rgba(59,130,246,0.18)",
  "Round of 32":    "rgba(139,92,246,0.18)",
  "Round of 16":    "rgba(234,179,8,0.18)",
  "Quarter-Final":  "rgba(239,68,68,0.18)",
  "Semi-Final":     "rgba(249,115,22,0.18)",
  "Final":          "rgba(255,215,0,0.25)",
}

const STAGE_TEXT: Record<string, string> = {
  "Group Stage":    "#93c5fd",
  "Round of 32":    "#c4b5fd",
  "Round of 16":    "#fde047",
  "Quarter-Final":  "#fca5a5",
  "Semi-Final":     "#fdba74",
  "Final":          "#FFD700",
}

interface Match {
  home: string
  away: string
  home_flag: string
  away_flag: string
  time_local: string
  venue: string
  city: string
  stage: string
  group?: string
}

type Schedule = Record<string, Match[]>

function getOffset(year: number, month: number) {
  return (new Date(year, month, 1).getDay() + 6) % 7
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
  })
}

export default function CalendarPage() {
  const [schedule, setSchedule] = useState<Schedule>({})
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`${API_URL}/api/schedule`)
      .then(r => r.json())
      .then(data => { setSchedule(data.schedule || {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selected && detailRef.current) {
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 50)
    }
  }, [selected])

  const selectedMatches = selected ? (schedule[selected] || []) : []

  return (
    <div className="min-h-screen pb-20" style={{ background: "#0a0f2c" }}>

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-5 py-4"
        style={{
          background: "rgba(10,15,44,0.95)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #1a2857",
        }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            <ArrowLeft size={14} />
            <span>Home</span>
          </Link>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
          <span className="text-white font-bold text-sm">Match Calendar</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/finder"
            className="text-sm font-medium transition-colors hidden sm:block"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Screenings Finder
          </Link>
          <Link href="/finder">
            <LiquidButton
              size="sm"
              className="rounded-full font-black tracking-wide"
              style={{ color: "#FFD700" }}
            >
              Find Screenings →
            </LiquidButton>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-10">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="text-center mb-12">
          <p
            className="text-xs font-black tracking-[0.5em] uppercase mb-3"
            style={{ color: "#FFD700", opacity: 0.65 }}
          >
            FIFA World Cup 2026
          </p>
          <h1
            className="font-black text-white uppercase tracking-tight mb-3"
            style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)" }}
          >
            Match Calendar
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            Click any match day to find free screenings near you
          </p>
        </div>

        {/* ── Legend ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {Object.entries(STAGE_TEXT).map(([stage, color]) => (
            <div key={stage} className="flex items-center gap-1.5 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ background: STAGE_COLORS[stage], border: `1px solid ${color}`, opacity: 0.9 }}
              />
              <span style={{ color: "rgba(255,255,255,0.45)" }}>{stage}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-24" style={{ color: "rgba(255,255,255,0.25)" }}>
            Loading schedule...
          </div>
        ) : (
          <div className="flex flex-col gap-14">
            {WC_MONTHS.map(({ year, month, label }) => {
              const offset = getOffset(year, month)
              const totalDays = daysInMonth(year, month)

              return (
                <div key={label}>
                  {/* Month heading */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-xl"></span>
                    <h2
                      className="font-black uppercase tracking-wide text-white"
                      style={{ fontSize: "clamp(1.2rem, 3vw, 1.8rem)" }}
                    >
                      {label}
                    </h2>
                    <div
                      className="flex-1 h-px"
                      style={{ background: "linear-gradient(to right, #1a2857, transparent)" }}
                    />
                    <span className="text-xs font-bold" style={{ color: "#FFD700", opacity: 0.6 }}>
                      {Object.keys(schedule).filter(d => d.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)).length} match days
                    </span>
                  </div>

                  {/* Day-of-week headers */}
                  <div className="grid grid-cols-7 mb-1">
                    {DAY_HEADERS.map(d => (
                      <div
                        key={d}
                        className="text-center py-2 text-xs font-black uppercase tracking-widest"
                        style={{ color: "rgba(255,255,255,0.2)" }}
                      >
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Leading empty cells */}
                    {Array.from({ length: offset }).map((_, i) => (
                      <div key={`e-${i}`} className="rounded-xl" style={{ minHeight: "90px" }} />
                    ))}

                    {/* Day cells */}
                    {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
                      const date = toDateStr(year, month, day)
                      const matches = schedule[date] || []
                      const hasMatches = matches.length > 0
                      const isSelected = selected === date
                      const preview = matches.slice(0, 2)
                      const extra = matches.length - 2
                      const stageColor = hasMatches ? STAGE_COLORS[matches[0].stage] || "rgba(255,215,0,0.12)" : undefined
                      const stageBorder = hasMatches ? STAGE_TEXT[matches[0].stage] || "#FFD700" : undefined

                      return (
                        <div
                          key={day}
                          onClick={() => {
                            if (!hasMatches) return
                            setSelected(isSelected ? null : date)
                          }}
                          className="rounded-xl p-1 sm:p-1.5 transition-all"
                          style={{
                            minHeight: "clamp(58px, 12vw, 90px)",
                            background: isSelected
                              ? "rgba(255,215,0,0.12)"
                              : hasMatches
                              ? stageColor
                              : "rgba(255,255,255,0.015)",
                            border: isSelected
                              ? "1.5px solid #FFD700"
                              : hasMatches
                              ? `1px solid ${stageBorder}40`
                              : "1px solid rgba(255,255,255,0.04)",
                            cursor: hasMatches ? "pointer" : "default",
                            boxShadow: isSelected
                              ? "0 0 20px rgba(255,215,0,0.2)"
                              : hasMatches
                              ? "0 0 10px rgba(255,215,0,0.04)"
                              : "none",
                          }}
                        >
                          {/* Day number + match count */}
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className="text-xs font-black w-5 h-5 flex items-center justify-center rounded-full"
                              style={{
                                color: isSelected ? "#0a0f2c" : hasMatches ? "#FFD700" : "rgba(255,255,255,0.25)",
                                background: isSelected ? "#FFD700" : hasMatches ? "rgba(255,215,0,0.15)" : "transparent",
                                fontSize: "0.65rem",
                              }}
                            >
                              {day}
                            </span>
                            {hasMatches && (
                              <span
                                className="rounded-full font-black"
                                style={{
                                  fontSize: "0.5rem",
                                  padding: "1px 5px",
                                  background: "rgba(255,215,0,0.15)",
                                  color: "#FFD700",
                                }}
                              >
                                {matches.length}
                              </span>
                            )}
                          </div>

                          {/* Match previews */}
                          {preview.map((m, i) => (
                            <div
                              key={i}
                              className="rounded-md px-1 py-0.5 mb-0.5"
                              style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.04)",
                              }}
                            >
                              <div
                                className="flex items-center gap-0.5 leading-none"
                                style={{ fontSize: "0.55rem", fontWeight: 700 }}
                              >
                                <span style={{ fontSize: "0.65rem" }}>{m.home_flag}</span>
                                <span className="text-white truncate" style={{ maxWidth: "26px" }}>
                                  {m.home.substring(0, 3).toUpperCase()}
                                </span>
                                <span style={{ color: "rgba(255,255,255,0.3)", margin: "0 1px" }}>v</span>
                                <span className="text-white truncate" style={{ maxWidth: "26px" }}>
                                  {m.away.substring(0, 3).toUpperCase()}
                                </span>
                                <span style={{ fontSize: "0.65rem" }}>{m.away_flag}</span>
                              </div>
                            </div>
                          ))}

                          {extra > 0 && (
                            <div
                              className="text-center"
                              style={{ fontSize: "0.5rem", color: "rgba(255,215,0,0.55)", marginTop: "2px" }}
                            >
                              +{extra} more
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Match detail panel (shown when a day is selected) ───── */}
        {selected && selectedMatches.length > 0 && (
          <div
            ref={detailRef}
            className="mt-10 rounded-2xl p-6"
            style={{
              background: "#0e1638",
              border: "1px solid rgba(255,215,0,0.25)",
              boxShadow: "0 0 40px rgba(255,215,0,0.08)",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-black tracking-widest uppercase mb-1" style={{ color: "#FFD700", opacity: 0.7 }}>
                  {selectedMatches.length} {selectedMatches.length === 1 ? "Match" : "Matches"}
                </p>
                <h3 className="text-white font-black text-lg">{formatDate(selected)}</h3>
              </div>
              <Link href={`/finder?date=${selected}&tab=map`}>
                <LiquidButton
                  size="sm"
                  className="rounded-full font-black flex items-center gap-2"
                  style={{ color: "#FFD700" }}
                >
                  Find Screenings →
                </LiquidButton>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedMatches.map((m, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{
                    background: STAGE_COLORS[m.stage] || "rgba(255,255,255,0.04)",
                    border: `1px solid ${STAGE_TEXT[m.stage] || "#FFD700"}30`,
                  }}
                >
                  {/* Stage badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-xs font-black px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        color: STAGE_TEXT[m.stage] || "#FFD700",
                      }}
                    >
                      {m.group ? `Group ${m.group}` : m.stage}
                    </span>
                    <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {m.time_local}
                    </span>
                  </div>

                  {/* Teams */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-3xl">{m.home_flag}</span>
                      <span className="text-white font-bold text-xs text-center leading-tight">
                        {m.home}
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                      <span className="text-xs font-black" style={{ color: "rgba(255,255,255,0.3)" }}>VS</span>
                    </div>

                    <div className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-3xl">{m.away_flag}</span>
                      <span className="text-white font-bold text-xs text-center leading-tight">
                        {m.away}
                      </span>
                    </div>
                  </div>

                  {/* Venue */}
                  <div
                    className="mt-3 pt-3 text-xs text-center"
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.35)",
                    }}
                  >
                    {m.venue} · {m.city}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
