// main.jsx: Application entry point — mounts the React app into the DOM.
// This file runs before any React component renders, so it is the right place
// to apply body-level CSS classes from saved accessibility preferences.
// Applying them here (synchronously) prevents a flash of unstyled content (FOUC)
// where the page briefly renders without the user's chosen accessibility settings.

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/tailwind.css";

// ── Accessibility Pre-hydration ───────────────────────────────────────────────
// Each preference is stored in localStorage by AccessibilityWidget.jsx under
// an `accessAid_*` key. We read them here and add matching body classes so
// styles are applied the instant the first paint occurs — not after React mounts.

if (localStorage.getItem('accessAid_highContrast') === 'true') {
  // high-contrast: boosts contrast and reduces colour complexity for low-vision users
  document.body.classList.add('high-contrast');
}
if (localStorage.getItem('accessAid_pauseAnimations') === 'true') {
  // pause-animations: disables CSS transitions and keyframe animations site-wide
  document.body.classList.add('pause-animations');
}
if (localStorage.getItem('accessAid_enhancedFocus') === 'true') {
  // enhanced-focus: draws a bold brand-gold ring on every keyboard-focused element
  document.body.classList.add('enhanced-focus');
}
if (localStorage.getItem('accessAid_largerText') === 'true') {
  // larger-text: scales up body copy, labels, and interactive elements by ~12%
  document.body.classList.add('larger-text');
}
if (localStorage.getItem('accessAid_readableFont') === 'true') {
  // readable-font: switches to a high-legibility system sans-serif (Verdana/Tahoma)
  document.body.classList.add('readable-font');
}
if (localStorage.getItem('accessAid_highlightLinks') === 'true') {
  // highlight-links: underlines all anchors and adds a warm tint for better visibility
  document.body.classList.add('highlight-links');
}

// ── React Mount ───────────────────────────────────────────────────────────────
// Mount the root App component in StrictMode. StrictMode intentionally renders
// components twice in development to surface side effects and deprecated patterns.
// It has no effect in production builds.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
