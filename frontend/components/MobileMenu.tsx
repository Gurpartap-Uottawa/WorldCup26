'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(v => !v)}
        className="md:hidden flex flex-col items-center justify-center w-9 h-9 rounded-lg gap-1.5 transition-colors"
        style={{ border: "1px solid rgba(255,255,255,0.1)", background: open ? "rgba(255,215,0,0.08)" : "transparent" }}
        aria-label="Menu"
      >
        <span className="block w-4 h-0.5 transition-all duration-300"
          style={{ background: open ? "#FFD700" : "rgba(255,255,255,0.6)",
            transform: open ? "translateY(4px) rotate(45deg)" : "none" }} />
        <span className="block w-4 h-0.5 transition-all duration-300"
          style={{ background: open ? "#FFD700" : "rgba(255,255,255,0.6)",
            opacity: open ? 0 : 1 }} />
        <span className="block w-4 h-0.5 transition-all duration-300"
          style={{ background: open ? "#FFD700" : "rgba(255,255,255,0.6)",
            transform: open ? "translateY(-8px) rotate(-45deg)" : "none" }} />
      </button>

      {open && (
        <div
          className="fixed left-0 right-0 z-40 md:hidden"
          style={{ top: "57px", background: "rgba(8,13,36,0.98)", borderBottom: "1px solid #1a2857", backdropFilter: "blur(16px)" }}
        >
          <nav className="flex flex-col px-6 py-5 gap-1">
            {[
              { label: "Features",     href: "#features", external: false },
              { label: "How It Works", href: "#how",      external: false },
              { label: "Calendar",     href: "/calendar", external: true  },
            ].map(({ label, href, external }) => (
              external ? (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="text-base font-bold py-3 border-b transition-colors"
                  style={{ color: "rgba(255,255,255,0.75)", borderColor: "rgba(255,255,255,0.06)" }}
                >
                  {label}
                </Link>
              ) : (
                <a
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="text-base font-bold py-3 border-b transition-colors"
                  style={{ color: "rgba(255,255,255,0.75)", borderColor: "rgba(255,255,255,0.06)" }}
                >
                  {label}
                </a>
              )
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
