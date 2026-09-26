"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  const remove = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100 }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2/95 px-4 py-3 shadow-2xl backdrop-blur-xl"
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-full ${
                  t.type === "success" ? "bg-success/20 text-success" : "bg-red-500/20 text-red-400"
                }`}
              >
                {t.type === "success" ? <Check size={14} /> : <X size={14} />}
              </span>
              <span className="text-sm text-text">{t.message}</span>
              <button
                onClick={() => remove(t.id)}
                className="ml-2 text-muted hover:text-text"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);