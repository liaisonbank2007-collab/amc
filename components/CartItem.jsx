// components/CartItem.jsx
"use client";

import React, { useState, useCallback } from "react";
import { inr, prettyName } from "../lib/format";
import {
  hasVisitControl,
  hasUnitControl,
  hasQtyControls,
} from "../lib/visibility";
import {
  lineTotal,
  DURATION_OPTIONS,
  getDiscountForDuration,
  getDurationOption,
  durationValueToMonths,
  getMaxVisits,        // ✅
  hasVisitCap,         // ✅
  MIN_DISCOUNT_MONTHS,
  getDurationOptionsForItem,
} from "../lib/calculations";
import QtyStepper from "./QtyStepper";
import SubItem from "./SubItem";

export default function CartItem({
  styles,
  item: it,
  onVisitsChange,
  onUnitsChange,
  onSubVisitsChange,
  onSubUnitsChange,
  onDurationChange,
  onRemove,
  onRemoveSub,
  onQuote,
  onAddMore,
}) {
  const displayName = it.item_name || it.item_code;
  const subItems = it.subItems || [];
  const currentDuration = it.selectedDuration || "12 Months";
const durationOptions = getDurationOptionsForItem(it);
  const { subtotal, discountPercentage, discountAmount, total, hasPayable } =
    lineTotal(it, currentDuration);

  const subCount = subItems.length;
  const showVisit = hasVisitControl(it);
  const showUnit = hasUnitControl(it);
  const durationOption = getDurationOption(currentDuration);

  // ✅ Cap only when custom_max_visit > 0; otherwise Infinity = "no cap"
  const capped = hasVisitCap(it);
  const maxVisits = capped ? getMaxVisits(it, currentDuration) : null;

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

  const handleDurationChange = (e) => {
    const newDuration = e.target.value;
    if (onDurationChange) onDurationChange(it.item_code, newDuration);
  };

  // ✅ When no cap → straight passthrough, no validation
  const handleVisitsChange = useCallback(
    (next) => {
      const n = Number(next) || 1;

      if (!capped) {
        onVisitsChange?.(it.item_code, n);
        return;
      }

      if (n > maxVisits) {
        showVisitWarning(
          `Max ${maxVisits} visit${maxVisits > 1 ? "s" : ""} allowed for ` +
            `${durationValueToMonths(currentDuration)} month duration.`
        );
        onVisitsChange?.(it.item_code, maxVisits);
        return;
      }
      onVisitsChange?.(it.item_code, n);
    },
    [
      capped,
      maxVisits,
      currentDuration,
      it.item_code,
      onVisitsChange,
      showVisitWarning,
    ]
  );

  const handleVisitClamp = useCallback(
    ({ reason, max }) => {
      if (!capped) return;                // ✅ no warning when uncapped
      if (reason !== "max") return;
      showVisitWarning(
        `Max ${max} visit${max > 1 ? "s" : ""} allowed for ` +
          `${durationValueToMonths(currentDuration)} month duration.`
      );
    },
    [capped, currentDuration, showVisitWarning]
  );

  return (
    <li className={styles.cartItem}>
      <div className={styles.cartItem__main}>
        <div className={styles.cartItem__thumb} aria-hidden="true">
          {displayName.slice(0, 2).toUpperCase()}
        </div>

        <div className={styles.cartItem__body}>
          <div className={styles.cartItem__info}>
            <span className={styles.cartItem__tag}>
              {it.amc_sub_type_name ||
                it.amc_sub_type ||
                it.amc_type_name ||
                "AMC"}
            </span>
            <h3 title={displayName}>{prettyName(displayName)}</h3>
            <p className={styles.cartItem__meta}>
              Code {it.item_code} · UOM {it.uom || "Nos"}
              {subCount > 0 &&
                ` · ${subCount} add-on${subCount > 1 ? "s" : ""}`}
            </p>
          </div>

          <div className={styles.cartItem__controls}>
            {hasQtyControls(it) && (
              <div className={styles.cartItem__counts}>
                {showVisit && (
                  <div className={styles.cartItem__count}>
                    <span className={styles.cartItem__countLabel}>
                      Visits
                      {capped && (
                        <em className={styles.cartItem__capBadge}>
                          max {maxVisits}
                        </em>
                      )}
                    </span>
                    <QtyStepper
                      className={styles.cartItem__qty}
                      value={it.visits || 1}
                      /* ✅ pass max ONLY when capped */
                      max={capped ? maxVisits : undefined}
                      onChange={handleVisitsChange}
                      onClamp={capped ? handleVisitClamp : undefined}
                    />
                    {visitWarning && (
                      <span
                        className={styles.cartItem__warning}
                        role="alert"
                      >
                        {visitWarning}
                      </span>
                    )}
                  </div>
                )}

                {showUnit && (
                  <div className={styles.cartItem__count}>
                    <span className={styles.cartItem__countLabel}>
                      <em className={styles.cartItem__uom}>
                        {it.uom || it.stock_uom || "Nos"}
                      </em>
                    </span>
                    <QtyStepper
                      className={styles.cartItem__qty}
                      value={it.units || 1}
                      onChange={(n) => onUnitsChange(it.item_code, n)}
                    />
                  </div>
                )}
              </div>
            )}

            <div className={styles.cartItem__duration}>
              <span className={styles.cartItem__countLabel}>
                Duration
                {discountPercentage > 0 && (
                  <em className={styles.cartItem__discountBadge}>
                    {discountPercentage}% off
                  </em>
                )}
              </span>
            <select
  className={styles.cartItem__durationSelect}
  value={currentDuration}
  onChange={handleDurationChange}
  aria-label="Select AMC duration"
>
  {durationOptions.map((opt) => {                    // ✅ filtered list
    const showDiscount =
      opt.months >= MIN_DISCOUNT_MONTHS && opt.discount > 0;
    return (
      <option key={opt.value} value={opt.value}>
        {opt.label}
        {showDiscount ? ` (${opt.discount}% off)` : ""}
      </option>
    );
  })}
</select>
            </div>

            <div className={styles.cartItem__price}>
              {hasPayable ? (
                <>
                  <span className={styles.cartItem__rate}>
                    {(() => {
                      const parts = [];
                      if (showVisit)
                        parts.push(
                          `${it.visits || 1} visit${
                            (it.visits || 1) > 1 ? "s" : ""
                          }`
                        );
                      if (showUnit)
                        parts.push(
                          `${it.units || 1} unit${
                            (it.units || 1) > 1 ? "s" : ""
                          }`
                        );
                      const months = durationValueToMonths(currentDuration);
                      parts.push(`${months} month${months > 1 ? "s" : ""}`);
                      return parts.join(" × ");
                    })()}
                  </span>

                  {discountPercentage > 0 && (
                    <span className={styles.cartItem__savings}>
                      <s>{inr(subtotal, it.currency)}</s>
                      <span className={styles.cartItem__savingsBadge}>
                        Save {inr(discountAmount, it.currency)}
                      </span>
                    </span>
                  )}

                  <span className={styles.cartItem__line}>
                    {inr(total, it.currency)}
                  </span>
                </>
              ) : (
                <span className={styles.cartItem__onRequest}>On request</span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.cartItem__actions}>
          <button
            type="button"
            className={styles.cartItem__quote}
            onClick={() => onQuote(it)}
          >
            Quote
            <span>↗</span>
          </button>
          <button
            type="button"
            className={styles.cartItem__remove}
            aria-label="Remove item"
            onClick={() => onRemove(it.item_code)}
          >
            Remove
          </button>
          {Number(it.custom_min_amount) > 0 && Number(it.custom_unit) > 0 && (
            <p className={styles.cartItem__perunit}>
              {it.custom_min_amount} for min <br />
              {Number(it.custom_unit).toLocaleString("en-IN")}
              /{it.uom || it.stock_uom || "Nos"}
            </p>
          )}
        </div>
      </div>

      {subItems.length > 0 && (
        <ul className={styles.cartItem__subs}>
          {subItems.map((s) => (
            <SubItem
              key={s.item_code}
              styles={styles}
              item={s}
              parentCode={it.item_code}
              parentDuration={currentDuration}
              onVisitsChange={onSubVisitsChange}
              onUnitsChange={onSubUnitsChange}
              onRemove={onRemoveSub}
            />
          ))}
        </ul>
      )}

      <div className={styles.cartItem__footer}>
        <button
          type="button"
          className={styles.cartItem__addMore}
          onClick={() => onAddMore(it)}
        >
          + Add more items to this
        </button>

        <div className={styles.cartItem__subtotal}>
          <span>Line total</span>
          {hasPayable ? (
            <>
              {discountPercentage > 0 && (
                <small className={styles.cartItem__originalTotal}>
                  Original: {inr(subtotal, it.currency)}
                </small>
              )}
              <strong>{inr(total, it.currency)}</strong>
            </>
          ) : (
            <strong>On request</strong>
          )}
        </div>
      </div>
    </li>
  );
}