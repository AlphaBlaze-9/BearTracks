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
import ti84Img from "../images/ti-84.jpg";
import hoodieImg from "../images/black hoodie.webp";

/**
 * SubmitPage
 * ----------
 * Login-gated page for submitting lost/found items.
 */

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
  const { user } = useAuth();
  const { refreshItems } = useItems();

  const [status, setStatus] = useState("Lost");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState(""); // For local preview
  const [rawFile, setRawFile] = useState(null); // For Supabase upload
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Quick submission for testing matching algorithm
  async function submitExample(type) {
    if (loading) return;
    setLoading(true);
    setError("");

    let itemData = {};

    // Define example data
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
      let imageUrl = null;
      try {
        const imgPath = type.includes("calc") ? ti84Img : hoodieImg;
        const res = await fetch(imgPath);
        const blob = await res.blob();
        const file = new File(
          [blob],
          type.includes("calc") ? "ti-84.jpg" : "black_hoodie.webp",
          { type: blob.type },
        );

        // uploadImage uses user.id, let's gracefully fallback if absent
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user?.id || "test-user"}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("lost-found-photos")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("lost-found-photos")
          .getPublicUrl(filePath);
        imageUrl = publicUrlData.publicUrl;
      } catch (uploadErr) {
        console.error("Failed to upload example image:", uploadErr);
      }

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

      await refreshItems();

      // Trigger matching
      if (data && data[0] && data[0].id) {
        const FN_URL = "/.netlify/functions/match-items";
        fetch(FN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newItemId: data[0].id }),
        }).catch((err) => console.error("Matching trigger failed:", err));
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/browse");
        // Reset success state after navigation so if they come back it's clean (though it unmounts usually)
        setSuccess(false);
        setLoading(false);
      }, 1500);
    } catch (err) {
      console.error("Example submission error:", err);
      setError(err.message);
      setLoading(false);
    }
  }

  async function uploadImage(file) {
    if (!file) return null;
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("lost-found-photos")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("lost-found-photos")
      .getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!title.trim()) {
      setLoading(false);
      return setError("Please add a title.");
    }
    if (!description.trim()) {
      setLoading(false);
      return setError("Please add a description.");
    }

    try {
      // 1. Upload image if present
      let imageUrl = null;
      if (rawFile) {
        imageUrl = await uploadImage(rawFile);
      }

      // 2. Insert into database
      const { data, error: dbError } = await supabase
        .from("lost_found_items")
        .insert([
          {
            title: title.trim(),
            description: description.trim(),
            category,
            type: status, // Mapping 'Lost'/'Found' status to 'type' column
            location: location.trim(),
            date_incident: date.trim() || null,
            image_url: imageUrl,
            user_id: user.id,
            submitter_name: user.user_metadata?.full_name || user.email,
          },
        ])
        .select();

      if (dbError) throw dbError;

      // 3. Refresh global items list to ensure the new item is present
      await refreshItems();

      // 4. Trigger AI Matching (Async - don't await blocking the UI)
      // We fire and forget, or we could await if we want to ensure it started.
      // Ideally, a background trigger is better, but client-side invocation is requested.
      if (data && data[0] && data[0].id) {
        const FN_URL = "/.netlify/functions/match-items";
        fetch(FN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newItemId: data[0].id }),
        }).catch((err) => console.error("Matching trigger failed:", err));
      }

      // 5. Success feedback
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

  if (success) {
    return (
      <div className="min-h-screen bg-hero flex items-center justify-center p-6">
        <MotionReveal>
          <div className="text-center card p-12 bg-brand-blue/10 backdrop-blur-3xl border border-brand-blue/30 shadow-2xl rounded-[3rem]">
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
            <MotionReveal>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Report an <span className="text-brand-blue">item</span>
              </h1>
              <p className="mt-3 text-base text-slate-700 font-medium">
                You’re signed in as{" "}
                <span className="font-bold text-brand-blue">
                  {user.user_metadata?.full_name || user.email}
                </span>
                .
              </p>
            </MotionReveal>

            {/* DEV TOOLS: Rapid Submission Buttons */}
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

            <MotionReveal delay={0.1}>
              <div className="mt-8 card overflow-hidden border border-brand-blue/20 p-1 shadow-2xl bg-gradient-to-br from-brand-blue/20 via-transparent to-brand-gold/15">
                <div className="bg-brand-blue/5 backdrop-blur-2xl rounded-[20px] p-7 sm:p-9 text-left">
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

                  <form className="grid gap-6" onSubmit={onSubmit}>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">
                          Title
                        </label>
                        <input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g., Calculator, AirPods case, Hoodie"
                          className="mt-2 input-field"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">
                          Description
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Add identifying details (color, brand, stickers, etc.)"
                          rows={4}
                          className="mt-2 input-field resize-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-slate-700 ml-1">
                          Category
                        </label>
                        <select
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

                      <div>
                        <label className="text-sm font-bold text-slate-700 ml-1">
                          Location (optional)
                        </label>
                        <input
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Library, Gym, Hallway…"
                          className="mt-2 input-field"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-slate-700 ml-1">
                          Date (optional)
                        </label>
                        <input
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

                    <div className="mt-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">
                        Photos
                      </label>
                      <div className="mt-2">
                        <ImagePicker
                          value={imageDataUrl}
                          onChange={setImageDataUrl}
                          onFileSelect={setRawFile}
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 font-medium"
                      >
                        {error}
                      </motion.div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={loading}
                      className="mt-4 rounded-2xl bg-brand-blue px-6 py-5 text-sm font-extrabold text-white shadow-xl shadow-brand-blue/30 hover:bg-brand-blue-dark transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Submitting...
                        </span>
                      ) : (
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
