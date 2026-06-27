// App.jsx: Root component of BearTracks — assembles all global providers and routes.
// The component tree is deliberately layered: BrowserRouter manages URL state,
// AuthProvider sits above ItemsProvider so auth is always resolved first,
// and MotionConfig wraps everything so Framer Motion respects accessibility prefs.

import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import BearBot from "./components/BearBot.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ItemsProvider } from "./context/ItemsContext.jsx";
import { MotionConfig } from "framer-motion";

// ── Page Imports ─────────────────────────────────────────────────────────────
// Each page is a lazily-renderable route segment; only the active route renders.
import HomePage from "./pages/HomePage.jsx";
import BrowsePage from "./pages/BrowsePage.jsx";
import SubmitPage from "./pages/SubmitPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import ItemDetailsPage from "./pages/ItemDetailsPage.jsx";
import AdminClaimsPage from "./pages/AdminClaimsPage.jsx";
import CitationsPage from "./pages/CitationsPage.jsx";


export default function App() {
  return (
    // ── BrowserRouter ────────────────────────────────────────────────────────
    // Enables client-side routing via the HTML5 History API, giving BearTracks
    // the feel of a native multi-page app without full-page reloads.
    <BrowserRouter>

      {/* AuthProvider: supplies user session, isAdmin flag, and auth helpers
          (login, signup, logout, deleteAccount) to every descendant via context */}
      <AuthProvider>

        {/* ItemsProvider: fetches lost/found items from Supabase on mount,
            sets up a real-time postgres_changes subscription, and exposes
            addItem / deleteItem / getItem / addClaim / resolveClaim helpers */}
        <ItemsProvider>

          {/*
            MotionConfig: global Framer Motion override.
            If the user has enabled "Pause Animations" in the Accessibility Widget,
            reducedMotion is set to "always" so every animation is skipped entirely.
            Otherwise it falls back to "user" (respects the OS prefers-reduced-motion setting).
          */}
          <MotionConfig reducedMotion={localStorage.getItem('accessAid_pauseAnimations') === 'true' ? "always" : "user"}>

            {/* Skip-to-content link: hidden off-screen until focused by keyboard Tab.
                Allows screen-reader / keyboard-only users to jump past the Navbar
                directly to the page content. Required for WCAG 2.2 AA compliance. */}
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>

            {/* Navbar renders on every route — contains logo, nav links,
                notification bell, accessibility widget, and account menu */}
            <Navbar />

            {/* BearBot: floating AI assistant widget (Google Gemini-powered).
                Rendered globally so chat state persists across route changes. */}
            <BearBot />

            {/* main: React Router injects the active page component here.
                tabIndex={-1} allows it to receive programmatic focus from the skip link. */}
            <main id="main-content" tabIndex={-1}>
              <Routes>

                {/* ── Public Routes ──────────────────────────────────────── */}
                <Route path="/" element={<HomePage />} />
                <Route path="/browse" element={<BrowsePage />} />
                <Route path="/items/:id" element={<ItemDetailsPage />} />
                <Route path="/citations" element={<CitationsPage />} />

                {/*
                  ── Protected Routes ───────────────────────────────────────
                  ProtectedRoute checks isAuthed from AuthContext.
                  Unauthenticated users are redirected to /login with the
                  original destination saved in location.state.from so they
                  can be returned here after a successful login.
                */}
                <Route
                  path="/submit"
                  element={
                    <ProtectedRoute>
                      <SubmitPage />
                    </ProtectedRoute>
                  }
                />

                {/* ── Authentication Routes ───────────────────────────────── */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Admin-only claims workspace — AdminClaimsPage enforces its own
                    auth guard internally and redirects non-admins to the home page */}
                <Route path="/claims" element={<AdminClaimsPage />} />

                {/*
                  ── 404 Fallback ──────────────────────────────────────────
                  Any unrecognized path falls through to HomePage rather than
                  showing a broken empty shell — keeps the UX clean.
                */}
                <Route path="*" element={<HomePage />} />

              </Routes>
            </main>
          </MotionConfig>
        </ItemsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
