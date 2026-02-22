<div align="center">
  <h1>Bear Tracks | BHS FBLA</h1>
  <p><strong>FBLA Website Coding & Development</strong> — Bothell High School Lost & Found Platform</p>
  <p>
    <a href="https://bhsbeartracks.org/"><strong>Live Website Demo</strong></a>
    ·
    <a href="#getting-started">Local Setup</a>
    ·
    <a href="#features">Features</a>
    ·
    <a href="#technology">Technology</a>
  </p>
</div>

## Overview
**Bear Tracks** is a modern lost & found platform created for the **Future Business Leaders of America (FBLA) Website Coding & Development** competitive event. It helps Bothell High School (BHS) students and staff quickly **report**, **browse**, and **recover** lost items through a clean, mobile-friendly interface and a streamlined claim process.

---

## Features
- **Role-Based Authentication:** Separate access for students and admins, with appropriate permissions for each role.
- **Searchable Listings:** Browse lost/found posts with filtering and keyword search for faster matching.
- **Item Submission w/ Photos:** Submit lost or found items with descriptions, categories, dates, locations, and image uploads.
- **Claim & Status Workflow:** Admins can review claims, verify ownership, approve/deny requests, and update item status.
- **Responsive & Accessible UI:** Designed to work smoothly across desktop, tablet, and mobile while following accessibility best practices.

---

## Technology
> **Note:** Replace the placeholders below with your *actual* stack (judges dislike “or” lists).

- **Frontend:** React, Vite, TypeScript, Tailwind CSS  
- **Backend:** Node.js, Serverless/Edge Functions  
- **Database & Auth:** Supabase (PostgreSQL) + Auth *(or your actual provider)*  
- **Deployment:** Netlify  

---

## Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** or **pnpm**

### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bhs-bear-tracks.git
   cd bhs-bear-tracks
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set environment variables**
   Create a `.env` (or `.env.local`) file in the project root:
   ```env
   VITE_API_URL=
   VITE_AUTH_DOMAIN=
   VITE_PROJECT_ID=
   VITE_STORAGE_BUCKET=
   ```
   *Replace values with your project credentials.*

4. **Run locally**
   ```bash
   npm run dev
   ```
   Then open `http://localhost:5173`.

## Project Structure (Quick Map)
- `src/` — React pages, components, and UI logic
- `src/assets/` — Images/icons
- `netlify/` or `functions/` — Serverless/Edge functions (if used)
- `.env(.local)` — Local environment configuration (not committed)

## Citations
*Keep citations relevant to technologies actually used in this project. Remove anything unrelated.*

- MDN Web Docs. “Using the Fetch API.” Accessed 12 Nov 2025. https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- W3Schools. “React JSX.” Accessed 12 Nov 2025. https://www.w3schools.com/react/react_jsx.asp
- W3Schools. “Window localStorage Property.” Accessed 12 Nov 2025. https://www.w3schools.com/jsref/prop_win_localstorage.asp
- Figma Resource Library. “100 Color Combinations To Influence Your Next Design.” Accessed 12 Nov 2025. https://www.figma.com/resource-library/color-combinations/
- Erstad, Will. “The Graphic Designer's Guide to the Psychology of Color.” Rasmussen University, 17 Jan 2018. https://www.rasmussen.edu/degrees/design/blog/psychology-of-color/

## Contributing
This project was developed for an FBLA competitive event. If you’d like to suggest improvements:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m "Add your feature"`)
4. Push (`git push origin feature/your-feature`)
5. Open a Pull Request

<br />
<div align="center">
  <i>Developed for FBLA Website Coding & Development</i>
</div>
