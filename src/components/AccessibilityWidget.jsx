// AccessibilityWidget.jsx: WCAG 2.2 AA compliant accessibility control panel for BearTracks.
// Renders as a floating button (or an inline button when a className prop is provided).
// Clicking it opens a popover panel with six toggleable accessibility features:
//   1. Page Audio Summary  — reads a route-specific summary aloud via Web Speech API
//   2. High Contrast       — applies a CSS filter to boost contrast and reduce saturation
//   3. Pause Animations    — disables all CSS/Framer Motion animations (requires page reload)
//   4. Enhanced Focus      — draws a bold gold ring on every focused element
//   5. Larger Text         — scales body copy, labels, and inputs by ~12%
//   6. Readable Font       — switches to Verdana/Tahoma with wider letter spacing
//   7. Highlight Links     — underlines all anchor tags with a warm background tint
// All preferences are persisted to localStorage under `accessAid_*` keys and are
// applied to <body> as CSS classes, which are also read by main.jsx before React
// mounts to prevent a flash of unstyled content (FOUC) on page reload.

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Accessibility, VolumeX, Volume2, Eye, Pause, Keyboard, X, Play, Type, BookOpen, Link2 } from 'lucide-react';

// Props:
//   className — optional override; when provided the widget renders inline (e.g., in Navbar)
//               rather than as the fixed bottom-right floating button.
export default function AccessibilityWidget({ className }) {
  // ── Feature State ─────────────────────────────────────────────────────────
  // Each preference is initialized from localStorage so it persists across
  // sessions without requiring a user account.
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('accessAid_highContrast') === 'true');
  const [pauseAnimations, setPauseAnimations] = useState(() => localStorage.getItem('accessAid_pauseAnimations') === 'true');
  const [enhancedFocus, setEnhancedFocus] = useState(() => localStorage.getItem('accessAid_enhancedFocus') === 'true');
  const [largerText, setLargerText] = useState(() => localStorage.getItem('accessAid_largerText') === 'true');
  const [readableFont, setReadableFont] = useState(() => localStorage.getItem('accessAid_readableFont') === 'true');
  const [highlightLinks, setHighlightLinks] = useState(() => localStorage.getItem('accessAid_highlightLinks') === 'true');

  // menuRef: used to detect clicks outside the popover panel and auto-close it
  const menuRef = useRef(null);
  const location = useLocation();

  // ── Click-Outside Detection ───────────────────────────────────────────────
  // Closes the panel when the user clicks anywhere outside the widget container.
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ── Route Change Cleanup ──────────────────────────────────────────────────
  // Cancel any active speech and close the panel whenever the user navigates.
  // This prevents audio from continuing to play after leaving the current page.
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsOpen(false);
  }, [location.pathname]);

  // ── Body Class Synchronization ────────────────────────────────────────────
  // Each preference maps 1:1 to a CSS class on <body>.
  // The effect runs whenever any preference changes, adding or removing the
  // corresponding class and persisting the new value to localStorage.
  useEffect(() => {
    // High Contrast
    if (highContrast) {
      document.body.classList.add('high-contrast');
      localStorage.setItem('accessAid_highContrast', 'true');
    } else {
      document.body.classList.remove('high-contrast');
      localStorage.setItem('accessAid_highContrast', 'false');
    }

    // Enhanced Focus Ring
    if (enhancedFocus) {
      document.body.classList.add('enhanced-focus');
      localStorage.setItem('accessAid_enhancedFocus', 'true');
    } else {
      document.body.classList.remove('enhanced-focus');
      localStorage.setItem('accessAid_enhancedFocus', 'false');
    }

    // Larger Text
    if (largerText) {
      document.body.classList.add('larger-text');
      localStorage.setItem('accessAid_largerText', 'true');
    } else {
      document.body.classList.remove('larger-text');
      localStorage.setItem('accessAid_largerText', 'false');
    }

    // Readable Font (Verdana/Tahoma + wider letter spacing)
    if (readableFont) {
      document.body.classList.add('readable-font');
      localStorage.setItem('accessAid_readableFont', 'true');
    } else {
      document.body.classList.remove('readable-font');
      localStorage.setItem('accessAid_readableFont', 'false');
    }

    // Highlight Links
    if (highlightLinks) {
      document.body.classList.add('highlight-links');
      localStorage.setItem('accessAid_highlightLinks', 'true');
    } else {
      document.body.classList.remove('highlight-links');
      localStorage.setItem('accessAid_highlightLinks', 'false');
    }
  }, [highContrast, enhancedFocus, largerText, readableFont, highlightLinks]);

  // ── togglePauseAnimations ─────────────────────────────────────────────────
  // Pause Animations requires a page reload because Framer Motion reads the
  // `accessAid_pauseAnimations` localStorage key once on mount (via App.jsx's
  // MotionConfig prop) — changing it mid-session has no effect without a reload.
  const togglePauseAnimations = () => {
    const newValue = !pauseAnimations;
    setPauseAnimations(newValue);
    localStorage.setItem('accessAid_pauseAnimations', newValue ? 'true' : 'false');
    window.location.reload();
  };

  // ── generateSummary ───────────────────────────────────────────────────────
  // Returns a plain-English audio summary of the current page based on the URL.
  // For item detail pages, it extracts the item title and description from the
  // live DOM as a best-effort approach without needing a separate API call.
  const generateSummary = () => {
    const path = location.pathname;

    switch (path) {
      case '/':
        return "You are on the Bear Tracks home page, Bridgeland High School's lost and found system. This page provides an overview of how to report, find, and reclaim lost items on campus.";
      case '/browse':
        return "You are on the Browse Page. Here you can search, filter, and view all reported lost and found items.";
      case '/submit':
        return "You are on the Submit New Item page. Please fill out the form to report a lost or found item. You must be logged in to submit an item.";
      case '/claims':
        return "You are on the Admin Claims Workspace. Here, administrators can review and process pending claims.";
      case '/login':
        return "You are on the Login page. Please enter your email and password to access your account.";
      case '/signup':
        return "You are on the Sign Up page. Create a new account to start reporting and claiming items.";
      case '/forgot-password':
        return "You are on the Reset Password page. Enter your email to receive a secure link for setting a new password.";
      case '/reset-password':
        return "You are on the Set New Password page. Choose and confirm a new password for your account.";
      default:
        // ── Item Detail Page: Dynamic Summary ─────────────────────────────
        // Try to extract the item title and description from the DOM for a
        // more informative summary on individual item pages.
        if (path.startsWith('/items/')) {
          const titleEl = document.querySelector('h1.item-title') || document.querySelector('h1');
          const descEl = document.querySelector('p.item-description') || document.querySelector('.prose p');

          let titleText = titleEl ? titleEl.innerText : "Item Details";
          let descText = descEl ? descEl.innerText : "";

          // Truncate long descriptions so the audio doesn't run on too long
          if (descText.length > 200) {
            descText = descText.substring(0, 200) + ".";
          }

          return `You are viewing details for: ${titleText}. ${descText}`;
        }
        return "You are on Bear Tracks, Bridgeland High School's lost and found system. Navigate the site using the menu.";
    }
  };

  // ── toggleSpeech ──────────────────────────────────────────────────────────
  // Starts or stops the Web Speech API's text-to-speech playback.
  // If speech is currently active, cancels it. Otherwise, generates the page
  // summary and reads it aloud using the browser's default voice.
  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const summaryText = generateSummary();
      const utterance = new SpeechSynthesisUtterance(summaryText);

      // Clean up state when the utterance finishes naturally or errors out
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // ── Layout Helpers ────────────────────────────────────────────────────────
  // isFullWidth: when true, the panel opens upward from a full-width button
  // (used in the mobile navigation drawer).
  const isFullWidth = className && className.includes("w-full");

  // Default floating button class — fixed position in the bottom-right corner
  const defaultBtnClass = "fixed bottom-6 right-6 z-50 flex items-center justify-center p-4 rounded-full bg-brand-blue text-white shadow-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue";

  // showText: when className includes "px-3" the widget renders with a text label
  // alongside the icon (used in the mobile drawer for the full-width variant).
  const showText = className && className.includes("px-3");

  return (
    // menuRef covers the entire widget so click-outside detection works correctly
    <div className={`relative ${isFullWidth ? "w-full" : ""}`} ref={menuRef}>

      {/* ── Toggle Button ─────────────────────────────────────────────────── */}
      {/* aria-haspopup and aria-expanded tell screen readers this is a menu trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={className || defaultBtnClass}
        aria-label="Accessibility Menu"
        aria-haspopup="true"
        aria-controls="accessibility-options"
        aria-expanded={isOpen}
      >
        <Accessibility className={className ? "h-5 w-5" : "h-6 w-6"} />
        {showText && <span className="">Accessibility Options</span>}
      </button>

      {/* ── Options Panel ─────────────────────────────────────────────────── */}
      {/* Opens below the button on desktop, above on mobile (bottom-full) */}
      {isOpen && (
        <div
          id="accessibility-options"
          role="region"
          aria-label="Accessibility Options Panel"
          className={`absolute ${isFullWidth ? "left-0 bottom-full mb-2" : "right-0 top-full mt-2"} w-[280px] sm:w-[320px] bg-white rounded-2xl shadow-2xl border border-slate-100 z-[9999] p-4 font-sans text-left`}
        >
          {/* ── Panel Header ────────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Accessibility className="h-5 w-5 text-brand-blue" />
              Accessibility
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close accessibility options"
              className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ── Feature Toggle Buttons ───────────────────────────────────── */}
          {/* Each button uses aria-pressed to communicate its on/off state to assistive tech.
              Active state: brand-blue tint background + colored label text.
              Inactive state: white background with hover tint. */}
          <div className="space-y-2 text-sm text-slate-700">

            {/* 1. Page Audio Summary */}
            <button
              onClick={toggleSpeech}
              aria-pressed={isSpeaking}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${isSpeaking ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue" : "bg-white border-slate-100 hover:border-brand-blue/30 hover:bg-slate-50"}`}
            >
              <span className="flex items-center gap-3 font-semibold">
                {/* Icon switches between Volume2 (play) and VolumeX (stop) */}
                {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                Page Audio Summary
              </span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${isSpeaking ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-500"}`}>
                {isSpeaking ? "ON" : "OFF"}
              </span>
            </button>

            {/* 2. High Contrast */}
            <button
              onClick={() => setHighContrast(!highContrast)}
              aria-pressed={highContrast}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${highContrast ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue" : "bg-white border-slate-100 hover:border-brand-blue/30 hover:bg-slate-50"}`}
            >
              <span className="flex items-center gap-3 font-semibold">
                <Eye className="h-5 w-5" />
                High Contrast
              </span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${highContrast ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-500"}`}>
                {highContrast ? "ON" : "OFF"}
              </span>
            </button>

            {/* 3. Pause Animations (requires page reload to take effect) */}
            <button
              onClick={togglePauseAnimations}
              aria-pressed={pauseAnimations}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${pauseAnimations ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue" : "bg-white border-slate-100 hover:border-brand-blue/30 hover:bg-slate-50"}`}
            >
              <span className="flex items-center gap-3 font-semibold">
                {/* Pause/Play icon indicates current animation state */}
                {pauseAnimations ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                Pause Animations
              </span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${pauseAnimations ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-500"}`}>
                {pauseAnimations ? "ON" : "OFF"}
              </span>
            </button>

            {/* 4. Enhanced Keyboard Focus */}
            <button
              onClick={() => setEnhancedFocus(!enhancedFocus)}
              aria-pressed={enhancedFocus}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${enhancedFocus ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue" : "bg-white border-slate-100 hover:border-brand-blue/30 hover:bg-slate-50"}`}
            >
              <span className="flex items-center gap-3 font-semibold">
                <Keyboard className="h-5 w-5" />
                Enhanced Keyboard Focus
              </span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${enhancedFocus ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-500"}`}>
                {enhancedFocus ? "ON" : "OFF"}
              </span>
            </button>

            {/* 5. Larger Text */}
            <button
              onClick={() => setLargerText(!largerText)}
              aria-pressed={largerText}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${largerText ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue" : "bg-white border-slate-100 hover:border-brand-blue/30 hover:bg-slate-50"}`}
            >
              <span className="flex items-center gap-3 font-semibold">
                <Type className="h-5 w-5" />
                Larger Text
              </span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${largerText ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-500"}`}>
                {largerText ? "ON" : "OFF"}
              </span>
            </button>

            {/* 6. Readable Font */}
            <button
              onClick={() => setReadableFont(!readableFont)}
              aria-pressed={readableFont}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${readableFont ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue" : "bg-white border-slate-100 hover:border-brand-blue/30 hover:bg-slate-50"}`}
            >
              <span className="flex items-center gap-3 font-semibold">
                <BookOpen className="h-5 w-5" />
                Readable Font
              </span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${readableFont ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-500"}`}>
                {readableFont ? "ON" : "OFF"}
              </span>
            </button>

            {/* 7. Highlight Links */}
            <button
              onClick={() => setHighlightLinks(!highlightLinks)}
              aria-pressed={highlightLinks}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${highlightLinks ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue" : "bg-white border-slate-100 hover:border-brand-blue/30 hover:bg-slate-50"}`}
            >
              <span className="flex items-center gap-3 font-semibold">
                <Link2 className="h-5 w-5" />
                Highlight Links
              </span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${highlightLinks ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-500"}`}>
                {highlightLinks ? "ON" : "OFF"}
              </span>
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
