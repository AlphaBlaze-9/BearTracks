// AuthContext.jsx: Global authentication state provider for BearTracks.
// Wraps the app in a React Context that supplies the current user, auth helpers,
// and the `isAdmin` role flag to any descendant component via `useAuth()`.
// This eliminates prop-drilling — any page or component can call `useAuth()`
// rather than threading user state down through multiple layers of components.

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

// ── Context Creation ──────────────────────────────────────────────────────────
// The initial value is null; consuming components should always call `useAuth()`
// rather than using the context directly to get the null-guard and type safety.
const AuthContext = createContext(null);

// ── AuthProvider ──────────────────────────────────────────────────────────────
// Wraps the application (in App.jsx) and makes auth state available tree-wide.
export function AuthProvider({ children }) {
  // user: the Supabase User object when signed in, or null when signed out
  const [user, setUser] = useState(null);
  // loading: true until the initial getSession() call resolves — prevents rendering
  // protected routes before we know whether a session actually exists.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ── Step 1: Check for an existing session on mount ───────────────────────
    // Supabase persists sessions in localStorage; getSession() reads it synchronously
    // and validates it against the server if needed.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false); // Unblock ProtectedRoute rendering once we have a definitive answer
    });

    // ── Step 2: Subscribe to real-time auth changes ──────────────────────────
    // Fires when the user logs in, logs out, or their token is refreshed.
    // Also fires if the user signs in on another tab — keeps all tabs in sync.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Clean up the auth subscription when the provider unmounts to prevent
    // setState calls on an unmounted component.
    return () => subscription.unsubscribe();
  }, []);

  // ── Context Value ─────────────────────────────────────────────────────────
  // useMemo ensures the context object reference is stable — components that
  // consume the context only re-render when `user` or `loading` actually changes.
  const value = useMemo(() => {

    // ── signup ────────────────────────────────────────────────────────────────
    // Creates a new Supabase auth user with email + password.
    // The display name is stored in user_metadata.full_name (not a separate DB table)
    // so it's immediately available in the session without a separate query.
    // Security note: Supabase hashes passwords using bcrypt — they are never stored
    // in plain text, and are never accessible via the client SDK.
    async function signup({ email, password, name }) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name, // Persisted in user_metadata for display in Navbar
          },
        },
      });
      if (error) throw error;
      return data.user;
    }

    // ── login ─────────────────────────────────────────────────────────────────
    // Authenticates with email + password and creates a local session.
    // On success, onAuthStateChange fires and updates `user` state automatically.
    async function login({ email, password }) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data.user;
    }

    // ── requestPasswordReset ─────────────────────────────────────────────────
    // Sends a password-recovery email containing a time-limited link.
    // The link's redirectTo lands the user on /reset-password where the new
    // password form is shown once the recovery token is validated.
    async function requestPasswordReset(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    }

    // ── updatePassword ────────────────────────────────────────────────────────
    // Updates the authenticated user's password. Only callable after a valid
    // recovery session has been established (token from the reset email link).
    async function updatePassword(newPassword) {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    }

    // ── logout ────────────────────────────────────────────────────────────────
    // Attempts a server-side sign-out first; falls back to a local-only sign-out
    // if the server call fails (e.g., expired token, network error).
    // The finally block manually clears Supabase auth tokens from localStorage
    // as a belt-and-suspenders safeguard to prevent stale session data.
    async function logout() {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Error from server on signout:", error);
          // Force local signout if server signout fails
          await supabase.auth.signOut({ scope: "local" });
        }
      } catch (err) {
        console.error("Error signing out:", err);
        try {
          await supabase.auth.signOut({ scope: "local" });
        } catch (e) {
          // Ignore secondary errors — we'll clean up below regardless
        }
      } finally {
        // Belt-and-suspenders: manually remove any sb-*-auth-token keys
        // in case Supabase's internal signOut misses something.
        for (const key of Object.keys(localStorage)) {
          if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
            localStorage.removeItem(key);
          }
        }
        // Always reset local user state so the UI reflects the signed-out status
        setUser(null);
      }
    }

    // ── deleteAccount ─────────────────────────────────────────────────────────
    // Calls the `delete_my_account` Postgres RPC (defined in Supabase SQL editor),
    // which deletes the user's items and auth record in a single atomic transaction.
    // Then signs out locally so no stale session data remains.
    async function deleteAccount() {
      if (!user) return;

      // delete_my_account is a SECURITY DEFINER function that runs as the service
      // role — it can delete the user's own auth.users row, which the anon key cannot.
      const { error } = await supabase.rpc("delete_my_account");
      if (error) throw error;

      // Sign out after deletion so the UI immediately reflects the account removal
      await logout();
    }

    return {
      user,
      isAuthed: Boolean(user),
      // ── Role-Based Access Control (RBAC) ──────────────────────────────────
      // Admin status is determined by matching the authenticated user's email against
      // two hard-coded admin addresses. This simple approach avoids a separate roles
      // table and is sufficient for a school-scale deployment.
      isAdmin:
        user?.email === "samarthmurali19@gmail.com" ||
        user?.email === "directortracks@gmail.com",
      loading,
      signup,
      login,
      logout,
      deleteAccount,
      requestPasswordReset,
      updatePassword,
    };
  }, [user, loading]); // Only recompute when user or loading changes

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── useAuth ───────────────────────────────────────────────────────────────────
/**
 * Custom hook for consuming AuthContext.
 * Throws a descriptive error if called outside of an AuthProvider tree,
 * which surfaces misconfigured component hierarchies immediately in development.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>.");
  return ctx;
}
