// ImagePicker.jsx: Photo upload and preview component for the Submit Item form.
// Handles two parallel tasks when the user picks a file:
//   1. Passes the raw File object to the parent via `onFileSelect` for Supabase Storage upload.
//   2. Generates a base64 data URL via FileReader and passes it to `onChange` for the
//      local image preview (so the user sees their photo instantly without waiting for upload).
// The hidden <input type="file"> is programmatically clicked via a ref so the visible
// button can be styled freely — native file inputs are notoriously hard to style consistently.

import { useRef } from "react";
import { CameraIcon } from "./Icons.jsx";

// Props:
//   value        — base64 data URL of the currently selected image (empty string = no selection)
//   onChange     — called with the new data URL (or empty string when removed)
//   onFileSelect — called with the raw File object (or null when removed); used for Supabase upload
export default function ImagePicker({ value, onChange, onFileSelect }) {
  // inputRef: programmatic reference to the hidden <input type="file"> element
  const inputRef = useRef(null);

  // handleFile: processes a selected file by running both data paths in parallel.
  function handleFile(file) {
    if (!file) return;

    // Path 1: Pass the raw File to the parent for direct Supabase Storage upload
    if (onFileSelect) onFileSelect(file);

    // Path 2: Read the file as a base64 data URL for immediate local preview.
    // FileReader.onload fires asynchronously once the read completes.
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  // handleRemove: clears both the preview data URL and the pending file reference
  function handleRemove() {
    onChange("");
    if (onFileSelect) onFileSelect(null);
  }

  return (
    <div>
      {/* ── Field Label ────────────────────────────────────────────────── */}
      <div className="text-sm font-medium">Photo</div>
      <p className="mt-1 text-xs text-slate-600">
        Optional, but recommended. Photos make items easier to recognize.
      </p>

      {/* ── Preview + Controls ──────────────────────────────────────────── */}
      {/* Two-column layout on sm+: left = preview thumbnail, right = action buttons */}
      <div className="mt-3 grid gap-3 sm:grid-cols-[200px,1fr]">

        {/* Image preview container — maintains a fixed 4:3 aspect ratio */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="aspect-[4/3] w-full bg-slate-100">
            {value ? (
              // Show the selected image as an object-cover thumbnail
              <img
                src={value}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              // Empty-state placeholder with the camera icon
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue text-white">
                    <CameraIcon className="h-6 w-6" />
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    No photo yet
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons column */}
        <div className="flex flex-col gap-2">
          {/* Upload button: clicking it triggers the hidden file input */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label="Upload photo"
            className="rounded-2xl bg-brand-blue px-4 py-3 text-sm font-medium text-white hover:bg-brand-blue-dark"
          >
            Upload photo
          </button>

          {/* Remove button: only shown once an image has been selected */}
          {value && (
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove photo"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              Remove
            </button>
          )}

          {/* Hidden file input — accept="image/*" restricts the file picker to images only */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            aria-label="File upload"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      </div>
    </div>
  );
}
