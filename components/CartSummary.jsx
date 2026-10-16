// components/CartSummary.jsx
"use client";

import React from "react";
import { inr } from "../lib/format";

export default function CartSummary({
  styles,
  cartLength,
  subtotal,
  currency,
  payableCount,
  onRequestCount,
  totalVisits,
  totalUnits,
  onRequestQuote,
}) {
  return (
    <aside className={styles.cartAside}>
      <div className={styles.cartSummary}>
        <div className={styles.cartSummary__glow} aria-hidden="true" />

        <header className={styles.cartSummary__head}>
          <div className={styles.cartSummary__headLeft}>
            <span className={styles.cartSummary__eyebrow}>
              <span className={styles.cartSummary__eyebrowDot} />
              ORDER SUMMARY
            </span>
            <h3>Your request</h3>
          </div>
          <div className={styles.cartSummary__headBadge}>
            {cartLength} line{cartLength > 1 ? "s" : ""}
          </div>
        </header>

        <div className={styles.cartSummary__stats}>
          <div className={styles.cartSummary__stat}>
            <span className={styles.cartSummary__statNum}>{totalVisits}</span>
            <span className={styles.cartSummary__statLabel}>Service</span>
          </div>
          <div className={styles.cartSummary__statDivider} />
          <div className={styles.cartSummary__stat}>
            <span className={styles.cartSummary__statNum}>{totalUnits}</span>
            <span className={styles.cartSummary__statLabel}>Units</span>
          </div>
          <div className={styles.cartSummary__statDivider} />
          <div className={styles.cartSummary__stat}>
            <span className={styles.cartSummary__statNum}>
              {payableCount}
            </span>
            <span className={styles.cartSummary__statLabel}>Items</span>
          </div>
          {/* <div className={styles.cartSummary__statDivider} />
          <div className={styles.cartSummary__stat}>
            <span
              className={`${styles.cartSummary__statNum} ${
                onRequestCount > 0
                  ? styles["cartSummary__statNum--soft"]
                  : ""
              }`}
            >
              {onRequestCount}
            </span>
            <span className={styles.cartSummary__statLabel}>On request</span>
          </div> */}
        </div>

        <div className={styles.cartSummary__breakdown}>
          <div className={styles.cartSummary__row}>
            <span>Subtotal</span>
            <span>{inr(subtotal, currency)}</span>
          </div>
          <div className={styles.cartSummary__row}>
            <span>Taxes &amp; fees</span>
            <span className={styles.cartSummary__muted}>
              Calculated later
            </span>
          </div>
          {onRequestCount > 0 && (
            <div className={styles.cartSummary__row}>
              <span>On-request items</span>
              <span className={styles.cartSummary__badge}>
                {onRequestCount} pending
              </span>
            </div>
          )}
        </div>

        <div className={styles.cartSummary__total}>
          <div className={styles.cartSummary__totalLabel}>
            <span>Estimated total</span>
            <small>Final pricing after site assessment</small>
          </div>
          <div className={styles.cartSummary__totalValue}>
            {inr(subtotal, currency)}
          </div>
        </div>

        <button
          type="button"
          className={styles.cartSummary__cta}
          onClick={onRequestQuote}
        >
          <span className={styles.cartSummary__ctaLabel}>
            Request Quote for All
          </span>
          <span className={styles.cartSummary__ctaIcon} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 12L12 4M12 4H6M12 4V10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        <ul className={styles.cartSummary__trust}>
          <li>
            <span className={styles.cartSummary__trustIcon}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2.5 6.2L5 8.5L9.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Response within 24 hours
          </li>
          <li>
            <span className={styles.cartSummary__trustIcon}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2.5 6.2L5 8.5L9.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            No payment required to request
          </li>
        </ul>
      </div>
    </aside>
  );
}