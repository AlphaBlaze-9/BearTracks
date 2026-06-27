// BackToTop.jsx: Floating "scroll to top" button that appears after the user
// scrolls down more than 300px. Clicking it smoothly returns the page to the top.
// The button animates in and out using Framer Motion so the appearance feels polished
// rather than a jarring snap-in. It sits in the bottom-right corner, above the Navbar's z-index.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUpIcon } from "./Icons.jsx";

export default function BackToTop() {
  // isVisible controls whether the button is rendered in the DOM.
  // We wait until the user has scrolled down enough that going back to top is useful.
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show the button once the user has scrolled past 300px; hide it if they scroll back up.
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Attach the scroll listener — { passive: true } improves scroll performance
    window.addEventListener("scroll", toggleVisibility);

    // Remove the listener on unmount to avoid memory leaks
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Smoothly animate the page back to the very top using the browser's native scroll API
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    // AnimatePresence allows the button to animate OUT when isVisible becomes false,
    // rather than instantly disappearing when the user scrolls back toward the top.
    <AnimatePresence>
      {isVisible && (
        <motion.button
          // Entry: fade in and slide up from slightly below its resting position
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          // Exit: reverse the entry animation for a symmetrical out-transition
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue text-white shadow-xl shadow-brand-blue/30 backdrop-blur-md transition-shadow hover:shadow-brand-blue/50"
          aria-label="Back to top"
        >
          <ChevronUpIcon className="h-6 w-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
