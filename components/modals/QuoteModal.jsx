// components/modals/QuoteModal.jsx
"use client";

import React from "react";
import { inr, prettyName } from "../../lib/format";
import { hasVisitControl, hasUnitControl } from "../../lib/visibility";
import { computeItemAmount } from "../../lib/calculations";

export default function QuoteModal({
  styles,
  isBulk,
  activeQuoteItems,
  quoteSummary,
  form,
  shippingLocked,
  submitting,
  onChange,
  onSameAsSiteToggle,
  onSubmit,
  onClose,
}) {
  return (
    <div
      className={styles.cartModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-modal-title"
      onClick={() => !submitting && onClose()}
    >
      <div
        className={`${styles.cartModal__panel} ${styles["cartModal__panel--wide"]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.cartModal__close}
          aria-label="Close"
          onClick={() => !submitting && onClose()}
        >
          ×
        </button>

        <div className={styles.cartModal__head}>
          <span className={styles.cartModal__eyebrow}>
            {isBulk ? "BULK QUOTE" : "ITEM QUOTE"}
          </span>
          <h2 id="quote-modal-title">
            {isBulk ? (
              <>
                Quote for <span>all items.</span>
              </>
            ) : (
              <>
                Quote for <span>this item.</span>
              </>
            )}
          </h2>
          <p>
            {isBulk
              ? `We'll review your ${quoteSummary.totalVisits} visit${
                  quoteSummary.totalVisits > 1 ? "s" : ""
                } and ${quoteSummary.totalUnits} unit${
                  quoteSummary.totalUnits > 1 ? "s" : ""
                } and get back with a detailed quotation within 24 hours.`
              : `We'll review "${prettyName(
                  activeQuoteItems[0].item_name ||
                    activeQuoteItems[0].item_code
                )}" and get back with a detailed quotation.`}
          </p>
        </div>

        <div className={styles.cartModal__preview}>
          {activeQuoteItems.map((it, idx) => {
            const showVisit = hasVisitControl(it);
            const showUnit = hasUnitControl(it);
            const parts = [];
            if (showVisit)
              parts.push(
                `${it.visits || 1} visit${(it.visits || 1) > 1 ? "s" : ""}`
              );
            if (showUnit)
              parts.push(
                `${it.units || 1} unit${(it.units || 1) > 1 ? "s" : ""}`
              );
            parts.push(it.uom || it.stock_uom || "Nos");
            if (it.amc_sub_type_name) parts.push(it.amc_sub_type_name);

            return (
              <div
                key={`${it.item_code}-${idx}`}
                className={styles.cartModal__previewRow}
              >
                <div className={styles.cartModal__previewThumb}>
                  {(it.item_name || it.item_code).slice(0, 2).toUpperCase()}
                </div>
                <div className={styles.cartModal__previewInfo}>
                  <strong title={it.item_name || it.item_code}>
                    {prettyName(it.item_name || it.item_code)}
                  </strong>
                  <span>{parts.join(" · ")}</span>
                </div>
                <div className={styles.cartModal__previewPrice}>
                  {it.rate && it.rate > 0
                    ? inr(
                        computeItemAmount(it) * (showVisit ? it.visits || 1 : 1),
                        it.currency
                      )
                    : "On request"}
                </div>
              </div>
            );
          })}
        </div>

        <form className={styles.cartModal__form} onSubmit={onSubmit}>
          <div className={styles.formSection}>
            <span className={styles.formSection__label}>Contact details</span>
            <div className={styles.cartModal__grid}>
              <label>
                <span>Full Name *</span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="e.g. Ananya Sharma"
                  required
                />
              </label>
              <label>
                <span>Company Name</span>
                <input
                  type="text"
                  name="company_name"
                  value={form.company_name}
                  onChange={onChange}
                  placeholder="e.g. ABC Technologies Pvt Ltd"
                />
              </label>
              <label>
                <span>Phone *</span>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="+91 98765 43210"
                  required
                />
              </label>
              <label>
                <span>Email *</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="you@company.com"
                  required
                />
              </label>
            </div>
          </div>

          <div className={styles.formSection}>
            <span className={styles.formSection__label}>Billing details</span>
            <div className={styles.cartModal__grid}>
              <label className={styles.cartModal__full}>
                <span>Service Address *</span>
                <textarea
                  name="address"
                  rows="2"
                  value={form.address}
                  onChange={onChange}
                  placeholder="Building, street, area"
                  required
                />
              </label>
              <label>
                <span>City *</span>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={onChange}
                  placeholder="Mumbai"
                  required
                />
              </label>
              <label>
                <span>State *</span>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={onChange}
                  placeholder="Maharashtra"
                  required
                />
              </label>
              <label>
                <span>Pincode *</span>
                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={onChange}
                  placeholder="400069"
                  inputMode="numeric"
                  pattern="[0-9]{4,10}"
                  required
                />
              </label>
              <label>
                <span>Property Type</span>
                <select
                  name="property_type"
                  value={form.property_type}
                  onChange={onChange}
                >
                  <option value="Commercial">Commercial</option>
                  <option value="Residential">Residential</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Institutional">Institutional</option>
                </select>
              </label>
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.formSection__head}>
              <span className={styles.formSection__label}>
                Shipping details
              </span>
              <label className={styles.cartModal__checkbox}>
                <input
                  type="checkbox"
                  checked={form.sameAsSite}
                  onChange={onSameAsSiteToggle}
                />
                <span
                  className={styles.cartModal__checkboxBox}
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    width="14"
                    height="14"
                  >
                    <path
                      d="M3 8.5L6.5 12L13 4.5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className={styles.cartModal__checkboxLabel}>
                  Same as Billing details
                </span>
              </label>
            </div>
            <div className={styles.cartModal__grid}>
              <label className={styles.cartModal__full}>
                <span>Shipping Address *</span>
                <textarea
                  name="shipping_address"
                  rows="2"
                  value={form.shipping_address}
                  onChange={onChange}
                  placeholder="Building, street, area"
                  required
                  disabled={shippingLocked}
                />
              </label>
              <label>
                <span>Shipping City *</span>
                <input
                  type="text"
                  name="shipping_city"
                  value={form.shipping_city}
                  onChange={onChange}
                  placeholder="Mumbai"
                  required
                  disabled={shippingLocked}
                />
              </label>
              <label>
                <span>Shipping Email *</span>
                <input
                  type="email"
                  name="shipping_email"
                  value={form.shipping_email}
                  onChange={onChange}
                  placeholder="you@company.com"
                  required
                  disabled={shippingLocked}
                />
              </label>
              <label>
                <span>Shipping Mobile *</span>
                <input
                  type="tel"
                  name="shipping_mobile"
                  value={form.shipping_mobile}
                  onChange={onChange}
                  placeholder="+91 98765 43210"
                  required
                  disabled={shippingLocked}
                />
              </label>
              <label>
                <span>Shipping State *</span>
                <input
                  type="text"
                  name="shipping_state"
                  value={form.shipping_state}
                  onChange={onChange}
                  placeholder="Maharashtra"
                  required
                  disabled={shippingLocked}
                />
              </label>
              <label>
                <span>Shipping Pincode *</span>
                <input
                  type="text"
                  name="shipping_pincode"
                  value={form.shipping_pincode}
                  onChange={onChange}
                  placeholder="400069"
                  inputMode="numeric"
                  pattern="[0-9]{4,10}"
                  required
                  disabled={shippingLocked}
                />
              </label>
            </div>
          </div>

          <div className={styles.formSection}>
            <span className={styles.formSection__label}>
              AMC preferences
            </span>
            <div className={styles.cartModal__grid}>
              <label>
                <span>Duration</span>
                <select
                  name="duration"
                  value={form.duration}
                  onChange={onChange}
                >
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="12 Months">12 Months</option>
                </select>
              </label>
              <label className={styles.cartModal__full}>
                <span>Remarks (optional)</span>
                <textarea
                  name="notes"
                  rows="2"
                  value={form.notes}
                  onChange={onChange}
                  placeholder="AMC services required for office premises…"
                />
              </label>
            </div>
          </div>

          <div className={styles.cartModal__summary}>
            <div>
              <span>Total visits</span>
              <strong>{quoteSummary.totalVisits}</strong>
            </div>
            <div>
              <span>Total units</span>
              <strong>{quoteSummary.totalUnits}</strong>
            </div>
            <div>
              <span>Estimated subtotal</span>
              <strong>
                {inr(quoteSummary.subtotal, quoteSummary.currency)}
              </strong>
            </div>
          </div>

          <div className={styles.cartModal__actions}>
            <button
              type="button"
              className={`${styles.btn} ${styles["btn--ghost"]}`}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.btn} ${styles["btn--primary"]}`}
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit Request"}
              {!submitting && <span>↗</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}