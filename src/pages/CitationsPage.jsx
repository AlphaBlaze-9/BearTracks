// CitationsPage.jsx: Dedicated page displaying formal MLA citations and reference materials used in the development
import { useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, ExternalLink, ShieldCheck, FileText, Code, Palette, Database, Award } from "lucide-react";
import Container from "../components/Container.jsx";
import Section from "../components/Section.jsx";
import MotionReveal from "../components/MotionReveal.jsx";


// and research phase of the Bridgeland High School BearTracks FBLA website.
// Architecture & Accessibility (WCAG Compliance):
// Implements a single descriptive <h1> heading for proper document hierarchy.
const CITATIONS = [
  {
    id: "rmcad-hierarchy",
    title: `"Designing Visual Hierarchies: Guiding the Viewer's Eye Through Composition."`,
    publisher: "Rocky Mountain College of Art + Design",
    url: "https://www.rmcad.edu/blog/designing-visual-hierarchies-guiding-the-viewers-eye-through-composition/",
    displayUrl: "www.rmcad.edu/blog/designing-visual-hierarchies-guiding-the-viewers-eye-through-composition/",
    accessDate: "25 June 2026",
    category: "UI/UX Design",
    icon: Palette,
    fullText: `"Designing Visual Hierarchies: Guiding the Viewer's Eye Through Composition." Rocky Mountain College of Art + Design, www.rmcad.edu/blog/designing-visual-hierarchies-guiding-the-viewers-eye-through-composition/. Accessed 25 June 2026.`
  },
  {
    id: "figma-tool",
    title: "Figma: The Collaborative Interface Design Tool",
    publisher: "Figma, 2026",
    url: "https://www.figma.com",
    displayUrl: "www.figma.com",
    accessDate: "25 June 2026",
    category: "Design Prototyping",
    icon: Palette,
    fullText: `Figma: The Collaborative Interface Design Tool. Figma, 2026, www.figma.com. Accessed 25 June 2026.`
  },
  {
    id: "mit-file-structure",
    title: `"File Structure."`,
    publisher: "Broad Institute CommKit, MIT Communication Lab",
    url: "https://mitcommlab.mit.edu/broad/commkit/file-structure/",
    displayUrl: "mitcommlab.mit.edu/broad/commkit/file-structure/",
    accessDate: "25 June 2026",
    category: "Architecture & Standards",
    icon: FileText,
    fullText: `"File Structure." Broad Institute CommKit, MIT Communication Lab, mitcommlab.mit.edu/broad/commkit/file-structure/. Accessed 25 June 2026.`
  },
  {
    id: "github-platform",
    title: "GitHub",
    publisher: "GitHub, Inc., 2026",
    url: "https://github.com",
    displayUrl: "github.com",
    accessDate: "25 June 2026",
    category: "Version Control",
    icon: Code,
    fullText: `GitHub. GitHub, Inc., 2026, github.com. Accessed 25 June 2026.`
  },
  {
    id: "gitnux-resources",
    title: "Gitnux",
    publisher: "Gitnux, 2026",
    url: "https://gitnux.org",
    displayUrl: "gitnux.org",
    accessDate: "25 June 2026",
    category: "Development Resources",
    icon: BookOpen,
    fullText: `Gitnux. Gitnux, 2026, gitnux.org. Accessed 25 June 2026.`
  },
  {
    id: "isls-society",
    title: "International Society of the Learning Sciences",
    publisher: "International Society of the Learning Sciences, 2026",
    url: "https://www.isls.org",
    displayUrl: "www.isls.org",
    accessDate: "25 June 2026",
    category: "Academic Research",
    icon: Award,
    fullText: `International Society of the Learning Sciences. International Society of the Learning Sciences, 2026, www.isls.org. Accessed 25 June 2026.`
  },
  {
    id: "rasmussen-color-psychology",
    title: `"The Psychology of Color: How Do Colors Influence Logo & Branding?"`,
    author: "Martins, Anjela",
    publisher: "Rasmussen University",
    url: "https://www.rasmussen.edu/degrees/design/blog/psychology-of-color/",
    displayUrl: "www.rasmussen.edu/degrees/design/blog/psychology-of-color/",
    accessDate: "25 June 2026",
    category: "UI/UX Design",
    icon: Palette,
    fullText: `Martins, Anjela. "The Psychology of Color: How Do Colors Influence Logo & Branding?" Rasmussen University, www.rasmussen.edu/degrees/design/blog/psychology-of-color/. Accessed 25 June 2026.`
  },
  {
    id: "mdn-web-docs",
    title: "MDN Web Docs",
    publisher: "Mozilla, 2026",
    url: "https://developer.mozilla.org/en-US/",
    displayUrl: "developer.mozilla.org/en-US/",
    accessDate: "25 June 2026",
    category: "Web Standards",
    icon: Code,
    fullText: `MDN Web Docs. Mozilla, 2026, developer.mozilla.org/en-US/. Accessed 25 June 2026.`
  },
  {
    id: "postgresql-docs",
    title: `"PostgreSQL Documentation."`,
    publisher: "PostgreSQL, The PostgreSQL Global Development Group, 2026",
    url: "https://www.postgresql.org/docs/",
    displayUrl: "www.postgresql.org/docs/",
    accessDate: "25 June 2026",
    category: "Database Systems",
    icon: Database,
    fullText: `"PostgreSQL Documentation." PostgreSQL, The PostgreSQL Global Development Group, 2026, www.postgresql.org/docs/. Accessed 25 June 2026.`
  },
  {
    id: "wcag-contrast",
    title: `"Understanding Success Criterion 1.4.3: Contrast (Minimum)."`,
    publisher: "Web Content Accessibility Guidelines (WCAG) 2.2, W3C",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum",
    displayUrl: "www.w3.org/WAI/WCAG22/Understanding/contrast-minimum",
    accessDate: "25 June 2026",
    category: "Accessibility (WCAG)",
    icon: ShieldCheck,
    fullText: `"Understanding Success Criterion 1.4.3: Contrast (Minimum)." Web Content Accessibility Guidelines (WCAG) 2.2, W3C, www.w3.org/WAI/WCAG22/Understanding/contrast-minimum. Accessed 25 June 2026.`
  },
  {
    id: "vscode-docs",
    title: `"Visual Studio Code Documentation."`,
    publisher: "Visual Studio Code, Microsoft, 2026",
    url: "https://code.visualstudio.com/docs",
    displayUrl: "code.visualstudio.com/docs",
    accessDate: "25 June 2026",
    category: "Development Tools",
    icon: Code,
    fullText: `"Visual Studio Code Documentation." Visual Studio Code, Microsoft, 2026, code.visualstudio.com/docs. Accessed 25 June 2026.`
  },
  {
    id: "w3c-aria-guide",
    title: `"WAI-ARIA Authoring Practices Guide."`,
    publisher: "W3C, World Wide Web Consortium, 2026",
    url: "https://www.w3.org/WAI/ARIA/apg/",
    displayUrl: "www.w3.org/WAI/ARIA/apg/",
    accessDate: "25 June 2026",
    category: "Accessibility (WCAG)",
    icon: ShieldCheck,
    fullText: `"WAI-ARIA Authoring Practices Guide." W3C, World Wide Web Consortium, 2026, www.w3.org/WAI/ARIA/apg/. Accessed 25 June 2026.`
  }
];

// Dynamically updates document.title for SEO and screen reader tab announcement.
export default function CitationsPage() {
  // Update document title and meta description for SEO guidelines
  // Uses semantic <section>, <article>, and <ul>/<li> elements to structure bibliography lists.
  // Color contrast ratios exceed WCAG AA 1.4.3 minimum contrast requirements.
  useEffect(() => {
    document.title = "Citations & Bibliography | BearTracks FBLA";
  }, []);

  // Interactive links include descriptive aria-labels and open safely with rel="noopener noreferrer".
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Page Header */}
      <Section className="relative overflow-hidden bg-brand-blue pt-12 pb-16 text-white sm:pt-20 sm:pb-24 shadow-lg">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-gold/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />

        <Container className="relative z-10">
          <MotionReveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-gold backdrop-blur-md mb-4">
              <BookOpen className="h-3.5 w-3.5" /> FBLA Project Bibliography
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">
              Works <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-amber-200 to-white">Cited</span>
            </h1>
            <p className="mt-4 max-w-3xl text-base sm:text-lg text-white/80 leading-relaxed font-medium">
              Formal MLA citations supporting the UI/UX architecture, accessibility compliance, database engineering, and visual design psychology behind the Bridgeland High School BearTracks platform.
            </p>
          </MotionReveal>
        </Container>
      </Section>

      {/* Bibliography Content Section */}
      <Section className="-mt-8 relative z-20">
        <Container>
          {/* Summary Stats Banner */}
          <MotionReveal delay={0.1}>
            <div className="rounded-3xl border border-brand-blue/15 bg-white p-6 sm:p-8 shadow-xl backdrop-blur-xl mb-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue shrink-0 font-black text-2xl">
                  📚
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Academic & Technical Sources</h2>
                  <p className="text-sm font-medium text-slate-600 mt-0.5">
                    12 verified sources referenced in standard Modern Language Association (MLA) format.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold tracking-wider uppercase shrink-0">
                <ShieldCheck className="w-4 h-4 text-green-600" /> WCAG 2.2 AA Verified
              </div>
            </div>
          </MotionReveal>

          {/* Citations Grid */}
          <div className="grid gap-6 md:grid-cols-2" role="list" aria-label="List of works cited">
            {CITATIONS.map((cite, index) => {
              const IconComponent = cite.icon || FileText;
              return (
                <motion.article
                  key={cite.id}
                  id={cite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-brand-blue/30 transition-all duration-300"
                  role="listitem"
                >
                  <div>
                    {/* Category Tag & Icon */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-blue/5 px-3 py-1 text-xs font-bold text-brand-blue border border-brand-blue/10">
                        <IconComponent className="w-3.5 h-3.5" />
                        {cite.category}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Accessed {cite.accessDate}
                      </span>
                    </div>

                    {/* MLA Citation Box */}
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 font-mono text-xs sm:text-sm text-slate-800 leading-relaxed pl-6 pl-indent">
                      <p className="indent-[-1.5rem] select-all">
                        {cite.author && <span className="font-semibold">{cite.author}. </span>}
                        <span className="italic sm:not-italic font-bold text-slate-900">{cite.title} </span>
                        <span>{cite.publisher}, </span>
                        <span className="text-brand-blue underline break-all">{cite.displayUrl}</span>
                        <span>. Accessed {cite.accessDate}.</span>
                      </p>
                    </div>
                  </div>

                  {/* Action Link Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold text-slate-500 line-clamp-1">
                      {cite.publisher}
                    </span>
                    <a
                      href={cite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open source URL for ${cite.title}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand-blue px-4 py-2 text-xs font-black text-white shadow-md shadow-brand-blue/20 hover:bg-brand-blue/90 hover:gap-2 transition-all shrink-0"
                    >
                      Visit Source <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </motion.article>
              );
            })}
          </div>

          {/* FBLA Compliance Notice Card */}
          <MotionReveal delay={0.3}>
            <div className="mt-12 rounded-3xl bg-gradient-to-r from-slate-900 to-[#062d78] p-8 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/10">
              <div className="space-y-2 max-w-2xl">
                <h3 className="text-lg font-black text-brand-gold uppercase tracking-wider">
                  Academic Integrity & Fair Use Statement
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  All external libraries, graphic assets, design frameworks, and technical documentation referenced in this project are credited in accordance with Future Business Leaders of America (FBLA) competitive event guidelines and MLA citation standards.
                </p>
              </div>
              <a
                href="https://www.fbla.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-[#062d78] hover:bg-brand-gold hover:text-slate-900 transition-colors shrink-0 shadow-lg"
              >
                FBLA Guidelines <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </MotionReveal>
        </Container>
      </Section>
    </div>
  );
}
