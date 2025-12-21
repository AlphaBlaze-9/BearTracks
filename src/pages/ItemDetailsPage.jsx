import { Link, useParams } from 'react-router-dom'
import Container from '../components/Container.jsx'
import Section from '../components/Section.jsx'
import { useItems } from '../context/ItemsContext.jsx'

/**
 * ItemDetailsPage
 * ---------------
 * One item, bigger photo, and the full details.
 *
 * NOTE: You asked not to show location/date "like that card".
 * We keep them out of the browse cards, but it's still useful to have them
 * on the detail page if provided.
 */

export default function ItemDetailsPage() {
  const { id } = useParams()
  const { getItem } = useItems()
  const item = getItem(id)

  if (!item) {
    return (
      <div className="min-h-screen bg-hero">
        <Section className="pt-10">
          <Container>
            <div className="card p-6">
              <div className="text-lg font-semibold">Item not found</div>
              <p className="mt-2 text-sm text-slate-600">
                This item may have been removed or your link is wrong.
              </p>
              <Link
                to="/browse"
                className="mt-5 inline-flex rounded-2xl bg-brand-blue px-5 py-3 text-sm font-medium text-white"
              >
                Back to browse
              </Link>
            </div>
          </Container>
        </Section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hero">
      <Section className="pt-10">
        <Container>
          <div className="mb-6 flex items-center justify-between">
            <Link to="/browse" className="text-sm text-slate-600 hover:text-slate-900">
              ← Back
            </Link>
            <span
              className={
                'rounded-full border px-3 py-1 text-xs font-medium ' +
                (item.status === 'Found'
                  ? 'border-brand-blue/20 bg-brand-blue/10 text-brand-blue'
                  : 'border-brand-orange/30 bg-brand-orange/10 text-brand-blue-dark')
              }
            >
              {item.status}
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card overflow-hidden">
              <div className="aspect-[4/3] w-full bg-brand-blue/5">
                {item.imageDataUrl ? (
                  <img src={item.imageDataUrl} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl">📷</div>
                      <div className="mt-2 text-xs text-slate-500">No photo uploaded</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card p-6">
              <h1 className="text-3xl font-semibold tracking-tight">{item.title}</h1>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.description}</p>

              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl border border-brand-blue/10 bg-white/60 p-4">
                  <div className="text-xs font-semibold text-slate-700">Category</div>
                  <div className="mt-1 text-sm text-slate-900">{item.category || 'Other'}</div>
                </div>

                {(item.location || item.date) && (
                  <div className="rounded-2xl border border-brand-blue/10 bg-white/60 p-4">
                    <div className="text-xs font-semibold text-slate-700">Extra details</div>
                    <div className="mt-2 grid gap-1 text-sm text-slate-700">
                      {item.location && (
                        <div>
                          <span className="font-medium">Location:</span> {item.location}
                        </div>
                      )}
                      {item.date && (
                        <div>
                          <span className="font-medium">Date:</span> {item.date}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-2xl bg-brand-blue/10 p-4 text-sm text-slate-700">
                <span className="font-medium">Next step:</span> When you connect this to a backend, this is where
                you'd add a "Claim" or "Message" button.
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  )
}
