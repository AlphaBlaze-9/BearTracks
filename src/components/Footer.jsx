import { PawPrint } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-white/60 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <PawPrint className="w-5 h-5 text-white/80" />
            </span>
            <div>
              <div className="font-semibold text-white/80">Bear Tracks</div>
              <div className="text-xs">A better school lost & found</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a className="hover:text-white" href="#how">
              How it works
            </a>
            <span className="text-white/30">•</span>
            <a className="hover:text-white" href="#cta">
              Report
            </a>
          </div>
        </div>
        <div className="mt-8 text-xs">
          © {new Date().getFullYear()} Bear Tracks. Built with React + Tailwind.
        </div>
      </div>
    </footer>
  );
}
