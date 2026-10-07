// components/CartHero.jsx
"use client";

import React from "react";
import Link from "next/link";

export default function CartHero({
  styles,
  cartLength,
  totalVisits,
  totalUnits,
  onAddItems,
  onRequestQuote,
}) {
  return (
    <section className={styles.cartHero}>
      <div className={styles.cartHero__inner}>
        <div className={styles.cartHero__left}>
          <span className={styles.cartHero__eyebrow}>YOUR SELECTION</span>
          <h1>
            Review your
            <span> maintenance request.</span>
          </h1>
          <p>
            {cartLength === 0
              ? "Your cart is empty. Add AMC services to start building your request."
              : `${cartLength} line${
                  cartLength > 1 ? "s" : ""
                } · ${totalVisits} visit${
                  totalVisits > 1 ? "s" : ""
                } · ${totalUnits} unit${
                  totalUnits > 1 ? "s" : ""
                } ready to be quoted.`}
          </p>

          <div className={styles.cartHero__actions}>
            <Link
              href="/"
              className={`${styles.btn} ${styles["btn--ghost"]}`}
            >
              ← Continue Browsing
            </Link>
            <button
              type="button"
              className={`${styles.btn} ${styles["btn--ghost"]}`}
              onClick={onAddItems}
            >
              + Add Items
            </button>
            {cartLength > 0 && (
              <button
                type="button"
                className={`${styles.btn} ${styles["btn--primary"]}`}
                onClick={onRequestQuote}
              >
                Request Quote for All
                <span>↗</span>
              </button>
            )}
          </div>
        </div>

        <div className={styles.cartHero__right} aria-hidden="true">
          <div className={styles.cartHero__badge}>
            <div className={styles.cartHero__badgeRow}>
              <span className={styles.cartHero__badgeNum}>
                {String(totalVisits).padStart(2, "0")}
              </span>
              <span className={styles.cartHero__badgeLabel}>visits</span>
            </div>
            <div className={styles.cartHero__badgeDivider} />
            <div className={styles.cartHero__badgeRow}>
              <span className={styles.cartHero__badgeNum}>
                {String(totalUnits).padStart(2, "0")}
              </span>
              <span className={styles.cartHero__badgeLabel}>units</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}