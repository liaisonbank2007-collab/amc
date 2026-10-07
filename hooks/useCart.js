// hooks/useCart.js
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getCart,
  saveCart,
  removeFromCart,
  clearCart,
} from "@/lib/cart";

export default function useCart() {
  const [cart, setCart] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    let stored = getCart();
    let changed = false;

    stored = stored.map((it) => {
      const needsMigration =
        it.visits == null ||
        it.units == null ||
        (it.subItems || []).some((s) => s.visits == null || s.units == null);

      if (!needsMigration) return it;

      changed = true;
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
    });

    if (changed) saveCart(stored);
    setCart(stored);

    const handler = () => setCart(getCart());
    window.addEventListener("amc-cart-updated", handler);
    return () => window.removeEventListener("amc-cart-updated", handler);
  }, []);

  const setVisits = useCallback((item_code, value) => {
    const visits = Math.max(1, Math.floor(Number(value) || 1));
    const next = getCart().map((it) =>
      it.item_code === item_code ? { ...it, visits } : it
    );
    saveCart(next);
    setCart(next);
  }, []);

  const setUnits = useCallback((item_code, value) => {
    const units = Math.max(1, Math.floor(Number(value) || 1));
    const next = getCart().map((it) =>
      it.item_code === item_code ? { ...it, units } : it
    );
    saveCart(next);
    setCart(next);
  }, []);

  const setSubVisits = useCallback((parentCode, subCode, value) => {
    const visits = Math.max(1, Math.floor(Number(value) || 1));
    const next = getCart().map((it) =>
      it.item_code === parentCode
        ? {
            ...it,
            subItems: (it.subItems || []).map((s) =>
              s.item_code === subCode ? { ...s, visits } : s
            ),
          }
        : it
    );
    saveCart(next);
    setCart(next);
  }, []);

  const setSubUnits = useCallback((parentCode, subCode, value) => {
    const units = Math.max(1, Math.floor(Number(value) || 1));
    const next = getCart().map((it) =>
      it.item_code === parentCode
        ? {
            ...it,
            subItems: (it.subItems || []).map((s) =>
              s.item_code === subCode ? { ...s, units } : s
            ),
          }
        : it
    );
    saveCart(next);
    setCart(next);
  }, []);

  const remove = useCallback((item_code) => {
    removeFromCart(item_code);
    setCart(getCart());
  }, []);

  const clear = useCallback(() => {
    clearCart();
    setCart([]);
  }, []);

  const refresh = useCallback(() => {
    setCart(getCart());
  }, []);

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