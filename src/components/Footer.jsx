// Footer.jsx: Site-wide footer rendered at the bottom of every page.
// Contains the BearTracks brand mark, quick navigation anchors, and a copyright notice.
// The footer is intentionally minimal — the primary navigation lives in the Navbar.
// Internal anchor links navigate to named sections on the HomePage (Hero / CTA).

import { PawPrint } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-white/60 md:px-6">

        {/* ── Brand + Navigation Row ────────────────────────────────────── */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          {/* Brand mark: paw print icon + site name + tagline */}
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <PawPrint className="w-5 h-5 text-white/80" />
            </span>
            <div>
              <div className="font-semibold text-white/80">Bear Tracks</div>
              <div className="text-xs">A better school lost &amp; found</div>
            </div>
          </div>

          {/* Quick-link anchors — scroll to the relevant HomePage sections */}
          <div className="flex flex-wrap items-center gap-3">
            <a className="hover:text-white" href="#how" aria-label="Learn how Bear Tracks works">
              How it works
            </a>
            <span className="text-white/30">•</span>
            <a className="hover:text-white" href="#cta" aria-label="Report a lost or found item">
              Report
            </a>
          </div>
        </div>

        {/* ── Copyright Notice ──────────────────────────────────────────── */}
        {/* Year is computed dynamically so it never needs a manual update */}
        <div className="mt-8 text-xs">
          © {new Date().getFullYear()} Bear Tracks. Built with React + Tailwind.
        </div>

      </div>
    </footer>
  );
}
