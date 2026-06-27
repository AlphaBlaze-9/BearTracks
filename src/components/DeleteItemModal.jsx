// DeleteItemModal.jsx: Confirmation dialog for permanently deleting a lost/found item.
// Shown when the item owner or an admin clicks the trash icon on an ItemCard or detail view.
// The deletion is handled by the parent via the onConfirm callback — this component is
// purely presentational and manages no async state of its own.

import { motion, AnimatePresence } from "framer-motion";
import { TrashIcon } from "./Icons";

// Props:
//   isOpen    — controls visibility
//   onClose   — called when the user dismisses via backdrop click or Cancel button
//   onConfirm — called when the user confirms; parent is responsible for the async deleteItem call
//   loading   — true while the delete request is in flight; disables all buttons
//   itemTitle — the item's name, shown in the dialog body so the user knows what they're deleting
export default function DeleteItemModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  itemTitle,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ─────────────────────────────────────────────────
              Blurred, dark overlay. Clicking it dismisses without deleting. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* ── Modal Panel ───────────────────────────────────────────────
              Centered card that slides and scales in for a polished feel. */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md pointer-events-auto overflow-hidden rounded-3xl bg-slate-900 border border-white/10 shadow-2xl"
            >
              <div className="p-8 text-center">

                {/* ── Warning Icon ────────────────────────────────────── */}
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10 text-red-500">
                  <TrashIcon className="h-10 w-10" />
                </div>

                {/* ── Headline ────────────────────────────────────────── */}
                <h2 className="text-2xl font-bold text-white">Delete Item?</h2>

                {/* ── Description ─────────────────────────────────────── */}
                {/* The item title is highlighted in white so the user clearly
                    sees exactly what will be permanently removed */}
                <p className="mt-4 text-slate-400 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="text-white font-semibold">
                    "{itemTitle}"
                  </span>
                  ? This action is permanent and cannot be undone.
                </p>

                {/* ── Action Buttons ───────────────────────────────────── */}
                <div className="mt-10 grid gap-3">
                  {/* Confirm delete — red to communicate destructive intent */}
                  <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex items-center justify-center rounded-2xl bg-red-500 px-6 py-4 text-sm font-bold text-white hover:bg-red-600 transition-all disabled:opacity-50 shadow-lg shadow-red-500/20"
                  >
                    {loading ? "Deleting" : "Yes, Delete Item"}
                  </button>

                  {/* Cancel — dismisses without taking any action */}
                  <button
                    onClick={onClose}
                    disabled={loading}
                    aria-label="Cancel deletion"
                    className="rounded-2xl bg-white/5 px-6 py-4 text-sm font-bold text-white hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
