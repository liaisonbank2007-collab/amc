// components/SubItem.jsx
"use client";

import React from "react";
import { inr, prettyName } from "../lib/format";
import { hasVisitControl, hasUnitControl, hasQtyControls } from "../lib/visibility";
import { computeItemAmount } from "../lib/calculations";
import QtyStepper from "./QtyStepper";

export default function SubItem({
  styles,
  item: s,
  parentCode,
  onVisitsChange,
  onUnitsChange,
  onRemove,
}) {
  const sName = s.item_name || s.item_code;
  const sShowVisit = hasVisitControl(s);
  const sShowUnit = hasUnitControl(s);

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
              <span className={styles.subItem__countLabel}>Visits</span>
              <QtyStepper
                className={styles.subItem__qty}
                value={s.visits || 1}
                onChange={(n) => onVisitsChange(parentCode, s.item_code, n)}
              />
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