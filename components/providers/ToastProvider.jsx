// ToastProvider.jsx
"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";                        // ← ADD
import { AnimatePresence, motion } from "framer-motion";
import { Check, X, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext(null);
const TOAST_DURATION = 3200;

const TYPE_META = {
  success: { Icon: Check, accent: "#cd7913", ring: "rgba(205, 121, 19, 0.28)", iconBg: "linear-gradient(135deg, #e8913a, #b8690f)", label: "Added to cart" },
  error:   { Icon: AlertCircle, accent: "#b00020", ring: "rgba(176, 0, 32, 0.24)", iconBg: "linear-gradient(135deg, #d33, #b00020)", label: "Something went wrong" },
  info:    { Icon: Info, accent: "#0f1a14", ring: "rgba(15, 26, 20, 0.14)", iconBg: "linear-gradient(135deg, #3a3f3c, #0f1a14)", label: "Heads up" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [mounted, setMounted] = useState(false);                 // ← SSR guard

  useEffect(() => { setMounted(true); }, []);                    // ← SSR guard

  const toast = useCallback((message, type = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((t) => [...t, { id, message, type }]);
  }, []);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) => setTimeout(() => remove(t.id), TOAST_DURATION));
    return () => timers.forEach(clearTimeout);
  }, [toasts, remove]);

  const viewport = mounted ? createPortal(                       // ← PORTAL
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "fixed",
        top: "calc(64px + 1rem)",                                // ← top-right anchor
        right: "1rem",                                           // ← right side
        left: "auto",                                            // ← no left
        transform: "none",                                       // ← no center transform
        zIndex: 100000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",                                  // ← stack from the right
        gap: 10,
        pointerEvents: "none",
        width: "min(92vw, 400px)",
      }}
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </AnimatePresence>
    </div>,
    document.body                                                // ← mount to <body>
  ) : null;

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {viewport}
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onClose }) {
  const meta = TYPE_META[toast.type] || TYPE_META.info;
  const { Icon } = meta;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.94 }}               // ← slide from the right
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.96, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 420, damping: 32, mass: 0.8 }}
      role="status"
      style={{
        pointerEvents: "auto",
        position: "relative",
        width: "100%",
        maxWidth: 380,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px 12px 12px",
        borderRadius: 16,
        background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 100%)",
        backdropFilter: "blur(18px) saturate(140%)",
        WebkitBackdropFilter: "blur(18px) saturate(140%)",
        border: `1px solid ${meta.ring}`,
        boxShadow: `0 1px 0 rgba(255,255,255,0.9) inset, 0 0 0 1px rgba(255,255,255,0.5), 0 18px 40px -18px rgba(15, 26, 20, 0.28), 0 8px 20px -12px ${meta.accent}44`,
        overflow: "hidden",
        fontFamily: "inherit",
        color: "#0f1a14",
      }}
    >
      <span aria-hidden="true" style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 10, background: meta.iconBg, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 14px -8px ${meta.accent}aa, 0 1px 0 rgba(255,255,255,0.4) inset` }}>
        <Icon size={16} strokeWidth={2.6} />
      </span>

      <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
        <span style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 800, color: meta.accent, opacity: 0.85 }}>
          {meta.label}
        </span>
        <span style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.35, color: "#0f1a14", wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }} title={toast.message}>
          {toast.message}
        </span>
      </div>

      <button type="button" onClick={onClose} aria-label="Dismiss notification" style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 8, border: "none", background: "transparent", color: "#6b7280", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <X size={14} strokeWidth={2.4} />
      </button>

      <motion.div aria-hidden="true" initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: TOAST_DURATION / 1000, ease: "linear" }} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2.5, transformOrigin: "left center", background: `linear-gradient(90deg, ${meta.accent}, ${meta.accent}99)`, opacity: 0.75 }} />
    </motion.div>
  );
}

export const useToast = () => useContext(ToastContext);