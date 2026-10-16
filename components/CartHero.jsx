// components/CartHero.jsx
"use client";

import React, { useCallback } from "react";
import Link from "next/link";

/**
 * CartHero
 *
 * Hero section for the cart page. Displays a summary of the user's selection
 * and provides primary actions.
 *
 * Refresh flow:
 *   1. User clicks "⟳ Refresh Items" (only rendered when cart is empty).
 *   2. CartHero calls `onRefreshItems()` (fire-and-forget).
 *   3. Parent sets `refreshing = true`, awaits its async work (~0.5s),
 *      then sets `refreshing = false`.
 *   4. Parent passes the SAME `refreshing` flag into <EmptyCart /> so the
 *      spinner appears inside the white "Your cart is empty" box below.
 *
 * @param {Object}   props
 * @param {Object}   props.styles           - CSS module class names.
 * @param {number}   props.cartLength       - Number of distinct line items.
 * @param {number}   props.totalVisits      - Total number of visits.
 * @param {number}   props.totalUnits       - Total number of units.
 * @param {Function} props.onAddItems       - Callback to add items.
 * @param {Function} props.onRequestQuote   - Callback to request a quote.
 * @param {Function} [props.onRefreshItems] - Async callback to refresh the cart.
 * @param {boolean}  [props.refreshing]     - Controlled loading state.
 *                                            Owned by the parent so it can be
 *                                            shared with other sections
 *                                            (e.g. EmptyCart).
 */
export default function CartHero({
  styles,
  cartLength,
  totalVisits,
  totalUnits,
  onAddItems,
  onRequestQuote,
  onRefreshItems,
  refreshing = false,
}) {
  const handleRefresh = useCallback(() => {
    if (refreshing) return;
    if (typeof onRefreshItems !== "function") {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[CartHero] onRefreshItems was not provided; refresh is a no-op."
        );
      }
      return;
    }
    // Parent owns the loading lifecycle; fire-and-forget here.
    // The parent will flip `refreshing` to true, then pass it to <EmptyCart />
    // so the spinner renders inside the white "Your cart is empty" box.
    onRefreshItems();
  }, [refreshing, onRefreshItems]);

  const hasItems = cartLength > 0;

  const summaryText = hasItems
    ? `${cartLength} line${cartLength > 1 ? "s" : ""} · ${totalVisits} service${
        totalVisits > 1 ? "s" : ""
      } · ${totalUnits} unit${totalUnits > 1 ? "s" : ""} ready to be quoted.`
    : "Your cart is empty. Add AMC services to start building your request.";

  return (
    <section className={styles.cartHero}>
      <div className={styles.cartHero__inner}>
        <div className={styles.cartHero__left}>
          <span className={styles.cartHero__eyebrow}>YOUR SELECTION</span>

          <h1>
            Review your
            <span> maintenance request.</span>
          </h1>

          <p>{summaryText}</p>

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
              disabled={refreshing}
            >
              + Add Items
            </button>

            {/* Refresh button only shown when cart is empty.
                It triggers the parent's refresh, which then feeds the same
                `refreshing` flag into <EmptyCart /> below. */}
            {!hasItems && (
              <button
                type="button"
                className={`${styles.btn} ${styles["btn--ghost"]} ${
                  refreshing ? styles["btn--loading"] : ""
                }`}
                onClick={handleRefresh}
                disabled={refreshing}
                aria-busy={refreshing}
                aria-live="polite"
                aria-label={refreshing ? "Refreshing items…" : "Refresh items"}
              >
                {refreshing ? (
                  <>
                    <span className={styles.spinner} aria-hidden="true" />
                    Refreshing…
                  </>
                ) : (
                  "⟳ Refresh Items"
                )}
              </button>
            )}

            {hasItems && (
              <button
                type="button"
                className={`${styles.btn} ${styles["btn--primary"]}`}
                onClick={onRequestQuote}
                disabled={refreshing}
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
              <span className={styles.cartHero__badgeLabel}>service</span>
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