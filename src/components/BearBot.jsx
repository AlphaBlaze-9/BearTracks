import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, ChevronDown } from "lucide-react";

// ─── API Configuration & System Prompt ───────────────────────────────────────────
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are BearBot, the helpful assistant for Bridgeland High School's lost & found system (Bear Tracks).
Your ONLY job is to assist users with the Bear Tracks website and answer questions based on the following information. Do not answer questions unrelated to the website or Bridgeland High School's lost & found.

Knowledge Base:
- Reporting a lost item: Log in (or sign up for free), click Submit in the navbar, choose Lost and describe the item. Add a photo if possible. We'll notify them automatically if a matching found item shows up.
- Reporting a found item: Log in or sign up, click Submit -> choose Found, describe the item and upload a photo. Drop the physical item off at the main office.
- Claiming an item: Click Browse and find the item, open it and tap 'Claim this item', describe unique details. Wait for admin approval. Once approved, pick it up at the Front Office with a student ID.
- Browsing: No account needed. Click Browse in the navbar. Users can search by keyword, filter by category, and sort.
- Submitting a report: Reports are reviewed by a moderator before going live.
- Account/Login: Free to create. Needed to submit reports, claim items, and get notifications.
- Location: Physical drop-offs and pickups are at the Bridgeland High School main office / Front Office.
- Hours: Website is 24/7. Physical drop-offs/pickups are Monday-Friday, approx 7:00 AM - 4:00 PM (school days only).
- Matching: Auto-matching scans found reports for lost items and sends a notification (bell icon) if there is a match.
- Photos: Supported formats are JPG, PNG, WEBP.
- Categories: Bags & Backpacks, Electronics, Clothing, Keys & Keychains, Books & School Supplies, IDs & Wallets, Water Bottles, Headphones & Earbuds, Other.
- Claim Status: Notifications will show if a claim is Approved (pick up at Front Office) or Denied (details didn't match).

Keep your answers concise, friendly, and helpful. Format your responses with markdown when appropriate (e.g., bullet points, bold text). Use emojis like 🐻 occasionally. Do NOT hallucinate information not provided here. If asked something unrelated, politely decline and steer the conversation back to Bear Tracks.`;

// ─── Algorithm ─────────────────────────────────────────────────────────────────
async function getBotResponse(messages) {
  if (!GEMINI_API_KEY) {
    return "Error: Google Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.";
  }

  // Format messages for Google Gemini API
  const geminiContents = [
    {
      role: "user",
      parts: [{ text: `System Instructions for BearBot:\n${SYSTEM_PROMPT}` }]
    },
    {
      role: "model",
      parts: [{ text: "Understood! I am BearBot 🐻 ready to help with Bridgeland High School's lost & found." }]
    },
    ...messages.map((m) => ({
      role: m.from === "bot" ? "model" : "user",
      parts: [{ text: m.text }]
    }))
  ];

  // Try models in sequence with fallback
  const fallbackModels = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-flash-lite-latest", "gemini-flash-latest"];

  for (const model of fallbackModels) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: geminiContents })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) return reply;
      }
    } catch (err) {
      console.warn(`[BearBot] Model ${model} failed, trying next fallback:`, err.message);
    }
  }

  return "Sorry, I'm having trouble connecting to Google Gemini right now. Please try again in a few moments.";
}

// ─── Message Renderer ──────────────────────────────────────────────────────────
// Renders newlines as <br> and **text** as <strong>
function MessageText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\n)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part === "\n") return <br key={i} />;
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </span>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function BearBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 0,
      from: "bot",
      text: "Hey there! I'm BearBot 🐻 — your Bridgeland High School lost & found assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const msgIdRef = useRef(1);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = { id: msgIdRef.current++, from: "user", text: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    const response = await getBotResponse(updatedMessages);
    setIsTyping(false);
    setMessages((prev) => [
      ...prev,
      { id: msgIdRef.current++, from: "bot", text: response },
    ]);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="fixed bottom-5 right-4 z-[9999] flex flex-col items-end gap-3 sm:right-6">
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="
              flex flex-col overflow-hidden rounded-2xl shadow-2xl
              w-[calc(100vw-2rem)] max-w-[360px]
              bg-white border border-brand-blue/20
            "
            style={{ height: "min(520px, 70vh)" }}
            role="dialog"
            aria-label="BearBot chat window"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 bg-brand-blue px-4 py-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xl shrink-0">
                  🐻
                </div>
                <div>
                  <div className="text-sm font-black text-white leading-tight">BearBot</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close BearBot"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/20 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Subtitle bar */}
            <div className="bg-brand-blue/5 border-b border-brand-blue/10 px-4 py-2 shrink-0">
              <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">
                Bridgeland High School Lost &amp; Found
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.from === "bot" && (
                    <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-blue text-sm mt-0.5">
                      🐻
                    </div>
                  )}
                  <div
                    className={`
                      max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
                      ${msg.from === "user"
                        ? "bg-brand-blue text-white rounded-br-sm font-medium"
                        : "bg-white text-slate-800 rounded-bl-sm shadow-sm border border-slate-100 font-medium"
                      }
                    `}
                  >
                    <MessageText text={msg.text} />
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-blue text-sm mt-0.5">
                    🐻
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-slate-100 flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-2 w-2 rounded-full bg-brand-blue/40 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick suggestions */}
            <div className="flex gap-2 overflow-x-auto px-4 py-2 border-t border-slate-100 bg-white shrink-0 no-scrollbar">
              {["Lost item", "Found item", "Claim item", "Hours"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="shrink-0 rounded-full border border-brand-blue/30 bg-brand-blue/5 px-3 py-1.5 text-xs font-bold text-brand-blue hover:bg-brand-blue hover:text-white transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-slate-100 bg-white px-3 py-3 shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                maxLength={300}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-blue/50 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:bg-white transition-all"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-white shadow-md shadow-brand-blue/20 hover:bg-brand-blue/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((s) => !s)}
        aria-label={isOpen ? "Close BearBot" : "Open BearBot"}
        className="
          relative flex items-center gap-3.5
          rounded-full bg-brand-blue px-8 py-5
          text-lg font-black text-white
          shadow-2xl shadow-brand-blue/60
          hover:bg-brand-blue/90 transition-colors
        "
      >
        <span className="text-3xl leading-none">{isOpen ? "✕" : "🐻"}</span>
        <span className={isOpen ? "hidden sm:inline" : undefined}>
          {isOpen ? "Close" : "BearBot"}
        </span>

        {/* Unread dot */}
        {!isOpen && hasUnread && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand-gold border-2 border-white animate-pulse" />
        )}
      </motion.button>
    </div>
  );
}
