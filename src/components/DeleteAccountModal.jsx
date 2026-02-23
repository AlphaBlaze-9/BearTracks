import { motion, AnimatePresence } from "framer-motion";
import { TrashIcon } from "./Icons";

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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md pointer-events-auto overflow-hidden rounded-3xl bg-slate-900 border border-white/10 shadow-2xl"
            >
              <div className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10 text-red-500">
                  <TrashIcon className="h-10 w-10" />
                </div>

                <h2 className="text-2xl font-bold text-white">
                  Delete Account?
                </h2>
                <p className="mt-4 text-slate-400 leading-relaxed">
                  This action is permanent. All your submitted items will be
                  removed from BearTracks and you will be signed out.
                </p>

                <div className="mt-10 grid gap-3">
                  <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex items-center justify-center rounded-2xl bg-red-500 px-6 py-4 text-sm font-bold text-white hover:bg-red-600 transition-all disabled:opacity-50 shadow-lg shadow-red-500/20"
                  >
                    {loading ? "Deleting" : "Yes, Delete My Account"}
                  </button>
                  <button
                    onClick={onClose}
                    disabled={loading}
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
