import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * ItemsContext
 * ------------
 * Manages lost & found items using Supabase.
 */

const ItemsContext = createContext(null)

export function ItemsProvider({ children }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchItems = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('lost_found_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching items:', error)
    } else {
      // Map Supabase fields to the names the frontend components expect
      const mapped = (data || []).map((dbItem) => ({
        ...dbItem,
        status: dbItem.type,
        imageDataUrl: dbItem.image_url,
        date: dbItem.date_incident,
        createdAt: new Date(dbItem.created_at).getTime(),
      }))
      setItems(mapped)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()

    // Subscribe to changes for real-time updates
    const subscription = supabase
      .channel('public:lost_found_items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lost_found_items' }, () => {
        fetchItems()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  const value = useMemo(() => {
    function addItem(newItem) {
      // Local state update – the Postgres change listener will also trigger a fetch
      setItems((prev) => [newItem, ...prev])
    }

    async function deleteItem(item) {
      if (!item) return

      // 1. Delete from database
      const { error: dbError } = await supabase
        .from('lost_found_items')
        .delete()
        .eq('id', item.id)

      if (dbError) throw dbError

      // Update local state immediately
      setItems((prev) => prev.filter((i) => i.id !== item.id))

      // 2. Delete from storage if image exists
      if (item.image_url) {
        try {
          // Extract file path from public URL
          // URL format: .../storage/v1/object/public/lost-found-photos/USER_ID/FILENAME
          const urlParts = item.image_url.split('/')
          const filePath = urlParts.slice(-2).join('/') // Gets USER_ID/FILENAME

          await supabase.storage
            .from('lost-found-photos')
            .remove([filePath])
        } catch (storageErr) {
          console.error('Failed to remove image from storage:', storageErr)
          // We don't throw here to ensure the UI updates since the record is already gone
        }
      }
    }

    function getItem(id) {
      return items.find((it) => String(it.id) === String(id))
    }

    return { items, addItem, getItem, deleteItem, loading, refreshItems: fetchItems }
  }, [items, loading])

  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>
}

export function useItems() {
  const ctx = useContext(ItemsContext)
  if (!ctx) throw new Error('useItems must be used inside <ItemsProvider>.')
  return ctx
}
