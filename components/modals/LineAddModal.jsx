// components/modals/LineAddModal.jsx
"use client";

import React from "react";
import { inr, prettyName } from "../../lib/format";
import { hasVisitControl, hasUnitControl } from "../../lib/visibility";
import { lineTotal } from "../../lib/calculations";
import CatalogBody from "../CatalogBody";

export default function LineAddModal({
  styles,
  parent,
  search,
  setSearch,
  catalogTypes,
  activeTypes,
  setActiveTypes,
  catalogLoading,
  catalogError,
  filteredCatalog,
  onAdd,
  onRemove,
  isAdded,
  retry,
  onClose,
}) {
  const parentTotal = lineTotal(parent).total;

  return (
    <div
      className={styles.cartModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="line-add-title"
      onClick={onClose}
    >
      <div
        className={`${styles.cartModal__panel} ${styles["cartModal__panel--wide"]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.cartModal__close}
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>

        <div className={styles.cartModal__head}>
          <span className={styles.cartModal__eyebrow}>
            ADD TO THIS CART LINE
          </span>
          <h2 id="line-add-title">
            Adding to{" "}
            <span>
              {prettyName(parent.item_name || parent.item_code)}
            </span>
          </h2>
          <p>
            Selected items will appear as sub-items under this line. They share
            the same quote request.
          </p>
        </div>

        <div className={styles.lineAddParent}>
          <div className={styles.lineAddParent__thumb}>
            {(parent.item_name || parent.item_code)
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className={styles.lineAddParent__info}>
            <strong title={parent.item_name || parent.item_code}>
              {prettyName(parent.item_name || parent.item_code)}
            </strong>
            <span>
              {(() => {
                const parts = [];
                if (hasVisitControl(parent))
                  parts.push(
                    `${parent.visits || 1} visit${
                      (parent.visits || 1) > 1 ? "s" : ""
                    }`
                  );
                if (hasUnitControl(parent))
                  parts.push(
                    `${parent.units || 1} unit${
                      (parent.units || 1) > 1 ? "s" : ""
                    }`
                  );
                parts.push(parent.uom || "Nos");
                if ((parent.subItems || []).length > 0)
                  parts.push(
                    `${parent.subItems.length} add-on${
                      parent.subItems.length > 1 ? "s" : ""
                    }`
                  );
                return parts.join(" · ");
              })()}
            </span>
          </div>
          <div className={styles.lineAddParent__priceWrap}>
            <span>Running total</span>
            <strong>
              {lineTotal(parent).hasPayable
                ? inr(parentTotal, parent.currency)
                : "On request"}
            </strong>
          </div>
        </div>

        <CatalogBody
          styles={styles}
          search={search}
          setSearch={setSearch}
          catalogTypes={catalogTypes}
          activeTypes={activeTypes}
          setActiveTypes={setActiveTypes}
          catalogLoading={catalogLoading}
          catalogError={catalogError}
          filteredCatalog={filteredCatalog}
          onAdd={onAdd}
          onRemove={onRemove}
          isAdded={isAdded}
          retry={retry}
          addLabel={(added) => (added ? "Add again" : "Add")}
          selectedLines={parent.subItems || []}
        />

        <div className={styles.cartModal__actions}>
          <button
            type="button"
            className={`${styles.btn} ${styles["btn--primary"]}`}
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}