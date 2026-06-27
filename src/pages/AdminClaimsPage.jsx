// AdminClaimsPage.jsx: Admin-only dashboard for reviewing and resolving student ownership claims.
// Admins can approve or deny pending claim requests submitted by students across the platform.
// Access is restricted via an auth guard — non-admins are silently redirected to the home page.

import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useItems } from "../context/ItemsContext.jsx";
import Container from "../components/Container.jsx";
import Section from "../components/Section.jsx";
import MotionReveal from "../components/MotionReveal.jsx";
import { Link, Navigate } from "react-router-dom";
import { ShieldCheck, User, Search, CheckCircle, XCircle } from "lucide-react";

export default function AdminClaimsPage() {
  // Pull authentication state and admin flag from the global AuthContext
  const { isAuthed, isAdmin } = useAuth();

  // Pull the full claims list, the resolve handler, and item lookup utility from ItemsContext
  const { claims, resolveClaim, getItem } = useItems();

  // Denial modal state — tracks which claim is being denied and the admin's written reason
  const [denyModalOpen, setDenyModalOpen] = useState(false);
  const [claimToDeny, setClaimToDeny] = useState(null);
  const [denialReason, setDenialReason] = useState("");

  // Open the denial modal for a specific claim and reset the reason textarea
  const handleDenyClick = (claimId) => {
    setClaimToDeny(claimId);
    setDenialReason("");
    setDenyModalOpen(true);
  };

  // Validate the reason field before committing the denial — empty submissions are blocked
  const submitDenial = () => {
    if (!denialReason.trim()) {
      alert("Please provide a reason for denial.");
      return;
    }
    // Persist the denied status and reason text via the context helper
    resolveClaim(claimToDeny, "Denied", denialReason);
    // Close and reset the modal state after a successful submission
    setDenyModalOpen(false);
    setClaimToDeny(null);
  };

  // Guard: Redirect non-authenticated or non-admin users back to the home page
  if (!isAuthed || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Partition the full claims list into two buckets for the two display sections below
  const pendingClaims = claims.filter((c) => c.status === "Pending");
  const resolvedClaims = claims.filter((c) => c.status !== "Pending");

  return (
    <div className="min-h-screen bg-hero pb-20">

      {/* ── Page Header ── */}
      {/* Frosted glass hero card with a shield icon and descriptive subtitle */}
      <Section className="pt-10 sm:pt-14 pb-0">
        <Container>
          <MotionReveal>
            <div className="max-w-3xl mx-auto rounded-[2rem] border border-brand-blue/20 bg-brand-blue/5 backdrop-blur-2xl p-5 sm:p-6 text-center shadow-soft mb-8">
              <ShieldCheck
                className="w-10 h-10 text-brand-blue mx-auto mb-3"
                strokeWidth={1.5}
              />
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Claims <span className="text-brand-blue">Workspace</span>
              </h1>
              <p className="mt-2 max-w-2xl mx-auto text-slate-600 font-medium text-sm">
                Review and process submitted claim requests. Approve claims to
                verify ownership and notify the student.
              </p>
            </div>
          </MotionReveal>
        </Container>
      </Section>

      {/* ── Main Content (Pending + Resolved) ── */}
      <Section className="pt-0 -mt-10 sm:-mt-16 relative z-10">
        <Container>
          <div className="flex flex-col gap-12">

            {/* ── Pending Claims Section ── */}
            {/* Displays all claims awaiting an admin decision — each card shows claimant info and action buttons */}
            <div>
              <h2 className="text-2xl font-black text-[#062d78] mb-6 flex items-center gap-3">
                Action Required{" "}
                {/* Orange badge showing the live count of unresolved claims */}
                <span className="bg-brand-orange text-white text-xs px-2.5 py-1 rounded-full">
                  {pendingClaims.length}
                </span>
              </h2>

              {/* Empty state — rendered when the admin has cleared all pending claims */}
              {pendingClaims.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center bg-white">
                  <CheckCircle
                    className="w-12 h-12 text-slate-300 mx-auto mb-4"
                    strokeWidth={1.5}
                  />
                  <p className="text-slate-500 font-bold block">
                    No pending claims! You're all caught up.
                  </p>
                </div>
              ) : (
                // Responsive grid — 1 column on mobile, up to 3 on large screens
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pendingClaims.map((claim) => {
                    // Resolve the item referenced by this claim so we can show its title and thumbnail
                    const linkedItem = getItem(claim.itemId);
                    return (
                      <MotionReveal key={claim.id} className="h-full">
                        <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-brand-blue/5 border border-slate-100 flex flex-col h-full hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                          {/* Decorative blur glow — adds depth to the top-right corner of the card */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full blur-3xl -mr-10 -mt-10" />

                          {/* Claim header — claimant name, grade level, and student ID number */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 shadow-sm">
                                Claim #{claim.id.slice(-5)}
                              </p>
                              <h3 className="text-xl font-black text-[#062d78]">
                                {claim.name}
                              </h3>
                              <p className="text-xs font-bold text-slate-500 mt-0.5">
                                Grade: {claim.gradeLevel} • ID: {claim.sNumber}
                              </p>
                            </div>
                            {/* User icon badge displayed in the top-right of the card header */}
                            <div className="h-10 w-10 flex shrink-0 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange">
                              <User className="w-5 h-5" />
                            </div>
                          </div>

                          {/* Claim rationale — the student's written justification for ownership */}
                          <div className="bg-slate-50 rounded-2xl p-4 mb-4 flex-grow border border-slate-100/50">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                              Claim Rationale
                            </p>
                            <p className="text-sm font-semibold text-slate-700 leading-relaxed italic">
                              "{claim.description}"
                            </p>
                          </div>

                          {/* Associated item preview — thumbnail, title, and a link to the item detail page */}
                          <div className="bg-brand-blue/5 rounded-2xl p-4 mb-6 border border-brand-blue/10 flex items-center gap-4">
                            {linkedItem ? (
                              <>
                                {/* Item thumbnail — falls back to a placeholder if no image exists */}
                                <img
                                  src={
                                    linkedItem.imageDataUrl ||
                                    "/placeholder.png"
                                  }
                                  className="h-12 w-12 rounded-xl object-cover bg-brand-blue/10"
                                  alt=""
                                />
                                <div>
                                  <p className="text-xs font-bold text-slate-500 mb-0.5">
                                    Associated Item
                                  </p>
                                  <Link
                                    to={`/items/${linkedItem.id}`}
                                    className="text-sm font-black text-brand-blue hover:underline line-clamp-1"
                                  >
                                    {linkedItem.title}
                                  </Link>
                                </div>
                              </>
                            ) : (
                              // The item may have been deleted between when the claim was submitted and now
                              <p className="text-xs font-bold text-red-500 py-3">
                                Item deleted or unavailable
                              </p>
                            )}
                          </div>

                          {/* Action buttons — Deny opens the reason modal, Approve resolves immediately */}
                          <div className="grid grid-cols-2 gap-3 mt-auto">
                            <button
                              onClick={() => handleDenyClick(claim.id)}
                              className="w-full py-3 rounded-xl bg-slate-100 text-slate-500 font-bold hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                              Deny
                            </button>
                            <button
                              onClick={() => resolveClaim(claim.id, "Approved")}
                              className="w-full py-3 rounded-xl bg-brand-blue text-white font-bold hover:bg-brand-blue-dark transition-colors shadow-lg shadow-brand-blue/20"
                            >
                              Approve
                            </button>
                          </div>
                        </div>
                      </MotionReveal>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Resolved Claims History (Activity Log) ── */}
            {/* Read-only table of past claim decisions — shown only when resolved claims exist */}
            {resolvedClaims.length > 0 && (
              <div className="mt-8 border-t border-slate-200 pt-12">
                <h2 className="text-xl font-black text-slate-400 mb-6 flex items-center gap-2 tracking-tight">
                  <Search className="w-5 h-5" /> Activity Log
                </h2>
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {resolvedClaims.map((claim) => (
                      <div
                        key={claim.id}
                        className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div>
                          {/* Color-coded status badge — green for approved, red for denied */}
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 ${claim.status === "Approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                          >
                            {claim.status}
                          </span>
                          <p className="font-black text-[#062d78]">
                            {claim.name} • {claim.sNumber}
                          </p>
                          {/* Truncated rationale — the full text was visible in the claim card above */}
                          <p className="text-xs font-medium text-slate-500 line-clamp-1 mt-1">
                            "{claim.description}"
                          </p>
                        </div>
                        {/* ISO timestamp formatted to the user's local timezone */}
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-slate-400 font-bold">
                            {new Date(claim.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Container>
      </Section>

      {/* ── Denial Reason Modal ── */}
      {/* Overlay modal that forces the admin to supply a written reason before confirming a denial */}
      {denyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01143a]/80 backdrop-blur-sm">
          <MotionReveal>
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 w-full max-w-[28rem] shadow-[0_0_50px_rgba(6,45,120,0.5)] relative border-2 border-brand-blue/10">
              {/* Close (X) button — cancels the denial flow without saving any state */}
              <button
                type="button"
                onClick={() => setDenyModalOpen(false)}
                className="absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full bg-brand-blue/5 text-[#062d78] hover:bg-brand-orange hover:text-white transition-all group cursor-pointer shadow-sm"
              >
                <XCircle className="w-4 h-4" strokeWidth={3} />
              </button>

              <h2 className="text-2xl font-black text-red-600 mb-1">
                Deny Claim
              </h2>
              <p className="text-sm font-bold text-slate-500 mb-6">
                Please provide a reason for denying this claim.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-[#01143a]/50 uppercase tracking-[0.1em] mb-1.5 pl-1">
                    Denial Reason
                  </label>
                  {/* Controlled textarea — submitDenial will alert and abort if this is left blank */}
                  <textarea
                    required
                    rows="3"
                    value={denialReason}
                    onChange={(e) => setDenialReason(e.target.value)}
                    className="w-full rounded-2xl border-2 border-red-100 bg-red-50/50 px-4 py-3 text-sm text-red-900 font-black focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all resize-none placeholder:text-red-300"
                    placeholder="Explain why this claim is being denied..."
                  ></textarea>
                </div>

                {/* Cancel or confirm — Confirm Denial calls submitDenial which validates then persists */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setDenyModalOpen(false)}
                    className="w-full sm:w-1/2 rounded-xl bg-slate-200 px-6 py-4 text-sm font-black text-slate-700 hover:bg-slate-300 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitDenial}
                    className="w-full sm:w-1/2 rounded-xl bg-red-500 px-6 py-4 text-sm font-black text-white shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all cursor-pointer"
                  >
                    Confirm Denial
                  </button>
                </div>
              </div>
            </div>
          </MotionReveal>
        </div>
      )}
    </div>
  );
}
