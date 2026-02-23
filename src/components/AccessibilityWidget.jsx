import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Accessibility, VolumeX } from 'lucide-react';

export default function AccessibilityWidget({ className }) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const location = useLocation();

    // Stop speaking when user navigates to a new page
    useEffect(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, [location.pathname]);

    const generateSummary = () => {
        const path = location.pathname;

        switch (path) {
            case '/':
                return "You are on the AccessAid Home Page. This page provides an overview of our mission to connect lost items with their owners and how the platform works.";
            case '/browse':
                return "You are on the Browse Page. Here you can search, filter, and view all reported lost and found items.";
            case '/submit':
                return "You are on the Submit New Item page. Please fill out the form to report a lost or found item. You must be logged in to submit an item.";
            case '/claims':
                return "You are on the Admin Claims Workspace. Here, administrators can review and process pending claims.";
            case '/login':
                return "You are on the Login page. Please enter your email and password to access your account.";
            case '/signup':
                return "You are on the Sign Up page. Create a new account to start reporting and claiming items.";
            default:
                // Handle dynamic item pages like /items/123
                if (path.startsWith('/items/')) {
                    // Attempt to extract title and description from the DOM dynamically
                    const titleEl = document.querySelector('h1.item-title') || document.querySelector('h1');
                    const descEl = document.querySelector('p.item-description') || document.querySelector('.prose p');

                    let titleText = titleEl ? titleEl.innerText : "Item Details";
                    let descText = descEl ? descEl.innerText : "";

                    // Truncate description length to avoid reading endless text
                    if (descText.length > 200) {
                        descText = descText.substring(0, 200) + ".";
                    }

                    return `You are viewing details for: ${titleText}. ${descText}`;
                }
                return "You are on AccessAid. Navigate the site using the menu.";
        }
    };

    const toggleSpeech = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const summaryText = generateSummary();
            const utterance = new SpeechSynthesisUtterance(summaryText);

            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };

    return (
        <button
            onClick={toggleSpeech}
            className={className || "fixed bottom-6 right-6 z-50 flex items-center justify-center p-4 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"}
            aria-label={isSpeaking ? "Stop accessibility audio summary" : "Play accessibility audio summary"}
            title={isSpeaking ? "Stop summary" : "Read page summary"}
        >
            {isSpeaking ? (
                <VolumeX className={className ? "h-5 w-5" : "h-6 w-6"} />
            ) : (
                <Accessibility className={className ? "h-5 w-5" : "h-6 w-6"} />
            )}
        </button>
    );
}
