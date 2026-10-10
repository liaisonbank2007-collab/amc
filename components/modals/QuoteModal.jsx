// components/modals/QuoteModal.jsx
"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import Swal from "sweetalert2";
import { inr, prettyName } from "../../lib/format";
import { hasVisitControl, hasUnitControl } from "../../lib/visibility";
import { computeItemAmount } from "../../lib/calculations";

const QUOTE_FORM_ID = "quote-form";

// Coalescing window (ms) for the mousedown→focus→click burst. Well below
// human perception, but long enough to collapse the native event cascade.
const GUARD_COALESCE_MS = 400;

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
  /**
   * View mode = every field is read-only / disabled and the "Preview
   * Quotation" button is swapped for an "Edit Details" button.
   *
   * Flow:
   *   edit  ──[Preview Quotation]──▶  view  ──[Edit Details]──▶  edit
   *                                     │
   *                                     └──[Submit Request]──▶ onSubmit()
   *
   * While in view mode, ANY attempt to edit a field triggers a single
   * SweetAlert asking the user to confirm switching back to edit mode.
   */
  const [isViewMode, setIsViewMode] = useState(false);

  // Refs for focus management / scroll locking
  const panelRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  // Prevent multiple SweetAlerts stacking if the user mashes a field
  const swalOpenRef = useRef(false);

  // Timestamp of the last guard invocation, used to coalesce the
  // mousedown → focus → click event burst into one popup.
  const lastGuardAtRef = useRef(0);

  // Remember which field the user tried to edit so we can focus it after
  // switching back to edit mode.
  const pendingFocusRef = useRef(null);

  // Stable, SSR-safe id
  const titleId = useId();

  /* ------------------------------------------------------------------ *
   * 1. Focus management + body scroll lock
   * ------------------------------------------------------------------ */
  useEffect(() => {
    previouslyFocusedRef.current =
      typeof document !== "undefined" ? document.activeElement : null;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t = window.setTimeout(() => {
      panelRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;

      const el = previouslyFocusedRef.current;
      if (el && typeof el.focus === "function") el.focus();
    };
  }, []);

  /* ------------------------------------------------------------------ *
   * 2. Escape key handling (respects submitting + view mode + Swal)
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      if (submitting) return;
      if (swalOpenRef.current) return; // let Swal handle Escape itself

      if (isViewMode) {
        setIsViewMode(false);
      } else {
        onClose?.();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isViewMode, submitting, onClose]);

  /* ------------------------------------------------------------------ *
   * 3. Guard: intercept any edit attempt while in view mode.
   *
   *    Fires once per user gesture. Rapid mousedown/focus/click bursts
   *    are coalesced via `lastGuardAtRef`, and an already-open Swal
   *    short-circuits immediately via `swalOpenRef`.
   * ------------------------------------------------------------------ */
  const guardViewMode = useCallback(
    (e) => {
      if (!isViewMode) return false;

      // Remember the element the user tried to interact with so we can
      // re-focus it after they confirm.
      pendingFocusRef.current = e?.target || null;

      // Coalesce rapid-fire events (mousedown → focus → click) into one.
      const now = Date.now();
      if (now - lastGuardAtRef.current < GUARD_COALESCE_MS) return true;
      lastGuardAtRef.current = now;

      // Already showing a Swal? Don't stack.
      if (swalOpenRef.current) return true;
      swalOpenRef.current = true;

      Swal.fire({
        title: "Enable Edit Details mode?",
        text: "You are currently viewing the preview. Switch back to edit mode to make changes?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, enable editing",
        cancelButtonText: "Stay in preview",
        reverseButtons: true,
        focusCancel: true,
        allowOutsideClick: false,
        allowEscapeKey: true,
        customClass: {
          container: "quote-modal-swal",
        },
      })
        .then((result) => {
          if (!result.isConfirmed) return;

          setIsViewMode(false);

          const el = pendingFocusRef.current;
          pendingFocusRef.current = null;

          if (!el || typeof el.focus !== "function") return;

          // After React commits the mode flip, focus the pending field.
          window.setTimeout(() => {
            try {
              if (
                typeof el.select === "function" &&
                el.tagName === "INPUT" &&
                el.type !== "checkbox" &&
                el.type !== "radio"
              ) {
                el.select();
              } else {
                el.focus();
              }
            } catch {
              try {
                el.focus();
              } catch {
                /* noop */
              }
            }
          }, 0);
        })
        .finally(() => {
          swalOpenRef.current = false;
        });

      return true;
    },
    [isViewMode]
  );

  /* ------------------------------------------------------------------ *
   * 4. Form change handlers — ignored while in view mode
   * ------------------------------------------------------------------ */
  const handleChange = useCallback(
    (e) => {
      if (guardViewMode(e)) return;
      onChange?.(e);
    },
    [guardViewMode, onChange]
  );

  const handleSameAsSiteToggle = useCallback(
    (e) => {
      if (guardViewMode(e)) return;
      onSameAsSiteToggle?.(e);
    },
    [guardViewMode, onSameAsSiteToggle]
  );

  /**
   * Single interaction handler used by every editable field.
   *
   * Using `onMouseDown` (not `onClick`) means it fires BEFORE the native
   * focus event, so we only need ONE handler per field — no more double
   * SweetAlert from `onClick` + `onFocus` firing together.
   */
  const handleFieldInteract = useCallback(
    (e) => {
      guardViewMode(e);
    },
    [guardViewMode]
  );

  /* ------------------------------------------------------------------ *
   * 5. Submit logic
   *    - "Preview Quotation" (type=submit, data-intent="preview"):
   *         switches the form into view mode.
   *    - "Submit Request" (type=submit, data-intent="submit"):
   *         only enabled once in view mode; calls onSubmit.
   *
   *    `e.nativeEvent.submitter` is the canonical, race-free way to
   *    determine which button triggered the submit.
   * ------------------------------------------------------------------ */
  const handleFormSubmit = useCallback(
    (e) => {
      e.preventDefault();

      const submitter =
        e.nativeEvent?.submitter ||
        (typeof document !== "undefined" ? document.activeElement : null);

      const intent =
        submitter?.dataset?.intent ||
        submitter?.getAttribute?.("data-intent");

      if (intent === "preview") {
        setIsViewMode(true);
        return;
      }

      if (intent === "submit") {
        if (!isViewMode) return;
        onSubmit?.(e);
      }
    },
    [isViewMode, onSubmit]
  );

  /* ------------------------------------------------------------------ *
   * 6. Return to edit mode — defensive against event bubbling
   * ------------------------------------------------------------------ */
  const handleEditDetails = useCallback((e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setIsViewMode(false);
  }, []);

  /* ------------------------------------------------------------------ *
   * 7. Memoised preview rows
   * ------------------------------------------------------------------ */
  const previewRows = useMemo(() => {
    return activeQuoteItems.map((it, idx) => {
      const showVisit = hasVisitControl(it);
      const showUnit = hasUnitControl(it);

      const parts = [];
      if (showVisit) {
        parts.push(
          `${it.visits || 1} visit${(it.visits || 1) > 1 ? "s" : ""}`
        );
      }
      if (showUnit) {
        parts.push(
          `${it.units || 1} unit${(it.units || 1) > 1 ? "s" : ""}`
        );
      }
      parts.push(it.uom || it.stock_uom || "Nos");
      if (it.amc_sub_type_name) parts.push(it.amc_sub_type_name);

      return {
        key: `${it.item_code}-${idx}`,
        title: prettyName(it.item_name || it.item_code),
        subtitle: parts.join(" · "),
        thumb: (it.item_name || it.item_code).slice(0, 2).toUpperCase(),
        amount:
          it.rate && it.rate > 0
            ? inr(
                computeItemAmount(it) * (showVisit ? it.visits || 1 : 1),
                it.currency
              )
            : "On request",
      };
    });
  }, [activeQuoteItems]);

  const closeFromBackdrop = useCallback(() => {
    if (submitting) return;
    if (swalOpenRef.current) return;
    onClose?.();
  }, [submitting, onClose]);

  /* ------------------------------------------------------------------ *
   * Render
   * ------------------------------------------------------------------ */
  return (
    <div
      className={styles.cartModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={closeFromBackdrop}
      suppressHydrationWarning
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`${styles.cartModal__panel} ${styles["cartModal__panel--wide"]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.cartModal__close}
          aria-label="Close"
          onClick={closeFromBackdrop}
          disabled={submitting}
        >
          ×
        </button>

        <div className={styles.cartModal__head}>
          <span className={styles.cartModal__eyebrow}>
            {isBulk ? "BULK QUOTE" : "ITEM QUOTE"}
          </span>
          <h2 id={titleId}>
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
                  activeQuoteItems[0]?.item_name ||
                    activeQuoteItems[0]?.item_code ||
                    ""
                )}" and get back with a detailed quotation.`}
          </p>
        </div>

        <div className={styles.cartModal__preview}>
          {previewRows.map((row) => (
            <div key={row.key} className={styles.cartModal__previewRow}>
              <div className={styles.cartModal__previewThumb}>
                {row.thumb}
              </div>
              <div className={styles.cartModal__previewInfo}>
                <strong title={row.title}>{row.title}</strong>
                <span>{row.subtitle}</span>
              </div>
              <div className={styles.cartModal__previewPrice}>
                {row.amount}
              </div>
            </div>
          ))}
        </div>

        <form
          id={QUOTE_FORM_ID}
          className={styles.cartModal__form}
          onSubmit={handleFormSubmit}
          noValidate={false}
          data-view-mode={isViewMode ? "true" : "false"}
        >
          {/* -------------------- Contact details -------------------- */}
          <div className={styles.formSection}>
            <span className={styles.formSection__label}>Contact details</span>
            <div className={styles.cartModal__grid}>
              <label>
                <span>Full Name *</span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onMouseDown={handleFieldInteract}
                  placeholder="e.g. Ananya Sharma"
                  autoComplete="name"
                  required
                  readOnly={isViewMode}
                  aria-readonly={isViewMode}
                  suppressHydrationWarning
                />
              </label>
              <label>
                <span>Company Name</span>
                <input
                  type="text"
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  onMouseDown={handleFieldInteract}
                  placeholder="e.g. ABC Technologies Pvt Ltd"
                  autoComplete="organization"
                  readOnly={isViewMode}
                  aria-readonly={isViewMode}
                  suppressHydrationWarning
                />
              </label>
              <label>
                <span>Phone *</span>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  onMouseDown={handleFieldInteract}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  required
                  readOnly={isViewMode}
                  aria-readonly={isViewMode}
                  suppressHydrationWarning
                />
              </label>
              <label>
                <span>Email *</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onMouseDown={handleFieldInteract}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                  readOnly={isViewMode}
                  aria-readonly={isViewMode}
                  suppressHydrationWarning
                />
              </label>
            </div>
          </div>

          {/* -------------------- Billing details -------------------- */}
          <div className={styles.formSection}>
            <span className={styles.formSection__label}>Billing details</span>
            <div className={styles.cartModal__grid}>
              <label className={styles.cartModal__full}>
                <span>Service Address *</span>
                <textarea
                  name="address"
                  rows="2"
                  value={form.address}
                  onChange={handleChange}
                  onMouseDown={handleFieldInteract}
                  placeholder="Building, street, area"
                  autoComplete="street-address"
                  required
                  readOnly={isViewMode}
                  aria-readonly={isViewMode}
                  suppressHydrationWarning
                />
              </label>
              <label>
                <span>City *</span>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  onMouseDown={handleFieldInteract}
                  placeholder="Mumbai"
                  autoComplete="address-level2"
                  required
                  readOnly={isViewMode}
                  aria-readonly={isViewMode}
                  suppressHydrationWarning
                />
              </label>
              <label>
                <span>State *</span>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  onMouseDown={handleFieldInteract}
                  placeholder="Maharashtra"
                  autoComplete="address-level1"
                  required
                  readOnly={isViewMode}
                  aria-readonly={isViewMode}
                  suppressHydrationWarning
                />
              </label>
              <label>
                <span>Pincode *</span>
                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  onMouseDown={handleFieldInteract}
                  placeholder="400069"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  pattern="[0-9]{4,10}"
                  required
                  readOnly={isViewMode}
                  aria-readonly={isViewMode}
                  suppressHydrationWarning
                />
              </label>
              <label>
                <span>Property Type</span>
                <select
                  name="property_type"
                  value={form.property_type}
                  onChange={handleChange}
                  onMouseDown={handleFieldInteract}
                  disabled={isViewMode}
                  aria-readonly={isViewMode}
                  suppressHydrationWarning
                >
                  <option value="Commercial">Commercial</option>
                  <option value="Residential">Residential</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Institutional">Institutional</option>
                </select>
              </label>
            </div>
          </div>

          {/* -------------------- Shipping details -------------------- */}
          <div className={styles.formSection}>
            <div className={styles.formSection__head}>
              <span className={styles.formSection__label}>
                Shipping details
              </span>
              <label className={styles.cartModal__checkbox}>
                <input
                  type="checkbox"
                  checked={form.sameAsSite}
                  onChange={handleSameAsSiteToggle}
                  onMouseDown={handleFieldInteract}
                  disabled={isViewMode}
                  aria-readonly={isViewMode}
                  suppressHydrationWarning
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
                  onChange={handleChange}
                  onMouseDown={handleFieldInteract}
                  placeholder="Building, street, area"
                  autoComplete="shipping street-address"
                  required
                  readOnly={isViewMode}
                  aria-readonly={isViewMode}
                  disabled={shippingLocked}
                  suppressHydrationWarning
                />
              </label>
              <label>
                <span>Shipping City *</span>
                <input
                  type="text"
                  name="shipping_city"
                  value={form.shipping_city}
                  onChange={handleChange}
                  onMouseDown={handleFieldInteract}
                  placeholder="Mumbai"
                  autoComplete="shipping address-level2"
                  required
                  readOnly={isViewMode}
                  aria-readonly={isViewMode}
                  disabled={shippingLocked}
                  suppressHydrationWarning
                />
              </label>
              <label>
                <span>Shipping Email *</span>
                <input
                  type="email"
                  name="shipping_email"
                  value={form.shipping_email}
                  onChange={handleChange}
                  onMouseDown={handleFieldInteract}
                  placeholder="you@company.com"
                  autoComplete="shipping email"
                  required
                  readOnly={isViewMode}
                  aria-readonly={isViewMode}
                  disabled={shippingLocked}
                  suppressHydrationWarning
                />
              </label>
              <label>
                <span>Shipping Mobile *</span>
                <input
                  type="tel"
                  name="shipping_mobile"
                  value={form.shipping_mobile}
                  onChange={handleChange}
                  onMouseDown={handleFieldInteract}
                  placeholder="+91 98765 43210"
                  autoComplete="shipping tel"
                  required
                  readOnly={isViewMode}
                  aria-readonly={isViewMode}
                  disabled={shippingLocked}
                  suppressHydrationWarning
                />
              </label>
              <label>
                <span>Shipping State *</span>
                <input
                  type="text"
                  name="shipping_state"
                  value={form.shipping_state}
                  onChange={handleChange}
                  onMouseDown={handleFieldInteract}
                  placeholder="Maharashtra"
                  autoComplete="shipping address-level1"
                  required
                  readOnly={isViewMode}
                  aria-readonly={isViewMode}
                  disabled={shippingLocked}
                  suppressHydrationWarning
                />
              </label>
              <label>
                <span>Shipping Pincode *</span>
                <input
                  type="text"
                  name="shipping_pincode"
                  value={form.shipping_pincode}
                  onChange={handleChange}
                  onMouseDown={handleFieldInteract}
                  placeholder="400069"
                  inputMode="numeric"
                  autoComplete="shipping postal-code"
                  pattern="[0-9]{4,10}"
                  required
                  readOnly={isViewMode}
                  aria-readonly={isViewMode}
                  disabled={shippingLocked}
                  suppressHydrationWarning
                />
              </label>
            </div>
          </div>

          {/* -------------------- AMC preferences -------------------- */}
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
                  onChange={handleChange}
                  onMouseDown={handleFieldInteract}
                  disabled={isViewMode}
                  aria-readonly={isViewMode}
                  suppressHydrationWarning
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
                  onChange={handleChange}
                  onMouseDown={handleFieldInteract}
                  placeholder="AMC services required for office premises…"
                  readOnly={isViewMode}
                  aria-readonly={isViewMode}
                  suppressHydrationWarning
                />
              </label>
            </div>
          </div>

          {/* -------------------- Summary -------------------- */}
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

          {isViewMode && (
            <div
              className={styles.cartModal__previewConfirmed}
              role="status"
              aria-live="polite"
            >
              ✓ Preview confirmed. You can now submit your request, or click
              “Edit Details” to make changes.
            </div>
          )}

          {/* -------------------- Actions -------------------- */}
          <div className={styles.cartModal__actions}>
            <button
              type="button"
              className={`${styles.btn} ${styles["btn--ghost"]}`}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>

            {isViewMode ? (
              <button
                type="button"
                className={`${styles.btn} ${styles["btn--preview"]}`}
                onClick={handleEditDetails}
                disabled={submitting}
              >
                Edit Details
              </button>
            ) : (
              <button
                type="submit"
                form={QUOTE_FORM_ID}
                data-intent="preview"
                className={`${styles.btn} ${styles["btn--preview"]}`}
                disabled={submitting}
              >
                Preview Quotation
              </button>
            )}

            <button
              type="submit"
              form={QUOTE_FORM_ID}
              data-intent="submit"
              className={`${styles.btn} ${styles["btn--primary"]}`}
              disabled={submitting || !isViewMode}
              aria-disabled={submitting || !isViewMode}
              title={
                !isViewMode
                  ? "Please preview and confirm before submitting"
                  : undefined
              }
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