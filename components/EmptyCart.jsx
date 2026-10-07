// components/EmptyCart.jsx
"use client";

import React from "react";
import Link from "next/link";

export default function EmptyCart({ styles, onAddItems }) {
  return (
    <section className={styles.cartSection}>
      <div className={styles.cartEmpty}>
        <div className={styles.cartEmpty__icon}>🛒</div>
        <h2>Your cart is empty</h2>
        <p>
          Add AMC services to your cart to build your maintenance request.
        </p>
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