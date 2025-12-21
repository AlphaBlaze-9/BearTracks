import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '../components/Container.jsx'
import Section from '../components/Section.jsx'
import ImagePicker from '../components/ImagePicker.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useItems } from '../context/ItemsContext.jsx'

/**
 * SubmitPage
 * ----------
 * Login-gated page for submitting lost/found items.
 *
 * IMPORTANT (your requirement):
 * - Only signed-in users can submit.
 *   (This route is wrapped with <ProtectedRoute> in App.jsx)
 */

const CATEGORIES = ['Electronics', 'Clothing', 'Water Bottle', 'Accessories', 'Books', 'Other']

export default function SubmitPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addItem } = useItems()

  const [status, setStatus] = useState('Lost')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Electronics')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState('')
  const [error, setError] = useState('')

  function onSubmit(e) {
    e.preventDefault()
    setError('')

    if (!title.trim()) return setError('Please add a title.')
    if (!description.trim()) return setError('Please add a description.')

    const newItem = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      category,
      status,
      // These are optional fields. We keep them in the data model,
      // but we do NOT show them on the browse cards.
      location: location.trim(),
      date: date.trim(),
      imageDataUrl,
      createdAt: Date.now(),
      createdBy: { id: user.id, name: user.name, email: user.email },
    }

    addItem(newItem)
    navigate(`/items/${newItem.id}`)
  }

  return (
    <div className="min-h-screen bg-hero">
      <Section className="pt-10">
        <Container>
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight">Report an item</h1>
            <p className="mt-2 text-sm text-slate-600">
              You’re signed in as <span className="font-medium">{user.name}</span>. Submit a Lost or Found post.
            </p>

            <div className="mt-6 card p-6">
              {/*
                Status toggle
                -------------
                We keep this simple: two buttons that set a "status" state.
              */}
              <div className="flex gap-2">
                {['Lost', 'Found'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={
                      'rounded-full px-4 py-2 text-sm font-medium border ' +
                      (status === s
                        ? 'border-brand-blue bg-brand-blue text-white'
                        : 'border-brand-blue/15 bg-white/60 text-slate-700 hover:bg-white/80')
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>

              <form className="mt-6 grid gap-5" onSubmit={onSubmit}>
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Calculator, AirPods case, Hoodie"
                    className="mt-2 input-field"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add identifying details (color, brand, stickers, etc.)"
                    rows={4}
                    className="mt-2 input-field"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-2 input-field"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Location (optional)</label>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Library, Gym, Hallway…"
                      className="mt-2 input-field"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Date (optional)</label>
                    <input
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder={status === 'Found' ? 'When was it found?' : 'When was it lost?'}
                      className="mt-2 input-field"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      We won’t show this on the browse cards (only in the details view).
                    </p>
                  </div>

                  <div />
                </div>

                <ImagePicker value={imageDataUrl} onChange={setImageDataUrl} />

                {error && <div className="rounded-2xl bg-brand-orange/15 p-3 text-sm text-slate-800">{error}</div>}

                <button
                  type="submit"
                  className="rounded-2xl bg-brand-blue px-6 py-3 text-sm font-medium text-white hover:bg-brand-blue-dark"
                >
                  Submit {status} item
                </button>

                <p className="text-xs text-slate-500">
                  (Mock auth + mock storage) Everything is currently stored in your browser. You’ll hook this up to a
                  real service later.
                </p>
              </form>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  )
}
