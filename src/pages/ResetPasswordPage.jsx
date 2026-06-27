// ResetPasswordPage.jsx: Destination page for the Supabase password-reset email link.
// When a user clicks the recovery link in their email, Supabase appends a token to the
// URL hash. supabase-js automatically parses this token and fires a PASSWORD_RECOVERY
// event, which sets `ready` to true and reveals the password-update form.
// On success, the user's password is updated and they are redirected to the login page.

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Container from "../components/Container.jsx";
import Section from "../components/Section.jsx";
import MotionReveal from "../components/MotionReveal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { supabase } from "../lib/supabase";
import BearTracksLogo from "../BearTracksLogo.png";


export default function ResetPasswordPage() {
  const navigate = useNavigate();

  // Pull the updatePassword helper from AuthContext
  const { updatePassword } = useAuth();

  // `ready` gates the form — only true when Supabase has confirmed a valid recovery session
  const [ready, setReady] = useState(false);

  // Controlled field values for the new password and confirmation inputs
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // UI state — inline error, loading spinner, and a "done" completion flag
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // `done` is set to true after the password has been successfully updated
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Check whether Supabase already has an active session when the page loads.
    // This covers cases where the user opened the link in a tab where they're still signed in.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    // Also listen for the PASSWORD_RECOVERY event, which fires when supabase-js parses
    // the token from the URL hash on a fresh (unauthenticated) tab load
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });

    // Unsubscribe from the auth listener when this component unmounts
    return () => subscription.unsubscribe();
  }, []);

  // Handle new-password form submission
  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    // Validate minimum password length before sending the request to Supabase
    if (password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }

    // Ensure both fields match before committing the update
    if (password !== confirm) {
      return setError("Passwords don't match.");
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setDone(true);
      // Give the user 2.5 seconds to read the success message, then redirect to login
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.message || "Could not update password. Try the link again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-hero pt-4 sm:pt-6">
      <Section className="py-4 sm:py-8">
        <Container>
          <div className="mx-auto max-w-[440px]">

            {/* ── Page Header: Logo + Title ── */}
            <MotionReveal>
              {/* Bear Tracks logo centered above the form card */}
              <div className="flex justify-center mb-6">
                <img
                  src={BearTracksLogo}
                  alt="Bear Tracks Logo"
                  className="h-28 w-auto"
                />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-[#062d78] text-center">
                Set a new password
              </h1>
              <p className="mt-3 text-base text-[#083796] font-bold text-center">
                Choose a strong password you don't use anywhere else.
              </p>
            </MotionReveal>

            {/* ── Form Card — switches between three states: done, not ready, and form ── */}
            <MotionReveal delay={0.1}>
              <div className="mt-10 card overflow-hidden border border-brand-blue/30 p-1 shadow-2xl bg-gradient-to-br from-brand-blue/20 via-transparent to-brand-gold/15">
                <div className="bg-brand-blue/5 backdrop-blur-xl rounded-[22px] p-8 sm:p-10">

                  {done ? (
                    /* ── Success State ── */
                    /* Shown after the password has been updated — auto-redirects to login */
                    <div className="text-center">
                      <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-green-500 text-white text-4xl mb-6 shadow-xl shadow-green-500/30">
                        ✓
                      </div>
                      <h2 className="text-2xl font-extrabold text-[#062d78] mb-2">
                        Password updated
                      </h2>
                      <p className="text-sm text-[#083796] font-bold">
                        Redirecting you to log in…
                      </p>
                    </div>

                  ) : !ready ? (
                    /* ── Not-Ready State ── */
                    /* Shown when no valid recovery session is detected — user likely navigated here directly */
                    <div className="text-center py-4">
                      <p className="text-sm text-[#083796] font-bold leading-relaxed">
                        This page only works when opened from the password-reset
                        link in your email. If you got here by mistake, request a
                        new link.
                      </p>
                      {/* Redirect back to the forgot-password page to restart the flow */}
                      <Link
                        to="/forgot-password"
                        className="mt-6 inline-flex rounded-2xl bg-brand-blue px-8 py-4 text-sm font-bold text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-dark transition-all"
                      >
                        Request a reset link
                      </Link>
                    </div>

                  ) : (
                    /* ── New Password Form ── */
                    /* Only rendered when `ready === true` (a valid recovery session exists) */
                    <form onSubmit={onSubmit} className="grid gap-6">

                      {/* New password field — autocomplete="new-password" prevents browser autofill confusion */}
                      <div>
                        <label
                          htmlFor="new-password"
                          className="text-xs font-black text-[#062d78] ml-1 uppercase tracking-widest"
                        >
                          New password
                        </label>
                        <input
                          id="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          type="password"
                          required
                          autoComplete="new-password"
                          placeholder="••••••••"
                          className="mt-2 input-field"
                        />
                      </div>

                      {/* Confirm password field — must match the new password field exactly */}
                      <div>
                        <label
                          htmlFor="confirm-password"
                          className="text-xs font-black text-[#062d78] ml-1 uppercase tracking-widest"
                        >
                          Confirm password
                        </label>
                        <input
                          id="confirm-password"
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          type="password"
                          required
                          autoComplete="new-password"
                          placeholder="••••••••"
                          className="mt-2 input-field"
                        />
                      </div>

                      {/* Inline error alert — appears for validation failures or Supabase errors */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          role="alert"
                          className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100"
                        >
                          {error}
                        </motion.div>
                      )}

                      {/* Submit button — disabled during the update request to prevent double submissions */}
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={loading}
                        className="mt-2 rounded-2xl bg-brand-blue px-6 py-4 text-sm font-bold text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-dark transition-all disabled:opacity-50"
                      >
                        {loading ? "Updating" : "Update password"}
                      </motion.button>
                    </form>
                  )}
                </div>
              </div>
            </MotionReveal>
          </div>
        </Container>
      </Section>
    </div>
  );
}
