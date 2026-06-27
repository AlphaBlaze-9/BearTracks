// SignupPage.jsx: New account registration page for Bear Tracks.
// Collects a display name, school email, and password, then creates a Supabase auth user.
// On success, the user is redirected to the Submit page to make their first report.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Container from "../components/Container.jsx";
import Section from "../components/Section.jsx";
import MotionReveal from "../components/MotionReveal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import BearTracksLogo from "../BearTracksLogo.png";


export default function SignupPage() {
  const navigate = useNavigate();

  // Pull the signup function from AuthContext — it wraps Supabase's signUp method
  const { signup } = useAuth();

  // Controlled input state for the three registration fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI feedback state — error message and loading spinner control
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle the registration form submission
  async function onSubmit(e) {
    e.preventDefault();
    setError("");        // Reset any prior error messages before the new attempt
    setLoading(true);
    try {
      // Create the Supabase auth user and store the display name in user_metadata
      await signup({ name, email, password });
      // After successful signup, send the user straight to the Submit page
      navigate("/submit");
    } catch (err) {
      setError(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-hero pt-8">
      <Section className="py-8 sm:py-12">
        <Container>
          <div className="mx-auto max-w-[440px]">

            {/* ── Page Header: Logo + Title ── */}
            <MotionReveal>
              {/* Bear Tracks logo centered above the form */}
              <div className="flex justify-center mb-6">
                <img
                  src={BearTracksLogo}
                  alt="Bear Tracks Logo"
                  className="h-20 w-auto"
                />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-[#062d78] text-center">
                Sign up
              </h1>
              <p className="mt-3 text-base text-[#083796] font-bold text-center">
                Create an account to start tracking lost items on campus.
              </p>
            </MotionReveal>

            {/* ── Registration Form Card ── */}
            {/* Glassmorphism card with gradient border using the 1px padding trick */}
            <MotionReveal delay={0.1}>
              <div className="mt-10 card overflow-hidden border border-brand-blue/30 p-1 shadow-2xl bg-gradient-to-br from-brand-blue/20 via-transparent to-brand-gold/15">
                <div className="bg-brand-blue/5 backdrop-blur-xl rounded-[22px] p-8 sm:p-10">
                  <form onSubmit={onSubmit} className="grid gap-6">

                    {/* Display name — stored in Supabase user_metadata as full_name */}
                    <div>
                      <label htmlFor="signup-name" className="text-xs font-black text-[#062d78] ml-1 uppercase tracking-widest">
                        Name
                      </label>
                      <input
                        id="signup-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                        placeholder="Samarth"
                        className="mt-2 input-field"
                      />
                    </div>

                    {/* School email address — used as the Supabase auth identifier */}
                    <div>
                      <label htmlFor="signup-email" className="text-xs font-black text-[#062d78] ml-1 uppercase tracking-widest">
                        Email
                      </label>
                      <input
                        id="signup-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@school.edu"
                        className="mt-2 input-field"
                      />
                    </div>

                    {/* Password — new-password autocomplete hint prevents browsers from autofilling a saved password */}
                    <div>
                      <label htmlFor="signup-password" className="text-xs font-black text-[#062d78] ml-1 uppercase tracking-widest">
                        Password
                      </label>
                      <input
                        id="signup-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="mt-2 input-field"
                      />
                    </div>

                    {/* Inline error alert — animates in with a scale transition when signup fails */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100"
                      >
                        {error}
                      </motion.div>
                    )}

                    {/* Submit button — shows a loading label and disables during the async request */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={loading}
                      className="mt-2 rounded-2xl bg-brand-blue px-6 py-4 text-sm font-bold text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-dark transition-all disabled:opacity-50"
                    >
                      {loading ? "Creating account" : "Create account"}
                    </motion.button>

                    {/* Horizontal divider — separates the submit button from the secondary link */}
                    <div className="relative my-2">
                      <div
                        className="absolute inset-0 flex items-center"
                        aria-hidden="true"
                      >
                        <div className="w-full border-t border-slate-200"></div>
                      </div>
                    </div>

                    {/* Login redirect — for users who already have an account */}
                    <p className="text-sm text-[#062d78] font-bold text-center">
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        className="font-bold text-[#ea580c] hover:text-[#c2410c] transition-colors duration-300"
                      >
                        Log in
                      </Link>
                    </p>
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
