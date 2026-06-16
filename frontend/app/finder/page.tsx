"use client"

import { Suspense, useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { CalendarDays, ArrowLeft, List, Map } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { fetchMatches, fetchScreenings } from "@/lib/api"
import type { Match, Screening } from "@/lib/types"
import MatchesPanel from "@/components/MatchesPanel"
import MapPanel from "@/components/MapPanel"
import Chatbot from "@/components/Chatbot"
import { LiquidButton } from "@/components/ui/liquid-glass-button"

const WC_START = new Date(2026, 5, 11)
const WC_END = new Date(2026, 6, 19)

function parseDateParam(param: string | null): Date {
  if (!param) return WC_START
  const d = new Date(param + "T12:00:00")
  if (isNaN(d.getTime()) || d < WC_START || d > WC_END) return WC_START
  return d
}

function FinderContent() {
  const searchParams = useSearchParams()
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    parseDateParam(searchParams.get("date"))
  )
  const [showCalendar, setShowCalendar] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [loadingScreenings, setLoadingScreenings] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [focusedMatchCity, setFocusedMatchCity] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<"matches" | "map">(
    searchParams.get("tab") === "map" ? "map" : "matches"
  )

  const dateStr = format(selectedDate, "yyyy-MM-dd")

  const loadData = useCallback(async (date: string) => {
    setLoadingMatches(true)
    setLoadingScreenings(true)
    setSelectedCity(null)
    setFocusedMatchCity(null)

    try {
      const [matchData, screeningData] = await Promise.all([
        fetchMatches(date),
        fetchScreenings(date),
      ])
      setMatches(matchData.matches || [])
      setScreenings(screeningData.screenings || [])
    } catch (err) {
      console.error(err)
      setMatches([])
      setScreenings([])
    } finally {
      setLoadingMatches(false)
      setLoadingScreenings(false)
    }
  }, [])

  useEffect(() => {
    loadData(dateStr)
  }, [dateStr, loadData])

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      setShowCalendar(false)
      setMobileTab("matches")
    }
  }

  const handleMatchClick = (match: Match) => {
    setFocusedMatchCity(match.city)
    setSelectedCity(match.city)
    setMobileTab("map")
  }

  const filteredScreenings = selectedCity
    ? screenings.filter(s => s.city?.toLowerCase() === selectedCity.toLowerCase())
    : screenings

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0f2c" }}>
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b"
        style={{ background: "#0a0f2c", borderColor: "#1a2857" }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1 text-white/40 hover:text-white/80 transition-colors text-sm mr-2"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">World Cup 2026</h1>
            <p className="text-xs" style={{ color: "#FFD700" }}>Free Screenings Finder</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/calendar"
            className="flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg"
            style={{ color: "rgba(255,255,255,0.45)", border: "1px solid #1a2857" }}
          >
            <CalendarDays size={14} className="hidden sm:block" />
            <span>Full Calendar</span>
          </Link>
          <span className="text-white/60 text-sm hidden lg:block">
            {format(selectedDate, "EEEE, MMM d, yyyy")}
          </span>
          <div className="relative">
            <LiquidButton
              size="sm"
              onClick={() => setShowCalendar(v => !v)}
              className="rounded-lg flex items-center gap-2"
              style={{ color: "#FFD700" }}
            >
              <CalendarDays size={14} />
              <span className="hidden sm:inline">Pick Date</span>
            </LiquidButton>

            {showCalendar && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowCalendar(false)} />
                <div
                  className="fixed left-4 right-4 top-16 z-50 rounded-xl shadow-2xl p-2 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-auto"
                  style={{ background: "#0e1638", border: "1px solid #1a2857" }}
                >
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={{ before: WC_START, after: WC_END }}
                    defaultMonth={WC_START}
                    style={{
                      "--rdp-accent-color": "#FFD700",
                      "--rdp-background-color": "#1a2857",
                      "--rdp-accent-color-dark": "#FFD700",
                      color: "white",
                    } as React.CSSProperties}
                    className="rdp-custom"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile tab bar */}
      <div className="lg:hidden flex border-b" style={{ borderColor: "#1a2857" }}>
        <button
          onClick={() => setMobileTab("matches")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold transition-colors"
          style={{
            color: mobileTab === "matches" ? "#FFD700" : "rgba(255,255,255,0.35)",
            borderBottom: mobileTab === "matches" ? "2px solid #FFD700" : "2px solid transparent",
          }}
        >
          <List size={15} /> Matches
        </button>
        <button
          onClick={() => setMobileTab("map")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold transition-colors"
          style={{
            color: mobileTab === "map" ? "#FFD700" : "rgba(255,255,255,0.35)",
            borderBottom: mobileTab === "map" ? "2px solid #FFD700" : "2px solid transparent",
          }}
        >
          <Map size={15} /> Map
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden lg:flex lg:flex-row">
        {/* Matches panel — slides off-left on mobile when map tab active; normal flow on desktop */}
        <div
          className={`absolute inset-0 overflow-y-auto transition-transform duration-300
            lg:relative lg:inset-auto lg:w-[420px] lg:min-w-[380px] lg:flex-shrink-0 lg:translate-x-0
            ${mobileTab === "matches" ? "translate-x-0" : "-translate-x-full"}`}
        >
          <MatchesPanel
            matches={matches}
            loading={loadingMatches}
            selectedCity={selectedCity}
            onMatchClick={handleMatchClick}
            onCityFilter={city => {
              setSelectedCity(city)
              setFocusedMatchCity(city)
            }}
          />
        </div>

        {/* Map panel — always mounted so Google Maps initialises; slides in from right on mobile */}
        <div
          className={`absolute inset-0 transition-transform duration-300
            lg:relative lg:inset-auto lg:flex-1 lg:translate-x-0
            ${mobileTab === "map" ? "translate-x-0" : "translate-x-full"}`}
        >
          <MapPanel
            matches={matches}
            screenings={filteredScreenings}
            loading={loadingScreenings}
            focusedCity={focusedMatchCity}
          />
        </div>
      </div>

      <Chatbot date={dateStr} matches={matches} screenings={screenings} />
    </div>
  )
}

export default function FinderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0f2c" }}>
        <p className="text-white/40 text-sm">Loading...</p>
      </div>
    }>
      <FinderContent />
    </Suspense>
  )
}
