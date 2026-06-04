"use client"

import type { Match } from "@/lib/types"
import { MapPin, Clock, Trophy } from "lucide-react"
import clsx from "clsx"
import { LiquidButton } from "@/components/ui/liquid-glass-button"

interface Props {
  matches: Match[]
  loading: boolean
  selectedCity: string | null
  onMatchClick: (match: Match) => void
  onCityFilter: (city: string | null) => void
}

const STAGE_COLORS: Record<string, string> = {
  "Group Stage": "#1a2857",
  "Round of 32": "#1e3560",
  "Round of 16": "#233f72",
  "Quarterfinal": "#2a4d8a",
  "Semifinal": "#2e56a0",
  "Third Place": "#1e3a6e",
  "Final": "#3a1a00",
}

const STAGE_BADGES: Record<string, string> = {
  "Group Stage": "#4a6fa5",
  "Round of 32": "#5a7fb5",
  "Round of 16": "#6a9ac5",
  "Quarterfinal": "#7aadd5",
  "Semifinal": "#8ac0e5",
  "Third Place": "#5a8fc0",
  "Final": "#FFD700",
}

function MatchSkeleton() {
  return (
    <div className="rounded-xl p-4 mb-3" style={{ background: "#0e1638", border: "1px solid #1a2857" }}>
      <div className="skeleton h-3 w-24 mb-3" />
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-1">
          <div className="skeleton h-8 w-8 rounded" />
          <div className="skeleton h-3 w-16" />
        </div>
        <div className="skeleton h-6 w-12 rounded" />
        <div className="flex flex-col items-center gap-1">
          <div className="skeleton h-8 w-8 rounded" />
          <div className="skeleton h-3 w-16" />
        </div>
      </div>
      <div className="skeleton h-3 w-32 mt-3" />
    </div>
  )
}

export default function MatchesPanel({
  matches, loading, selectedCity, onMatchClick, onCityFilter,
}: Props) {
  const cities = Array.from(new Set(matches.map(m => m.city)))

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-base flex items-center gap-2">
          <Trophy size={16} style={{ color: "#FFD700" }} />
          Matches
          {!loading && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#1a2857", color: "#FFD700" }}>
              {matches.length}
            </span>
          )}
        </h2>
      </div>

      {/* City filter pills */}
      {cities.length > 1 && !loading && (
        <div className="flex flex-wrap gap-2 mb-4">
          <LiquidButton
            size="sm"
            onClick={() => onCityFilter(null)}
            className={clsx(
              "rounded-full text-xs font-medium",
              !selectedCity ? "text-[#FFD700]" : "text-white/50"
            )}
          >
            All Cities
          </LiquidButton>
          {cities.map(city => (
            <LiquidButton
              key={city}
              size="sm"
              onClick={() => onCityFilter(selectedCity === city ? null : city)}
              className={clsx(
                "rounded-full text-xs font-medium",
                selectedCity === city ? "text-[#FFD700]" : "text-white/50"
              )}
            >
              {city}
            </LiquidButton>
          ))}
        </div>
      )}

      {loading ? (
        <>
          <MatchSkeleton />
          <MatchSkeleton />
          <MatchSkeleton />
        </>
      ) : matches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-white/60 text-sm">No matches scheduled for this date.</p>
          <p className="text-white/40 text-xs mt-1">Try another date during June 11 – July 19, 2026</p>
        </div>
      ) : (
        <div>
          {matches
            .filter(m => !selectedCity || m.city.toLowerCase() === selectedCity.toLowerCase())
            .map(match => (
              <MatchCard
                key={match.id}
                match={match}
                onClick={() => onMatchClick(match)}
                isSelected={selectedCity === match.city}
              />
            ))}
        </div>
      )}
    </div>
  )
}

function MatchCard({ match, onClick, isSelected }: {
  match: Match
  onClick: () => void
  isSelected: boolean
}) {
  const bg = STAGE_COLORS[match.stage] ?? "#1a2857"
  const badgeColor = STAGE_BADGES[match.stage] ?? "#4a6fa5"

  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full text-left rounded-xl p-4 mb-3 transition-all duration-200",
        "hover:scale-[1.01] hover:shadow-lg",
        isSelected && "ring-2"
      )}
      style={{
        background: bg,
        border: isSelected ? "1px solid #FFD700" : "1px solid #1a2857",

        boxShadow: isSelected ? "0 0 0 2px #FFD700" : undefined,
      }}
    >
      {/* Stage badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: badgeColor, color: "white" }}
        >
          {match.group !== match.stage ? `Group ${match.group}` : match.stage}
        </span>
        {match.stage === "Final" && <span className="text-lg">🏆</span>}
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col items-center gap-1 flex-1">
          <span className="text-3xl">{match.home_flag}</span>
          <span className="text-white text-sm font-semibold text-center leading-tight">
            {match.home}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-white/40 text-xs">VS</span>
        </div>

        <div className="flex flex-col items-center gap-1 flex-1">
          <span className="text-3xl">{match.away_flag}</span>
          <span className="text-white text-sm font-semibold text-center leading-tight">
            {match.away}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-white/60 text-xs">
          <Clock size={12} />
          <span>{match.time_local}</span>
          <span className="text-white/30">·</span>
          <span>{match.time_utc} UTC</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/60 text-xs">
          <MapPin size={12} />
          <span>{match.venue}</span>
          <span className="text-white/30">·</span>
          <span style={{ color: "#FFD700" }}>{match.city}</span>
        </div>
      </div>
    </button>
  )
}
