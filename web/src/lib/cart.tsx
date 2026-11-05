"use client";

import { createContext, useContext, useCallback, useSyncExternalStore } from "react";

/* ── Types ── */
export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  size: string | null;
  image: string;
  qty: number;
}

export interface CartState {
  items: CartItem[];
}

/* ── localStorage store ── */
const STORAGE_KEY = "jp-cart";

function readCart(): CartState {
  if (typeof window === "undefined") return { items: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : { items: [] };
    if (!Array.isArray(parsed?.items)) return { items: [] };
    return { items: parsed.items.filter((item: CartItem) => item && typeof item.productId === "string" && typeof item.slug === "string" && typeof item.name === "string" && typeof item.image === "string" && (item.size === null || typeof item.size === "string") && Number.isSafeInteger(item.qty) && item.qty >= 1 && item.qty <= 20 && Number.isSafeInteger(item.priceCents) && item.priceCents >= 0) };
  } catch {
    return { items: [] };
  }
}

let listeners: Array<() => void> = [];
const EMPTY_CART: CartState = { items: [] };
let snapshot: CartState = EMPTY_CART;

function emitChange() {
  snapshot = readCart();
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): CartState {
  return snapshot;
}

function getServerSnapshot(): CartState {
  return EMPTY_CART;
}

/* ── Init snapshot on client ── */
if (typeof window !== "undefined") {
  snapshot = readCart();
  window.addEventListener("storage", event => { if (event.key === STORAGE_KEY) emitChange(); });
}

/* ── Cart actions ── */
function persist(state: CartState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  emitChange();
}

function itemKey(productId: string, size: string | null) {
  return `${productId}::${size ?? ""}`;
}

function addItem(item: Omit<CartItem, "qty">, qty = 1) {
  if (!Number.isSafeInteger(qty) || qty < 1) return;
  const state = readCart();
  const existing = state.items.find(
    (i) => itemKey(i.productId, i.size) === itemKey(item.productId, item.size)
  );
  if (existing) {
    existing.qty = Math.min(20, existing.qty + qty);
  } else {
    state.items.push({ ...item, qty: Math.min(20, qty) });
  }
  persist(state);
}

function removeItem(productId: string, size: string | null) {
  const state = readCart();
  state.items = state.items.filter(
    (i) => itemKey(i.productId, i.size) !== itemKey(productId, size)
  );
  persist(state);
}

function updateQty(productId: string, size: string | null, qty: number) {
  if (!Number.isSafeInteger(qty)) return;
  if (qty < 1) return removeItem(productId, size);
  const state = readCart();
  const item = state.items.find(
    (i) => itemKey(i.productId, i.size) === itemKey(productId, size)
  );
  if (item) item.qty = Math.min(20, qty);
  persist(state);
}

function clearCart() {
  persist({ items: [] });
}

/* ── Context ── */
interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalCents: number;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (productId: string, size: string | null) => void;
  updateQty: (productId: string, size: string | null, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const totalItems = state.items.reduce((s, i) => s + i.qty, 0);
  const totalCents = state.items.reduce((s, i) => s + i.priceCents * i.qty, 0);

  const value: CartContextValue = {
    items: state.items,
    totalItems,
    totalCents,
    addItem: useCallback((item, qty) => addItem(item, qty), []),
    removeItem: useCallback((pid, size) => removeItem(pid, size), []),
    updateQty: useCallback((pid, size, qty) => updateQty(pid, size, qty), []),
    clearCart: useCallback(() => clearCart(), []),
  };

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
