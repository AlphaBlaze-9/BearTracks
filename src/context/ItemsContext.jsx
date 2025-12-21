import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { readJSON, writeJSON } from '../lib/storage.js'

/**
 * ItemsContext
 * ------------
 * Stores lost & found posts in localStorage.
 *
 * This keeps the app fully "frontend-only" for now, which is what you asked.
 * Later, you can replace the persistence layer with real API calls.
 */

const ItemsContext = createContext(null)

const ITEMS_KEY = 'bt_items'

function seedItems() {
  // A couple starter items so "Browse" isn't empty on first run.
  // Images are optional — if there's no image, the card shows a clean placeholder.
  return [
    {
      id: 'seed-1',
      title: 'Calculator',
      description: 'Blue TI calculator. Found near the library tables.',
      category: 'Electronics',
      status: 'Found',
      location: 'Library',
      date: '2025-12-18',
      imageDataUrl: '',
      createdAt: Date.now() - 1000 * 60 * 60 * 5,
    },
    {
      id: 'seed-2',
      title: 'Hydro Flask',
      description: 'Silver bottle with a “BEARS” sticker.',
      category: 'Water Bottle',
      status: 'Lost',
      location: '',
      date: '',
      imageDataUrl: '',
      createdAt: Date.now() - 1000 * 60 * 60 * 28,
    },
  ]
}

export function ItemsProvider({ children }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    const existing = readJSON(ITEMS_KEY, null)
    if (existing && Array.isArray(existing) && existing.length) {
      setItems(existing)
    } else {
      const seeded = seedItems()
      setItems(seeded)
      writeJSON(ITEMS_KEY, seeded)
    }
  }, [])

  const value = useMemo(() => {
    function addItem(newItem) {
      setItems((prev) => {
        const next = [newItem, ...prev]
        writeJSON(ITEMS_KEY, next)
        return next
      })
    }

    function getItem(id) {
      return items.find((it) => String(it.id) === String(id))
    }

    return { items, addItem, getItem }
  }, [items])

  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>
}

export function useItems() {
  const ctx = useContext(ItemsContext)
  if (!ctx) throw new Error('useItems must be used inside <ItemsProvider>.')
  return ctx
}
