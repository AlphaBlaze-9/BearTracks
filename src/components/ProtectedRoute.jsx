// ProtectedRoute.jsx: Route guard that requires an authenticated user session.
// Wrap any <Route> element in this component to restrict it to logged-in users.
// Unauthenticated visitors are redirected to /login, and the original destination
// is passed via location.state.from so the login page can send them back after login.

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  // isAuthed: true when Supabase has confirmed a valid session exists
  // loading: true during the initial getSession() call — prevents a false redirect
  const { isAuthed, loading } = useAuth();
  const location = useLocation();

  // ── Loading State ─────────────────────────────────────────────────────────
  // While Supabase resolves the session, show a branded spinner rather than
  // flashing an empty page or incorrectly redirecting an authenticated user.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hero">
        <div className="relative">
          {/* Rotating border ring — the brand-blue quarter arc creates the spinner effect */}
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand-blue/20 border-t-brand-blue" />
          {/* Pulsing label beneath the spinner for clarity */}
          <div className="absolute inset-x-0 -bottom-8 text-center text-xs font-bold uppercase tracking-widest text-brand-blue animate-pulse">
            Authenticating
          </div>
        </div>
      </div>
    );
  }

  // ── Redirect Unauthenticated Users ────────────────────────────────────────
  // `replace` prevents the /login URL from being added to the browser history stack,
  // so pressing Back after login doesn't loop the user back to /login.
  // `state.from` records where the user intended to go so LoginPage can redirect there.
  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // ── Authenticated: Render Children ───────────────────────────────────────
  return children;
}
