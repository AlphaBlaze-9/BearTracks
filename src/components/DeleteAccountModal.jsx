// DeleteAccountModal.jsx: Confirmation dialog for permanent account deletion.
// Presented before executing the irreversible `deleteAccount` action from AuthContext.
// The modal uses AnimatePresence so it fades in and out smoothly rather than snapping.
// A dark backdrop is rendered behind the dialog to focus the user's attention.

import { motion, AnimatePresence } from "framer-motion";
import { TrashIcon } from "./Icons";

// Props:
//   isOpen   — controls visibility; AnimatePresence handles the exit animation
//   onClose  — called when the user clicks the backdrop or the "Cancel" button
//   onConfirm — called when the user confirms deletion (triggers the async deleteAccount RPC)
//   loading  — true while the delete request is in flight; disables both action buttons
export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ─────────────────────────────────────────────────
              Semi-transparent overlay that dims the rest of the page.
              Clicking it triggers onClose so the user can easily dismiss. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* ── Modal Panel ───────────────────────────────────────────────
              pointer-events-none on the wrapper lets backdrop clicks pass through;
              pointer-events-auto is restored on the card itself. */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md pointer-events-auto overflow-hidden rounded-3xl bg-slate-900 border border-white/10 shadow-2xl"
            >
              <div className="p-8 text-center">

                {/* ── Warning Icon ────────────────────────────────────── */}
                {/* Red trash icon signals a destructive, irreversible action */}
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10 text-red-500">
                  <TrashIcon className="h-10 w-10" />
                </div>

                {/* ── Headline + Description ───────────────────────────── */}
                <h2 className="text-2xl font-bold text-white">
                  Delete Account?
                </h2>
                <p className="mt-4 text-slate-400 leading-relaxed">
                  This action is permanent. All your submitted items will be
                  removed from BearTracks and you will be signed out.
                </p>

                {/* ── Action Buttons ───────────────────────────────────── */}
                <div className="mt-10 grid gap-3">
                  {/* Confirm: red background signals the danger of this action */}
                  <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex items-center justify-center rounded-2xl bg-red-500 px-6 py-4 text-sm font-bold text-white hover:bg-red-600 transition-all disabled:opacity-50 shadow-lg shadow-red-500/20"
                  >
                    {/* Show a progress label while the RPC call is in flight */}
                    {loading ? "Deleting" : "Yes, Delete My Account"}
                  </button>

                  {/* Cancel: neutral style, also disabled during deletion to prevent race conditions */}
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
