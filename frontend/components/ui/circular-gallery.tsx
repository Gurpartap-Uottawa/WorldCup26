'use client'
import { useState, useEffect, useRef, HTMLAttributes } from 'react'
import { createPortal } from 'react-dom'

const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ')
}

export interface GalleryItem {
  common: string
  binomial: string
  lure?: string
  photo: {
    url: string
    text: string
    pos?: string
    by: string
  }
}

interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[]
  radius?: number
  autoRotateSpeed?: number
}

const CircularGallery = ({ items, className, radius = 600, autoRotateSpeed = 0.02, ...props }: CircularGalleryProps) => {
    const [rotation, setRotation] = useState(0)
    const [isScrolling, setIsScrolling] = useState(false)
    const [scale, setScale] = useState(1)
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const animationFrameRef = useRef<number | null>(null)

    useEffect(() => {
      const updateScale = () => {
        const w = containerRef.current?.offsetWidth ?? window.innerWidth
        setScale(Math.min(1, Math.max(0.62, w / 1000)))
      }
      updateScale()
      window.addEventListener('resize', updateScale)
      return () => window.removeEventListener('resize', updateScale)
    }, [])

    useEffect(() => {
      const handleScroll = () => {
        setIsScrolling(true)
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)

        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
        const scrollProgress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0
        setRotation(scrollProgress * 360)

        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false)
        }, 150)
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => {
        window.removeEventListener('scroll', handleScroll)
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      }
    }, [])

    useEffect(() => {
      const autoRotate = () => {
        if (!isScrolling) {
          setRotation(prev => prev + autoRotateSpeed)
        }
        animationFrameRef.current = requestAnimationFrame(autoRotate)
      }
      animationFrameRef.current = requestAnimationFrame(autoRotate)
      return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      }
    }, [isScrolling, autoRotateSpeed])

    const anglePerItem = 360 / items.length
    const effectiveRadius = radius * scale
    const cardW = Math.round(300 * scale)
    const cardH = Math.round(400 * scale)

    const modal = selectedItem && typeof document !== 'undefined' && createPortal(
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 9999, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(12px)" }}
        onClick={() => setSelectedItem(null)}
      >
        <div
          className="relative w-full rounded-2xl overflow-hidden shadow-2xl"
          style={{
            maxWidth: "380px",
            background: "#080d24",
            border: "1.5px solid rgba(255,215,0,0.4)",
            boxShadow: "0 0 60px rgba(255,215,0,0.15), 0 24px 80px rgba(0,0,0,0.7)",
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className="relative overflow-hidden" style={{ height: "260px" }}>
            <img
              src={selectedItem.photo.url}
              alt={selectedItem.photo.text}
              className="w-full h-full object-cover"
              style={{ objectPosition: selectedItem.photo.pos || 'center top' }}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,13,36,0.1) 30%, #080d24 100%)" }} />
          </div>
          <div className="px-6 pt-1 pb-7">
            <p className="text-xs font-black tracking-[0.4em] uppercase mb-2" style={{ color: "#FFD700" }}>
              {selectedItem.binomial}
            </p>
            <h2 className="font-black text-white mb-4" style={{ fontSize: "1.6rem", lineHeight: 1.1 }}>
              {selectedItem.common}
            </h2>
            <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.78)", fontSize: "0.95rem" }}>
              {selectedItem.lure}
            </p>
          </div>
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full font-bold transition-colors"
            style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.7)", fontSize: "1rem" }}
          >
            ✕
          </button>
        </div>
      </div>,
      document.body
    )

    return (
      <>
      {modal}
      <div
        ref={containerRef}
        role="region"
        aria-label="Circular 3D Gallery"
        className={cn('relative w-full h-full flex items-center justify-center', className)}
        style={{ perspective: '2000px' }}
        {...props}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `rotateY(${rotation}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {items.map((item, i) => {
            const itemAngle = i * anglePerItem
            const totalRotation = rotation % 360
            const relativeAngle = (itemAngle + totalRotation + 360) % 360
            const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle)
            const opacity = Math.max(0.3, 1 - normalizedAngle / 180)

            return (
              <div
                key={item.photo.url}
                role="group"
                aria-label={item.common}
                onClick={() => item.lure && setSelectedItem(item)}
                style={{
                  position: 'absolute',
                  width: `${cardW}px`,
                  height: `${cardH}px`,
                  transform: `rotateY(${itemAngle}deg) translateZ(${effectiveRadius}px)`,
                  left: '50%',
                  top: '50%',
                  marginLeft: `-${cardW / 2}px`,
                  marginTop: `-${cardH / 2}px`,
                  opacity,
                  transition: 'opacity 0.3s linear',
                  cursor: item.lure ? 'pointer' : 'default',
                }}
              >
                <div className="relative w-full h-full rounded-lg shadow-2xl overflow-hidden border border-white/10 backdrop-blur-lg group">
                  <img
                    src={item.photo.url}
                    alt={item.photo.text}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ objectPosition: item.photo.pos || 'center' }}
                  />
                  <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent text-white">
                    <h2 className="text-xl font-bold">{item.common}</h2>
                    <em className="text-sm italic opacity-80">{item.binomial}</em>
                  </div>
                  {item.lure && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: "rgba(10,15,44,0.55)", backdropFilter: "blur(2px)" }}>
                      <span className="text-xs font-black tracking-widest uppercase" style={{ color: "#FFD700" }}>
                        Tap to read
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      </>
    )
}

export { CircularGallery }
