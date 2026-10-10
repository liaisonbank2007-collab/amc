// hooks/useCart.js
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCart,
  saveCart,
  removeFromCart,
  clearCart,
} from "@/lib/cart";

const CART_EVENT = "amc-cart-updated";

/**
 * Bring a persisted cart entry up to the current schema.
 * Returns the migrated item, or the original reference if no change
 * was needed (so callers can cheaply detect "changed").
 */
function migrateItem(it) {
  const needsMigration =
    it.visits == null ||
    it.units == null ||
    (it.subItems || []).some((s) => s.visits == null || s.units == null);

  if (!needsMigration) return it;

  const legacyQty = it.qty || 1;
  const migrated = {
    ...it,
    visits: it.visits ?? 1,
    units: it.units ?? legacyQty,
    subItems: (it.subItems || []).map((s) => ({
      ...s,
      visits: s.visits ?? 1,
      units: s.units ?? s.qty ?? 1,
    })),
  };
  delete migrated.qty;
  return migrated;
}

/**
 * Migrate an entire stored cart in one pass. Returns
 * { cart, changed } so the caller only writes when needed.
 */
function migrateCart(stored) {
  let changed = false;
  const cart = stored.map((it) => {
    const next = migrateItem(it);
    if (next !== it) changed = true;
    return next;
  });
  return { cart, changed };
}

export default function useCart() {
  const [cart, setCart] = useState([]);
  const [mounted, setMounted] = useState(false);

  // Keep a stable reference to the latest snapshot so event-driven
  // refreshes (other tab, custom event) don't rely on stale closures.
  const cartRef = useRef(cart);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  // -----------------------------------------------------------------
  // Hydrate from storage on mount + subscribe to external updates.
  // -----------------------------------------------------------------
  useEffect(() => {
    let stored;
    try {
      stored = getCart();
    } catch (err) {
      console.error("[useCart] failed to read cart:", err);
      stored = [];
    }

    const { cart: migrated, changed } = migrateCart(stored);
    if (changed) {
      try {
        saveCart(migrated);
      } catch (err) {
        console.error("[useCart] failed to persist migration:", err);
      }
    }

    setCart(migrated);
    setMounted(true);

    // Same-tab updates dispatched by other modules via window.dispatchEvent.
    const onCartUpdated = () => {
      try {
        setCart(getCart());
      } catch (err) {
        console.error("[useCart] failed to refresh cart:", err);
      }
    };

    // Cross-tab updates: `storage` only fires in *other* tabs, which is
    // exactly what we want — the acting tab already set its own state.
    const onStorage = (e) => {
      if (e.key && e.key !== "amc_cart") return;
      onCartUpdated();
    };

    window.addEventListener(CART_EVENT, onCartUpdated);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(CART_EVENT, onCartUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // -----------------------------------------------------------------
  // Mutation helpers
  // Each does a fresh read → write → publish so concurrent writers
  // (e.g. two components, another tab) don't clobber each other.
  // -----------------------------------------------------------------
  const commit = useCallback((next) => {
    try {
      saveCart(next);
    } catch (err) {
      console.error("[useCart] failed to persist cart:", err);
    }
    setCart(next);
    // Notify other hook instances / tabs that already listen for this.
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(CART_EVENT));
    }
  }, []);

  const readLatest = useCallback(() => {
    try {
      return getCart();
    } catch (err) {
      console.error("[useCart] failed to read cart:", err);
      return cartRef.current;
    }
  }, []);

  const setVisits = useCallback(
    (itemCode, value) => {
      const visits = Math.max(1, Math.floor(Number(value) || 1));
      const next = readLatest().map((it) =>
        it.item_code === itemCode ? { ...it, visits } : it
      );
      commit(next);
    },
    [commit, readLatest]
  );

  const setUnits = useCallback(
    (itemCode, value) => {
      const units = Math.max(1, Math.floor(Number(value) || 1));
      const next = readLatest().map((it) =>
        it.item_code === itemCode ? { ...it, units } : it
      );
      commit(next);
    },
    [commit, readLatest]
  );

  const setSubVisits = useCallback(
    (parentCode, subCode, value) => {
      const visits = Math.max(1, Math.floor(Number(value) || 1));
      const next = readLatest().map((it) =>
        it.item_code === parentCode
          ? {
              ...it,
              subItems: (it.subItems || []).map((s) =>
                s.item_code === subCode ? { ...s, visits } : s
              ),
            }
          : it
      );
      commit(next);
    },
    [commit, readLatest]
  );

  const setSubUnits = useCallback(
    (parentCode, subCode, value) => {
      const units = Math.max(1, Math.floor(Number(value) || 1));
      const next = readLatest().map((it) =>
        it.item_code === parentCode
          ? {
              ...it,
              subItems: (it.subItems || []).map((s) =>
                s.item_code === subCode ? { ...s, units } : s
              ),
            }
          : it
      );
      commit(next);
    },
    [commit, readLatest]
  );

  const remove = useCallback(
    (itemCode) => {
      try {
        removeFromCart(itemCode);
      } catch (err) {
        console.error("[useCart] failed to remove item:", err);
      }
      const next = readLatest();
      setCart(next);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(CART_EVENT));
      }
    },
    [readLatest]
  );

  const clear = useCallback(() => {
    try {
      clearCart();
    } catch (err) {
      console.error("[useCart] failed to clear cart:", err);
    }
    setCart([]);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(CART_EVENT));
    }
  }, []);

  const refresh = useCallback(() => {
    setCart(readLatest());
  }, [readLatest]);

  return {
    cart,
    mounted,
    setVisits,
    setUnits,
    setSubVisits,
    setSubUnits,
    remove,
    clear,
    refresh,
  };
}