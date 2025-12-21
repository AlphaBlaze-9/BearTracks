import { Link } from 'react-router-dom'
import { EyeIcon, TagIcon } from './Icons.jsx'

/**
 * ItemCard
 * --------
 * The "browse" card style (based on the reference screenshot).
 *
 * IMPORTANT: per your request, we do NOT show Location or Date on the card.
 * Those can still exist in the item data and appear in the detail view.
 */

function PlaceholderImage() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="text-4xl">📦</div>
        <div className="mt-2 text-xs text-slate-500">No photo yet</div>
      </div>
    </div>
  )
}

export default function ItemCard({ item }) {
  return (
    <div className="item-card">
      <div className="item-card__image">
        {item.imageDataUrl ? (
          <img
            src={item.imageDataUrl}
            alt={item.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <PlaceholderImage />
        )}
      </div>

      <div className="p-6">
        <div className="text-xl font-semibold tracking-tight">{item.title}</div>
        <div className="mt-2 text-sm text-slate-600 leading-relaxed">{item.description}</div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-700">
          <div className="inline-flex items-center gap-2">
            <TagIcon className="h-5 w-5 text-slate-500" />
            <span className="rounded-full bg-brand-gold/20 px-3 py-1 text-sm text-slate-900">
              {item.category || 'Other'}
            </span>
          </div>

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

        <Link
          to={`/items/${item.id}`}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-blue px-5 py-3 text-base font-medium text-white hover:bg-brand-blue-dark"
        >
          <EyeIcon className="h-5 w-5" />
          View Details
        </Link>
      </div>
    </div>
  )
}
