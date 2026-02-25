import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ItemsProvider } from "./context/ItemsContext.jsx";
import { MotionConfig } from "framer-motion";

import HomePage from "./pages/HomePage.jsx";
import BrowsePage from "./pages/BrowsePage.jsx";
import SubmitPage from "./pages/SubmitPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import ItemDetailsPage from "./pages/ItemDetailsPage.jsx";
import AdminClaimsPage from "./pages/AdminClaimsPage.jsx";

/**
 * App
 * ---
 * Root router + providers.
 *
 * Key rules you requested:
 * - Browse is its own page: /browse
 * - Login + signup pages exist (mocked, not connected to a service yet)
 * - Only signed-in users can submit items: /submit is protected
 */

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ItemsProvider>
          <MotionConfig reducedMotion={localStorage.getItem('accessAid_pauseAnimations') === 'true' ? "always" : "user"}>
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/items/:id" element={<ItemDetailsPage />} />

              <Route
                path="/submit"
                element={
                  <ProtectedRoute>
                    <SubmitPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/claims" element={<AdminClaimsPage />} />

              {/* Fallback: if someone types an unknown URL, send them home */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </MotionConfig>
        </ItemsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
