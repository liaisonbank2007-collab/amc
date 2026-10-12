// components/CartItem.jsx
"use client";

import React from "react";
import { inr, prettyName } from "../lib/format";
import {
  hasVisitControl,
  hasUnitControl,
  hasQtyControls,
} from "../lib/visibility";
import { lineTotal } from "../lib/calculations";
import QtyStepper from "./QtyStepper";
import SubItem from "./SubItem";

export default function CartItem({
  styles,
  item: it,
  onVisitsChange,
  onUnitsChange,
  onSubVisitsChange,
  onSubUnitsChange,
  onRemove,
  onRemoveSub,
  onQuote,
  onAddMore,
}) {
  const displayName = it.item_name || it.item_code;
  const subItems = it.subItems || [];
  const { total, hasPayable } = lineTotal(it);
  const subCount = subItems.length;
  const showVisit = hasVisitControl(it);
  const showUnit = hasUnitControl(it);

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
                    <span className={styles.cartItem__countLabel}>Visits</span>
                    <QtyStepper
                      className={styles.cartItem__qty}
                      value={it.visits || 1}
                      onChange={(n) => onVisitsChange(it.item_code, n)}
                    />
                  </div>
                )}

                {showUnit && (
                  <div className={styles.cartItem__count}>
                    <span className={styles.cartItem__countLabel}>
                      Units
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

            <div className={styles.cartItem__price}>
              {hasPayable ? (
                <>
                  <span className={styles.cartItem__rate}>
                    {(() => {
                      const parts = [];
                      if (showVisit)
                        parts.push(
                          `${(it.visits || 1).toLocaleString("en-IN")} visit${
                            (it.visits || 1) > 1 ? "s" : ""
                          }`,
                        );
                      if (showUnit)
                        parts.push(
                          `${(it.units || 1).toLocaleString("en-IN")} unit${
                            (it.units || 1) > 1 ? "s" : ""
                          }`,
                        );
                      return parts.length ? parts.join(" × ") : "Fixed";
                    })()}
                  </span>
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
          <p className={styles.cartItem__perunit}>
            {it.custom_min_amount} for min <br />
            {it.custom_unit}/{it.uom || it.stock_uom || "Nos"}
          </p>
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
          <strong>{hasPayable ? inr(total, it.currency) : "On request"}</strong>
        </div>
      </div>
    </li>
  );
}