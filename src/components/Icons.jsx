// Icons.jsx: Centralized icon exports for BearTracks.
// All lucide-react icons used across components are aliased here so that
// swapping icon libraries only requires changes in one file, not every component.
// Each export wraps the lucide icon with a default className that fits our UI scale.

import { Tag, Eye, Camera, Trash2, ChevronUp } from "lucide-react";

// ── TagIcon ──────────────────────────────────────────────────────────────────
// Used on ItemCard to display the item's category label.
export function TagIcon({ className = "h-5 w-5" }) {
  return <Tag className={className} />;
}

// ── EyeIcon ──────────────────────────────────────────────────────────────────
// Used on ItemCard's "Details" link to signal that clicking opens the full view.
export function EyeIcon({ className = "h-5 w-5" }) {
  return <Eye className={className} />;
}

// ── CameraIcon ───────────────────────────────────────────────────────────────
// Used in ImagePicker's empty-state placeholder to prompt the user to upload a photo.
export function CameraIcon({ className = "h-5 w-5" }) {
  return <Camera className={className} />;
}

// ── TrashIcon ────────────────────────────────────────────────────────────────
// Used in ItemCard's delete button and in the DeleteItemModal / DeleteAccountModal.
export function TrashIcon({ className = "h-5 w-5" }) {
  return <Trash2 className={className} />;
}

// ── ChevronUpIcon ────────────────────────────────────────────────────────────
// Used in BackToTop to indicate the scroll direction when the button is visible.
export function ChevronUpIcon({ className = "h-5 w-5" }) {
  return <ChevronUp className={className} />;
}
