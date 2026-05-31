import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Container from "../components/Container.jsx";
import Section from "../components/Section.jsx";
import MotionReveal from "../components/MotionReveal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import BearTracksLogo from "../BearTracksLogo.png";

/**
 * ForgotPasswordPage
 * ------------------
 * Lets a user request a password-reset email via Supabase.
 */

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || "Could not send reset email. Please try again.");
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
                Reset password
              </h1>
              <p className="mt-3 text-base text-[#083796] font-bold text-center">
                Enter your email and we’ll send you a secure link to set a new
                password.
              </p>
            </MotionReveal>

            <MotionReveal delay={0.1}>
              <div className="mt-10 card overflow-hidden border border-brand-blue/30 p-1 shadow-2xl bg-gradient-to-br from-brand-blue/20 via-transparent to-brand-gold/15">
                <div className="bg-brand-blue/5 backdrop-blur-xl rounded-[22px] p-8 sm:p-10">
                  {sent ? (
                    <div className="text-center">
                      <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-green-500 text-white text-4xl mb-6 shadow-xl shadow-green-500/30">
                        ✓
                      </div>
                      <h2 className="text-2xl font-extrabold text-[#062d78] mb-2">
                        Check your inbox
                      </h2>
                      <p className="text-sm text-[#083796] font-bold leading-relaxed">
                        If an account exists for{" "}
                        <span className="text-brand-blue">{email}</span>, a
                        password-reset link is on its way. The link expires
                        after a short time, so use it soon.
                      </p>
                      <Link
                        to="/login"
                        className="mt-8 inline-flex rounded-2xl bg-brand-blue px-8 py-4 text-sm font-bold text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-dark transition-all"
                      >
                        Back to log in
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={onSubmit} className="grid gap-6">
                      <div>
                        <label
                          htmlFor="forgot-email"
                          className="text-xs font-black text-[#062d78] ml-1 uppercase tracking-widest"
                        >
                          Email
                        </label>
                        <input
                          id="forgot-email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="you@school.edu"
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
                        {loading ? "Sending link" : "Send reset link"}
                      </motion.button>

                      <p className="text-sm text-[#062d78] font-bold text-center">
                        Remembered it?{" "}
                        <Link
                          to="/login"
                          className="font-bold text-[#ea580c] hover:text-[#c2410c] transition-colors duration-300"
                        >
                          Log in
                        </Link>
                      </p>
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
