// ItemCard.jsx: Displays a single lost/found item as a card in the Browse grid.
// Shows the item photo (or a placeholder), its status badge (Lost / Found),
// an optional AI match percentage badge (for the item owner), the title, description,
// category, and a link to the full detail page. Admins and item owners also see a
// delete button in the photo overlay, wired to the DeleteItemModal confirmation dialog.

import { useState } from "react";
import { Link } from "react-router-dom";
import { EyeIcon, TagIcon, TrashIcon } from "./Icons.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useItems } from "../context/ItemsContext.jsx";
import DeleteItemModal from "./DeleteItemModal.jsx";


// ── PlaceholderImage ──────────────────────────────────────────────────────────
// Renders when an item has no uploaded photo. The box emoji + label keeps the
// card height consistent with photo cards so the browse grid stays visually even.
function PlaceholderImage() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-100/50">
      <div className="text-center">
        <div className="text-4xl">📦</div>
        <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          No photo yet
        </div>
      </div>
    </div>
  );
}

// ── ItemCard ──────────────────────────────────────────────────────────────────
// Props:
//   item — a mapped item object from ItemsContext (camelCase fields)
export default function ItemCard({ item }) {
  const { user, isAdmin } = useAuth();
  const { deleteItem } = useItems();

  // Modal visibility and in-flight deletion state for the delete flow
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // canDelete: the trash icon and DeleteItemModal are only shown to the item's
  // original submitter or any admin — regular users cannot delete others' items.
  const isOwner = user && user.id === item.user_id;
  const canDelete = isAdmin || isOwner;

  // handleDelete: calls ItemsContext.deleteItem which removes the DB record and
  // cleans up the image from Supabase Storage before closing the modal.
  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteItem(item);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to delete item:", err);
      alert("Failed to delete item. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      {/* ── Card Shell ─────────────────────────────────────────────────── */}
      <div className="item-card group overflow-hidden bg-white hover:shadow-xl transition-all duration-300">

        {/* ── Photo Area ──────────────────────────────────────────────── */}
        <div className="item-card__image overflow-hidden relative">
          {item.imageDataUrl ? (
            // Lazy-load the image to avoid blocking the initial page render
            <img
              src={item.imageDataUrl}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <PlaceholderImage />
          )}

          {/* ── Delete Button Overlay (admin / owner only) ───────────── */}
          {/* e.preventDefault() stops the wrapping Link from navigating when trash is clicked */}
          {canDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsModalOpen(true);
              }}
              aria-label={isAdmin ? "Delete as Admin" : "Delete your item"}
              className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-2xl bg-white/90 text-red-500 shadow-lg backdrop-blur hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"
              title={isAdmin ? "Delete as Admin" : "Delete your item"}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}

          {/* ── Status Badge + AI Match Badge ───────────────────────── */}
          <div className="absolute left-4 bottom-4 flex gap-2">
            {/* Status: green for "Found", brand-blue for "Lost" */}
            <span
              className={
                "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm " +
                (item.status === "Found"
                  ? "bg-green-500 text-white"
                  : "bg-brand-blue text-white")
              }
            >
              {item.status}
            </span>

            {/* AI Match badge: only shown on Lost items with potential matches,
                and only to the item's owner (so other users don't see score data) */}
            {item.status === "Lost" && item.potential_matches && item.potential_matches.length > 0 && isOwner && (
              <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm bg-brand-orange text-white">
                {Math.round((item.potential_matches[0].score || 0) * 100)}% Match
              </span>
            )}
          </div>
        </div>

        {/* ── Card Body ───────────────────────────────────────────────── */}
        <div className="p-6">
          {/* Title */}
          <div className="text-xl font-bold tracking-tight text-slate-900">
            {item.title}
          </div>

          {/* Description capped at 2 lines so cards stay the same height in the grid */}
          <p className="mt-2 line-clamp-2 text-sm text-slate-600 leading-relaxed">
            {item.description}
          </p>

          {/* ── Footer Row: Category + Details Link ─────────────────── */}
          <div className="mt-6 flex items-center justify-between">
            {/* Category tag with icon */}
            <div className="flex items-center gap-2 text-slate-500">
              <TagIcon className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">
                {item.category || "Other"}
              </span>
            </div>

            {/* Details link navigates to the ItemDetailsPage for this item */}
            <Link
              to={`/items/${item.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100 transition-all"
            >
              Details
            </Link>
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ────────────────────────────────── */}
      {/* Rendered outside the card so it isn't clipped by the card's overflow:hidden */}
      <DeleteItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        itemTitle={item.title}
      />
    </>
  );
}
