// App.jsx: The root component of the BearTracks application.
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import BearBot from "./components/BearBot.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ItemsProvider } from "./context/ItemsContext.jsx";
import { MotionConfig } from "framer-motion";

import HomePage from "./pages/HomePage.jsx";
import BrowsePage from "./pages/BrowsePage.jsx";
import SubmitPage from "./pages/SubmitPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import ItemDetailsPage from "./pages/ItemDetailsPage.jsx";
import AdminClaimsPage from "./pages/AdminClaimsPage.jsx";
import CitationsPage from "./pages/CitationsPage.jsx";


// Architecture: Utilizes `react-router-dom` for client-side routing, enabling a Single Page Application (SPA) experience.
// Architecture: Wraps the entire application in global state providers (`AuthProvider` and `ItemsProvider`) to manage user sessions and database records.
export default function App() {
  // Architecture: Integrates Framer Motion for animations, respecting user accessibility preferences for reduced motion.
  // Note: This file serves as the main entry point where all major components (Navbar, Chatbot, Pages) are assembled.
  // Note: Protected routes ensure only authenticated users can access specific workflows like submitting items.
  return (
    // BrowserRouter manages the browser history and URL synchronization
    <BrowserRouter>
      {/* AuthProvider manages global authentication state (login/signup) */}
      <AuthProvider>
        {/* ItemsProvider handles fetching, caching, and updating lost/found items */}
        <ItemsProvider>
          {/* 
            MotionConfig globally controls Framer Motion animations. 
            It checks local storage for accessibility preferences to reduce motion if requested.
          */}
          <MotionConfig reducedMotion={localStorage.getItem('accessAid_pauseAnimations') === 'true' ? "always" : "user"}>
            
            {/* Accessibility skip link for keyboard navigation (WCAG compliance) */}
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            
            {/* Global Navbar rendered on every page */}
            <Navbar />
            
            {/* AI Assistant Chatbot rendered globally as a floating widget */}
            <BearBot />
            
            {/* Main content area where React Router injects the active page component */}
            <main id="main-content" tabIndex={-1}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/browse" element={<BrowsePage />} />
                <Route path="/items/:id" element={<ItemDetailsPage />} />
                <Route path="/citations" element={<CitationsPage />} />
                
                {/* 
                  Protected Routes 
                  The `ProtectedRoute` wrapper intercepts unauthenticated access attempts 
                  and redirects the user to the login page.
                */}
                <Route
                  path="/submit"
                  element={
                    <ProtectedRoute>
                      <SubmitPage />
                    </ProtectedRoute>
                  }
                />

                {/* Authentication Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/claims" element={<AdminClaimsPage />} />

                {/* 
                  Fallback Route
                  If a user navigates to an undefined path (404), safely redirect them to the HomePage.
                */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>
          </MotionConfig>
        </ItemsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

