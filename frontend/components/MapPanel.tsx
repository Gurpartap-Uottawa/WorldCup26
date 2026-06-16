"use client"

import { useState, useCallback, useEffect } from "react"
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api"
import type { Match, Screening } from "@/lib/types"
import { ExternalLink, MapPin } from "lucide-react"

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" }

const DEFAULT_CENTER = { lat: 37.5, lng: -96.5 }
const DEFAULT_ZOOM = 4

const MAP_OPTIONS: google.maps.MapOptions = {
  styles: [
    { elementType: "geometry", stylers: [{ color: "#0e1638" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
    { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
    { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#64779e" }] },
    { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
    { featureType: "landscape.man_made", elementType: "geometry.stroke", stylers: [{ color: "#334e87" }] },
    { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#023e58" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#283d6a" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6f9ba5" }] },
    { featureType: "poi", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
    { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#023859" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#3C7680" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
    { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2c6675" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#255763" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#b0d5ce" }] },
    { featureType: "road.highway", elementType: "labels.text.stroke", stylers: [{ color: "#023747" }] },
    { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
    { featureType: "transit", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
    { featureType: "transit.line", elementType: "geometry.fill", stylers: [{ color: "#283d6a" }] },
    { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#3a4762" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1d4a" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4e6d70" }] },
  ],
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
}

interface Props {
  matches: Match[]
  screenings: Screening[]
  loading: boolean
  focusedCity: string | null
}

interface InfoTarget {
  type: "screening" | "stadium"
  data: Screening | Match
  position: google.maps.LatLngLiteral
}

export default function MapPanel({ matches, screenings, loading, focusedCity }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: "google-map-script",
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [infoTarget, setInfoTarget] = useState<InfoTarget | null>(null)

  const onLoad = useCallback((m: google.maps.Map) => setMap(m), [])
  const onUnmount = useCallback(() => setMap(null), [])

  // Pan/zoom when focused city changes
  useEffect(() => {
    if (!map || !focusedCity) return
    const match = matches.find(m => m.city === focusedCity)
    if (match?.stadium_lat && match?.stadium_lng) {
      map.panTo({ lat: match.stadium_lat, lng: match.stadium_lng })
      map.setZoom(11)
    }
  }, [focusedCity, matches, map])

  // Unique stadium markers
  const stadiumMarkers = matches
    .filter(m => m.stadium_lat && m.stadium_lng)
    .reduce<Map<string, Match>>((acc, m) => {
      if (!acc.has(m.venue)) acc.set(m.venue, m)
      return acc
    }, new Map())

  const screeningsWithCoords = screenings.filter(s => s.lat && s.lng)

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center flex-col gap-3"
        style={{ background: "#0e1638" }}>
        <MapPin size={32} style={{ color: "#FFD700" }} />
        <p className="text-white/60 text-sm text-center px-4">
          Map unavailable — configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        </p>
        {screenings.length > 0 && (
          <div className="mt-4 w-full max-w-md px-4">
            <p className="text-white/80 text-sm font-semibold mb-2">Free Screenings:</p>
            {screenings.slice(0, 8).map((s, i) => (
              <div key={i} className="mb-2 p-3 rounded-lg" style={{ background: "#1a2857" }}>
                <p className="text-white text-sm font-medium">{s.name}</p>
                <p className="text-white/50 text-xs">{s.address}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center"
        style={{ background: "#0e1638" }}>
        <div className="text-white/40 text-sm">Loading map...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        options={MAP_OPTIONS}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* Blue: stadium markers */}
        {Array.from(stadiumMarkers.values()).map(match => (
          <Marker
            key={`stadium-${match.venue}`}
            position={{ lat: match.stadium_lat!, lng: match.stadium_lng! }}
            title={match.venue}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#3b82f6",
              fillOpacity: 0.9,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            }}
            onClick={() =>
              setInfoTarget({
                type: "stadium",
                data: match,
                position: { lat: match.stadium_lat!, lng: match.stadium_lng! },
              })
            }
          />
        ))}

        {/* Screening markers — colour by source */}
        {screeningsWithCoords.map((s, i) => {
          const color =
            s.source === "official_fan_festival" ? "#ef4444"
            : s.source === "popular_watch_spot"  ? "#f97316"
            : "#ef4444"
          return (
            <Marker
              key={`screening-${i}`}
              position={{ lat: s.lat!, lng: s.lng! }}
              title={s.name}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 9,
                fillColor: color,
                fillOpacity: 0.9,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }}
              onClick={() =>
                setInfoTarget({
                  type: "screening",
                  data: s,
                  position: { lat: s.lat!, lng: s.lng! },
                })
              }
            />
          )
        })}

        {/* InfoWindow */}
        {infoTarget && (
          <InfoWindow
            position={infoTarget.position}
            onCloseClick={() => setInfoTarget(null)}
          >
            <div className="max-w-xs" style={{ color: "#0a0f2c", fontFamily: "Inter, sans-serif" }}>
              {infoTarget.type === "screening" ? (
                <ScreeningInfo s={infoTarget.data as Screening} />
              ) : (
                <StadiumInfo m={infoTarget.data as Match} />
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Legend */}
      <div
        className="absolute bottom-8 left-4 flex flex-col gap-1.5 p-3 rounded-xl text-xs"
        style={{ background: "rgba(10,15,44,0.92)", border: "1px solid #1a2857" }}
      >
        <div className="flex items-center gap-2 text-white/80">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: "#3b82f6" }} />
          Match Venues
        </div>
        <div className="flex items-center gap-2 text-white/80">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: "#ef4444" }} />
          Official Fan Festival
        </div>
        <div className="flex items-center gap-2 text-white/80">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: "#f97316" }} />
          Public Watch Spot
        </div>
        {loading && (
          <div className="text-white/40 mt-1">Loading screenings...</div>
        )}
      </div>

      {/* No screenings notice */}
      {!loading && screeningsWithCoords.length === 0 && screenings.length > 0 && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs text-white/70"
          style={{ background: "rgba(10,15,44,0.9)", border: "1px solid #1a2857" }}
        >
          {screenings.length} screenings found (no coordinates — configure Google Maps key)
        </div>
      )}
    </div>
  )
}

function ScreeningInfo({ s }: { s: Screening }) {
  const mapsUrl = s.google_place_url ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address || s.name)}`

  return (
    <div>
      <p className="font-bold text-sm mb-1">{s.name}</p>
      {s.address && <p className="text-xs text-gray-600 mb-2">{s.address}</p>}
      {s.description && s.description !== s.address && (
        <p className="text-xs text-gray-500 mb-2 max-w-[220px]">{s.description}</p>
      )}
      {s.source === "official_fan_festival" && (
        <span className="inline-block text-xs px-2 py-0.5 rounded-full mb-2 font-medium"
          style={{ background: "#FFD700", color: "#0a0f2c" }}>
          Official Fan Festival
        </span>
      )}
      {s.source === "popular_watch_spot" && (
        <span className="inline-block text-xs px-2 py-0.5 rounded-full mb-2 font-medium"
          style={{ background: "#f97316", color: "white" }}>
          Public Watch Spot
        </span>
      )}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-xs font-medium mt-1"
        style={{ color: "#2563eb" }}
      >
        <ExternalLink size={11} />
        View on Google Maps
      </a>
    </div>
  )
}

function StadiumInfo({ m }: { m: Match }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.venue + " " + m.city)}`
  return (
    <div>
      <p className="font-bold text-sm mb-1">{m.venue}</p>
      <p className="text-xs text-gray-600 mb-1">{m.city}</p>
      <p className="text-xs font-medium mb-2">
        {m.home_flag} {m.home} vs {m.away_flag} {m.away}
      </p>
      <p className="text-xs text-gray-500">{m.time_local}</p>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-xs font-medium mt-2"
        style={{ color: "#2563eb" }}
      >
        <ExternalLink size={11} />
        View on Google Maps
      </a>
    </div>
  )
}
