// LoginPage.jsx: Supabase-backed authentication page for returning Bear Tracks users.
// Handles email/password login, displays inline error messages, and redirects the user
// back to their intended destination (or "/" by default) after a successful login.
// Also exposes quick-login buttons for the two test accounts used in FBLA judging demos.

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Container from "../components/Container.jsx";
import Section from "../components/Section.jsx";
import MotionReveal from "../components/MotionReveal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import BearTracksLogo from "../BearTracksLogo.png";


export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Pull the login function from the global AuthContext
  const { login } = useAuth();

  // Controlled form field values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state for async login feedback
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Capture the page the user was trying to reach before being redirected to login.
  // After a successful login, they'll be sent back there instead of always going to "/".
  const from = location.state?.from || "/";

  // Handle the main login form submission
  async function onSubmit(e) {
    e.preventDefault();
    setError("");       // Clear any previous error before retrying
    setLoading(true);
    try {
      await login({ email, password });
      navigate(from);   // Return user to their originally intended destination
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  // Pre-fill and submit credentials for a demo account — used during FBLA judging
  async function handleTestLogin(testEmail, testPassword) {
    setError("");
    setLoading(true);
    try {
      await login({ email: testEmail, password: testPassword });
      navigate(from);
    } catch (err) {
      setError(err.message || "Login failed.");
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
                Log in
              </h1>
              <p className="mt-3 text-base text-[#083796] font-bold text-center">
                Welcome back to BearTracks. Please enter your credentials.
              </p>
            </MotionReveal>

            {/* ── Login Form Card ── */}
            {/* Glassmorphism card with a gradient border using a 1px padding trick */}
            <MotionReveal delay={0.1}>
              <div className="mt-10 card overflow-hidden border border-brand-blue/30 p-1 shadow-2xl bg-gradient-to-br from-brand-blue/20 via-transparent to-brand-gold/15">
                <div className="bg-brand-blue/5 backdrop-blur-xl rounded-[22px] p-8 sm:p-10">
                  <form onSubmit={onSubmit} className="grid gap-6">

                    {/* Email input — uses autocomplete="email" for browser autofill support */}
                    <div>
                      <label htmlFor="login-email" className="text-xs font-black text-[#062d78] ml-1 uppercase tracking-widest">
                        Email
                      </label>
                      <input
                        id="login-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@school.edu"
                        className="mt-2 input-field"
                      />
                    </div>

                    {/* Password input — includes a "Forgot password?" link aligned to the right of the label */}
                    <div>
                      <div className="flex items-center justify-between ml-1">
                        <label htmlFor="login-password" className="text-xs font-black text-[#062d78] uppercase tracking-widest">
                          Password
                        </label>
                        {/* Forgot password link — navigates to the password reset request page */}
                        <Link
                          to="/forgot-password"
                          className="text-xs font-bold text-[#ea580c] hover:text-[#c2410c] transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <input
                        id="login-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="mt-2 input-field"
                      />
                    </div>

                    {/* Inline error alert — animates in with a scale transition when an auth error occurs */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100"
                      >
                        {error}
                      </motion.div>
                    )}

                    {/* Submit button — disabled and shows "Logging in" during the async request */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={loading}
                      className="mt-2 rounded-2xl bg-brand-blue px-6 py-4 text-sm font-bold text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-dark transition-all disabled:opacity-50"
                    >
                      {loading ? "Logging in" : "Log in"}
                    </motion.button>

                    {/* Horizontal divider — visually separates the main form from secondary links */}
                    <div className="relative my-2">
                      <div
                        className="absolute inset-0 flex items-center"
                        aria-hidden="true"
                      >
                        <div className="w-full border-t border-slate-200"></div>
                      </div>
                    </div>

                    {/* Sign-up redirect — sends new users to the account creation page */}
                    <p className="text-sm text-[#062d78] font-bold text-center">
                      Don't have an account?{" "}
                      <Link
                        to="/signup"
                        className="font-bold text-[#ea580c] hover:text-[#c2410c] transition-colors duration-300"
                      >
                        Sign up
                      </Link>
                    </p>

                    {/* Divider with "Test Accounts" label for the demo login section */}
                    <div className="relative my-2">
                      <div
                        className="absolute inset-0 flex items-center"
                        aria-hidden="true"
                      >
                        <div className="w-full border-t border-slate-200"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-2 text-xs text-slate-500 uppercase">
                          Test Accounts
                        </span>
                      </div>
                    </div>

                    {/* ── FBLA Demo Quick-Login Buttons ── */}
                    {/* Two pre-configured accounts: one standard user, one admin (director) */}
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {/* Standard user account — can browse items, submit reports, and file claims */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() =>
                          handleTestLogin(
                            "userbeartracks@gmail.com",
                            "userbeartracks123",
                          )
                        }
                        disabled={loading}
                        className="rounded-xl border-2 border-brand-blue/20 bg-white/50 px-4 py-2 text-xs font-bold text-[#062d78] hover:bg-brand-blue/5 hover:border-brand-blue/40 transition-all disabled:opacity-50"
                      >
                        Test User Login
                      </motion.button>
                      {/* Admin account — can access the Claims Workspace and resolve pending claims */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() =>
                          handleTestLogin(
                            "directortracks@gmail.com",
                            "directorbeartracks123",
                          )
                        }
                        disabled={loading}
                        className="rounded-xl border-2 border-brand-gold/20 bg-white/50 px-4 py-2 text-xs font-bold text-[#062d78] hover:bg-brand-gold/5 hover:border-brand-gold/40 transition-all disabled:opacity-50"
                      >
                        Test Admin Login
                      </motion.button>
                    </div>
                  </form>
                </div>
              </div>
            </MotionReveal>
          </div>
        </Container>
      </Section>
    </div>
  );
}
