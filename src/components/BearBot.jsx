// BearBot.jsx: AI-powered chatbot assistant for BearTracks, powered by Google Gemini.
// Renders as a floating button in the bottom-right corner of every page.
// Clicking it opens a chat window where students can ask questions about how to
// report lost items, claim found items, check hours, and more.
// Uses a 4-model fallback chain so the bot stays online even if one Gemini model
// is rate-limited or unavailable.

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, ChevronDown } from "lucide-react";

// ── API Configuration ─────────────────────────────────────────────────────────
// The Gemini API key is loaded from a Vite environment variable (.env file) so it
// is never committed to source control. Set VITE_GEMINI_API_KEY in your .env.
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// ── System Prompt ─────────────────────────────────────────────────────────────
// SYSTEM_PROMPT defines BearBot's identity, knowledge base, and behavioral guardrails.
// Injected as the first turn in every Gemini conversation so the model always has
// full context regardless of how many user messages have been exchanged.
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

// ── getBotResponse ────────────────────────────────────────────────────────────
/**
 * Sends the full conversation history to Google Gemini and returns the bot's reply.
 * The system prompt is injected as the first user/model exchange so Gemini always
 * has BearBot's instructions in context, regardless of how many turns have elapsed.
 *
 * Fallback chain: tries 4 Gemini model variants in sequence — if one fails (rate
 * limit, unavailable, or network error), it automatically retries with the next.
 *
 * @param {Array<{from: string, text: string}>} messages — full conversation history
 * @returns {Promise<string>} — the bot's text reply
 */
async function getBotResponse(messages) {
  if (!GEMINI_API_KEY) {
    return "Error: Google Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.";
  }

  // Format the conversation for the Gemini API.
  // Prepend the system prompt as a synthetic user/model exchange so the model
  // receives behavioral instructions without needing a system role field.
  const geminiContents = [
    {
      role: "user",
      parts: [{ text: `System Instructions for BearBot:\n${SYSTEM_PROMPT}` }]
    },
    {
      role: "model",
      parts: [{ text: "Understood! I am BearBot 🐻 ready to help with Bridgeland High School's lost & found." }]
    },
    // Append the actual conversation history, mapping our internal roles to Gemini's
    ...messages.map((m) => ({
      role: m.from === "bot" ? "model" : "user",
      parts: [{ text: m.text }]
    }))
  ];

  // Try each model in order; move to the next if any call fails
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
      // Log the failure and try the next model in the fallback chain
      console.warn(`[BearBot] Model ${model} failed, trying next fallback:`, err.message);
    }
  }

  // All models failed — return a user-friendly error message
  return "Sorry, I'm having trouble connecting to Google Gemini right now. Please try again in a few moments.";
}

// ── MessageText ───────────────────────────────────────────────────────────────
// Renders BearBot's response with minimal markdown support:
//   **text** → <strong>text</strong>  (bold)
//   \n       → <br />                 (line breaks)
// This avoids a full markdown library dependency while still supporting
// the most common formatting the AI produces.
function MessageText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\n)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part === "\n") return <br key={i} />;
        if (part.startsWith("**") && part.endsWith("**")) {
          // Strip the ** delimiters and wrap in <strong>
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </span>
  );
}

// ── BearBot Component ─────────────────────────────────────────────────────────
export default function BearBot() {
  // isOpen: controls chat window visibility
  const [isOpen, setIsOpen] = useState(false);
  // messages: full conversation history including the initial greeting
  const [messages, setMessages] = useState([
    {
      id: 0,
      from: "bot",
      text: "Hey there! I'm BearBot 🐻 — your Bridgeland High School lost & found assistant. How can I help you today?",
    },
  ]);
  // input: the current draft text in the message input field
  const [input, setInput] = useState("");
  // isTyping: true while waiting for a Gemini API response — shows the typing indicator
  const [isTyping, setIsTyping] = useState(false);
  // hasUnread: shows the gold pulse dot on the toggle button until first open
  const [hasUnread, setHasUnread] = useState(true);

  // Refs for DOM manipulation
  const bottomRef = useRef(null);   // Scroll anchor at the bottom of the message list
  const inputRef = useRef(null);    // Chat text input, focused when window opens
  const msgIdRef = useRef(1);       // Incrementing ID counter for message keys

  // Clear the unread indicator and focus the input when the chat window opens
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 300); // Brief delay for animation
    }
  }, [isOpen]);

  // Auto-scroll to the latest message whenever the message list or typing state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── sendMessage ───────────────────────────────────────────────────────────
  // Appends the user message, clears the input, shows the typing indicator,
  // calls getBotResponse with the updated history, then appends the reply.
  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = { id: msgIdRef.current++, from: "user", text: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    // Pass the full history (including the new user message) so Gemini has context
    const response = await getBotResponse(updatedMessages);
    setIsTyping(false);
    setMessages((prev) => [
      ...prev,
      { id: msgIdRef.current++, from: "bot", text: response },
    ]);
  }

  // handleKeyDown: sends the message on Enter (without Shift for newlines)
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    // Fixed container in the bottom-right corner, above everything except modals
    <div className="fixed bottom-5 right-4 z-[9999] flex flex-col items-end gap-3 sm:right-6">

      {/* ── Chat Window ──────────────────────────────────────────────────── */}
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
            id="bearbot-window"
            role="dialog"
            aria-label="BearBot chat window"
          >
            {/* ── Chat Header ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-3 bg-brand-blue px-4 py-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xl shrink-0">
                  🐻
                </div>
                <div>
                  <div className="text-sm font-black text-white leading-tight">BearBot</div>
                  {/* Green pulse dot signals the bot is online and ready */}
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

            {/* ── Subtitle Bar ─────────────────────────────────────────────── */}
            <div className="bg-brand-blue/5 border-b border-brand-blue/10 px-4 py-2 shrink-0">
              <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">
                Bridgeland High School Lost &amp; Found
              </p>
            </div>

            {/* ── Message List ─────────────────────────────────────────────── */}
            {/* flex-1 makes this section take all available height between header and input */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  {/* Bot avatar shown to the left of every bot message */}
                  {msg.from === "bot" && (
                    <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-blue text-sm mt-0.5">
                      🐻
                    </div>
                  )}
                  {/* Message bubble — brand-blue for user, white for bot */}
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

              {/* ── Typing Indicator ────────────────────────────────────────── */}
              {/* Three bouncing dots appear while waiting for the Gemini response */}
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
                      // Each dot bounces with a 150ms stagger for a wave effect
                      <span
                        key={i}
                        className="h-2 w-2 rounded-full bg-brand-blue/40 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Invisible scroll anchor — scrollIntoView() targets this element */}
              <div ref={bottomRef} />
            </div>

            {/* ── Quick Suggestions ─────────────────────────────────────────── */}
            {/* Horizontally scrollable chips for common questions, no-scrollbar hides
                the scrollbar while keeping the content scrollable */}
            <div className="flex gap-2 overflow-x-auto px-4 py-2 border-t border-slate-100 bg-white shrink-0 no-scrollbar">
              {["Lost item", "Found item", "Claim item", "Hours"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  aria-label={`Ask BearBot: ${suggestion}`}
                  className="shrink-0 rounded-full border border-brand-blue/30 bg-brand-blue/5 px-3 py-1.5 text-xs font-bold text-brand-blue hover:bg-brand-blue hover:text-white transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* ── Message Input ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 border-t border-slate-100 bg-white px-3 py-3 shrink-0">
              {/* Text input — maxLength prevents absurdly long messages */}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                aria-label="Type your message to BearBot"
                maxLength={300}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-blue/50 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:bg-white transition-all"
              />
              {/* Send button — disabled while waiting for a response to prevent spamming */}
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

      {/* ── Toggle Button ─────────────────────────────────────────────────── */}
      {/* Scales slightly on hover/tap; aria-expanded communicates state to screen readers */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((s) => !s)}
        aria-label={isOpen ? "Close BearBot assistant" : "Open BearBot assistant"}
        aria-expanded={isOpen}
        aria-controls="bearbot-window"
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

        {/* Unread pulse dot — gold to match the brand; hidden once the user opens the chat */}
        {!isOpen && hasUnread && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand-gold border-2 border-white animate-pulse" />
        )}
      </motion.button>
    </div>
  );
}
