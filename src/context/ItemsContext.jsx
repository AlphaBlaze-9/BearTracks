// ItemsContext.jsx: Global state provider for BearTracks lost/found items and claims.
// Acts as the single source of truth for all item data — fetches from Supabase on
// mount, subscribes to real-time postgres_changes for live updates across all clients,
// and exposes CRUD helpers (addItem, deleteItem, getItem, addClaim, resolveClaim)
// to every descendant component via the `useItems()` hook.

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

// ── Context Creation ──────────────────────────────────────────────────────────
// Null default — the useItems() hook below throws if consumed outside a provider.
const ItemsContext = createContext(null);

// ── ItemsProvider ─────────────────────────────────────────────────────────────
export function ItemsProvider({ children }) {
  // items: array of mapped item objects (camelCase frontend fields)
  const [items, setItems] = useState([]);
  // claims: client-side claim records (not persisted to DB in this demo — claims
  //         live in memory and are lost on page refresh)
  const [claims, setClaims] = useState([]);
  // loading: true until the first fetchItems() call resolves
  const [loading, setLoading] = useState(true);

  // ── fetchItems ──────────────────────────────────────────────────────────────
  /**
   * Loads all items from the `lost_found_items` Supabase table, sorted newest-first.
   * Performs a field mapping from snake_case DB columns to camelCase frontend names
   * so components never have to deal with inconsistent naming conventions.
   */
  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("lost_found_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching items:", error);
    } else {
      // ── Data Transformation ────────────────────────────────────────────────
      // Map DB snake_case fields → camelCase used throughout the React codebase.
      // This keeps all components clean while staying true to SQL naming conventions.
      const mapped = (data || []).map((dbItem) => ({
        ...dbItem,                                          // include all original fields
        status: dbItem.type,                               // "Lost" or "Found"
        imageDataUrl: dbItem.image_url,                   // public Supabase Storage URL
        date: dbItem.date_incident,                        // date the item was lost/found
        createdAt: new Date(dbItem.created_at).getTime(), // ms timestamp for sorting
      }));
      setItems(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    // ── Initial Load ──────────────────────────────────────────────────────────
    fetchItems();

    // ── Real-time Subscription ────────────────────────────────────────────────
    // Subscribe to all INSERT, UPDATE, and DELETE events on lost_found_items.
    // When the database changes (any client, any user), we re-fetch the full list
    // so every connected browser tab sees the latest data without a manual refresh.
    // This is what makes BearTracks feel "live" — new submissions appear instantly
    // for admins reviewing the claim queue or browsing students.
    const subscription = supabase
      .channel("public:lost_found_items")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lost_found_items" },
        () => {
          // Re-fetch on any database change event
          fetchItems();
        },
      )
      .subscribe();

    // Remove the channel subscription on unmount to prevent memory leaks
    // and avoid duplicate subscription listeners on hot-module reloads.
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // ── Context Value ─────────────────────────────────────────────────────────
  // Memoized so descendants only re-render when items, claims, or loading change.
  const value = useMemo(() => {

    // ── addItem ────────────────────────────────────────────────────────────────
    // Optimistically adds a newly submitted item to local state immediately.
    // The real-time postgres_changes subscription will also trigger a full re-fetch,
    // ensuring the local state stays consistent with the database.
    function addItem(newItem) {
      setItems((prev) => [newItem, ...prev]);
    }

    // ── deleteItem ─────────────────────────────────────────────────────────────
    // Removes the item from the DB, then clears the associated image from Supabase
    // Storage. Both operations are attempted — a failed image deletion is logged
    // but does NOT undo the DB delete, since orphaned images are a minor issue
    // compared to leaving a ghost record in the database.
    async function deleteItem(item) {
      if (!item) return;

      // Step 1: Delete the database record (enforced by Supabase RLS —
      // only the item owner or an admin can delete)
      const { error: dbError } = await supabase
        .from("lost_found_items")
        .delete()
        .eq("id", item.id);

      if (dbError) throw dbError;

      // Optimistically remove from local state immediately so the UI responds
      setItems((prev) => prev.filter((i) => i.id !== item.id));

      // Step 2: Remove the photo from Supabase Storage if one exists.
      // URL format: .../storage/v1/object/public/lost-found-photos/USER_ID/FILENAME
      // We extract the last two path segments to reconstruct the storage file path.
      if (item.image_url) {
        try {
          const urlParts = item.image_url.split("/");
          const filePath = urlParts.slice(-2).join("/"); // → "USER_ID/FILENAME"

          await supabase.storage.from("lost-found-photos").remove([filePath]);
        } catch (storageErr) {
          // Log but don't re-throw — the item record is already gone from the DB
          console.error("Failed to remove image from storage:", storageErr);
        }
      }
    }

    // ── getItem ────────────────────────────────────────────────────────────────
    // Looks up a single item by ID from the local in-memory array.
    // String coercion handles cases where the URL param (string) is compared to
    // a DB-returned number ID.
    function getItem(id) {
      return items.find((it) => String(it.id) === String(id));
    }

    // ── addClaim ───────────────────────────────────────────────────────────────
    // Creates a claim record in local state with an auto-generated timestamp ID.
    // Claims are currently in-memory only — a future enhancement would persist them
    // to a `claims` Supabase table for cross-session and cross-device visibility.
    async function addClaim(itemId, claimData) {
      const newClaim = {
        id: Date.now().toString(), // Unique enough for in-memory use
        itemId,
        ...claimData,
        status: "Pending",        // All new claims start as Pending
        createdAt: Date.now(),
      };
      setClaims((prev) => [newClaim, ...prev]);
      return newClaim;
    }

    // ── resolveClaim ───────────────────────────────────────────────────────────
    // Updates a claim's status to "Approved" or "Denied" and optionally records
    // the denial reason so the claimant's notification can display it.
    async function resolveClaim(claimId, status, denialReason = null) {
      setClaims((prev) =>
        prev.map((c) => (c.id === claimId ? { ...c, status, denialReason } : c)),
      );
    }

    return {
      items,
      claims,
      addItem,
      getItem,
      deleteItem,
      addClaim,
      resolveClaim,
      loading,
      // refreshItems: exposed so pages can manually trigger a re-fetch if needed
      refreshItems: fetchItems,
    };
  }, [items, claims, loading]);

  return (
    <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>
  );
}

// ── useItems ──────────────────────────────────────────────────────────────────
/**
 * Custom hook for consuming ItemsContext.
 * Throws a descriptive error if called outside an ItemsProvider tree,
 * catching hierarchy mistakes during development before they cause subtle bugs.
 */
export function useItems() {
  const ctx = useContext(ItemsContext);
  if (!ctx) throw new Error("useItems must be used inside <ItemsProvider>.");
  return ctx;
}
