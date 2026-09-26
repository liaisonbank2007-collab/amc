"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCart = create()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, qty = 1) => {
        const items = [...get().items];
        const idx = items.findIndex((i) => i.item_code === item.item_code);
        if (idx > -1) {
          items[idx] = { ...items[idx], qty: items[idx].qty + qty };
        } else {
          items.push({
            item_code: item.item_code,
            item_name: item.item_name,
            uom: item.uom,
            rate: item.rate,
            currency: item.currency || "INR",
            amc_type: item.amc_type,
            amc_type_name: item.amc_type_name,
            amc_sub_type: item.amc_sub_type,
            amc_sub_type_name: item.amc_sub_type_name,
            qty,
          });
        }
        set({ items });
      },

      removeItem: (code) =>
        set({ items: get().items.filter((i) => i.item_code !== code) }),

      updateQty: (code, qty) =>
        set({
          items: get().items.map((i) =>
            i.item_code === code ? { ...i, qty: Math.max(1, qty) } : i
          ),
        }),

      clear: () => set({ items: [] }),

      get count() {
        return get().items.reduce((s, i) => s + i.qty, 0);
      },
      get subtotal() {
        return get().items.reduce((s, i) => s + i.rate * i.qty, 0);
      },
    }),
    {
      name: "amc-cart",
      skipHydration: true,
    }
  )
);

export function CartProvider({ children }) {
  return children;
}