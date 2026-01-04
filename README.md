# Bear Tracks (redesigned)

This folder contains a refreshed front-end for a school **Lost & Found** site.

## Included upgrades

- Cleaner spacing + layout (consistent `Container` + `Section` components)
- Smoother animations (Framer Motion scroll reveals + micro-interactions)
- **Stats count-up animation** that starts when the stats tiles scroll into view
- Comments throughout the code explaining what each piece does
- Respects accessibility settings (`prefers-reduced-motion`)

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL Vite prints in your terminal.

## Build

```bash
npx netlify dev
```

## Where to edit

- Page layout: `src/App.jsx`
- Navbar: `src/components/Navbar.jsx`
- Count-up numbers: `src/components/CountUp.jsx`
- “Animate on scroll” wrapper: `src/components/MotionReveal.jsx`

## Notes

- The contact form is a **demo only** (no backend). Hook it up to your API, Firebase, or Google Forms.
- The stats are placeholders — replace them with real numbers.
