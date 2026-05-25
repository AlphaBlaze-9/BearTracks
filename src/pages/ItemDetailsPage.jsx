import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Search, Sparkles, Package, User, X } from "lucide-react";
import Container from "../components/Container.jsx";
import Section from "../components/Section.jsx";
import MotionReveal from "../components/MotionReveal.jsx";
import { useItems } from "../context/ItemsContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * ItemDetailsPage
 * ---------------
 * One item, bigger photo, and the full details.
 */

export default function ItemDetailsPage() {
  const { id } = useParams();
  const { getItem, addClaim } = useItems();
  const { user, isAuthed } = useAuth();
  const item = getItem(id);

  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const { claims } = useItems();
  const hasClaimed = claims.some(
    (c) => String(c.itemId) === String(item?.id) && c.userId === user?.id,
  );

  const [claimData, setClaimData] = useState({
    name: "",
    sNumber: "",
    gradeLevel: "",
    description: "",
  });

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
          {/* AI Match Banner - Only for "Lost" items */}
          {item.status === "Lost" &&
            item.potential_matches &&
            item.potential_matches.length > 0 && (
              <MotionReveal>
                <div className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand-blue via-brand-orange to-brand-blue p-1 shadow-2xl shadow-brand-blue/20">
                  <div className="relative bg-white/95 backdrop-blur-3xl rounded-[1.8rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
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
                      {item.potential_matches[0].reasons &&
                        item.potential_matches[0].reasons.length > 0 && (
                          <p className="text-xs font-semibold text-slate-400 mt-1">
                            Based on:{" "}
                            {item.potential_matches[0].reasons.join(", ")}
                          </p>
                        )}
                    </div>
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

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            {/* Left Column: Image */}
            <div className="w-full lg:w-[42%]">
              <MotionReveal>
                <Link
                  to="/browse"
                  className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 rounded-2xl bg-brand-orange border border-brand-orange text-xs font-black text-white shadow-lg shadow-brand-orange/20 hover:bg-brand-gold hover:border-brand-gold hover:text-white transition-all group w-fit"
                >
                  <span className="transform transition-transform group-hover:-translate-x-1 text-lg leading-none">
                    ←
                  </span>
                  <span>Back to browse</span>
                </Link>
                <div className="card overflow-hidden border border-brand-blue/20 shadow-2xl bg-brand-blue/10 backdrop-blur-xl p-2.5">
                  <div className="aspect-[4/5] w-full rounded-[1.75rem] overflow-hidden bg-brand-blue/5">
                    {item.imageDataUrl ? (
                      <img
                        src={item.imageDataUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
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

            {/* Right Column: Details */}
            <div className="w-full lg:w-[54%] pt-2 lg:pt-8">
              <MotionReveal delay={0.1}>
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
                  <span className="text-[10px] font-bold text-slate-400">
                    ID: #{item.id.toString().slice(-6)}
                  </span>
                </div>

                <h1 className="text-4xl font-black tracking-tight text-[#062d78] sm:text-5xl">
                  {item.title}
                </h1>
                <p className="mt-4 text-base text-[#083796] font-bold leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.75rem] border border-brand-blue/20 bg-brand-blue/10 backdrop-blur-xl p-5 shadow-lg">
                    <div className="text-[10px] font-black text-[#01143a]/40 uppercase tracking-widest">
                      Category
                    </div>
                    <div className="mt-1 text-xl font-black text-[#062d78]">
                      {item.category || "Other"}
                    </div>
                  </div>

                  {(item.location || item.date || item.submitter_name) && (
                    <div className="sm:col-span-2 rounded-[1.75rem] border border-brand-blue/20 bg-brand-blue/10 backdrop-blur-xl p-5 shadow-lg">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                        Extra details
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
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

                {isAuthed ? (
                  hasClaimed ? (
                    <div className="mt-8 p-1 rounded-[1.75rem] border-none bg-gradient-to-r from-red-500 via-orange-500 to-red-500 shadow-2xl shadow-red-500/20 group overflow-hidden relative">
                      <div className="bg-white rounded-[1.5rem] p-6 text-center shadow-inner">
                        <h3 className="text-xl font-black text-red-600">
                          Claim Already Filed
                        </h3>
                        <p className="mt-2 text-sm text-slate-500 font-bold tracking-wide leading-relaxed">
                          You have already submitted a claim for this item.
                          Check your notifications for status updates!
                        </p>
                      </div>
                    </div>
                  ) : (
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
              </MotionReveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* Claim Modal */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01143a]/80 backdrop-blur-sm">
          <MotionReveal>
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 w-full max-w-[28rem] shadow-[0_0_50px_rgba(6,45,120,0.5)] relative border-2 border-brand-blue/10">
              <button
                type="button"
                onClick={() => setIsClaimModalOpen(false)}
                className="absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full bg-brand-blue/5 text-[#062d78] hover:bg-brand-orange hover:text-white transition-all group cursor-pointer shadow-sm"
              >
                <X className="w-4 h-4" strokeWidth={3} />
              </button>

              {success ? (
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
                      await addClaim(item.id, {
                        ...claimData,
                        userId: user?.id,
                      });
                      setSuccess(true);
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
                    className="space-y-4"
                  >
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

                    <div>
                      <label className="block text-[10px] font-black text-[#01143a]/50 uppercase tracking-[0.1em] mb-1.5 pl-1">
                        Grade Level
                      </label>
                      <div className="relative">
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

                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      <button
                        type="button"
                        onClick={async () => {
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
                      <button
                        type="submit"
                        className="w-full sm:w-1/2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-orange px-6 py-4 text-sm font-black text-white shadow-xl shadow-brand-blue/20 hover:shadow-2xl hover:shadow-brand-blue/30 transition-all transform hover:-translate-y-1 cursor-pointer"
                      >
                        Submit Claim Request
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
