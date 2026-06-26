// ResetPasswordPage.jsx: Reached from the password-reset email link. Supabase establishes a
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Container from "../components/Container.jsx";
import Section from "../components/Section.jsx";
import MotionReveal from "../components/MotionReveal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { supabase } from "../lib/supabase";
import BearTracksLogo from "../BearTracksLogo.png";


// temporary recovery session, then the user picks a new password here.
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // The recovery link drops the user here with a session in the URL hash.
    // supabase-js parses it automatically and fires PASSWORD_RECOVERY.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }
    if (password !== confirm) {
      return setError("Passwords don’t match.");
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setDone(true);
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
            <MotionReveal>
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
                Choose a strong password you don’t use anywhere else.
              </p>
            </MotionReveal>

            <MotionReveal delay={0.1}>
              <div className="mt-10 card overflow-hidden border border-brand-blue/30 p-1 shadow-2xl bg-gradient-to-br from-brand-blue/20 via-transparent to-brand-gold/15">
                <div className="bg-brand-blue/5 backdrop-blur-xl rounded-[22px] p-8 sm:p-10">
                  {done ? (
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
                    <div className="text-center py-4">
                      <p className="text-sm text-[#083796] font-bold leading-relaxed">
                        This page only works when opened from the password-reset
                        link in your email. If you got here by mistake, request a
                        new link.
                      </p>
                      <Link
                        to="/forgot-password"
                        className="mt-6 inline-flex rounded-2xl bg-brand-blue px-8 py-4 text-sm font-bold text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-dark transition-all"
                      >
                        Request a reset link
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={onSubmit} className="grid gap-6">
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
