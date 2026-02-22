import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * AuthContext
 * -----------
 * Manages global authentication state using Supabase.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo(() => {
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
      isAdmin:
        user?.email === "samarthmurali19@gmail.com" ||
        user?.email === "directortracks@gmail.com",
      loading,
      signup,
      login,
      logout,
      deleteAccount,
    };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>.");
  return ctx;
}
