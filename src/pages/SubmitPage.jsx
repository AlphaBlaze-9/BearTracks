// SubmitPage.jsx: Login-gated form for reporting a lost or found item.
// Users choose between "Lost" and "Found" status, fill in item details, optionally
// upload a photo, and submit the report to Supabase. After insertion, an AI matching
// function is triggered asynchronously to look for similar items in the database.
// Rapid demo-submission buttons are available for testing the matching algorithm.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Container from "../components/Container.jsx";
import Section from "../components/Section.jsx";
import ImagePicker from "../components/ImagePicker.jsx";
import MotionReveal from "../components/MotionReveal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useItems } from "../context/ItemsContext.jsx";
import { supabase } from "../lib/supabase";
import { moderateFields } from "../lib/moderation";
import ti84Img from "../images/ti-84.jpg";
import hoodieImg from "../images/black hoodie.webp";


// Available category options for the item category dropdown
const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Water Bottle",
  "Accessories",
  "Books",
  "Other",
];

export default function SubmitPage() {
  const navigate = useNavigate();

  // Authenticated user — required since this page is protected by ProtectedRoute
  const { user } = useAuth();

  // refreshItems forces the global item list to resync with Supabase after a new insert
  const { refreshItems } = useItems();

  // ── Form Field State ──
  const [status, setStatus] = useState("Lost");         // "Lost" or "Found" toggle
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState(""); // Base64 preview URL for the UI
  const [rawFile, setRawFile] = useState(null);         // Original File object for Supabase Storage upload

  // ── Async Submission State ──
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ─────────────────────────────────────────────────────────────
  //  submitExample — Rapid Demo Submissions
  //  Inserts a pre-defined lost or found item with a bundled image
  //  to quickly demonstrate the AI matching algorithm during FBLA judging.
  //  Four presets: calc-lost, calc-found, hoodie-lost, hoodie-found
  // ─────────────────────────────────────────────────────────────
  async function submitExample(type) {
    if (loading) return;
    setLoading(true);
    setError("");

    // Select the metadata template based on the demo type
    let itemData = {};

    if (type === "calc-lost") {
      itemData = {
        title: "TI-84 Plus Calculator",
        description: "Gray TI-84 Plus calculator. Lost it in the library.",
        category: "Electronics",
        type: "Lost",
        location: "Library",
        date_incident: new Date().toISOString().split("T")[0],
      };
    } else if (type === "calc-found") {
      itemData = {
        title: "Gray Calculator",
        description: "Found a TI-84 calculator on a table.",
        category: "Electronics",
        type: "Found",
        location: "Library",
        date_incident: new Date().toISOString().split("T")[0],
      };
    } else if (type === "hoodie-lost") {
      itemData = {
        title: "Black Nike Hoodie",
        description: "Black pullover hoodie with a small tear on the sleeve.",
        category: "Clothing",
        type: "Lost",
        location: "Gym",
        date_incident: new Date().toISOString().split("T")[0],
      };
    } else if (type === "hoodie-found") {
      itemData = {
        title: "Black Hoodie",
        description: "Found a black hoodie in the locker room.",
        category: "Clothing",
        type: "Found",
        location: "Gym",
        date_incident: new Date().toISOString().split("T")[0],
      };
    }

    try {
      // Attempt to upload the bundled demo image to Supabase Storage
      let imageUrl = null;
      try {
        // Pick the correct local asset based on the demo type
        const imgPath = type.includes("calc") ? ti84Img : hoodieImg;
        const res = await fetch(imgPath);
        const blob = await res.blob();
        const file = new File(
          [blob],
          type.includes("calc") ? "ti-84.jpg" : "black_hoodie.webp",
          { type: blob.type },
        );

        // Generate a random filename and upload under the user's ID folder
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user?.id || "test-user"}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("lost-found-photos")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Retrieve the public URL for the uploaded image to store in the database row
        const { data: publicUrlData } = supabase.storage
          .from("lost-found-photos")
          .getPublicUrl(filePath);
        imageUrl = publicUrlData.publicUrl;
      } catch (uploadErr) {
        // Image upload failure is non-fatal for demo submissions — log and continue
        console.error("Failed to upload example image:", uploadErr);
      }

      // Insert the item record into the Supabase database
      const { data, error: dbError } = await supabase
        .from("lost_found_items")
        .insert([
          {
            ...itemData,
            image_url: imageUrl,
            user_id: user.id || "test-user",
            submitter_name:
              user.user_metadata?.full_name || user.email || "Test User",
          },
        ])
        .select();

      if (dbError) throw dbError;

      // Force the global item list to refresh so the new post appears immediately
      await refreshItems();

      // Fire-and-forget AI matching trigger — does not block the success redirect
      if (data && data[0] && data[0].id) {
        const FN_URL = "/.netlify/functions/match-items";
        fetch(FN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newItemId: data[0].id }),
        }).catch((err) => console.error("Matching trigger failed:", err));
      }

      // Show success state and redirect to the browse page after 1.5 seconds
      setSuccess(true);
      setTimeout(() => {
        navigate("/browse");
        setSuccess(false);
        setLoading(false);
      }, 1500);
    } catch (err) {
      console.error("Example submission error:", err);
      setError(err.message);
      setLoading(false);
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  uploadImage — Uploads a file to Supabase Storage
  //  Returns the public URL of the uploaded image, or null if no file was provided.
  //  Uses a random filename to avoid conflicts across multiple submissions.
  // ─────────────────────────────────────────────────────────────
  async function uploadImage(file) {
    if (!file) return null;

    // Build a unique file path: <userId>/<random>.<extension>
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Upload to the "lost-found-photos" storage bucket
    const { error: uploadError } = await supabase.storage
      .from("lost-found-photos")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Fetch and return the permanent public URL for use in the database row
    const { data } = supabase.storage
      .from("lost-found-photos")
      .getPublicUrl(filePath);
    return data.publicUrl;
  }

  // ─────────────────────────────────────────────────────────────
  //  onSubmit — Primary form submission handler
  //  Steps: validate → moderate → upload image → insert row → refresh → match → redirect
  // ─────────────────────────────────────────────────────────────
  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic field validation — title and description are required
    if (!title.trim()) {
      setLoading(false);
      return setError("Please add a title.");
    }
    if (!description.trim()) {
      setLoading(false);
      return setError("Please add a description.");
    }

    // Step 0: Run the content moderation check on all user-typed text fields
    const { flagged, reason } = await moderateFields([
      { label: "Title", value: title },
      { label: "Description", value: description },
      { label: "Location", value: location },
    ]);
    // Block the submission if any field was flagged and show the reason to the user
    if (flagged) {
      setLoading(false);
      return setError(reason);
    }

    try {
      // Step 1: Upload the selected image to Supabase Storage (if one was chosen)
      let imageUrl = null;
      if (rawFile) {
        imageUrl = await uploadImage(rawFile);
      }

      // Step 2: Insert the new item record into the `lost_found_items` Supabase table
      const { data, error: dbError } = await supabase
        .from("lost_found_items")
        .insert([
          {
            title: title.trim(),
            description: description.trim(),
            category,
            type: status,                                    // Maps "Lost"/"Found" to the `type` column
            location: location.trim(),
            date_incident: date.trim() || null,             // Optional field — null if not provided
            image_url: imageUrl,
            user_id: user.id,
            submitter_name: user.user_metadata?.full_name || user.email,
          },
        ])
        .select();

      if (dbError) throw dbError;

      // Step 3: Refresh the global item list so the new post appears in browse immediately
      await refreshItems();

      // Step 4: Trigger the AI matching Netlify function asynchronously.
      // We fire-and-forget here so the user is not waiting on the matching result.
      if (data && data[0] && data[0].id) {
        const FN_URL = "/.netlify/functions/match-items";
        fetch(FN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newItemId: data[0].id }),
        }).catch((err) => console.error("Matching trigger failed:", err));
      }

      // Step 5: Show the success screen and redirect to browse after 2 seconds
      setSuccess(true);
      setTimeout(() => {
        navigate("/browse");
      }, 2000);
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Full-screen success interstitial ──
  // Renders instead of the form while the redirect countdown is running
  if (success) {
    return (
      <div className="min-h-screen bg-hero flex items-center justify-center p-6">
        <MotionReveal>
          <div className="text-center card p-12 bg-brand-blue/10 backdrop-blur-3xl border border-brand-blue/30 shadow-2xl rounded-[3rem]">
            {/* Large green checkmark signals successful submission */}
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-[2rem] bg-green-500 text-white text-5xl mb-8 shadow-xl shadow-green-500/30">
              ✓
            </div>
            <h2 className="text-4xl font-extrabold text-[#062d78] mb-3">
              Item Reported!
            </h2>
            <p className="text-lg text-[#083796] font-bold tracking-tight">
              Redirecting you to the browse page...
            </p>
          </div>
        </MotionReveal>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero pt-20">
      <Section className="pt-6 pb-10 sm:pt-10 sm:pb-16 text-center">
        <Container>
          <div className="mx-auto max-w-xl">

            {/* ── Page Header ── */}
            <MotionReveal>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Report an <span className="text-brand-blue">item</span>
              </h1>
              {/* Display the logged-in user's name or email as a confirmation they're authenticated */}
              <p className="mt-3 text-base text-slate-700 font-medium">
                You're signed in as{" "}
                <span className="font-bold text-brand-blue">
                  {user.user_metadata?.full_name || user.email}
                </span>
                .
              </p>
            </MotionReveal>

            {/* ── Demo Rapid-Submit Buttons ── */}
            {/* Four presets that each insert a complete item with an image for FBLA judging demos */}
            <MotionReveal delay={0.05}>
              <div className="mt-6 mb-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <button
                  onClick={() => submitExample("calc-lost")}
                  className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                >
                  Example: Lost Calc
                </button>
                <button
                  onClick={() => submitExample("calc-found")}
                  className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                >
                  Example: Found Calc
                </button>
                <button
                  onClick={() => submitExample("hoodie-lost")}
                  className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                >
                  Example: Lost Hoodie
                </button>
                <button
                  onClick={() => submitExample("hoodie-found")}
                  className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                >
                  Example: Found Hoodie
                </button>
              </div>
            </MotionReveal>

            {/* ── Main Submission Form Card ── */}
            <MotionReveal delay={0.1}>
              <div className="mt-8 card overflow-hidden border border-brand-blue/20 p-1 shadow-2xl bg-gradient-to-br from-brand-blue/20 via-transparent to-brand-gold/15">
                <div className="bg-brand-blue/5 backdrop-blur-2xl rounded-[20px] p-7 sm:p-9 text-left">

                  {/* ── Status Toggle (Lost / Found) ── */}
                  {/* Two equal-width buttons act as a toggle — the active one fills with brand-blue */}
                  <div className="flex gap-3 mb-8">
                    {["Lost", "Found"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={
                          "flex-1 rounded-xl py-4 text-xs font-extrabold border transition-all transform active:scale-[0.98] " +
                          (status === s
                            ? "border-brand-blue bg-brand-blue text-white shadow-xl shadow-brand-blue/30 scale-[1.01]"
                            : "border-brand-blue/20 bg-brand-blue/5 text-[#083796] hover:bg-brand-blue/15 hover:text-[#062d78]")
                        }
                      >
                        {s === "Lost"
                          ? "I Lost Something"
                          : "I Found Something"}
                      </button>
                    ))}
                  </div>

                  {/* ── Item Details Form ── */}
                  <form className="grid gap-6" onSubmit={onSubmit}>
                    <div className="grid gap-6 sm:grid-cols-2">

                      {/* Title — full-width on all screen sizes */}
                      <div className="sm:col-span-2">
                        <label htmlFor="submit-title" className="text-sm font-bold text-slate-700 ml-1">
                          Title
                        </label>
                        <input
                          id="submit-title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g., Calculator, AirPods case, Hoodie"
                          className="mt-2 input-field"
                          required
                        />
                      </div>

                      {/* Description — full-width textarea for identifying details */}
                      <div className="sm:col-span-2">
                        <label htmlFor="submit-description" className="text-sm font-bold text-slate-700 ml-1">
                          Description
                        </label>
                        <textarea
                          id="submit-description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Add identifying details (color, brand, stickers, etc.)"
                          rows={4}
                          className="mt-2 input-field resize-none"
                          required
                        />
                      </div>

                      {/* Category dropdown — maps to the CATEGORIES constant defined above */}
                      <div>
                        <label htmlFor="submit-category" className="text-sm font-bold text-slate-700 ml-1">
                          Category
                        </label>
                        <select
                          id="submit-category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="mt-2 select-field h-[54px] font-bold text-slate-700"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Location — optional field, stored as a plain text string */}
                      <div>
                        <label htmlFor="submit-location" className="text-sm font-bold text-slate-700 ml-1">
                          Location (optional)
                        </label>
                        <input
                          id="submit-location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Library, Gym, Hallway…"
                          className="mt-2 input-field"
                        />
                      </div>

                      {/* Date — optional, stored as a string; placeholder changes based on Lost/Found status */}
                      <div>
                        <label htmlFor="submit-date" className="text-sm font-bold text-slate-700 ml-1">
                          Date (optional)
                        </label>
                        <input
                          id="submit-date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          placeholder={
                            status === "Found"
                              ? "When was it found?"
                              : "When was it lost?"
                          }
                          className="mt-2 input-field"
                        />
                      </div>
                    </div>

                    {/* ── Photo Upload ── */}
                    {/* ImagePicker provides a drag-and-drop or click-to-browse interface */}
                    <div className="mt-2" role="group" aria-label="Upload photos">
                      <label id="submit-photos" className="text-sm font-bold text-slate-700 ml-1">
                        Photos
                      </label>
                      <div className="mt-2" aria-labelledby="submit-photos">
                        {/* `onChange` updates the local preview URL; `onFileSelect` stores the raw file for upload */}
                        <ImagePicker
                          value={imageDataUrl}
                          onChange={setImageDataUrl}
                          onFileSelect={setRawFile}
                        />
                      </div>
                    </div>

                    {/* Inline error alert — shown for validation failures, moderation flags, or API errors */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 font-medium"
                      >
                        {error}
                      </motion.div>
                    )}

                    {/* Submit button — animates on hover/tap; shows a spinner while the async steps run */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={loading}
                      className="mt-4 rounded-2xl bg-brand-blue px-6 py-5 text-sm font-extrabold text-white shadow-xl shadow-brand-blue/30 hover:bg-brand-blue-dark transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        // Spinner + label shown while the upload and database insert are in progress
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Submitting...
                        </span>
                      ) : (
                        // Dynamic label — matches the selected Lost/Found status
                        `Submit ${status} report`
                      )}
                    </motion.button>
                  </form>
                </div>
              </div>
            </MotionReveal>
          </div>
        </Container>
      </Section>
    </div>
  );
}
