'use client'
import { useState, useEffect, useRef } from "react"
import Link from "next/link"

interface CardData {
  id: number
  imgUrl: string
  title: string
  content: string
  href?: string
  cta?: string
}

interface CardProps {
  data: CardData[]
  showCarousel?: boolean
  cardsPerView?: number
}

const CarouselCard = ({ data, showCarousel = true, cardsPerView = 3 }: CardProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isSingleCard, setIsSingleCard] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsSingleCard(data?.length === 1)
  }, [data])

  const cardWidth = 75 / cardsPerView

  const nextSlide = () => {
    if (isAnimating || !showCarousel || !data) return
    if (data.length <= cardsPerView) return

    setIsAnimating(true)
    const nextIndex = (currentIndex + 1) % data.length

    if (containerRef.current) {
      containerRef.current.style.transition = "transform 500ms ease"
      containerRef.current.style.transform = `translateX(-${cardWidth}%)`

      setTimeout(() => {
        setCurrentIndex(nextIndex)
        if (containerRef.current) {
          containerRef.current.style.transition = "none"
          containerRef.current.style.transform = "translateX(0)"
          void containerRef.current.offsetWidth
          setIsAnimating(false)
        }
      }, 500)
    }
  }

  const prevSlide = () => {
    if (isAnimating || !showCarousel || !data) return
    if (data.length <= cardsPerView) return

    setIsAnimating(true)
    const prevIndex = (currentIndex - 1 + data.length) % data.length

    if (containerRef.current) {
      containerRef.current.style.transition = "none"
      containerRef.current.style.transform = `translateX(-${cardWidth}%)`
      setCurrentIndex(prevIndex)
      void containerRef.current.offsetWidth
      containerRef.current.style.transition = "transform 500ms ease"
      containerRef.current.style.transform = "translateX(0)"

      setTimeout(() => {
        setIsAnimating(false)
      }, 500)
    }
  }

  const getVisibleCards = () => {
    if (!showCarousel || !data) return data || []

    const visibleCards = []
    const totalCards = data.length
    for (let i = 0; i < cardsPerView + 1; i++) {
      const index = (currentIndex + i) % totalCards
      visibleCards.push(data[index])
    }
    return visibleCards
  }

  if (!data || data.length === 0) {
    return <div className="text-white/40 text-sm text-center py-10">No cards available</div>
  }

  return (
    <div className="w-full px-8">
      <div className={`relative ${isSingleCard ? "max-w-sm mx-auto" : "w-full"}`}>

        {/* ← Prev button */}
        {showCarousel && data.length > cardsPerView && (
          <>
            <button
              onClick={prevSlide}
              disabled={isAnimating}
              aria-label="Previous slide"
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-40"
              style={{
                background: "rgba(10,15,44,0.9)",
                border: "1px solid rgba(255,215,0,0.5)",
                color: "#FFD700",
                fontSize: "1rem",
              }}
            >
              ←
            </button>

            {/* → Next button */}
            <button
              onClick={nextSlide}
              disabled={isAnimating}
              aria-label="Next slide"
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-40"
              style={{
                background: "rgba(10,15,44,0.9)",
                border: "1px solid rgba(255,215,0,0.5)",
                color: "#FFD700",
                fontSize: "1rem",
              }}
            >
              →
            </button>
          </>
        )}

        {/* Overflow mask */}
        <div className="overflow-hidden rounded-2xl">
          {/* Sliding track */}
          <div
            ref={containerRef}
            className="flex"
            style={{
              transform: "translateX(0)",
              width: showCarousel
                ? `${((cardsPerView + 1) * 100) / cardsPerView}%`
                : "100%",
            }}
          >
            {getVisibleCards().map((card, idx) => {
              const cardInner = (
                <div
                  className="relative overflow-hidden rounded-xl group h-full shadow-lg"
                  style={{ border: "1px solid #1a2857" }}
                >
                  {/* Photo */}
                  <div className="w-full h-72 overflow-hidden">
                    <img
                      src={card.imgUrl}
                      alt={card.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Always-visible title bar */}
                  <div
                    className="px-4 py-3 flex items-center justify-between"
                    style={{ background: "#0e1638" }}
                  >
                    <p className="text-white font-bold text-sm">{card.title}</p>
                    {card.href && (
                      <span className="text-xs font-black opacity-50" style={{ color: "#FFD700" }}>
                        →
                      </span>
                    )}
                  </div>

                  {/* Hover overlay — slides up from bottom */}
                  <div
                    className="absolute inset-0 p-5 transition-transform duration-300 transform translate-y-full group-hover:translate-y-0 overflow-y-auto flex flex-col justify-end"
                    style={{ background: "rgba(10,15,44,0.96)" }}
                  >
                    <p
                      className="font-black text-base mb-3 leading-tight"
                      style={{ color: "#FFD700" }}
                    >
                      {card.title}
                    </p>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.72)" }}
                    >
                      {card.content}
                    </p>
                    {card.cta && (
                      <span
                        className="mt-4 text-xs font-black tracking-wide"
                        style={{ color: "#FFD700" }}
                      >
                        {card.cta} →
                      </span>
                    )}
                  </div>
                </div>
              )

              return (
                <div
                  key={`card-${currentIndex}-${idx}`}
                  className="px-2"
                  style={{
                    width: showCarousel
                      ? `${100 / (cardsPerView + 1)}%`
                      : `${100 / Math.min(cardsPerView, data.length)}%`,
                  }}
                >
                  {card.href ? (
                    <Link href={card.href} className="block h-full" style={{ textDecoration: "none" }}>
                      {cardInner}
                    </Link>
                  ) : (
                    cardInner
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Dot indicators */}
        {showCarousel && data.length > cardsPerView && (
          <div className="flex justify-center gap-1.5 mt-5">
            {data.map((_, i) => (
              <button
                key={i}
                onClick={() => !isAnimating && setCurrentIndex(i)}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === currentIndex ? "20px" : "6px",
                  height: "6px",
                  background: i === currentIndex ? "#FFD700" : "rgba(255,255,255,0.2)",
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CarouselCard
