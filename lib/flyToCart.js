// lib/flyToCart.js
"use client";

import React, { useEffect, useRef, useState } from "react";

export const FLY_DURATION = 700; // ms — total two-leg flight time

// ── Clone geometry ─────────────────────────────────────────
const SIZE = 96;                // px — the flying tile (was 48)
const HALF = SIZE / 2;          // 48 — used to center the tile
const RADIUS = 22;              // px — border-radius (was 14)
const FONT_SIZE = 22;           // px — the "BE" / "AN" letters (was 14)

export function FlyToCartItem({
  label,
  startX,
  startY,
  midX,
  midY,
  endX,
  endY,
  onDone,
}) {
  const [phase, setPhase] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase(1));
    });
    const t1 = setTimeout(() => setPhase(2), 140);
    const t2 = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone?.();
      }
    }, 140 + FLY_DURATION + 60);

    return () => {
      cancelAnimationFrame(raf1);
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const x = phase >= 2 ? endX : phase >= 1 ? midX : startX;
  const y = phase >= 2 ? endY : phase >= 1 ? midY : startY;
  const scale = phase >= 2 ? 0.32 : phase >= 1 ? 0.85 : 1;
  const opacity = phase >= 2 ? 0 : 1;

  const transition =
    phase >= 2
      ? `transform ${FLY_DURATION}ms cubic-bezier(0.4, 0, 0.8, 0.4), opacity ${FLY_DURATION}ms ease-in`
      : `transform ${Math.round(
          FLY_DURATION * 0.55
        )}ms cubic-bezier(0.2, 0.7, 0.3, 1), opacity 200ms ease-out`;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: SIZE,
        height: SIZE,
        pointerEvents: "none",
        zIndex: 9998,
        transform: `translate(${x - HALF}px, ${y - HALF}px) scale(${scale})`,
        transition,
        opacity,
        willChange: "transform, opacity",
        transformOrigin: "center center",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: RADIUS,
          background: "linear-gradient(135deg, #fdf1df, #f6d9a8)",
          color: "#b8690f",
          fontWeight: 800,
          fontSize: FONT_SIZE,
          letterSpacing: "0.04em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow:
            "0 16px 36px -10px rgba(205,121,19,0.7), 0 1px 0 rgba(255,255,255,0.6) inset",
          fontFamily: "inherit",
          border: "1px solid rgba(205, 121, 19, 0.18)",
        }}
      >
        {String(label || "?").slice(0, 2).toUpperCase()}
      </div>
    </div>
  );
}

export function useFlyToCart() {
  const [flyingItems, setFlyingItems] = useState([]);

  const flyToCart = (sourceEl, code, label, destEl, onLand) => {
    if (!sourceEl || !destEl) return;

    const srcRect = sourceEl.getBoundingClientRect();
    const dstRect = destEl.getBoundingClientRect();

    const startX = srcRect.left + srcRect.width / 2;
    const startY = srcRect.top + srcRect.height / 2;
    const endX = dstRect.left + dstRect.width / 2;
    const endY = dstRect.top + dstRect.height / 2;

    // Bigger arc for a bigger tile
    const midX = (startX + endX) / 2;
    const midY = Math.min(startY, endY) - 160;

    const id = `${code}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;

    setFlyingItems((prev) => [
      ...prev,
      { id, code, label, startX, startY, midX, midY, endX, endY, onLand },
    ]);
  };

  const removeFlying = (id) => {
    setFlyingItems((prev) => prev.filter((x) => x.id !== id));
  };

  return { flyingItems, flyToCart, removeFlying };
}