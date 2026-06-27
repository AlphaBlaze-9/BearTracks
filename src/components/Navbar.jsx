// Navbar.jsx: Sticky top navigation bar for BearTracks.
// Features: brand logo, desktop nav links, accessibility widget, real-time notification bell
// (match alerts, claim status, admin new-claim alerts), account dropdown (logout / delete),
// and a mobile slide-down drawer. The header grows a shadow on scroll via useScrollShadow.
// All menus close automatically when the route changes via the location effect.

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Trash2,
} from "lucide-react";
import Container from "./Container.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useItems } from "../context/ItemsContext.jsx";
import DeleteAccountModal from "./DeleteAccountModal.jsx";
import AccessibilityWidget from "./AccessibilityWidget.jsx";

import BearTracksLogo from "../BearTracksLogo.png";


// ── cx (className utility) ────────────────────────────────────────────────────
// Joins an arbitrary number of class strings, filtering out falsy values.
// Keeps conditional className construction readable without a third-party library.
function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

// ── useScrollShadow ───────────────────────────────────────────────────────────
// Returns `true` when the page has scrolled past 8px, used to add a drop shadow
// to the header so it visually "lifts" above the page content when scrolled.
function useScrollShadow() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll(); // Run once immediately to set the correct initial state
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

// ── Navbar ────────────────────────────────────────────────────────────────────
export default function Navbar() {
  const { isAuthed, user, isAdmin, logout, deleteAccount } = useAuth();
  const { items, claims } = useItems();
  const scrolled = useScrollShadow();

  // ── UI State ───────────────────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);             // Mobile drawer open/closed
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false); // Account dropdown
  const [isNotifOpen, setIsNotifOpen] = useState(false);   // Notification bell panel
  const [isDeleting, setIsDeleting] = useState(false);     // Account deletion in-flight

  // ── Read Notification IDs ─────────────────────────────────────────────────
  // Persist which notifications the user has dismissed so the badge count is
  // accurate across page loads. Keys: item IDs for match alerts, "claim_ID" for
  // claim updates, and "admin_claim_ID" for admin new-claim alerts.
  const [readNotifs, setReadNotifs] = useState(() => {
    try {
      const saved = localStorage.getItem("read_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // handleLogout: calls AuthContext.logout, navigates home, and guards against
  // double-clicks with the isLoggingOut flag.
  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      alert("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  // ── Notification Computation ───────────────────────────────────────────────
  // Builds an array of unread notifications from three sources:
  //   1. Match alerts — items the user submitted that have AI-matched potential_matches
  //   2. Claim status — the user's own claims that have been Approved or Denied
  //   3. Admin alerts — all Pending claims (only shown to admins for review)
  const notifications =
    isAuthed && user
      ? [
        // ── Match Alerts ───────────────────────────────────────────────────
        // Shown only to the submitter of the lost/found item when the AI
        // match-items function has found at least one candidate match.
        ...items
          .filter(
            (it) =>
              it.user_id === user.id &&
              (it.status === "Lost" || it.status === "Found") &&
              it.potential_matches &&
              it.potential_matches.length > 0 &&
              !readNotifs.includes(it.id), // Skip already-dismissed alerts
          )
          .map((item) => ({ type: "match", item })),

        // ── Claim Status Alerts ────────────────────────────────────────────
        // Shown to the claimant once an admin has approved or denied their claim.
        ...claims
          .filter(
            (claim) =>
              claim.userId === user.id &&
              claim.status !== "Pending" &&       // Only resolved claims trigger alerts
              !readNotifs.includes(`claim_${claim.id}`),
          )
          .map((claim) => ({
            type: "claim",
            claim,
            item: items.find((i) => String(i.id) === String(claim.itemId)),
          })),

        // ── Admin New-Claim Alerts ─────────────────────────────────────────
        // Shown exclusively to admins for every Pending claim awaiting review.
        ...(isAdmin
          ? claims
            .filter(
              (claim) =>
                claim.status === "Pending" &&
                !readNotifs.includes(`admin_claim_${claim.id}`),
            )
            .map((claim) => ({
              type: "admin_claim",
              claim,
              item: items.find(
                (i) => String(i.id) === String(claim.itemId),
              ),
            }))
          : []),
      ]
      : [];

  // handleNotificationClick: marks a notification as read by adding its ID to
  // the readNotifs array and persisting it to localStorage.
  function handleNotificationClick(itemId) {
    setIsNotifOpen(false);
    if (!readNotifs.includes(itemId)) {
      const newRead = [...readNotifs, itemId];
      setReadNotifs(newRead);
      localStorage.setItem("read_notifications", JSON.stringify(newRead));
    }
  }

  const location = useLocation();
  const navigate = useNavigate();

  // Close all open menus when the user navigates to a new route.
  // This handles both link clicks and programmatic navigation.
  useEffect(() => {
    setIsOpen(false);
    setIsAccountMenuOpen(false);
  }, [location.pathname]);

  // goHomeAndScroll: navigates to / then scrolls to a section anchor.
  // If already on the home page, scrolls immediately without a route change.
  function goHomeAndScroll(id) {
    if (location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    navigate("/");
    // Brief timeout allows the home page to mount before attempting the scroll
    setTimeout(
      () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
      60,
    );
  }

  // handleDeleteAccount: prompts the user with a native confirm dialog as a
  // final safeguard before triggering the irreversible deleteAccount RPC.
  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Are you sure? All your submitted items will be permanently deleted.",
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteAccount();
      alert("Account deleted.");
      navigate("/");
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.message || "Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  // desktopLink: NavLink className factory — applies an active background pill
  // when the link matches the current route.
  const desktopLink = ({ isActive }) =>
    cx(
      "rounded-full px-3 py-2 text-sm font-extrabold text-[#062d78] hover:bg-brand-gold/20 transition-colors",
      isActive ? "bg-brand-gold/25 text-[#062d78] shadow-sm" : "",
    );

  return (
    <header
      className={
        "sticky top-0 z-50 border-b border-brand-blue/20 bg-brand-blue/15 backdrop-blur-lg transition-all " +
        (scrolled ? "shadow-soft bg-brand-blue/25" : "")
      }
    >
      <Container className="py-3">
        <div className="flex items-center justify-between">

          {/* ── Brand Logo ───────────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2" aria-label="BearTracks Home">
            <img
              src={BearTracksLogo}
              alt="Bear Tracks Logo"
              className="h-14 w-auto object-contain"
            />
            <span className="font-black text-xl text-[#062d78] tracking-tight hidden sm:block">
              BearTracks
            </span>
          </Link>

          {/* ── Desktop Navigation ──────────────────────────────────────── */}
          <nav className="hidden items-center gap-2 md:flex" aria-label="Main Navigation">
            <NavLink to="/" className={desktopLink} end>Home</NavLink>
            <NavLink to="/browse" className={desktopLink}>Browse</NavLink>
            <NavLink to="/submit" className={desktopLink}>Submit</NavLink>
            <NavLink to="/citations" className={desktopLink}>Citations</NavLink>

            {/* FAQ: scrolls to the #faq section on the HomePage */}
            <button
              type="button"
              onClick={() => goHomeAndScroll("faq")}
              aria-label="Frequently Asked Questions"
              className="rounded-full px-4 py-2 text-sm font-extrabold text-[#062d78] hover:bg-brand-gold/15 transition-all"
            >
              FAQ
            </button>

            {/* Claims link: only visible to authenticated admins */}
            {isAuthed && isAdmin && (
              <NavLink to="/claims" className={desktopLink}>
                Claims
              </NavLink>
            )}

            {/* Accessibility Widget: renders as a circular icon button in the navbar */}
            <AccessibilityWidget className="ml-2 flex items-center justify-center h-10 w-10 flex-shrink-0 flex-grow-0 rounded-full border border-brand-blue/20 bg-brand-blue/10 text-[#062d78] hover:bg-brand-blue/20 transition-all cursor-pointer shadow-sm" />

            {/* ── Notification Bell (authenticated users only) ──────────── */}
            {isAuthed && (
              <div className="relative ml-2">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  aria-label={notifications.length > 0 ? `Notifications (${notifications.length} unread)` : "Notifications"}
                  aria-expanded={isNotifOpen}
                  className="relative flex items-center justify-center h-10 w-10 rounded-full border border-brand-blue/20 bg-brand-blue/10 text-[#062d78] hover:bg-brand-blue/20 transition-all"
                >
                  <Bell className="w-5 h-5" strokeWidth={2} />
                  {/* Red badge shows unread count; only rendered when count > 0 */}
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* ── Notification Panel ──────────────────────────────────── */}
                <AnimatePresence>
                  {isNotifOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-2 w-72 origin-top-right overflow-hidden rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5 z-50"
                        role="region"
                        aria-label="Notifications Panel"
                      >
                        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 mb-2">
                          Notifications
                        </div>

                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm text-slate-500 font-medium">
                            No new alerts
                          </div>
                        ) : (
                          <div className="max-h-64 overflow-y-auto flex flex-col gap-1">
                            {notifications.map((notif) => {

                              // ── Match Notification ───────────────────────────
                              // Links to the matched Found item's details page
                              if (notif.type === "match") {
                                const { item } = notif;
                                const matchedItemId = item.potential_matches[0].id;
                                return (
                                  <Link
                                    key={`match_${item.id}`}
                                    to={`/items/${matchedItemId}`}
                                    onClick={() => handleNotificationClick(item.id)}
                                    aria-label={`Match found (${Math.round((item.potential_matches[0].score || 0) * 100)}%): Possible match for "${item.title}"`}
                                    className="block rounded-xl bg-brand-blue/5 p-3 hover:bg-brand-blue/10 transition-colors"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="text-brand-blue pt-0.5">
                                        <Search className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <div className="text-xs font-bold text-[#062d78] flex items-center justify-between">
                                          <span>Match Found!</span>
                                          <span className="bg-brand-orange text-white px-2 py-0.5 rounded-full text-[10px] ml-2">
                                            {Math.round((item.potential_matches[0].score || 0) * 100)}%
                                          </span>
                                        </div>
                                        <div className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                                          Possible match for "{item.title}"
                                        </div>
                                      </div>
                                    </div>
                                  </Link>
                                );
                              }

                              // ── Claim Status Notification ────────────────────
                              // Shows Approved (green) or Denied (red) with optional
                              // denial reason and pickup instructions for approvals.
                              if (notif.type === "claim") {
                                const { claim, item } = notif;
                                const isApproved = claim.status === "Approved";
                                return (
                                  <Link
                                    key={`claim_${claim.id}`}
                                    to={`/items/${claim.itemId}`}
                                    onClick={() => handleNotificationClick(`claim_${claim.id}`)}
                                    aria-label={`Claim ${claim.status}: Your claim for "${item?.title || "an item"}" was ${claim.status.toLowerCase()}`}
                                    className={`block rounded-xl p-3 transition-colors ${isApproved ? "bg-green-50 hover:bg-green-100" : "bg-red-50 hover:bg-red-100"}`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className={isApproved ? "text-green-600 pt-0.5" : "text-red-600 pt-0.5"}>
                                        <Bell className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <div className={`text-xs font-bold ${isApproved ? "text-green-800" : "text-red-800"}`}>
                                          Claim {claim.status}
                                        </div>
                                        <div className="text-xs text-slate-600 mt-0.5">
                                          Your claim for "{item?.title || "an item"}" was {claim.status.toLowerCase()}.
                                          {isApproved && (
                                            <span className="block mt-1 font-bold text-green-700">
                                              Please pick it up at the Front Office.
                                            </span>
                                          )}
                                          {!isApproved && claim.denialReason && (
                                            <span className="block mt-1 font-bold text-red-700">
                                              Reason: {claim.denialReason}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </Link>
                                );
                              }

                              // ── Admin New-Claim Notification ─────────────────
                              // Shown only to admins; links to the /claims dashboard
                              if (notif.type === "admin_claim") {
                                const { claim, item } = notif;
                                return (
                                  <Link
                                    key={`admin_claim_${claim.id}`}
                                    to="/claims"
                                    onClick={() => handleNotificationClick(`admin_claim_${claim.id}`)}
                                    aria-label={`New Claim Request: ${claim.name} filed a claim for "${item?.title || "an item"}"`}
                                    className="block rounded-xl bg-brand-orange/5 p-3 hover:bg-brand-orange/10 transition-colors"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="text-brand-orange pt-0.5">
                                        <Bell className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <div className="text-xs font-bold text-orange-800">
                                          New Claim Request!
                                        </div>
                                        <div className="text-xs text-slate-600 mt-0.5">
                                          {claim.name} filed a claim for "
                                          {item?.title || "an item"}". Review it now.
                                        </div>
                                      </div>
                                    </div>
                                  </Link>
                                );
                              }
                            })}
                          </div>
                        )}
                      </motion.div>
                      {/* Invisible backdrop: clicking outside the panel closes it */}
                      <div
                        className="fixed inset-0 z-[-1]"
                        onClick={() => setIsNotifOpen(false)}
                      />
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ── Auth Actions ─────────────────────────────────────────────── */}
            {!isAuthed ? (
              // Unauthenticated: show Log In + Sign Up buttons
              <div className="ml-2 flex items-center gap-2">
                <NavLink
                  to="/login"
                  className="rounded-full border border-brand-orange/20 bg-brand-orange/10 px-5 py-2 text-sm font-black text-[#ea580c] hover:bg-brand-orange/20 transition-all shadow-sm"
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/signup"
                  className="rounded-full bg-brand-orange px-5 py-2 text-sm font-bold text-white hover:bg-[#ea580c] transition-all shadow-md shadow-brand-orange/20"
                >
                  Sign up
                </NavLink>
              </div>
            ) : (
              // Authenticated: show account dropdown with user's name
              <div className="relative ml-3">
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  aria-label="User account menu"
                  aria-haspopup="true"
                  aria-expanded={isAccountMenuOpen}
                  className="flex items-center gap-3 rounded-full border border-brand-blue/20 bg-brand-blue/10 px-4 py-2 text-sm font-black text-[#062d78] hover:bg-brand-blue/20 transition-all"
                >
                  {/* Green pulse dot signals active session */}
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  {/* Display name from user_metadata, fall back to email prefix */}
                  {user.user_metadata?.full_name || user.email?.split("@")[0]}
                  <ChevronDown
                    className={cx(
                      "h-4 w-4 transition-transform",
                      isAccountMenuOpen ? "rotate-180" : "",
                    )}
                  />
                </button>

                {/* ── Account Dropdown Menu ─────────────────────────────────── */}
                <AnimatePresence>
                  {isAccountMenuOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5"
                        role="menu"
                        aria-label="User Account Menu"
                      >
                        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Account
                        </div>
                        {/* Log out action */}
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          role="menuitem"
                          aria-label="Log out of account"
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <LogOut className="w-4 h-4" />
                          {isLoggingOut ? "Logging out" : "Log out"}
                        </button>
                        <div className="my-1 h-px bg-slate-100" />
                        {/* Delete account action — red text signals destructive intent */}
                        <button
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            handleDeleteAccount();
                          }}
                          role="menuitem"
                          aria-label="Permanently delete account"
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Account
                        </button>
                      </motion.div>
                      {/* Invisible backdrop to dismiss the dropdown on outside click */}
                      <div
                        className="fixed inset-0 z-[-1]"
                        onClick={() => setIsAccountMenuOpen(false)}
                      />
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </nav>

          {/* ── Mobile Menu Toggle ──────────────────────────────────────── */}
          {/* Only rendered on screens narrower than the md breakpoint */}
          <button
            className="md:hidden rounded-xl border border-brand-blue/20 bg-brand-blue/10 px-3 py-2 text-sm font-black text-[#062d78] flex items-center gap-2"
            onClick={() => setIsOpen((s) => !s)}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            aria-label={isOpen ? "Close main menu" : "Open main menu"}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span className="sr-only">{isOpen ? "Close" : "Menu"}</span>
          </button>
        </div>
      </Container>

      {/* ── Mobile Drawer ─────────────────────────────────────────────────── */}
      {/* Slides down below the header on small screens, auto-closes on route change */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            id="mobile-navigation"
            role="navigation"
            aria-label="Mobile Navigation"
            className="md:hidden overflow-hidden border-t border-brand-blue/15 bg-white/65 backdrop-blur"
          >
            <Container className="py-3">
              <div className="flex flex-col gap-1">
                {/* Mobile nav links — same destinations as the desktop nav */}
                <NavLink to="/" className="rounded-xl px-3 py-3 text-sm text-slate-700 hover:bg-brand-gold/15" end>Home</NavLink>
                <NavLink to="/browse" className="rounded-xl px-3 py-3 text-sm text-slate-700 hover:bg-brand-gold/15">Browse</NavLink>
                <NavLink to="/submit" className="rounded-xl px-3 py-3 text-sm text-slate-700 hover:bg-brand-gold/15">Submit</NavLink>
                <NavLink to="/citations" className="rounded-xl px-3 py-3 text-sm text-slate-700 hover:bg-brand-gold/15">Citations</NavLink>

                <button
                  type="button"
                  onClick={() => goHomeAndScroll("faq")}
                  aria-label="Frequently Asked Questions"
                  className="rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-700 hover:bg-brand-gold/15"
                >
                  FAQ
                </button>

                {/* Admin-only link to the claims dashboard */}
                {isAuthed && isAdmin && (
                  <NavLink
                    to="/claims"
                    className="rounded-xl px-3 py-3 text-sm font-bold text-brand-orange hover:bg-brand-gold/15"
                  >
                    Claims Dashboard
                  </NavLink>
                )}

                <div className="my-1 border-t border-brand-blue/10"></div>

                {/* Accessibility widget in mobile drawer — full-width button style */}
                <AccessibilityWidget className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-blue/20 bg-brand-blue/5 px-3 py-3 text-sm font-bold text-[#062d78] hover:bg-brand-blue/10 transition-colors" />

                {/* ── Mobile Auth Actions ──────────────────────────────────── */}
                {!isAuthed ? (
                  <div className="mt-2 grid gap-2">
                    <NavLink to="/login" className="rounded-xl border border-brand-orange/15 bg-white/60 px-3 py-3 text-center text-sm font-medium text-slate-900">
                      Log in
                    </NavLink>
                    <NavLink to="/signup" className="rounded-xl bg-brand-orange px-3 py-3 text-center text-sm font-medium text-white">
                      Sign up
                    </NavLink>
                  </div>
                ) : (
                  <div className="mt-2 grid gap-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      aria-label="Log out of account"
                      className="rounded-xl border border-brand-blue/15 bg-white/60 px-3 py-3 text-center text-sm font-medium text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoggingOut ? "Logging out" : "Log out"}
                    </button>
                    {/* Destructive action: red background to signal danger */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        handleDeleteAccount();
                      }}
                      aria-label="Permanently delete account"
                      className="rounded-xl bg-red-50 px-3 py-3 text-center text-sm font-bold text-red-500"
                    >
                      Delete Account
                    </button>
                  </div>
                )}
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
