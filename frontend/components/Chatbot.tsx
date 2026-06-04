"use client"

import { useState, useRef, useEffect } from "react"
import { X, Send, ChevronDown } from "lucide-react"
import type { Match, Screening, ChatMessage } from "@/lib/types"
import { sendChat } from "@/lib/api"
import clsx from "clsx"
import { LiquidButton } from "@/components/ui/liquid-glass-button"

const SUGGESTIONS = [
  "Who is playing today?",
  "Where can I watch for free in Dallas?",
  "What is England's squad?",
  "When is the Final?",
]

interface Props {
  date: string
  matches: Match[]
  screenings: Screening[]
}

export default function Chatbot({ date, matches, screenings }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
      inputRef.current?.focus()
    }
  }, [open, messages])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: ChatMessage = { role: "user", content: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const data = await sendChat({
        message: text.trim(),
        date,
        context: { matches, screenings },
        history: messages,
      })
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I couldn't connect to the server. Make sure the backend is running.",
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <>
      {/* Bubble trigger */}
      {!open && (
        <LiquidButton
          onClick={() => setOpen(true)}
          size="sm"
          className="fixed bottom-6 left-6 z-50 w-fit rounded-full font-semibold shadow-2xl px-4 py-2"
          style={{ color: "#FFD700" }}
        >
          <span className="text-base"></span>
          Ask Here
        </LiquidButton>
      )}

      {/* Chat drawer */}
      {open && (
        <div
          className={clsx(
            "fixed z-50 shadow-2xl flex flex-col",
            "bottom-0 left-0 w-full sm:w-96 sm:bottom-6 sm:left-6",
            "rounded-t-2xl sm:rounded-2xl",
          )}
          style={{
            background: "#0e1638",
            border: "1px solid #1a2857",
            height: "clamp(400px, 60vh, 600px)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-t-2xl"
            style={{ background: "#1a2857", borderBottom: "1px solid #2a3867" }}
          >
            <div className="flex items-center gap-2">
              <div>
                <p className="text-white font-bold text-sm">World Cup AI</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/50 hover:text-white transition-colors"
            >
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-white/50 text-xs text-center mb-2">Ask anything about World Cup 2026</p>
                {SUGGESTIONS.map(s => (
                  <LiquidButton
                    key={s}
                    size="sm"
                    onClick={() => send(s)}
                    className="rounded-lg justify-start text-left w-full"
                    style={{ color: "#FFD700" }}
                  >
                    {s}
                  </LiquidButton>
                ))}
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={clsx(
                  "max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user"
                    ? "self-end rounded-br-sm"
                    : "self-start rounded-bl-sm"
                )}
                style={
                  msg.role === "user"
                    ? { background: "#FFD700", color: "#0a0f2c" }
                    : { background: "#1a2857", color: "white" }
                }
              >
                {msg.content}
              </div>
            ))}

            {loading && (
              <div
                className="self-start px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1"
                style={{ background: "#1a2857" }}
              >
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="px-3 py-3 flex gap-2"
            style={{ borderTop: "1px solid #1a2857" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about squads, screenings, schedules..."
              className="flex-1 px-3 py-2 rounded-xl text-sm text-white placeholder-white/30 outline-none"
              style={{ background: "#1a2857", border: "1px solid #2a3867" }}
              disabled={loading}
            />
            <LiquidButton
              size="icon"
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="rounded-xl flex-shrink-0"
              style={{ color: "#FFD700" }}
            >
              <Send size={16} />
            </LiquidButton>
          </div>
        </div>
      )}
    </>
  )
}
