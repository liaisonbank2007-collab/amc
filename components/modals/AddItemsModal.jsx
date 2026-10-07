// components/modals/AddItemsModal.jsx
"use client";

import React from "react";
import CatalogBody from "../CatalogBody";

export default function AddItemsModal({
  styles,
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
  cart,
  onClearAll,
  onClose,
}) {
  return (
    <div
      className={styles.cartModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-items-title"
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
          <span className={styles.cartModal__eyebrow}>ADD AMC SERVICES</span>
          <h2 id="add-items-title">
            Pick items to <span>add to your cart.</span>
          </h2>
          <p>Search or filter by category, then tap an item to add it.</p>
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
          selectedLines={cart}
          onClearAll={onClearAll}
        />

        <div className={styles.cartModal__actions}>
          <button
            type="button"
            className={`${styles.btn} ${styles["btn--ghost"]}`}
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}