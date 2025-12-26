import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EyeIcon, TagIcon, TrashIcon } from './Icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useItems } from '../context/ItemsContext.jsx'
import DeleteItemModal from './DeleteItemModal.jsx'

/**
 * ItemCard
 * --------
 * The "browse" card style (based on the reference screenshot).
 */

function PlaceholderImage() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-100/50">
      <div className="text-center">
        <div className="text-4xl">📦</div>
        <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">No photo yet</div>
      </div>
    </div>
  )
}

export default function ItemCard({ item }) {
  const { isAdmin } = useAuth()
  const { deleteItem } = useItems()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteItem(item)
      setIsModalOpen(false)
    } catch (err) {
      console.error('Failed to delete item:', err)
      alert('Failed to delete item. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="item-card group overflow-hidden bg-white hover:shadow-xl transition-all duration-300">
        <div className="item-card__image overflow-hidden relative">
          {item.imageDataUrl ? (
            <img
              src={item.imageDataUrl}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <PlaceholderImage />
          )}

          {isAdmin && (
            <button
              onClick={(e) => {
                e.preventDefault()
                setIsModalOpen(true)
              }}
              className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-2xl bg-white/90 text-red-500 shadow-lg backdrop-blur hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"
              title="Delete as Admin"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}

          <div className="absolute left-4 bottom-4">
            <span
              className={
                'rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm ' +
                (item.status === 'Found'
                  ? 'bg-green-500 text-white'
                  : 'bg-brand-blue text-white')
              }
            >
              {item.status}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="text-xl font-bold tracking-tight text-slate-900">{item.title}</div>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600 leading-relaxed">
            {item.description}
          </p>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <TagIcon className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">
                {item.category || 'Other'}
              </span>
            </div>

            <Link
              to={`/items/${item.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100 transition-all"
            >
              Details
            </Link>
          </div>
        </div>
      </div>

      <DeleteItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        itemTitle={item.title}
      />
    </>
  )
}
