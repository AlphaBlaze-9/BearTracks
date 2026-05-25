import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, ChevronDown } from "lucide-react";

// ─── Knowledge Base ────────────────────────────────────────────────────────────
// Each entry has `keywords` (substrings to match in the lowercased input)
// and a `response`. The algorithm scores each entry and returns the best match.

const KNOWLEDGE_BASE = [
  {
    keywords: ["hi", "hello", "hey", "howdy", "sup", "yo", "good morning", "good afternoon", "good evening", "what's up", "whats up"],
    response: "Hey! I'm BearBot 🐻 — Bridgeland High School's lost & found assistant. How can I help you today?\n\nYou can ask me about:\n• Reporting a lost item\n• Reporting a found item\n• Claiming an item\n• Browsing the lost & found\n• Location & hours",
  },
  {
    keywords: ["lost", "missing", "lose", "i lost", "can't find", "cant find", "lost my", "dropped", "left behind", "left my"],
    response: "Sorry you lost something! Here's what to do:\n\n1. Log in (or sign up for free)\n2. Click **Submit** in the navigation bar\n3. Choose **Lost** and describe your item\n4. Add a photo if you have one — it really helps!\n\nWe'll notify you automatically if a matching found item shows up. You can also browse current found items right now by clicking **Browse**.",
  },
  {
    keywords: ["found", "found an item", "turned in", "turn in", "drop off", "i found", "picked up", "someone lost", "somebody lost"],
    response: "Nice one for turning it in! Here's how:\n\n1. Log in or sign up for free\n2. Click **Submit** → choose **Found**\n3. Describe the item and upload a photo\n4. Drop the physical item off at the **main office**\n\nYour report helps us connect the item with its rightful owner.",
  },
  {
    keywords: ["claim", "mine", "belongs to me", "my item", "pick up", "pickup", "retrieve", "get my", "how do i get", "how do i claim"],
    response: "To claim an item:\n\n1. Click **Browse** and find your item\n2. Open it and tap **Claim this item**\n3. Describe unique details (markings, contents, serial #)\n4. Wait for admin approval\n5. Once approved, pick it up at the **Front Office** with your student ID!\n\nTip: The more specific your description, the faster you'll be verified.",
  },
  {
    keywords: ["browse", "search", "look for", "find items", "see items", "view items", "show me", "whats in", "what's in", "what items"],
    response: "You don't even need an account to browse! Just click **Browse** in the navigation bar.\n\nYou can:\n• Search by keyword\n• Filter by category (Electronics, Clothing, etc.)\n• Sort by newest or oldest\n\nSpot something that's yours? Click it to start a claim.",
  },
  {
    keywords: ["submit", "report", "post item", "add item", "how do i submit", "how to submit", "how to report"],
    response: "To submit a report:\n\n1. Log in (or sign up — it's free)\n2. Click **Submit** in the navbar\n3. Choose **Lost** or **Found**\n4. Fill in the details and optionally add a photo\n5. Hit submit!\n\nReports are reviewed by a moderator before going live to keep things accurate.",
  },
  {
    keywords: ["login", "log in", "sign in", "signin", "sign up", "signup", "register", "create account", "account", "how do i login", "how to login"],
    response: "Creating an account is free and only takes a minute!\n\nClick **Log In** or **Sign Up** in the top-right corner of the page. Having an account lets you:\n\n• Submit lost & found reports\n• Claim items\n• Get notifications when matches are found\n\nYou can browse without an account, but you'll need one to take action.",
  },
  {
    keywords: ["where", "location", "office", "drop off location", "pickup location", "where is", "where do i", "where can i"],
    response: "All physical lost & found items should be brought to the **Bridgeland High School main office**.\n\nFor pickups: head to the **Front Office** with your student ID once your claim has been approved through Bear Tracks.",
  },
  {
    keywords: ["hours", "open", "when", "time", "schedule", "what time", "when is", "when can"],
    response: "Bear Tracks is available online **24/7** — you can browse and submit reports anytime!\n\nFor physical drop-offs and pickups at the main office, visit during regular school hours:\n📅 Monday–Friday, approximately **7:00 AM – 4:00 PM** (school days only).",
  },
  {
    keywords: ["how does it work", "how it works", "how does bear", "explain", "what is bear tracks", "what is beartracks", "tell me about"],
    response: "Bear Tracks is Bridgeland High School's official lost & found system! Here's how it works:\n\n1. 📝 **Report** — Post a lost or found item with a description\n2. ✅ **Verify** — Moderators confirm the post is accurate\n3. 🧩 **Match** — Our system surfaces similar posts automatically\n4. 🎒 **Return** — Arrange a safe pickup at the Front Office\n\nSimple, fast, and student-friendly!",
  },
  {
    keywords: ["contact", "email", "reach out", "talk to", "message admin", "staff", "admin", "help desk"],
    response: "You can reach the Bear Tracks team through the **Contact form** at the bottom of the homepage — just scroll down!\n\nFor urgent matters or in-person help, visit the **main office** during school hours.",
  },
  {
    keywords: ["match", "matching", "notification", "notify", "alert", "auto match", "auto-match", "how does matching"],
    response: "Bear Tracks has smart auto-matching built in!\n\nWhen you submit a **lost** item report, our system scans existing **found** reports for similar descriptions. If a match is found, you'll see a 🔔 notification in the bell icon in the top navbar.\n\nMake sure you're logged in to receive alerts — and keep your report details specific for better matches!",
  },
  {
    keywords: ["photo", "picture", "image", "upload", "add photo", "add picture"],
    response: "Adding a photo is totally optional but **strongly recommended** — it makes matching much faster!\n\nWhen submitting a report, there's an image upload option in the form. Supported formats: JPG, PNG, WEBP. Try to get a clear shot of any unique markings or features.",
  },
  {
    keywords: ["category", "categories", "type", "what types", "kinds of items"],
    response: "Bear Tracks supports a variety of item categories including:\n\n🎒 Bags & Backpacks\n📱 Electronics\n👕 Clothing\n🔑 Keys & Keychains\n📚 Books & School Supplies\n💳 IDs & Wallets\n💧 Water Bottles\n🎵 Headphones & Earbuds\n📦 Other\n\nPick the closest category when submitting to help with matching!",
  },
  {
    keywords: ["backpack", "bag", "calculator", "phone", "airpods", "earbuds", "headphones", "earphones", "jacket", "hoodie", "shoes", "keys", "keychain", "wallet", "id card", "student id", "water bottle", "hydroflask", "laptop", "chromebook", "charger", "binder", "notebook"],
    response: "Items like that get reported here all the time! Here's what to do:\n\n1. Click **Browse** to search for your specific item\n2. Use the search bar and category filter\n3. If it's not listed yet, submit a **Lost** report so we can match it when someone turns it in\n\nSomeone might turn it in later today — it happens more than you'd think!",
  },
  {
    keywords: ["approved", "denied", "rejected", "my claim", "claim status", "what happened to my claim"],
    response: "You can check your claim status through the 🔔 notification bell in the navbar (while logged in).\n\n• **Approved** → Head to the Front Office with your student ID to pick up your item!\n• **Denied** → The details didn't match up. You can try re-submitting with more specific info.\n\nIf you think there's been a mistake, contact us through the contact form.",
  },
  {
    keywords: ["thanks", "thank you", "thank", "thx", "ty", "appreciate", "cheers", "cool", "awesome", "great"],
    response: "Happy to help! Good luck with your item 🐻 Come back anytime if you have more questions!",
  },
  {
    keywords: ["bye", "goodbye", "see you", "later", "peace", "ttyl", "gotta go"],
    response: "Take care! Hope you find what you're looking for 🐻 Bear Tracks has your back!",
  },
];

const DEFAULT_RESPONSE =
  "Hmm, I didn't quite catch that! Try asking about:\n\n• Reporting a **lost** item\n• Reporting a **found** item\n• How to **claim** an item\n• **Browsing** the lost & found\n• **Location** and hours\n• How **matching** works\n\nOr scroll down on the homepage to see our FAQ section!";

// ─── Algorithm ─────────────────────────────────────────────────────────────────
function getBotResponse(input) {
  const lower = input.toLowerCase().trim();
  if (!lower) return null;

  let bestScore = 0;
  let bestResponse = DEFAULT_RESPONSE;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) {
        // Longer keywords are more specific → reward them more
        score += kw.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestResponse = entry.response;
    }
  }

  return bestResponse;
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

  function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = { id: msgIdRef.current++, from: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getBotResponse(trimmed);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: msgIdRef.current++, from: "bot", text: response },
      ]);
    }, 800 + Math.random() * 400);
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
          relative flex items-center gap-2.5
          rounded-full bg-brand-blue px-5 py-3
          text-sm font-black text-white
          shadow-xl shadow-brand-blue/40
          hover:bg-brand-blue/90 transition-colors
        "
      >
        <span className="text-lg leading-none">{isOpen ? "✕" : "🐻"}</span>
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
