// components/QtyStepper.jsx
"use client";

import React from "react";

export default function QtyStepper({
  value,
  onChange,
  min = 1,
  max,               // ✅ no default — undefined / null / <=0  ⇒  no cap
  className,
  inputClassName,
  onClamp,
}) {
  // Normalize max: only a finite, positive number counts as a real cap.
  const effectiveMax = React.useMemo(() => {
    if (max === undefined || max === null || max === "") return Infinity;
    const n = Number(max);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : Infinity;
  }, [max]);

  const hasCap = Number.isFinite(effectiveMax);

  const [draft, setDraft] = React.useState(String(value ?? min));
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    if (!focused) setDraft(String(value ?? min));
  }, [value, focused, min]);

  const clamp = React.useCallback(
    (n) => {
      if (!Number.isFinite(n)) return min;
      const int = Math.round(n);
      if (int < min) return min;
      if (hasCap && int > effectiveMax) return effectiveMax;
      return int;
    },
    [min, effectiveMax, hasCap]
  );

  const commit = React.useCallback(
    (raw) => {
      const n = Number(raw);
      const safe = clamp(n);
      setDraft(String(safe));

      // Only notify when a real cap/min actually clamped the value
      if (Number.isFinite(n) && n !== safe && hasCap) {
        onClamp?.({
          requested: n,
          applied: safe,
          reason: n > effectiveMax ? "max" : "min",
          max: effectiveMax,
          min,
        });
      }

      if (safe !== value) onChange(safe);
    },
    [clamp, onChange, value, onClamp, effectiveMax, min, hasCap]
  );

  const bump = React.useCallback(
    (delta) => {
      const base = Number(draft);
      const current =
        Number.isFinite(base) && base > 0 ? base : value || min;
      const requested = current + delta;
      const next = clamp(requested);

      // Only notify when a real cap blocked the step
      if (requested !== next && hasCap) {
        onClamp?.({
          requested,
          applied: next,
          reason: requested > effectiveMax ? "max" : "min",
          max: effectiveMax,
          min,
        });
      }

      setDraft(String(next));
      onChange(next);
    },
    [draft, value, min, effectiveMax, hasCap, clamp, onChange, onClamp]
  );

  const timeoutRef = React.useRef(null);
  const intervalRef = React.useRef(null);
  const holdStartRef = React.useRef(0);
  const holdingRef = React.useRef(false);

  const tick = React.useCallback(
    (dir) => {
      const elapsed = Date.now() - holdStartRef.current;
      let step = 1;
      if (elapsed > 3000) step = 100;
      else if (elapsed > 1500) step = 25;
      else if (elapsed > 600) step = 5;
      bump(dir * step);
    },
    [bump]
  );

  const startHold = (dir) => (e) => {
    if (e && e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    holdingRef.current = true;
    holdStartRef.current = Date.now();

    bump(dir);

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (!holdingRef.current) return;
        tick(dir);
      }, 80);
    }, 350);
  };

  const stopHold = () => {
    holdingRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  React.useEffect(() => () => stopHold(), []);

  return (
    <div className={className}>
      <button
        type="button"
        aria-label="Decrease"
        onPointerDown={startHold(-1)}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        onContextMenu={(e) => e.preventDefault()}
      >
        −
      </button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        value={draft}
        className={inputClassName}
        onFocus={(e) => {
          setFocused(true);
          e.currentTarget.select();
        }}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^\d]/g, "");
          setDraft(digits);
        }}
        onBlur={(e) => {
          setFocused(false);
          commit(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          } else if (e.key === "Escape") {
            setDraft(String(value ?? min));
            e.currentTarget.blur();
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            bump(1);
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            bump(-1);
          }
        }}
      />

      <button
        type="button"
        aria-label="Increase"
        onPointerDown={startHold(1)}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        onContextMenu={(e) => e.preventDefault()}
      >
        +
      </button>
    </div>
  );
}