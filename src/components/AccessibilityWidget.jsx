import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Accessibility, VolumeX, Volume2, Eye, Pause, Keyboard, X, Play } from 'lucide-react';

export default function AccessibilityWidget({ className }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [pauseAnimations, setPauseAnimations] = useState(false);
    const [enhancedFocus, setEnhancedFocus] = useState(false);
    const menuRef = useRef(null);
    const location = useLocation();

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Stop speaking when user navigates to a new page
    useEffect(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsOpen(false); // also close menu on navigation
    }, [location.pathname]);

    // Apply classes to body
    useEffect(() => {
        if (highContrast) document.body.classList.add('high-contrast');
        else document.body.classList.remove('high-contrast');

        if (pauseAnimations) document.body.classList.add('pause-animations');
        else document.body.classList.remove('pause-animations');

        if (enhancedFocus) document.body.classList.add('enhanced-focus');
        else document.body.classList.remove('enhanced-focus');
    }, [highContrast, pauseAnimations, enhancedFocus]);

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
                if (path.startsWith('/items/')) {
                    const titleEl = document.querySelector('h1.item-title') || document.querySelector('h1');
                    const descEl = document.querySelector('p.item-description') || document.querySelector('.prose p');

                    let titleText = titleEl ? titleEl.innerText : "Item Details";
                    let descText = descEl ? descEl.innerText : "";

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

    const isFullWidth = className && className.includes("w-full");

    // Default class if none provided
    const defaultBtnClass = "fixed bottom-6 right-6 z-50 flex items-center justify-center p-4 rounded-full bg-brand-blue text-white shadow-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue";

    // Determine icon size and text based on className
    const showText = className && className.includes("px-3");

    return (
        <div className={`relative ${isFullWidth ? "w-full" : ""}`} ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={className || defaultBtnClass}
                aria-label="Accessibility Menu"
                aria-expanded={isOpen}
            >
                <Accessibility className={className ? "h-5 w-5" : "h-6 w-6"} />
                {showText && <span className="">Accessibility Options</span>}
            </button>

            {isOpen && (
                <div className={`absolute ${isFullWidth ? "left-0 bottom-full mb-2" : "right-0 top-full mt-2"} w-[280px] sm:w-[320px] bg-white rounded-2xl shadow-2xl border border-slate-100 z-[9999] p-4 font-sans text-left`}>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Accessibility className="h-5 w-5 text-brand-blue" />
                            Accessibility
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-2 text-sm text-slate-700">
                        <button
                            onClick={toggleSpeech}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${isSpeaking ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue" : "bg-white border-slate-100 hover:border-brand-blue/30 hover:bg-slate-50"
                                }`}
                        >
                            <span className="flex items-center gap-3 font-semibold">
                                {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                Page Audio Summary
                            </span>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${isSpeaking ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-500"}`}>
                                {isSpeaking ? "ON" : "OFF"}
                            </span>
                        </button>

                        <button
                            onClick={() => setHighContrast(!highContrast)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${highContrast ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue" : "bg-white border-slate-100 hover:border-brand-blue/30 hover:bg-slate-50"
                                }`}
                        >
                            <span className="flex items-center gap-3 font-semibold">
                                <Eye className="h-5 w-5" />
                                High Contrast
                            </span>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${highContrast ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-500"}`}>
                                {highContrast ? "ON" : "OFF"}
                            </span>
                        </button>

                        <button
                            onClick={() => setPauseAnimations(!pauseAnimations)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${pauseAnimations ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue" : "bg-white border-slate-100 hover:border-brand-blue/30 hover:bg-slate-50"
                                }`}
                        >
                            <span className="flex items-center gap-3 font-semibold">
                                {pauseAnimations ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                                Pause Animations
                            </span>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${pauseAnimations ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-500"}`}>
                                {pauseAnimations ? "ON" : "OFF"}
                            </span>
                        </button>

                        <button
                            onClick={() => setEnhancedFocus(!enhancedFocus)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${enhancedFocus ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue" : "bg-white border-slate-100 hover:border-brand-blue/30 hover:bg-slate-50"
                                }`}
                        >
                            <span className="flex items-center gap-3 font-semibold">
                                <Keyboard className="h-5 w-5" />
                                Enhanced Keyboard Focus
                            </span>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${enhancedFocus ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-500"}`}>
                                {enhancedFocus ? "ON" : "OFF"}
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
