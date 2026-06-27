// ContactForm.jsx: School partnership inquiry form displayed on the BearTracks homepage.
// Allows administrators or teachers from other schools to request information about
// deploying BearTracks at their campus. The current onSubmit handler is a placeholder
// that switches to a success state — replace it with a POST to a real backend or
// email service (e.g., Netlify Forms, Resend, SendGrid) before going live.

import { useState } from "react";
import { motion } from "framer-motion";

export default function ContactForm() {
  // status: "idle" shows the form; "sent" shows the success confirmation message
  const [status, setStatus] = useState("idle");

  // handleSubmit: prevents default form submission and switches to the "sent" state.
  // In production, add an async fetch/POST to a backend here before setting status.
  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("sent");
  };

  return (
    // Gradient border card — 1px padding trick creates a colorful border effect
    <div className="card overflow-hidden border border-brand-blue/30 p-1 shadow-2xl bg-gradient-to-br from-brand-blue/30 via-transparent to-brand-orange/30">
      <div className="bg-brand-blue/10 backdrop-blur-xl rounded-[22px] p-8 sm:p-10">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <h3 className="text-3xl font-black text-[#062d78]">Get BearTracks</h3>
        <p className="mt-2 text-[#083796] font-bold">
          Partner with us to bring smart lost and found to your school.
        </p>

        {/* ── Inquiry Form ─────────────────────────────────────────────── */}
        {/* aria-label identifies the form purpose for screen readers */}
        <form onSubmit={handleSubmit} aria-label="School partnership inquiry form" className="mt-8 grid gap-5">

          {/* Name + Email row — two-column on small and up */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className="text-xs font-black text-[#062d78] ml-1 uppercase tracking-widest">
                Name
              </label>
              <input
                id="contact-name"
                required
                type="text"
                placeholder="Samarth"
                className="mt-2 input-field"
              />
            </div>
            <div>
              {/* type="email" triggers browser validation and the correct mobile keyboard */}
              <label htmlFor="contact-email" className="text-xs font-black text-[#062d78] ml-1 uppercase tracking-widest">
                School Email
              </label>
              <input
                id="contact-email"
                required
                type="email"
                placeholder="you@school.edu"
                className="mt-2 input-field"
              />
            </div>
          </div>

          {/* School name — helps us identify the institution before following up */}
          <div>
            <label htmlFor="contact-school" className="text-xs font-black text-[#062d78] ml-1 uppercase tracking-widest">
              School Name
            </label>
            <input
              id="contact-school"
              required
              type="text"
              placeholder="Bear Creek High"
              className="mt-2 input-field"
            />
          </div>

          {/* Message textarea — resize-none prevents layout-breaking manual resizing */}
          <div>
            <label htmlFor="contact-message" className="text-xs font-black text-[#062d78] ml-1 uppercase tracking-widest">
              Message
            </label>
            <textarea
              id="contact-message"
              required
              rows={4}
              placeholder="Tell us about your school"
              className="mt-2 input-field resize-none"
            />
          </div>

          {/* Submit button — disabled after form is sent to prevent duplicate submissions */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={status === "sent"}
            aria-label={status === "sent" ? "Message sent successfully" : "Send inquiry message"}
            className="mt-2 rounded-2xl bg-brand-blue px-6 py-4 text-sm font-bold text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-dark transition-all disabled:opacity-50"
          >
            {status === "sent" ? "Message Sent! ✓" : "Send Message"}
          </motion.button>

        </form>
      </div>
    </div>
  );
}
