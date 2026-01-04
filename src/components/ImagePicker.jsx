import { useRef } from 'react'
import { CameraIcon } from './Icons.jsx'

/**
 * ImagePicker
 * -----------
 * Handles image upload + preview.
 *
 * We store the image as a data URL (base64) so the app can remain backend-free.
 * Later you can swap this to upload to S3/Cloudinary/etc.
 */

export default function ImagePicker({ value, onChange, onFileSelect }) {
  const inputRef = useRef(null)

  function handleFile(file) {
    if (!file) return

    // 1. Pass the raw file object to the parent for Supabase upload
    if (onFileSelect) onFileSelect(file)

    // 2. Local preview using base64 (remains unchanged for UI logic)
    const reader = new FileReader()
    reader.onload = () => onChange(String(reader.result || ''))
    reader.readAsDataURL(file)
  }

  function handleRemove() {
    onChange('')
    if (onFileSelect) onFileSelect(null)
  }

  return (
    <div>
      <div className="text-sm font-medium">Photo</div>
      <p className="mt-1 text-xs text-slate-600">
        Optional, but recommended. Photos make items easier to recognize.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-[200px,1fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="aspect-[4/3] w-full bg-slate-100">
            {value ? (
              <img src={value} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue text-white">
                    <CameraIcon className="h-6 w-6" />
                  </div>
                  <div className="mt-2 text-xs text-slate-500">No photo yet</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-2xl bg-brand-blue px-4 py-3 text-sm font-medium text-white hover:bg-brand-blue-dark"
          >
            Upload photo
          </button>

          {value && (
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              Remove
            </button>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      </div>
    </div>
  )
}
