// AuthContext.jsx: Manages global authentication state using Supabase.
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";


// Purpose: Provides a React Context that wraps the application and supplies authentication
// Purpose: data (user profile, login state, admin status) to all descendant components.
// Purpose: This prevents "prop drilling" and makes checking auth status easy from anywhere.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Session Check: Check for an active session when the app first loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false); // Stop loading indicator once session is resolved
    });

    // 2. Real-time Auth Listener: Listen for changes (e.g., user logs in on another tab, or session expires)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup subscription to prevent memory leaks when the provider unmounts
    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo(() => {
    // Note: We implemented secure authentication using Supabase. Passwords are cryptographically
    // Note: hashed by Supabase, meaning they are never stored in plain text. We also utilize
    // Note: Row Level Security (RLS) in our database to ensure users can only modify their own items.
    async function signup({ email, password, name }) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      if (error) throw error;
      return data.user;
    }

    async function login({ email, password }) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data.user;
    }

    async function requestPasswordReset(email) {
      // Sends a password-recovery email. The link returns the user to
      // /reset-password with a temporary recovery session.
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    }

    async function updatePassword(newPassword) {
      // Used on the reset-password page once the recovery session is active.
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    }

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
          // Ignore
        }
      } finally {
        // Manually clear any lingering Supabase auth tokens as a strict fallback
        for (const key of Object.keys(localStorage)) {
          if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
            localStorage.removeItem(key);
          }
        }
        // Always clear local session
        setUser(null);
      }
    }

    async function deleteAccount() {
      if (!user) return;

      // Call the secure RPC function to delete account and data
      const { error } = await supabase.rpc("delete_my_account");
      if (error) throw error;

      // Sign out locally
      await logout();
    }

    return {
      user,
      isAuthed: Boolean(user),
      // Role-Based Access Control (RBAC): Determine if the user is an administrator
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
  }, [user, loading]); // Memoize the context value to prevent unnecessary re-renders of consuming components

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to consume the AuthContext.
 * Ensures that it is only used within a valid AuthProvider tree.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>.");
  return ctx;
}
