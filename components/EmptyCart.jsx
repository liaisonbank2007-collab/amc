// components/EmptyCart.jsx
"use client";

import React from "react";
import Link from "next/link";

export default function EmptyCart({ styles, onAddItems, refreshing }) {
  return (
    <section className={styles.cartSection}>
      <div className={styles.cartEmpty}>
        {/* Icon / spinner swap */}
        <div
          className={styles.emptyCartIcon}
          aria-busy={refreshing}
          aria-live="polite"
        >
          {refreshing ? (
            <span className={styles.spinner} aria-hidden="true" />
          ) : (
            <span aria-hidden="true">🛒</span>
          )}
        </div>

        <h2 className={styles.emptyCartTitle}>
          {refreshing ? "Refreshing your cart…" : "Your cart is empty"}
        </h2>

        <p className={styles.emptyCartText}>
          {refreshing
            ? "Checking for the latest items in your cart."
            : "Add AMC services to your cart to build your maintenance request."}
        </p>
        {/* <div className={styles.cartEmpty__icon}>🛒</div>
        <h2>Your cart is empty</h2>
        <p>
          Add AMC services to your cart to build your maintenance request.
        </p> */}
        <div className={styles.cartEmpty__actions}>
          <button
            type="button"
            className={`${styles.btn} ${styles["btn--primary"]}`}
            onClick={onAddItems}
          >
            + Add Items <span>↗</span>
          </button>
          <Link href="/" className={`${styles.btn} ${styles["btn--ghost"]}`}>
            Explore AMC Services
          </Link>
        </div>
      </div>
    </section>
  );
}