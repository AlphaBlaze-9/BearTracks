import { useAuth } from "../context/AuthContext.jsx";
import { useItems } from "../context/ItemsContext.jsx";
import Container from "../components/Container.jsx";
import Section from "../components/Section.jsx";
import MotionReveal from "../components/MotionReveal.jsx";
import { Link, Navigate } from "react-router-dom";
import { ShieldCheck, User, Search, CheckCircle, XCircle } from "lucide-react";

export default function AdminClaimsPage() {
  const { isAuthed, isAdmin } = useAuth();
  const { claims, resolveClaim, getItem } = useItems();

  // Guard: Redirect if not logged in or not admin
  if (!isAuthed || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const pendingClaims = claims.filter((c) => c.status === "Pending");
  const resolvedClaims = claims.filter((c) => c.status !== "Pending");

  return (
    <div className="min-h-screen bg-hero pb-20">
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

      <Section className="pt-0 -mt-10 sm:-mt-16 relative z-10">
        <Container>
          <div className="flex flex-col gap-12">
            {/* Pending Claims Section */}
            <div>
              <h2 className="text-2xl font-black text-[#062d78] mb-6 flex items-center gap-3">
                Action Required{" "}
                <span className="bg-brand-orange text-white text-xs px-2.5 py-1 rounded-full">
                  {pendingClaims.length}
                </span>
              </h2>

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
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pendingClaims.map((claim) => {
                    const linkedItem = getItem(claim.itemId);
                    return (
                      <MotionReveal key={claim.id} className="h-full">
                        <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-brand-blue/5 border border-slate-100 flex flex-col h-full hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full blur-3xl -mr-10 -mt-10" />

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
                            <div className="h-10 w-10 flex shrink-0 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange">
                              <User className="w-5 h-5" />
                            </div>
                          </div>

                          <div className="bg-slate-50 rounded-2xl p-4 mb-4 flex-grow border border-slate-100/50">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                              Claim Rationale
                            </p>
                            <p className="text-sm font-semibold text-slate-700 leading-relaxed italic">
                              "{claim.description}"
                            </p>
                          </div>

                          <div className="bg-brand-blue/5 rounded-2xl p-4 mb-6 border border-brand-blue/10 flex items-center gap-4">
                            {linkedItem ? (
                              <>
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
                              <p className="text-xs font-bold text-red-500 py-3">
                                Item deleted or unavailable
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-auto">
                            <button
                              onClick={() => resolveClaim(claim.id, "Denied")}
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

            {/* Resolved History */}
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
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 ${claim.status === "Approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                          >
                            {claim.status}
                          </span>
                          <p className="font-black text-[#062d78]">
                            {claim.name} • {claim.sNumber}
                          </p>
                          <p className="text-xs font-medium text-slate-500 line-clamp-1 mt-1">
                            "{claim.description}"
                          </p>
                        </div>
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
    </div>
  );
}
