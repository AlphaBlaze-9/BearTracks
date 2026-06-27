// ItemDetailsPage.jsx: Full detail view for a single lost or found item.
// Reads the item ID from the URL params, fetches it from ItemsContext, and renders
// the item photo, metadata, and two interactive panels:
//   1. Claim Panel — authenticated users can submit an ownership claim for review.
//   2. Inquiry Panel — authenticated users can send a question about the item.
// If the item ID does not exist in the store, a "not found" fallback is shown instead.

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Search, Sparkles, Package, User, X, MessageCircle } from "lucide-react";
import Container from "../components/Container.jsx";
import Section from "../components/Section.jsx";
import MotionReveal from "../components/MotionReveal.jsx";
import { useItems } from "../context/ItemsContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { moderateFields } from "../lib/moderation.js";


export default function ItemDetailsPage() {
  // Extract the item ID from the URL (e.g. /items/:id)
  const { id } = useParams();

  // Pull item lookup, claim submission, and the full claims list from ItemsContext
  const { getItem, addClaim } = useItems();
  const { user, isAuthed } = useAuth();

  // Resolve the item object by ID — returns undefined if the item has been removed
  const item = getItem(id);

  // ── Claim Modal State ──
  // Controls the claim submission modal visibility, success/error feedback, and loading state
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [claimSubmitting, setClaimSubmitting] = useState(false);

  // ── Inquiry Modal State ──
  // Controls the "Ask a Question" modal and tracks the question text input
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryText, setInquiryText] = useState("");
  const [inquirySubmitting, setInquirySubmitting] = useState(false);

  // Check whether the currently authenticated user has already filed a claim on this item
  const { claims } = useItems();
  const userClaim = claims.find(
    (c) => String(c.itemId) === String(item?.id) && c.userId === user?.id,
  );
  const hasClaimed = !!userClaim;

  // Controlled form state for the four claim fields
  const [claimData, setClaimData] = useState({
    name: "",
    sNumber: "",
    gradeLevel: "",
    description: "",
  });

  // ── Item Not Found Fallback ──
  // Shown when the item has been deleted or the URL is incorrect
  if (!item) {
    return (
      <div className="min-h-screen bg-hero">
        <Section className="pt-24 pb-12">
          <Container>
            <MotionReveal>
              <div className="mx-auto max-w-md card p-12 text-center bg-brand-blue/10 backdrop-blur-3xl border border-brand-blue/30 shadow-2xl rounded-[3rem]">
                <Search
                  className="w-20 h-20 text-slate-300 mx-auto mb-6"
                  strokeWidth={1.5}
                />
                <h2 className="text-3xl font-black text-[#062d78] tracking-tight">
                  Item not found
                </h2>
                <p className="mt-3 text-[#083796] font-bold">
                  This item may have been removed or the link is incorrect.
                </p>
                <Link
                  to="/browse"
                  className="mt-8 inline-flex rounded-2xl bg-brand-blue px-8 py-4 text-sm font-bold text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-dark transition-all"
                >
                  Back to browse
                </Link>
              </div>
            </MotionReveal>
          </Container>
        </Section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero">
      <Section className="pt-16 sm:pt-20 pb-10">
        <Container>

          {/* ── AI Match Banner ── */}
          {/* Only visible for "Lost" items that have AI-suggested matches AND are owned by the current user */}
          {item.status === "Lost" &&
            item.potential_matches &&
            item.potential_matches.length > 0 &&
            user &&
            user.id === item.user_id && (
              <MotionReveal>
                <div className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand-blue via-brand-orange to-brand-blue p-1 shadow-2xl shadow-brand-blue/20">
                  <div className="relative bg-white/95 backdrop-blur-3xl rounded-[1.8rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                    {/* Sparkle icon signals an AI-generated result */}
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-blue/10 text-4xl">
                      <Sparkles
                        className="w-8 h-8 text-brand-blue"
                        fill="currentColor"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                        <h3 className="text-xl font-black text-[#062d78]">
                          Possible Match Detected!
                        </h3>
                        {/* Match confidence score as a percentage, derived from the cosine similarity score */}
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-black text-green-700 border border-green-200">
                          {Math.round(
                            (item.potential_matches[0].score || 0) * 100,
                          )}
                          % Match
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-600">
                        Our Algorithm found an item that looks similar:{" "}
                        <span className="text-[#083796]">
                          "{item.potential_matches[0].title}"
                        </span>
                      </p>
                      {/* Show the semantic reasons the algorithm flagged this as a match */}
                      {item.potential_matches[0].reasons &&
                        item.potential_matches[0].reasons.length > 0 && (
                          <p className="text-xs font-semibold text-slate-400 mt-1">
                            Based on:{" "}
                            {item.potential_matches[0].reasons.join(", ")}
                          </p>
                        )}
                    </div>
                    {/* CTA button to navigate directly to the matched item's detail page */}
                    <Link
                      to={`/items/${item.potential_matches[0].id}`}
                      className="shrink-0 rounded-xl bg-brand-blue px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-dark transition-all transform hover:scale-105"
                    >
                      View Match
                    </Link>
                  </div>
                </div>
              </MotionReveal>
            )}

          {/* ── Two-Column Layout: Image | Details ── */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">

            {/* ── Left Column: Item Photo ── */}
            <div className="w-full lg:w-[42%]">
              <MotionReveal>
                {/* Back to browse button — prominent and accessible */}
                <Link
                  to="/browse"
                  className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 rounded-2xl bg-brand-orange border border-brand-orange text-xs font-black text-white shadow-lg shadow-brand-orange/20 hover:bg-brand-gold hover:border-brand-gold hover:text-white transition-all group w-fit"
                >
                  <span className="transform transition-transform group-hover:-translate-x-1 text-lg leading-none">
                    ←
                  </span>
                  <span>Back to browse</span>
                </Link>

                {/* Photo container — 4:5 aspect ratio for a portrait-style item photo */}
                <div className="card overflow-hidden border border-brand-blue/20 shadow-2xl bg-brand-blue/10 backdrop-blur-xl p-2.5">
                  <div className="aspect-[4/5] w-full rounded-[1.75rem] overflow-hidden bg-brand-blue/5">
                    {item.imageDataUrl ? (
                      // Render the uploaded image if one exists
                      <img
                        src={item.imageDataUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      // Fallback placeholder when no photo was submitted with the report
                      <div className="flex h-full w-full items-center justify-center bg-slate-100">
                        <div className="text-center grayscale opacity-30">
                          <Package
                            className="w-24 h-24 mx-auto mb-4"
                            strokeWidth={1}
                          />
                          <div className="text-sm font-bold uppercase tracking-widest">
                            No photo uploaded
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </MotionReveal>
            </div>

            {/* ── Right Column: Item Details + Action Panels ── */}
            <div className="w-full lg:w-[54%] pt-2 lg:pt-8">
              <MotionReveal delay={0.1}>

                {/* Status badge (Lost/Found), short ID, and optional AI match percentage */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={
                      "rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] shadow-sm " +
                      (item.status === "Found"
                        ? "bg-green-500 text-white shadow-green-500/20"
                        : "bg-brand-blue text-white shadow-brand-blue/20")
                    }
                  >
                    {item.status}
                  </span>
                  {/* Truncated item ID displayed as a reference number */}
                  <span className="text-[10px] font-bold text-slate-400">
                    ID: #{item.id.toString().slice(-6)}
                  </span>
                  {/* Secondary match percentage badge — only shown for the item owner */}
                  {item.status === "Lost" && item.potential_matches && item.potential_matches.length > 0 && user && user.id === item.user_id && (
                    <span className="rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] shadow-sm bg-brand-orange text-white shadow-brand-orange/20">
                      {Math.round((item.potential_matches[0].score || 0) * 100)}% Match
                    </span>
                  )}
                </div>

                {/* Item title and description — the core content block */}
                <h1 className="text-4xl font-black tracking-tight text-[#062d78] sm:text-5xl">
                  {item.title}
                </h1>
                <p className="mt-4 text-base text-[#083796] font-bold leading-relaxed">
                  {item.description}
                </p>

                {/* ── Metadata Grid ── */}
                {/* Shows category, location, date, and submitter name when available */}
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {/* Category chip — always present */}
                  <div className="rounded-[1.75rem] border border-brand-blue/20 bg-brand-blue/10 backdrop-blur-xl p-5 shadow-lg">
                    <div className="text-[10px] font-black text-[#01143a]/40 uppercase tracking-widest">
                      Category
                    </div>
                    <div className="mt-1 text-xl font-black text-[#062d78]">
                      {item.category || "Other"}
                    </div>
                  </div>

                  {/* Optional extra details block — only rendered when at least one extra field is populated */}
                  {(item.location || item.date || item.submitter_name) && (
                    <div className="sm:col-span-2 rounded-[1.75rem] border border-brand-blue/20 bg-brand-blue/10 backdrop-blur-xl p-5 shadow-lg">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                        Extra details
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {/* Location where the item was lost or found */}
                        {item.location && (
                          <div className="flex items-start gap-3">
                            <div className="mt-1 h-5 w-5 bg-brand-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <div className="h-2 w-2 bg-brand-blue rounded-full" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-[#01143a]/40 uppercase tracking-[0.05em]">
                                Location
                              </span>
                              <span className="text-[#062d78] font-black">
                                {item.location}
                              </span>
                            </div>
                          </div>
                        )}
                        {/* Date when the item was lost or found */}
                        {item.date && (
                          <div className="flex items-start gap-3">
                            <div className="mt-1 h-5 w-5 bg-brand-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <div className="h-2 w-2 bg-brand-orange rounded-full" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-[#01143a]/40 uppercase tracking-[0.05em]">
                                Date
                              </span>
                              <span className="text-[#062d78] font-black">
                                {item.date}
                              </span>
                            </div>
                          </div>
                        )}
                        {/* Name of the student who submitted the report */}
                        {item.submitter_name && (
                          <div className="flex items-start gap-3 sm:col-span-2">
                            <div className="mt-1 h-5 w-5 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-3 h-3 text-indigo-600" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-[#01143a]/40 uppercase tracking-[0.05em]">
                                Submitted By
                              </span>
                              <span className="text-[#062d78] font-black">
                                {item.submitter_name}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Claim Panel ── */}
                {/* Three states: authenticated+claimed, authenticated+not claimed, unauthenticated */}
                {isAuthed ? (
                  hasClaimed ? (
                    // Show the current claim status if the user has already filed one
                    <div className={`mt-8 p-1 rounded-[1.75rem] border-none shadow-2xl group overflow-hidden relative bg-gradient-to-r ${
                      userClaim.status === "Approved" ? "from-green-500 via-emerald-500 to-green-500 shadow-green-500/20" :
                      userClaim.status === "Denied" ? "from-red-500 via-rose-500 to-red-500 shadow-red-500/20" :
                      "from-slate-400 via-slate-500 to-slate-400 shadow-slate-500/20"
                    }`}>
                      <div className="bg-white rounded-[1.5rem] p-6 text-center shadow-inner">
                        <h3 className={`text-xl font-black ${
                          userClaim.status === "Approved" ? "text-green-600" :
                          userClaim.status === "Denied" ? "text-red-600" :
                          "text-slate-700"
                        }`}>
                          Claim Status: {userClaim.status}
                        </h3>
                        {/* Pending — the claim is awaiting admin review */}
                        {userClaim.status === "Pending" && (
                          <p className="mt-2 text-sm text-slate-500 font-bold tracking-wide leading-relaxed">
                            You have already submitted a claim for this item.
                            Check your notifications for status updates!
                          </p>
                        )}
                        {/* Approved — the admin has verified ownership; student should collect from the front office */}
                        {userClaim.status === "Approved" && (
                          <p className="mt-2 text-sm text-green-600 font-bold tracking-wide leading-relaxed">
                            Your claim was approved! Please pick up the item at the Front Office.
                          </p>
                        )}
                        {/* Denied — the admin rejected the claim, optionally with a reason */}
                        {userClaim.status === "Denied" && (
                          <>
                            <p className="mt-2 text-sm text-red-600 font-bold tracking-wide leading-relaxed">
                              Unfortunately, your claim request was denied.
                            </p>
                            {/* Display the admin's denial reason if one was provided */}
                            {userClaim.denialReason && (
                              <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3 text-left">
                                <span className="block text-[10px] font-black text-red-800 uppercase tracking-widest mb-1">Reason for Denial:</span>
                                <span className="text-sm font-bold text-red-700">{userClaim.denialReason}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    // "Want to claim this?" CTA button — opens the claim submission modal
                    <button
                      onClick={() => setIsClaimModalOpen(true)}
                      className="w-full text-left mt-8 p-1 rounded-[1.75rem] border-none bg-gradient-to-r from-brand-blue via-brand-orange to-brand-blue shadow-2xl shadow-brand-blue/20 group overflow-hidden relative cursor-pointer hover:shadow-brand-orange/20 transition-all transform hover:-translate-y-1"
                    >
                      <div className="bg-brand-blue/95 backdrop-blur-3xl rounded-[1.5rem] p-6 transition-all group-hover:bg-transparent flex flex-col items-center text-center">
                        <h3 className="text-xl font-black text-white group-hover:text-white transition-colors">
                          Want to claim this?
                        </h3>
                        <p className="mt-2 text-sm text-brand-orange font-bold group-hover:text-white/90 transition-colors tracking-wide">
                          Click here to submit a claim request.
                        </p>
                      </div>
                    </button>
                  )
                ) : (
                  // Unauthenticated fallback — prompt the user to log in before claiming
                  <div className="mt-8 p-1 rounded-[1.75rem] bg-gradient-to-r from-slate-300 to-slate-400 group overflow-hidden relative">
                    <div className="bg-slate-50 rounded-[1.5rem] p-6 text-center">
                      <h3 className="text-xl font-black text-slate-400">
                        Log in to claim
                      </h3>
                      <p className="mt-2 text-sm text-slate-500 font-bold">
                        You must be signed in to submit a claim request.
                      </p>
                      <Link
                        to="/login"
                        className="mt-4 inline-block rounded-xl bg-slate-200 px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-300 transition-colors"
                      >
                        Go to Login
                      </Link>
                    </div>
                  </div>
                )}

                {/* ── Inquiry Button ── */}
                {/* Only shown to authenticated users — opens the "Ask a Question" modal */}
                {isAuthed && (
                  <button
                    onClick={() => setIsInquiryModalOpen(true)}
                    className="w-full text-left mt-4 p-1 rounded-[1.75rem] border-2 border-brand-blue/10 bg-white shadow-xl shadow-brand-blue/5 group overflow-hidden relative cursor-pointer hover:border-brand-blue/30 transition-all transform hover:-translate-y-1"
                  >
                    <div className="rounded-[1.5rem] p-5 flex items-center justify-center gap-4 text-center">
                      {/* Message circle icon — animates to brand blue fill on hover */}
                      <div className="h-12 w-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="text-lg font-black text-[#062d78]">
                          Have a Question?
                        </h3>
                        <p className="text-xs text-slate-500 font-bold mt-0.5">
                          Ask us for more details about this item.
                        </p>
                      </div>
                    </div>
                  </button>
                )}
              </MotionReveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ══════════════════════════════════════════════ */}
      {/*  INQUIRY MODAL                                 */}
      {/* ══════════════════════════════════════════════ */}
      {/* Full-screen overlay modal — collects and sends a question about the item */}
      {isInquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01143a]/80 backdrop-blur-sm">
          <MotionReveal>
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 w-full max-w-[28rem] shadow-[0_0_50px_rgba(6,45,120,0.5)] relative border-2 border-brand-blue/10">
              {/* Close button — dismisses the modal without saving */}
              <button
                type="button"
                onClick={() => setIsInquiryModalOpen(false)}
                className="absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full bg-brand-blue/5 text-[#062d78] hover:bg-brand-orange hover:text-white transition-all group cursor-pointer shadow-sm"
              >
                <X className="w-4 h-4" strokeWidth={3} />
              </button>

              {inquirySuccess ? (
                // ── Inquiry Success State ── shown after the simulated API call resolves
                <div className="text-center py-8">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-brand-blue text-white mb-6 shadow-xl shadow-brand-blue/30">
                    <MessageCircle className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-[#062d78] mb-2 tracking-tight">
                    Question Sent!
                  </h2>
                  <p className="text-sm text-slate-500 font-bold px-4">
                    We'll get back to you with an answer soon.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-[#062d78] mb-1">
                    Ask a Question
                  </h2>
                  <p className="text-sm font-bold text-slate-500 mb-6">
                    What would you like to know about this item?
                  </p>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setInquirySubmitting(true);

                      // Simulate a network request — replace with a real Supabase insert when ready
                      await new Promise((resolve) => setTimeout(resolve, 800));

                      setInquirySubmitting(false);
                      setInquirySuccess(true);
                      // Auto-close the modal 3 seconds after showing the success state
                      setTimeout(() => {
                        setIsInquiryModalOpen(false);
                        setInquirySuccess(false);
                        setInquiryText("");
                      }, 3000);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-[10px] font-black text-[#01143a]/50 uppercase tracking-[0.1em] mb-1.5 pl-1">
                        Your Question
                      </label>
                      {/* Controlled textarea — the submit button is disabled until this has content */}
                      <textarea
                        required
                        rows="4"
                        value={inquiryText}
                        onChange={(e) => setInquiryText(e.target.value)}
                        className="w-full rounded-2xl border-2 border-brand-blue/10 bg-brand-blue/5 px-4 py-3 text-sm text-[#062d78] font-black focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all resize-none placeholder:text-slate-400/70"
                        placeholder="e.g. Is there a name written on the back?"
                      ></textarea>
                    </div>

                    <div className="mt-6">
                      {/* Disabled when submitting or when the textarea is empty */}
                      <button
                        type="submit"
                        disabled={inquirySubmitting || !inquiryText.trim()}
                        className="w-full rounded-xl bg-gradient-to-r from-brand-blue to-brand-orange px-6 py-4 text-sm font-black text-white shadow-xl shadow-brand-blue/20 hover:shadow-2xl hover:shadow-brand-blue/30 transition-all transform hover:-translate-y-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {inquirySubmitting ? "Sending…" : "Send Question"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </MotionReveal>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/*  CLAIM SUBMISSION MODAL                        */}
      {/* ══════════════════════════════════════════════ */}
      {/* Full-screen overlay — collects student details and runs content moderation before saving */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01143a]/80 backdrop-blur-sm">
          <MotionReveal>
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 w-full max-w-[28rem] shadow-[0_0_50px_rgba(6,45,120,0.5)] relative border-2 border-brand-blue/10">
              {/* Close button — dismisses the modal and resets form state */}
              <button
                type="button"
                onClick={() => setIsClaimModalOpen(false)}
                className="absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full bg-brand-blue/5 text-[#062d78] hover:bg-brand-orange hover:text-white transition-all group cursor-pointer shadow-sm"
              >
                <X className="w-4 h-4" strokeWidth={3} />
              </button>

              {success ? (
                // ── Claim Success State ── shown after a successful claim submission
                <div className="text-center py-8">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-green-500 text-white text-4xl mb-6 shadow-xl shadow-green-500/30">
                    <span className="leading-none pt-1 pr-0.5">✓</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-[#062d78] mb-2 tracking-tight">
                    Claim Sent!
                  </h2>
                  <p className="text-sm text-slate-500 font-bold px-4">
                    We've received your request and will review it shortly.
                    Check your notifications for updates.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-[#062d78] mb-1">
                    Claim this item
                  </h2>
                  <p className="text-sm font-bold text-slate-500 mb-6">
                    Please provide your details to verify ownership.
                  </p>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setClaimError("");
                      setClaimSubmitting(true);

                      // Run content moderation on the free-text fields before persisting
                      const { flagged, reason } = await moderateFields([
                        { label: "Name", value: claimData.name },
                        {
                          label: "Description",
                          value: claimData.description,
                        },
                      ]);
                      // Block the submission if any field was flagged by the moderation API
                      if (flagged) {
                        setClaimError(reason);
                        setClaimSubmitting(false);
                        return;
                      }

                      // Persist the claim to Supabase via the ItemsContext helper
                      await addClaim(item.id, {
                        ...claimData,
                        userId: user?.id,
                      });
                      setClaimSubmitting(false);
                      setSuccess(true);
                      // Auto-close the modal 3 seconds after showing the success state
                      setTimeout(() => {
                        setIsClaimModalOpen(false);
                        setSuccess(false);
                        setClaimError("");
                        setClaimData({
                          name: "",
                          sNumber: "",
                          gradeLevel: "",
                          description: "",
                        });
                      }, 3000);
                    }}
                    className="space-y-4"
                  >
                    {/* Student full name — used by the admin to verify identity */}
                    <div>
                      <label className="block text-[10px] font-black text-[#01143a]/50 uppercase tracking-[0.1em] mb-1.5 pl-1">
                        Student Name
                      </label>
                      <input
                        type="text"
                        required
                        value={claimData.name}
                        onChange={(e) =>
                          setClaimData({ ...claimData, name: e.target.value })
                        }
                        className="w-full rounded-2xl border-2 border-brand-blue/10 bg-brand-blue/5 px-4 py-3 text-sm text-[#062d78] font-black focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all placeholder:text-slate-400/70"
                        placeholder="e.g. John Doe"
                      />
                    </div>

                    {/* Student ID number — the "S-Number" used by Bridgeland High School */}
                    <div>
                      <label className="block text-[10px] font-black text-[#01143a]/50 uppercase tracking-[0.1em] mb-1.5 pl-1">
                        S-Number (ID)
                      </label>
                      <input
                        type="text"
                        required
                        value={claimData.sNumber}
                        onChange={(e) =>
                          setClaimData({
                            ...claimData,
                            sNumber: e.target.value,
                          })
                        }
                        className="w-full rounded-2xl border-2 border-brand-blue/10 bg-brand-blue/5 px-4 py-3 text-sm text-[#062d78] font-black focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all placeholder:text-slate-400/70"
                        placeholder="e.g. S123456"
                      />
                    </div>

                    {/* Grade level — helps the admin match the claimant to school records */}
                    <div>
                      <label className="block text-[10px] font-black text-[#01143a]/50 uppercase tracking-[0.1em] mb-1.5 pl-1">
                        Grade Level
                      </label>
                      <div className="relative">
                        {/* Custom-styled select — appearance-none removes the native arrow, replaced by an SVG chevron */}
                        <select
                          required
                          value={claimData.gradeLevel}
                          onChange={(e) =>
                            setClaimData({
                              ...claimData,
                              gradeLevel: e.target.value,
                            })
                          }
                          className="w-full rounded-2xl border-2 border-brand-blue/10 bg-brand-blue/5 px-4 py-3 text-sm text-[#062d78] font-black focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all appearance-none cursor-pointer"
                        >
                          <option value="" disabled>
                            Select Grade
                          </option>
                          <option value="9">9th Grade</option>
                          <option value="10">10th Grade</option>
                          <option value="11">11th Grade</option>
                          <option value="12">12th Grade</option>
                          <option value="Staff">Staff / Faculty</option>
                        </select>
                        {/* Custom dropdown chevron icon — pointer-events-none so it doesn't intercept clicks */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#062d78]">
                          <svg
                            className="fill-current h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Description / proof of ownership — moderated for inappropriate content */}
                    <div>
                      <label className="block text-[10px] font-black text-[#01143a]/50 uppercase tracking-[0.1em] mb-1.5 pl-1">
                        Description / Proof
                      </label>
                      <textarea
                        required
                        rows="3"
                        value={claimData.description}
                        onChange={(e) =>
                          setClaimData({
                            ...claimData,
                            description: e.target.value,
                          })
                        }
                        className="w-full rounded-2xl border-2 border-brand-blue/10 bg-brand-blue/5 px-4 py-3 text-sm text-[#062d78] font-black focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all resize-none placeholder:text-slate-400/70"
                        placeholder="Explain why this is yours (e.g. details, unique marks, when you lost it)"
                      ></textarea>
                    </div>

                    {/* Moderation or submission error — displayed when the API returns an error */}
                    {claimError && (
                      <div
                        role="alert"
                        className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 font-bold"
                      >
                        {claimError}
                      </div>
                    )}

                    {/* ── Action Buttons ── */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      {/* Demo Submit — populates and submits a pre-filled claim for FBLA judging */}
                      <button
                        type="button"
                        onClick={async () => {
                          // Pre-filled demo data for quick demonstration during evaluation
                          const demoData = {
                            name: "Samarth Muralidhara",
                            sNumber: "124515",
                            gradeLevel: "11",
                            description:
                              "I think this calculator is mine because my friends can vouch for me, and I've downloaded chem- related apps on it.",
                          };
                          await addClaim(item.id, {
                            ...demoData,
                            userId: user?.id,
                          });
                          setSuccess(true);
                          // Auto-close and reset the modal after the success state is shown
                          setTimeout(() => {
                            setIsClaimModalOpen(false);
                            setSuccess(false);
                            setClaimData({
                              name: "",
                              sNumber: "",
                              gradeLevel: "",
                              description: "",
                            });
                          }, 3000);
                        }}
                        className="w-full sm:w-1/2 rounded-xl bg-slate-200 px-6 py-4 text-sm font-black text-slate-700 hover:bg-slate-300 transition-all transform hover:-translate-y-1 cursor-pointer"
                      >
                        Demo Submit
                      </button>
                      {/* Real submit — disabled while moderation and database insert are in progress */}
                      <button
                        type="submit"
                        disabled={claimSubmitting}
                        className="w-full sm:w-1/2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-orange px-6 py-4 text-sm font-black text-white shadow-xl shadow-brand-blue/20 hover:shadow-2xl hover:shadow-brand-blue/30 transition-all transform hover:-translate-y-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {claimSubmitting ? "Checking…" : "Submit Claim Request"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </MotionReveal>
        </div>
      )}
    </div>
  );
}
