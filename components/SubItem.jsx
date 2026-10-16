// components/SubItem.jsx
"use client";

import React, { useCallback, useState } from "react";
import { inr, prettyName } from "../lib/format";
import {
  hasVisitControl,
  hasUnitControl,
  hasQtyControls,
} from "../lib/visibility";
import {
  computeItemAmount,
  getMaxVisits,
  hasVisitCap,            // ✅
  durationValueToMonths,
} from "../lib/calculations";
import QtyStepper from "./QtyStepper";

export default function SubItem({
  styles,
  item: s,
  parentCode,
  parentDuration = "12 Months",
  onVisitsChange,
  onUnitsChange,
  onRemove,
}) {
  const sName = s.item_name || s.item_code;
  const sShowVisit = hasVisitControl(s);
  const sShowUnit = hasUnitControl(s);

  // ✅ Sub-item cap inherits the parent's duration
  const effectiveDuration = s.selectedDuration || parentDuration;
  const capped = hasVisitCap(s);
  const maxVisits = capped ? getMaxVisits(s, effectiveDuration) : null;

  const [visitWarning, setVisitWarning] = useState("");
  const warnTimerRef = React.useRef(null);

  const showVisitWarning = useCallback((msg) => {
    setVisitWarning(msg);
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    warnTimerRef.current = setTimeout(() => setVisitWarning(""), 3000);
  }, []);

  React.useEffect(
    () => () => {
      if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    },
    []
  );

  const handleVisitsChange = useCallback(
    (next) => {
      const n = Number(next) || 1;

      if (!capped) {
        onVisitsChange?.(parentCode, s.item_code, n);
        return;
      }

      if (n > maxVisits) {
        showVisitWarning(
          `Max ${maxVisits} visit${maxVisits > 1 ? "s" : ""} allowed for ` +
            `${durationValueToMonths(effectiveDuration)} month duration.`
        );
        onVisitsChange?.(parentCode, s.item_code, maxVisits);
        return;
      }
      onVisitsChange?.(parentCode, s.item_code, n);
    },
    [
      capped,
      maxVisits,
      effectiveDuration,
      s.item_code,
      parentCode,
      onVisitsChange,
      showVisitWarning,
    ]
  );

  const handleVisitClamp = useCallback(
    ({ reason, max }) => {
      if (!capped) return;
      if (reason !== "max") return;
      showVisitWarning(
        `Max ${max} visit${max > 1 ? "s" : ""} allowed for ` +
          `${durationValueToMonths(effectiveDuration)} month duration.`
      );
    },
    [capped, effectiveDuration, showVisitWarning]
  );

  return (
    <li className={styles.subItem}>
      <div className={styles.subItem__thumb} aria-hidden="true">
        {sName.slice(0, 2).toUpperCase()}
      </div>
      <div className={styles.subItem__info}>
        <strong title={sName}>{prettyName(sName)}</strong>
        <span>
          {s.item_code} · {s.uom || "Nos"}
        </span>
      </div>

      {hasQtyControls(s) && (
        <div className={styles.subItem__counts}>
          {sShowVisit && (
            <div className={styles.subItem__count}>
              <span className={styles.subItem__countLabel}>
                Visits
                {capped && (
                  <em className={styles.subItem__capBadge}>
                    max {maxVisits}
                  </em>
                )}
              </span>
              <QtyStepper
                className={styles.subItem__qty}
                value={s.visits || 1}
                max={capped ? maxVisits : undefined}
                onChange={handleVisitsChange}
                onClamp={capped ? handleVisitClamp : undefined}
              />
              {visitWarning && (
                <span className={styles.subItem__warning} role="alert">
                  {visitWarning}
                </span>
              )}
            </div>
          )}

          {sShowUnit && (
            <div className={styles.subItem__count}>
              <span className={styles.subItem__countLabel}>
                Units{" "}
                <em className={styles.subItem__uom}>
                  {s.uom || s.stock_uom || "Nos"}
                </em>
              </span>
              <QtyStepper
                className={styles.subItem__qty}
                value={s.units || 1}
                onChange={(n) => onUnitsChange(parentCode, s.item_code, n)}
              />
            </div>
          )}
        </div>
      )}

      <div className={styles.subItem__price}>
        {s.rate && s.rate > 0
          ? inr(
              computeItemAmount(s) * (sShowVisit ? s.visits || 1 : 1),
              s.currency
            )
          : "On request"}
      </div>
      <button
        type="button"
        className={styles.subItem__remove}
        aria-label="Remove sub-item"
        onClick={() => onRemove(parentCode, s.item_code)}
      >
        ×
      </button>
    </li>
  );
}