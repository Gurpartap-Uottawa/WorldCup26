import Image from "next/image"
import Link from "next/link"
import CarouselCard from "@/components/ui/carousel-card"
import { CircularGallery, GalleryItem } from "@/components/ui/circular-gallery"
import { LiquidButton } from "@/components/ui/liquid-glass-button"

const WC_GALLERY_ITEMS: GalleryItem[] = [
  {
    common: "Lionel Messi",
    binomial: "Argentina",
    photo: {
      url: "/messi%20world%20cup.jpg",
      text: "Lionel Messi with the World Cup trophy",
      pos: "center top",
      by: "Argentina",
    },
  },
  {
    common: "Cristiano Ronaldo",
    binomial: "Portugal",
    photo: {
      url: "/cr7.jpg",
      text: "Cristiano Ronaldo",
      pos: "center top",
      by: "Portugal",
    },
  },
  {
    common: "Kylian Mbappé",
    binomial: "France",
    photo: {
      url: "/mbappe.jpg",
      text: "Kylian Mbappé",
      pos: "center top",
      by: "France",
    },
  },
  {
    common: "Neymar Jr",
    binomial: "Brazil",
    photo: {
      url: "/neymar.jpg",
      text: "Neymar Jr",
      pos: "center top",
      by: "Brazil",
    },
  },
  {
    common: "Lamine Yamal",
    binomial: "Spain",
    photo: {
      url: "/lamine%20world%20cup.jpg",
      text: "Lamine Yamal",
      pos: "center top",
      by: "Spain",
    },
  },
  {
    common: "Harry Kane",
    binomial: "England",
    photo: {
      url: "/harry%20kane.jpg",
      text: "Harry Kane",
      pos: "center top",
      by: "England",
    },
  },
  {
    common: "Virgil van Dijk",
    binomial: "Netherlands",
    photo: {
      url: "/vandijk.jpg",
      text: "Virgil van Dijk",
      pos: "center top",
      by: "Netherlands",
    },
  },
  {
    common: "Erling Haaland",
    binomial: "Norway",
    photo: {
      url: "/haaland.jpg",
      text: "Erling Haaland",
      pos: "center top",
      by: "Norway",
    },
  },
  {
    common: "Florian Wirtz",
    binomial: "Germany",
    photo: {
      url: "/wirtz.jpg",
      text: "Florian Wirtz",
      pos: "center top",
      by: "Germany",
    },
  },
]

const FEATURE_CARDS = [
  {
    id: 1,
    imgUrl: "/interactive%20map.jpg",
    title: "Live Interactive Map",
    content:
      "Every stadium, FIFA Fan Festival, and public watch party plotted across North America — colour-coded and clickable. Blue for venues, red for fan festivals, orange for public watch spots.",
    href: "/finder",
    cta: "Open Map",
  },
  {
    id: 2,
    imgUrl: "/fan%20festival.jpg",
    title: "Find Your Fan Festival",
    content:
      "FIFA Fan Festivals are free, open-air events in every host city with live big screens, music, food, and the full match atmosphere — no ticket required.",
    href: "/finder",
    cta: "Find Festivals",
  },
  {
    id: 3,
    imgUrl: "/ai%20assistant.gif",
    title: "AI Match Assistant",
    content:
      "Ask anything about WC2026 — squad depth charts, match previews, host city travel tips, or which public screening is closest to your location. Powered by Groq.",
    href: "/finder",
    cta: "Chat Now",
  },
  {
    id: 4,
    imgUrl: "/calender.jpg",
    title: "Full Match Calendar",
    content:
      "All 104 games from June 11 to July 19. Click any match day to see every fixture, venue, and kick-off time — then jump straight to free screenings near you.",
    href: "/calendar",
    cta: "View Calendar",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0f2c" }}>

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(10,15,44,0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,215,0,0.08)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl"></span>
          <span className="text-white font-black text-base tracking-wide">WC2026</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How It Works</a>
          <Link href="/calendar" className="hover:text-white transition-colors">Calendar</Link>
        </div>

        <Link href="/finder">
          <LiquidButton
            size="sm"
            className="rounded-full font-black tracking-wide"
            style={{ color: "#FFD700" }}
          >
            OPEN APP →
          </LiquidButton>
        </Link>
      </nav>

      {/* ── Hero — Circular Gallery ────────────────────────────────────────── */}
      {/* 500vh gives the scroll-driven rotation room to breathe */}
      <div style={{ height: "500vh", background: "#0a0f2c" }}>
        <div
          className="sticky top-0 h-screen overflow-hidden"
          style={{ background: "#0a0f2c" }}
        >
          {/* Top fade so fixed navbar stays readable */}
          <div
            className="absolute top-0 left-0 right-0 z-20 h-32 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, #0a0f2c 0%, transparent 100%)" }}
          />

          {/* Bottom fade into stats bar */}
          <div
            className="absolute bottom-0 left-0 right-0 z-20 h-52 pointer-events-none"
            style={{ background: "linear-gradient(to top, #0a0f2c 0%, transparent 100%)" }}
          />

          {/* Text + CTA — pinned to bottom third, gallery fills the upper space */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-12 pointer-events-none px-4">
            <p
              className="text-xs font-black tracking-[0.6em] mb-2 uppercase"
              style={{ color: "#FFD700", opacity: 0.8 }}
            >
              FIFA
            </p>
            <h1
              className="font-black uppercase leading-none text-white text-center"
              style={{
                fontSize: "clamp(2rem, 6vw, 5rem)",
                letterSpacing: "-0.01em",
                textShadow: "0 2px 60px rgba(255,215,0,0.3), 0 0 80px rgba(10,15,44,0.95)",
              }}
            >
              WORLD CUP
            </h1>
            <h2
              className="font-black leading-none"
              style={{
                fontSize: "clamp(3rem, 11vw, 9rem)",
                color: "#FFD700",
                letterSpacing: "0.08em",
                textShadow: "0 0 120px rgba(255,215,0,0.55), 0 2px 4px rgba(0,0,0,0.6)",
                marginTop: "-0.05em",
              }}
            >
              2026
            </h2>
            <p
              className="font-semibold text-sm tracking-widest uppercase mt-3"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Free Screenings Finder
            </p>

            {/* CTA — pointer-events-auto overrides the parent none */}
            <div className="mt-5 flex flex-col items-center gap-2 pointer-events-auto w-full px-6 sm:w-auto sm:px-0">
              <Link href="/finder" className="w-full sm:w-auto">
                <LiquidButton
                  size="xl"
                  className="rounded-full font-black text-lg w-full sm:w-fit"
                  style={{ color: "#FFD700" }}
                >
                  Find Screenings Near You →
                </LiquidButton>
              </Link>
            </div>
          </div>

          {/* Gallery — increased opacity so cards are much more visible */}
          <div className="w-full h-full" style={{ opacity: 0.85 }}>
            <CircularGallery
              items={WC_GALLERY_ITEMS}
              radius={550}
              autoRotateSpeed={0.08}
            />
          </div>
        </div>
      </div>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "rgba(20,32,80,0.6)",
          borderTop: "1px solid #1a2857",
          borderBottom: "1px solid #1a2857",
        }}
        className="py-10 px-4"
      >
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: "48",   label: "Teams"       },
            { num: "104",  label: "Matches"     },
            { num: "16",   label: "Host Cities" },
            { num: "100+", label: "Watch Spots" },
          ].map(({ num, label }) => (
            <div key={label}>
              <div
                className="font-black text-4xl"
                style={{ color: "#FFD700" }}
              >
                {num}
              </div>
              <div
                className="text-xs mt-1 uppercase tracking-[0.25em]"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features carousel ─────────────────────────────────────────────── */}
      <section id="features" className="py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <p
            className="text-center text-xs font-black tracking-[0.4em] uppercase mb-3"
            style={{ color: "#FFD700", opacity: 0.7 }}
          >
            Everything You Need
          </p>
          <h2
            className="text-3xl md:text-4xl font-black text-white text-center mb-14 uppercase tracking-tight"
          >
            Your WORLD CUP 2026 Companion
          </h2>

          <CarouselCard data={FEATURE_CARDS} cardsPerView={3} />
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section id="how" className="py-24 px-4" style={{ background: "rgba(14,22,56,0.5)" }}>
        <div className="max-w-4xl mx-auto">
          <p
            className="text-center text-xs font-black tracking-[0.4em] uppercase mb-3"
            style={{ color: "#FFD700", opacity: 0.7 }}
          >
            Simple as That
          </p>
          <h2 className="text-3xl font-black text-white text-center mb-16 uppercase tracking-tight">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Pick a Date",    desc: "Choose any match day between June 11 and July 19, 2026." },
              { step: "02", title: "See What's On",  desc: "Instantly see all matches playing that day and where they are." },
              { step: "03", title: "Find Your Spot", desc: "Browse 100+ free screening locations on the live map and get directions." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0"
                  style={{ background: "rgba(255,215,0,0.12)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }}
                >
                  {step}
                </div>
                <h3 className="text-white font-bold text-base">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────────────────────── */}
      <section className="relative py-36 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/football-hero.jpg"
            fill
            style={{ objectFit: "cover", objectPosition: "center 40%" }}
            alt=""
          />
          <div
            className="absolute inset-0"
            style={{ background: "rgba(10,15,44,0.88)" }}
          />
        </div>

        <div className="relative z-10 max-w-xl mx-auto text-center">
          <p
            className="text-xs font-black tracking-[0.5em] uppercase mb-4"
            style={{ color: "#FFD700", opacity: 0.7 }}
          >
            Free · Open to All
          </p>
          <h2
            className="font-black text-white uppercase mb-5"
            style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", lineHeight: 1.1 }}
          >
            Where Will You Watch?
          </h2>
          <p className="text-sm mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            Over 100 free public screening locations across the US and Canada. Stadiums, fan festivals, parks, and bars — find yours in seconds.
          </p>
          <Link href="/finder">
            <LiquidButton
              size="xl"
              className="rounded-full font-black text-xl"
              style={{ color: "#FFD700" }}
            >
              FIND MY NEAREST SPOT →
            </LiquidButton>
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer
        className="py-8 px-4 text-center"
        style={{ borderTop: "1px solid #1a2857" }}
      >
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>
          World Cup 2026 Free Screenings Finder · Not affiliated with FIFA · For fans, by fans
        </p>
      </footer>

    </div>
  )
}
