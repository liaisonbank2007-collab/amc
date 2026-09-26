// lib/cart.js
const KEY = "amc_cart";

export function getCart() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("amc-cart-updated"));
}

export function addToCart(items) {
  const list = Array.isArray(items) ? items : [items];
  const cart = getCart();
  const existing = new Map(cart.map((c) => [c.item_code, c]));
  list.forEach((item) => {
    if (existing.has(item.item_code)) {
      const cur = existing.get(item.item_code);
      cur.qty = (cur.qty || 1) + (item.qty || 1);
    } else {
      existing.set(item.item_code, { ...item, qty: item.qty || 1 });
    }
  });
  saveCart(Array.from(existing.values()));
}

export function removeFromCart(item_code) {
  saveCart(getCart().filter((c) => c.item_code !== item_code));
}

export function clearCart() {
  saveCart([]);
}

export function getCartCount() {
  return getCart().reduce((sum, c) => sum + (c.qty || 1), 0);
}


export const appendToCartItem = (parentCode, subItem) => {
  const cart = getCart();
  const parent = cart.find((c) => c.item_code === parentCode);
  if (!parent) return;
  if (!parent.subItems) parent.subItems = [];
  const existing = parent.subItems.find(
    (s) => s.item_code === subItem.item_code
  );
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    parent.subItems.push({ ...subItem, qty: subItem.qty || 1 });
  }
  saveCart(cart);
};

export const setSubItemQty = (parentCode, subCode, qty) => {
  const cart = getCart();
  const parent = cart.find((c) => c.item_code === parentCode);
  if (!parent || !parent.subItems) return;
  const sub = parent.subItems.find((s) => s.item_code === subCode);
  if (!sub) return;
  sub.qty = Math.max(1, Number(qty) || 1);
  saveCart(cart);
};

export const removeSubItem = (parentCode, subCode) => {
  const cart = getCart();
  const parent = cart.find((c) => c.item_code === parentCode);
  if (!parent || !parent.subItems) return;
  parent.subItems = parent.subItems.filter((s) => s.item_code !== subCode);
  saveCart(cart);
};