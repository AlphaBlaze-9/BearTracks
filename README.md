<div align="center">
  <h1>Bear Tracks | BHS FBLA</h1>
  <p><strong>FBLA Website Coding & Development</strong> — Bridgeland High School Lost & Found Platform</p>
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
**Bear Tracks** is a modern lost & found platform created for the **Future Business Leaders of America (FBLA) Website Coding & Development** competitive event. It helps Bridgeland High School (BHS) students and staff quickly **report**, **browse**, and **recover** lost items through a clean, mobile-friendly interface and a streamlined claim process.

---

## Features
- **Role-Based Authentication:** Separate access for students and admins, with appropriate permissions for each role.
- **Searchable Listings:** Browse lost/found posts with filtering and keyword search for faster matching.
- **Item Submission w/ Photos:** Submit lost or found items with descriptions, categories, dates, locations, and image uploads.
- **Claim & Status Workflow:** Admins can review claims, verify ownership, approve/deny requests, and update item status.
- **Responsive & Accessible UI:** Designed to work smoothly across desktop, tablet, and mobile while following accessibility best practices.

---

## Technology

- **Frontend:** React, Vite, JavaScript, Tailwind CSS  
- **Backend/AI:** OpenAI API (Integration)
- **Database & Auth:** Supabase (PostgreSQL) + Auth  
- **Deployment:** Netlify  

---

## Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** or **pnpm**

### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/AlphaBlaze-9/BearTracks.git
   cd BearTracks
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set environment variables**
   Create a `.env` (or `.env.local`) file in the project root:
   ```env
   OPENAI_API_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   VITE_SUPABASE_URL=
   ```
   *Replace values with your project credentials.*

4. **Run locally**
   ```bash
   npm run dev
   ```
   Then open `http://localhost:5173`.

## Project Structure (Quick Map)
- `src/` — React pages, components, and UI logic
- `src/images/` — Application images and custom graphics
- `src/lib/` — Backend and API integrations (Supabase)
- `netlify/` — Netlify serverless functions and configuration
- `.env` — Local environment configuration (not committed)

## Citations

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
