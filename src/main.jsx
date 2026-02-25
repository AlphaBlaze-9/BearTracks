import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/tailwind.css";

// Apply accessibility preferences before React mounts to prevent FOUC
if (localStorage.getItem('accessAid_highContrast') === 'true') {
  document.body.classList.add('high-contrast');
}
if (localStorage.getItem('accessAid_pauseAnimations') === 'true') {
  document.body.classList.add('pause-animations');
}
if (localStorage.getItem('accessAid_enhancedFocus') === 'true') {
  document.body.classList.add('enhanced-focus');
}

// Entry point: mount the React app into <div id="root">.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
