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
const GUARD_COALESCE_MS = 400;
const FIRST_EDITABLE_FIELD_NAME = "name";

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
  const [isViewMode, setIsViewMode] = useState(false);

  const panelRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const swalOpenRef = useRef(false);
  const lastGuardAtRef = useRef(0);
  const shouldFocusFullNameRef = useRef(false);
  const raf2Ref = useRef(0);

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
   * 2. Escape key handling
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      if (submitting) return;
      if (swalOpenRef.current) return;

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
   * 3. Scroll the modal panel back to the top.
   * ------------------------------------------------------------------ */
  const scrollPanelToTop = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const behavior = prefersReducedMotion ? "auto" : "smooth";

    let scroller = panel;
    let node = panel.parentElement;
    while (node) {
      const style =
        typeof window !== "undefined"
          ? window.getComputedStyle(node)
          : null;
      const overflowY = style?.overflowY;
      const canScroll =
        (overflowY === "auto" || overflowY === "scroll") &&
        node.scrollHeight > node.clientHeight;

      if (canScroll) {
        scroller = node;
        break;
      }
      node = node.parentElement;
    }

    try {
      scroller.scrollTo({ top: 0, behavior });
    } catch {
      scroller.scrollTop = 0;
    }
  }, []);

  /* ------------------------------------------------------------------ *
   * 4. Post-commit effect: focus Full Name when returning to edit mode.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (isViewMode) return;
    if (!shouldFocusFullNameRef.current) return;

    shouldFocusFullNameRef.current = false;

    const panel = panelRef.current;
    if (!panel) return;

    const formEl =
      panel.querySelector(`#${QUOTE_FORM_ID}`) ||
      panel.querySelector("form");
    if (!formEl) return;

    const field = formEl.querySelector(
      `[name="${FIRST_EDITABLE_FIELD_NAME}"]`
    );
    if (!field || typeof field.focus !== "function") return;

    const raf1 = window.requestAnimationFrame(() => {
      const raf2 = window.requestAnimationFrame(() => {
        scrollPanelToTop();

        try {
          field.focus({ preventScroll: true });

          if (
            typeof field.select === "function" &&
            field.tagName === "INPUT" &&
            field.type !== "checkbox" &&
            field.type !== "radio"
          ) {
            field.select();
          }
        } catch {
          try {
            field.focus();
          } catch {
            /* noop */
          }
        }

        window.requestAnimationFrame(() => {
          scrollPanelToTop();
        });
      });

      raf2Ref.current = raf2;
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      if (raf2Ref.current) {
        window.cancelAnimationFrame(raf2Ref.current);
        raf2Ref.current = 0;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isViewMode]);

  /* ------------------------------------------------------------------ *
   * 5. Guard: intercept any edit attempt while in view mode.
   * ------------------------------------------------------------------ */
  const guardViewMode = useCallback(
    (e) => {
      if (!isViewMode) return false;

      const now = Date.now();
      if (now - lastGuardAtRef.current < GUARD_COALESCE_MS) return true;
      lastGuardAtRef.current = now;

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
        returnFocus: false,
        customClass: {
          container: "quote-modal-swal",
          confirmButton: "quote-confirm-btn",
        },
      })
        .then((result) => {
          if (!result.isConfirmed) return;

          if (typeof document !== "undefined") {
            const active = document.activeElement;
            if (active && typeof active.blur === "function") {
              try {
                active.blur();
              } catch {
                /* noop */
              }
            }
          }

          shouldFocusFullNameRef.current = true;
          setIsViewMode(false);
        })
        .finally(() => {
          swalOpenRef.current = false;
        });

      return true;
    },
    [isViewMode]
  );

  /* ------------------------------------------------------------------ *
   * 6. Form change handlers
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

  /* ------------------------------------------------------------------ *
   * 7. Submit logic
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
        scrollPanelToTop();
        return;
      }

      if (intent === "submit") {
        if (!isViewMode) return;
        onSubmit?.(e);
      }
    },
    [isViewMode, onSubmit, scrollPanelToTop]
  );

  /* ------------------------------------------------------------------ *
   * 8. Return to edit mode via the Edit Details button.
   * ------------------------------------------------------------------ */
  const handleEditDetails = useCallback((e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    shouldFocusFullNameRef.current = true;
    setIsViewMode(false);
  }, []);

  /* ------------------------------------------------------------------ *
   * 9. Memoised preview rows
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
          className={`${styles.cartModal__form} ${
            isViewMode ? styles["cartModal__form--preview"] : ""
          }`}
          onSubmit={handleFormSubmit}
          noValidate={false}
          data-view-mode={isViewMode ? "true" : "false"}
        >
          {/* -------- Preview Mode Banner (only in view mode) -------- */}
          {isViewMode && (
            <div
              className={styles.cartModal__previewBanner}
              role="status"
              aria-live="polite"
            >
              <span
                className={styles.cartModal__previewBannerDot}
                aria-hidden="true"
              />
              <span className={styles.cartModal__previewBannerText}>
                Preview Mode
              </span>
              <span className={styles.cartModal__previewBannerSub}>
                Fields are read-only. Click &quot;Edit Details&quot; to make changes.
              </span>
            </div>
          )}

          {/* -------------------- Contact details -------------------- */}
          <div className={styles.formSection}>
            <span className={styles.formSection__label}>Contact details</span>
            <div className={styles.cartModal__grid}>
              <label>
                <span>Full Name *</span>
                {isViewMode ? (
                  <div className={styles.cartModal__plainValue}>
                    {form.name || "NA"}
                  </div>
                ) : (
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Ananya Sharma"
                    autoComplete="name"
                    required
                    suppressHydrationWarning
                  />
                )}
              </label>
              <label>
                <span>Company Name</span>
                {isViewMode ? (
                  <div className={styles.cartModal__plainValue}>
                    {form.company_name || "NA"}
                  </div>
                ) : (
                  <input
                    type="text"
                    name="company_name"
                    value={form.company_name}
                    onChange={handleChange}
                    placeholder="e.g. ABC Technologies Pvt Ltd"
                    autoComplete="organization"
                    suppressHydrationWarning
                  />
                )}
              </label>
              <label>
                <span>Phone *</span>
                {isViewMode ? (
                  <div className={styles.cartModal__plainValue}>
                    {form.phone || "NA"}
                  </div>
                ) : (
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    required
                    suppressHydrationWarning
                  />
                )}
              </label>
              <label>
                <span>Email *</span>
                {isViewMode ? (
                  <div className={styles.cartModal__plainValue}>
                    {form.email || "NA"}
                  </div>
                ) : (
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                    suppressHydrationWarning
                  />
                )}
              </label>
            </div>
          </div>

          {/* -------------------- Billing details -------------------- */}
          <div className={styles.formSection}>
            <span className={styles.formSection__label}>
              Billing details
            </span>
            <div className={styles.cartModal__grid}>
              <label className={styles.cartModal__full}>
                <span>Service Address *</span>
                {isViewMode ? (
                  <div className={styles.cartModal__plainValue}>
                    {form.address || "NA"}
                  </div>
                ) : (
                  <textarea
                    name="address"
                    rows="2"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Building, street, area"
                    autoComplete="street-address"
                    required
                    suppressHydrationWarning
                  />
                )}
              </label>
              <label>
                <span>City *</span>
                {isViewMode ? (
                  <div className={styles.cartModal__plainValue}>
                    {form.city || "NA"}
                  </div>
                ) : (
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Mumbai"
                    autoComplete="address-level2"
                    required
                    suppressHydrationWarning
                  />
                )}
              </label>
              <label>
                <span>State *</span>
                {isViewMode ? (
                  <div className={styles.cartModal__plainValue}>
                    {form.state || "NA"}
                  </div>
                ) : (
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Maharashtra"
                    autoComplete="address-level1"
                    required
                    suppressHydrationWarning
                  />
                )}
              </label>
              <label>
                <span>Pincode *</span>
                {isViewMode ? (
                  <div className={styles.cartModal__plainValue}>
                    {form.pincode || "NA"}
                  </div>
                ) : (
                  <input
                    type="text"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="400069"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    pattern="[0-9]{4,10}"
                    required
                    suppressHydrationWarning
                  />
                )}
              </label>
              <label>
                <span>Property Type</span>
                {isViewMode ? (
                  <div className={styles.cartModal__plainValue}>
                    {form.property_type || "NA"}
                  </div>
                ) : (
                  <select
                    name="property_type"
                    value={form.property_type}
                    onChange={handleChange}
                    suppressHydrationWarning
                  >
                    <option value="Commercial">Commercial</option>
                    <option value="Residential">Residential</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Institutional">Institutional</option>
                  </select>
                )}
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
                {isViewMode ? (
                  <div className={styles.cartModal__plainValue}>
                    {form.shipping_address || "NA"}
                  </div>
                ) : (
                  <textarea
                    name="shipping_address"
                    rows="2"
                    value={form.shipping_address}
                    onChange={handleChange}
                    placeholder="Building, street, area"
                    autoComplete="shipping street-address"
                    required
                    disabled={shippingLocked}
                    suppressHydrationWarning
                  />
                )}
              </label>
              <label>
                <span>Shipping City *</span>
                {isViewMode ? (
                  <div className={styles.cartModal__plainValue}>
                    {form.shipping_city || "NA"}
                  </div>
                ) : (
                  <input
                    type="text"
                    name="shipping_city"
                    value={form.shipping_city}
                    onChange={handleChange}
                    placeholder="Mumbai"
                    autoComplete="shipping address-level2"
                    required
                    disabled={shippingLocked}
                    suppressHydrationWarning
                  />
                )}
              </label>
              <label>
                <span>Shipping Email *</span>
                {isViewMode ? (
                  <div className={styles.cartModal__plainValue}>
                    {form.shipping_email || "NA"}
                  </div>
                ) : (
                  <input
                    type="email"
                    name="shipping_email"
                    value={form.shipping_email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    autoComplete="shipping email"
                    required
                    disabled={shippingLocked}
                    suppressHydrationWarning
                  />
                )}
              </label>
              <label>
                <span>Shipping Mobile *</span>
                {isViewMode ? (
                  <div className={styles.cartModal__plainValue}>
                    {form.shipping_mobile || "NA"}
                  </div>
                ) : (
                  <input
                    type="tel"
                    name="shipping_mobile"
                    value={form.shipping_mobile}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    autoComplete="shipping tel"
                    required
                    disabled={shippingLocked}
                    suppressHydrationWarning
                  />
                )}
              </label>
              <label>
                <span>Shipping State *</span>
                {isViewMode ? (
                  <div className={styles.cartModal__plainValue}>
                    {form.shipping_state || "NA"}
                  </div>
                ) : (
                  <input
                    type="text"
                    name="shipping_state"
                    value={form.shipping_state}
                    onChange={handleChange}
                    placeholder="Maharashtra"
                    autoComplete="shipping address-level1"
                    required
                    disabled={shippingLocked}
                    suppressHydrationWarning
                  />
                )}
              </label>
              <label>
                <span>Shipping Pincode *</span>
                {isViewMode ? (
                  <div className={styles.cartModal__plainValue}>
                    {form.shipping_pincode || "NA"}
                  </div>
                ) : (
                  <input
                    type="text"
                    name="shipping_pincode"
                    value={form.shipping_pincode}
                    onChange={handleChange}
                    placeholder="400069"
                    inputMode="numeric"
                    autoComplete="shipping postal-code"
                    pattern="[0-9]{4,10}"
                    required
                    disabled={shippingLocked}
                    suppressHydrationWarning
                  />
                )}
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
                {isViewMode ? (
                  <div className={styles.cartModal__plainValue}>
                    {form.duration || "NA"}
                  </div>
                ) : (
                  <select
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    suppressHydrationWarning
                  >
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                    <option value="12 Months">12 Months</option>
                  </select>
                )}
              </label>
              <label className={styles.cartModal__full}>
                <span>Remarks (optional)</span>
                {isViewMode ? (
                  <div className={styles.cartModal__plainValue}>
                    {form.notes || "NA"}
                  </div>
                ) : (
                  <textarea
                    name="notes"
                    rows="2"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="AMC services required for office premises…"
                    suppressHydrationWarning
                  />
                )}
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
              <>
                <button
                  type="button"
                  className={`${styles.btn} ${styles["btn--preview"]}`}
                  onClick={handleEditDetails}
                  disabled={submitting}
                >
                  Edit Details
                </button>
                <button
                  type="button"
                  className={`${styles.btn} ${styles["btn--primary"]}`}
                  onClick={onSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Submitting…" : "Create Quote"}
                  {!submitting && <span>↗</span>}
                </button>
              </>
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
          </div>
        </form>
      </div>
    </div>
  );
}