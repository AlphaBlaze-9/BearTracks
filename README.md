<div align="center">
  <img width="800" alt="Bear Tracks Banner" src="https://bhsbeartracks.org/favicon.png" />
  <h1>Bear Tracks | BHS FBLA</h1>
  <p>Website Coding & Development</p>
</div>

## Bear Tracks: A School Lost & Found Experience
[Live Website Demo](https://bhsbeartracks.org/)

A comprehensive and professional lost and found platform built specifically for the **Future Business Leaders of America (FBLA) Website Coding & Development** competitive event. Bear Tracks is designed to provide Bothell High School (BHS) students and staff with a fast, friendly, and easy-to-use experience for reporting, browsing, and recovering lost items on campus. 

## Features
- **User Authentication:** Secure, role-based authentication allowing both students and administrative staff to access the platform securely.
- **Interactive Listings:** Browse and search through an organized database of lost and found items.
- **Item Submission:** Effortlessly report a lost item or log a newly found item with descriptions, categories, and image uploads. 
- **Application & Claim Management:** Administrators can manage item claims, verify ownership, and update the status of missing goods.
- **Responsive & Accessible Design:** A seamless, intuitive, and highly responsive user interface ensuring a perfect experience across desktops, tablets, and smartphones.

## Technologies Used
- **Frontend:** React.js, Vite, TypeScript, CSS/Tailwind
- **Backend:** Node.js, Serverless Edge Functions
- **Database & Auth:** PostgreSQL/MongoDB (or Supabase/Firebase), JWT for secure sessions
- **Deployment:** Netlify 

## Getting Started
To get a local copy of this FBLA project up and running, follow these simple steps.

### Prerequisites
- Node.js installed on your machine (v18.0.0 or higher)
- NPM or Pnpm package manager

### Installation
1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/bhs-bear-tracks.git
   ```
2. Navigate to the project directory:
   ```bash
   cd bhs-bear-tracks
   ```
3. Install NPM packages:
   ```bash
   npm install
   ```
4. Set up environment variables:
   Create a `.env` (or `.env.local`) file in the root directory, containing the required configurations for your backend/database:
   ```env
   VITE_API_URL=
   VITE_AUTH_DOMAIN=
   VITE_PROJECT_ID=
   VITE_STORAGE_BUCKET=
   ```
   *(Replace each value with your specific configuration details)*

5. Run the application locally:
   ```bash
   npm run dev
   ```
6. Open your browser and navigate to `http://localhost:5173` to view the app!

## Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request (we will review and merge promptly)

<br />
<div align="center">
  <i>Developed for FBLA Website Coding & Development</i>
</div>
