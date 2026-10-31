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
import {
  computeItemAmount,
  lineTotal,
  getDiscountForDuration,
  durationValueToMonths,
} from "../../lib/calculations"; // ✅ FIX: import helpers for duration + discount

const QUOTE_FORM_ID = "quote-form";
const GUARD_COALESCE_MS = 400;
const FIRST_EDITABLE_FIELD_NAME = "name";



/* ------------------------------------------------------------------ *
 * Pincode → City/State lookup (India Post public API, no key needed)
 * ------------------------------------------------------------------ */
const PIN_API = "https://api.postalpincode.in/pincode/";

async function fetchPincodeDetails(pincode) {
  if (!/^[1-9][0-9]{5}$/.test(String(pincode || "").trim())) {
    return { ok: false, reason: "invalid" };
  }
  try {
    const res = await fetch(`${PIN_API}${pincode}`);
    if (!res.ok) return { ok: false, reason: "network" };
    const data = await res.json();
    const first = Array.isArray(data) ? data[0] : null;
    if (!first || first.Status !== "Success" || !first.PostOffice?.length) {
      return { ok: false, reason: "notfound" };
    }
    const po = first.PostOffice[0];
    return {
      ok: true,
      city: po.District || po.Block || po.Name || "",
      state: po.State || "",
      country: po.Country || "India",
    };
  } catch {
    return { ok: false, reason: "network" };
  }
}

/* ------------------------------------------------------------------ *
 * Number to Words (Indian System)
 * ------------------------------------------------------------------ */
function numberToWords(num) {
  if (!num || num === 0) return "Zero";
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy",
    "Eighty", "Ninety",
  ];

  const inWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100)
      return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + inWords(n % 100) : "")
      );
    return "";
  };

  let result = "";

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);

  if (crore) result += inWords(crore) + " Crore ";
  if (lakh) result += inWords(lakh) + " Lakh ";
  if (thousand) result += inWords(thousand) + " Thousand ";
  if (hundred) result += inWords(hundred) + " Hundred ";
  if (num % 100) result += inWords(num % 100);

  return result.trim();
}

/* ------------------------------------------------------------------ *
 * Live-value resolvers — read directly from the item service list.
 * ------------------------------------------------------------------ */

function pickNumber(candidates, fallback) {
  for (const c of candidates) {
    const n = Number(c);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return fallback;
}

function resolveAreaQty(item) {
  return pickNumber([item?.units, item?.custom_units], 1);
}

function resolveVisits(item) {
  return pickNumber([item?.visits, item?.custom_visit], 1);
}

function resolveUnits(item) {
  return pickNumber([item?.units, item?.custom_units], 1);
}

function resolveRate(item) {
  return Number(item?.rate) || 0;
}

function resolveUom(item) {
  return item?.price_uom || item?.uom || item?.stock_uom || "Nos";
}

/**
 * ✅ NEW: Effective duration for a row.
 * Sub-items inherit the parent's selected duration.
 */
function resolveDuration(item, parentDuration = null) {
  return (
    item?.selectedDuration ||
    parentDuration ||
    "12 Months"
  );
}

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

  // Pincode auto-fetch state
const [pinLookup, setPinLookup] = useState({
  billing: { loading: false, error: "" },
  shipping: { loading: false, error: "" },
});

// Track manual edits so auto-fill never clobbers user-typed values
const manualCityStateRef = useRef({
  billing: { city: false, state: false },
  shipping: { city: false, state: false },
});

// Track last pincode we successfully resolved (prevents re-fetch loop)
const lastPinRef = useRef({ billing: "", shipping: "" });

  const panelRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const swalOpenRef = useRef(false);
  const lastGuardAtRef = useRef(0);
  const shouldFocusFullNameRef = useRef(false);
  const raf2Ref = useRef(0);

  const titleId = useId();





  /* ------------------------------------------------------------------ *
 * 4b. Auto-fetch City/State from Pincode (billing + shipping)
 * ------------------------------------------------------------------ */
useEffect(() => {
  if (isViewMode) return;
  if (!onChange) return;

  const run = async (which, pincode, prefix) => {
    const pin = String(pincode || "").trim();

    // Reset if not a valid 6-digit pin
    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      setPinLookup((s) => ({ ...s, [which]: { loading: false, error: "" } }));
      lastPinRef.current[which] = "";
      return;
    }

    // Already resolved this exact pincode — skip
    if (lastPinRef.current[which] === pin) return;

    setPinLookup((s) => ({ ...s, [which]: { loading: true, error: "" } }));

    const result = await fetchPincodeDetails(pin);

    if (!result.ok) {
      setPinLookup((s) => ({
        ...s,
        [which]: {
          loading: false,
          error:
            result.reason === "notfound"
              ? "Pincode not found"
              : "Could not fetch details",
        },
      }));
      lastPinRef.current[which] = "";
      return;
    }

    lastPinRef.current[which] = pin;
    setPinLookup((s) => ({ ...s, [which]: { loading: false, error: "" } }));

    // Only fill fields the user hasn't manually overridden
    const manual = manualCityStateRef.current[which];
    const patch = {};
    if (!manual.city && result.city) {
      patch[`${prefix}city`] = result.city;
    }
    if (!manual.state && result.state) {
      patch[`${prefix}state`] = result.state;
    }

   // Apply city and state individually through the parent onChange handler
if (!manual.city && result.city) {
  onChange({
    target: {
      name: `${prefix}city`,
      value: result.city,
    },
  });
}

if (!manual.state && result.state) {
  onChange({
    target: {
      name: `${prefix}state`,
      value: result.state,
    },
  });
}
  };

  const t = window.setTimeout(() => {
    run("billing", form.pincode, "");
    run("shipping", form.shipping_pincode, "shipping_");
  }, 500); // debounce

  return () => window.clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [form.pincode, form.shipping_pincode, isViewMode]);

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
  // const handleChange = useCallback(
  //   (e) => {
  //     if (guardViewMode(e)) return;
  //     onChange?.(e);
  //   },
  //   [guardViewMode, onChange]
  // );


  const handleChange = useCallback(
  (e) => {
    if (guardViewMode(e)) return;

    const name = e?.target?.name;
    if (name === "city") manualCityStateRef.current.billing.city = true;
    if (name === "state") manualCityStateRef.current.billing.state = true;
    if (name === "shipping_city") manualCityStateRef.current.shipping.city = true;
    if (name === "shipping_state") manualCityStateRef.current.shipping.state = true;

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
   * 9. ✅ FIXED: preview rows use the item's selected duration.
   * ------------------------------------------------------------------ */
  const previewRows = useMemo(() => {
    return activeQuoteItems.map((it, idx) => {
      const showVisit = hasVisitControl(it);
      const showUnit = hasUnitControl(it);

      const liveUnits = resolveAreaQty(it);
      const liveVisits = resolveVisits(it);

      const parts = [];
      if (showUnit) {
        parts.push(`${liveUnits} unit${liveUnits > 1 ? "s" : ""}`);
      }
      if (showVisit) {
        parts.push(`${liveVisits} visit${liveVisits > 1 ? "s" : ""}`);
      }
      parts.push(resolveUom(it));
      if (it.amc_sub_type_name) parts.push(it.amc_sub_type_name);

      // ✅ FIX: pass the item's selected duration so discounts & multipliers
      // are computed against the correct term (matches the cart line).
      const duration = resolveDuration(it);
      const { total, hasPayable } = lineTotal(it, duration);

      // Optional: show the discount % badge alongside the amount
      const discountPct = getDiscountForDuration(duration);

      return {
        key: `${it.item_code || it.item_name || "item"}-${idx}`,
        title: prettyName(it.item_name || it.item_code || ""),
        subtitle: parts.join(" · "),
        thumb: (it.item_name || it.item_code || "IT")
          .slice(0, 2)
          .toUpperCase(),
        amount: hasPayable ? inr(total, it.currency) : "On request",
        discountPct,
        duration,
      };
    });
  }, [activeQuoteItems]);

  /* ------------------------------------------------------------------ *
   * 10. ✅ FIXED: Quotation Preview Data
   *
   *   - Amount per row = lineTotal(item, item.selectedDuration).total
   *     which is exactly what the cart's LINE TOTAL renders.
   *   - Sub-items inherit the parent's duration via resolveDuration.
   * ------------------------------------------------------------------ */
  const quotationData = useMemo(() => {
    let subtotal = 0;

    const items = activeQuoteItems.map((item, idx) => {
      const areaQty = resolveAreaQty(item);
      const visit = resolveVisits(item);
      const rate = resolveRate(item);

      // ✅ FIX: use the item's own selected duration (sub-items fall back
      // to "12 Months" but you can pass a parent duration here if needed).
      const duration = resolveDuration(item);

      // ✅ FIX: lineTotal now receives the duration, so multiplier and
      // discount match the cart exactly.
      const { total, hasPayable } = lineTotal(item, duration);
      const amount = hasPayable ? total : 0;
      subtotal += amount;

      const serviceName = item.item_name || item.item_code || "";

      return {
        sr: idx + 1,
        description: serviceName,
        subDescription:
          item.amc_sub_type || item.amc_type || serviceName,
        areaQty,
        uom: resolveUom(item),
        visit,
        rate,
        amount,
        duration,                                       // ✅ keep for reference
        months: durationValueToMonths(duration),        // ✅ optional display
        discountPct: getDiscountForDuration(duration),  // ✅ optional display
      };
    });

    const cgstRate = 9;
    const sgstRate = 9;
    const cgstAmount = subtotal * (cgstRate / 100);
    const sgstAmount = subtotal * (sgstRate / 100);
    const grandTotal = subtotal + cgstAmount + sgstAmount;

    const formatAddress = (addr, city, state, pincode) => {
      const parts = [addr, city, state, pincode].filter(Boolean);
      return parts.join(", ");
    };

    return {
      buyer: {
        name: form.name || "NA",
        company: form.company_name || "",
        address: formatAddress(
          form.address,
          form.city,
          form.state,
          form.pincode
        ),
        mobile: form.phone || "",
        email: form.email || "",
      },
      consignee: {
        name: form.shipping_name || form.name || "NA",
        company: form.shipping_company || form.company_name || "",
        address: formatAddress(
          form.shipping_address,
          form.shipping_city,
          form.shipping_state,
          form.shipping_pincode
        ),
        mobile: form.shipping_mobile || form.phone || "",
        email: form.shipping_email || form.email || "",
      },
      items,
      subtotal,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      grandTotal,
      grandTotalWords: numberToWords(Math.round(grandTotal)),
      currency: quoteSummary.currency || "INR",
    };
  }, [activeQuoteItems, form, quoteSummary]);

  const closeFromBackdrop = useCallback(() => {
    if (submitting) return;
    if (swalOpenRef.current) return;
    onClose?.();
  }, [submitting, onClose]);

  /* ------------------------------------------------------------------ *
   * 11. Build table rows as an array
   * ------------------------------------------------------------------ */
  const tableBodyRows = useMemo(() => {
    const rows = [];

    quotationData.items.forEach((item) => {
      rows.push(
        <tr key={`item-${item.sr}`}>
          <td>{item.sr}</td>
          <td
            style={{
              maxWidth: "250px",
              overflowWrap: "anywhere",
            }}
          >
            {item.description}
          </td>
          <td>{item.areaQty}</td>
          <td>{item.uom}</td>
          <td>{item.visit}</td>
          <td>{inr(item.rate, quotationData.currency)}</td>
          <td className="text-right">
            {inr(item.amount, quotationData.currency)}
          </td>
        </tr>
      );
    });

    const totalRowClass = styles.quotationPreview__totalRow;
    const grandTotalRowClass = `${styles.quotationPreview__totalRow} ${styles["quotationPreview__totalRow--grand"]}`;

    // Total row
    rows.push(
      <tr key="total-row" className={totalRowClass}>
        <td
          colSpan="6"
          style={{ textAlign: "right", fontWeight: "bold", paddingRight: "1rem" }}
        >
          Total
        </td>
        <td style={{ fontWeight: "bold", textAlign: "right" }}>
          {inr(quotationData.subtotal, quotationData.currency)}
        </td>
      </tr>
    );

    // CGST row
    rows.push(
      <tr key="cgst-row" className={totalRowClass}>
        <td
          colSpan="6"
          style={{ textAlign: "right", fontWeight: "bold", paddingRight: "1rem" }}
        >
          CGST @ {quotationData.cgstRate}%
        </td>
        <td style={{ textAlign: "right" }}>
          {inr(quotationData.cgstAmount, quotationData.currency)}
        </td>
      </tr>
    );

    // SGST row
    rows.push(
      <tr key="sgst-row" className={totalRowClass}>
        <td
          colSpan="6"
          style={{ textAlign: "right", fontWeight: "bold", paddingRight: "1rem" }}
        >
          SGST @ {quotationData.sgstRate}%
        </td>
        <td style={{ textAlign: "right" }}>
          {inr(quotationData.sgstAmount, quotationData.currency)}
        </td>
      </tr>
    );

    // Grand Total row
    rows.push(
      <tr key="grand-total-row" className={grandTotalRowClass}>
        <td
          colSpan="6"
          style={{ textAlign: "right", fontWeight: "bold", paddingRight: "1rem" }}
        >
          Grand Total
        </td>
        <td style={{ fontWeight: "bold", textAlign: "right" }}>
          {inr(quotationData.grandTotal, quotationData.currency)}
        </td>
      </tr>
    );

    // Grand Total (In Words)
    rows.push(
      <tr
        key="grand-total-words-row"
        className={styles.quotationPreview__wordsRow}
      >
        <td
          colSpan="7"
          style={{
            textAlign: "left",
            fontWeight: "bold",
            paddingLeft: "1rem",
          }}
        >
          Grand Total : INR {quotationData.grandTotalWords} only.
        </td>
      </tr>
    );

    // Payment Terms and Conditions
    // rows.push(
    //   <tr
    //     key="payment-terms-header-row"
    //     className={styles.quotationPreview__termsRow}
    //   >
    //     <td
    //       colSpan="7"
    //       style={{
    //         textAlign: "left",
    //         fontWeight: "bold",
    //         paddingLeft: "1rem",
    //       }}
    //     >
    //       Payment Terms and Conditions :
    //     </td>
    //   </tr>
    // );

    // rows.push(
    //   <tr
    //     key="payment-terms-text-row"
    //     className={styles.quotationPreview__termsRow}
    //   >
    //     <td colSpan="7" style={{ textAlign: "left" }}>
    //       100% of Advance the total order value shall be payable for
    //       confirmation of the work order.
    //     </td>
    //   </tr>
    // );

    return rows;
  }, [quotationData, styles]);

  /* ------------------------------------------------------------------ *
   * EXTRACTED JSX: View Mode Content
   * ------------------------------------------------------------------ */
  const viewModeContent = (
    <div className={styles.quotationPreview}>
      <div className={styles.quotationPreview__headerGrid}>
        <div className={styles.quotationPreview__headerCol}>
          <h4>Buyer (Bill to)</h4>
          <div className={styles.quotationPreview__addressBlock}>
            <strong>
              {quotationData.buyer.company || quotationData.buyer.name}
            </strong>
            <p>{quotationData.buyer.address}</p>
            {quotationData.buyer.mobile && (
              <p>Phone: {quotationData.buyer.mobile}</p>
            )}
            {quotationData.buyer.email && (
              <p>Email: {quotationData.buyer.email}</p>
            )}
          </div>
        </div>
        <div className={styles.quotationPreview__headerCol}>
          <h4>Consignee (Ship to)</h4>
          <div className={styles.quotationPreview__addressBlock}>
            <strong>
              {quotationData.consignee.company || quotationData.consignee.name}
            </strong>
            <p>{quotationData.consignee.address}</p>
            {quotationData.consignee.mobile && (
              <p>Phone: {quotationData.consignee.mobile}</p>
            )}
            {quotationData.consignee.email && (
              <p>Email: {quotationData.consignee.email}</p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.quotationPreview__tableWrapper}>
        <table className={styles.quotationPreview__table}>
          <thead>
            <tr>
              <th>Sr No.</th>
              <th>Type Of Services</th>
              <th>Area/Qty</th>
              <th>UOM</th>
              <th>Service</th>
              <th>Rate (Rs)</th>
              <th>Amount (Rs)</th>
            </tr>
          </thead>
          <tbody>{tableBodyRows}</tbody>
        </table>
      </div>
    </div>
  );

  /* ------------------------------------------------------------------ *
   * EXTRACTED JSX: Edit Mode Content
   * ------------------------------------------------------------------ */
  const editModeContent = (
    <div className={styles.editModeContainer}>
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
              placeholder="e.g. Ananya Sharma"
              autoComplete="name"
              required
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
              placeholder="e.g. ABC Technologies Pvt Ltd"
              autoComplete="organization"
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
              placeholder="+91 98765 43210"
              autoComplete="tel"
              required
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
              placeholder="you@company.com"
              autoComplete="email"
              required
              suppressHydrationWarning
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
      onChange={handleChange}
      placeholder="Building, street, area"
      autoComplete="street-address"
      required
      suppressHydrationWarning
    />
  </label>

  {/* Pincode FIRST — triggers auto-fetch of City & State */}
  <label>
    <span>
      Pincode *
      {pinLookup.billing.loading && (
        <small style={{ marginLeft: 8, opacity: 0.7 }}>fetching…</small>
      )}
    </span>
    <input
      type="text"
      name="pincode"
      value={form.pincode}
      onChange={handleChange}
      placeholder="400069"
      inputMode="numeric"
      autoComplete="postal-code"
      pattern="[0-9]{4,10}"
      maxLength={6}
      required
      suppressHydrationWarning
    />
    {pinLookup.billing.error && (
      <small style={{ color: "#c0392b", marginTop: 4, display: "block" }}>
        {pinLookup.billing.error}
      </small>
    )}
  </label>

  <label>
    <span>City *</span>
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
  </label>

  <label>
    <span>State *</span>
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
  </label>

  <label>
    <span>Property Type</span>
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
  </label>
</div>
      </div>

      <div className={styles.formSection}>
        <div className={styles.formSection__head}>
          <span className={styles.formSection__label}>Shipping details</span>
          <label className={styles.cartModal__checkbox}>
            <input
              type="checkbox"
              checked={form.sameAsSite}
              onChange={handleSameAsSiteToggle}
              disabled={isViewMode}
              aria-readonly={isViewMode}
              suppressHydrationWarning
            />
            <span className={styles.cartModal__checkboxBox} aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
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
      placeholder="Building, street, area"
      autoComplete="shipping street-address"
      required
      disabled={shippingLocked}
      suppressHydrationWarning
    />
  </label>

  {/* Pincode FIRST — triggers auto-fetch of City & State */}
  <label>
    <span>
      Shipping Pincode *
      {pinLookup.shipping.loading && (
        <small style={{ marginLeft: 8, opacity: 0.7 }}>fetching…</small>
      )}
    </span>
    <input
      type="text"
      name="shipping_pincode"
      value={form.shipping_pincode}
      onChange={handleChange}
      placeholder="400069"
      inputMode="numeric"
      autoComplete="shipping postal-code"
      pattern="[0-9]{4,10}"
      maxLength={6}
      required
      disabled={shippingLocked}
      suppressHydrationWarning
    />
    {pinLookup.shipping.error && (
      <small style={{ color: "#c0392b", marginTop: 4, display: "block" }}>
        {pinLookup.shipping.error}
      </small>
    )}
  </label>

  <label>
    <span>Shipping City *</span>
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
  </label>

  <label>
    <span>Shipping State *</span>
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
  </label>

  <label>
    <span>Shipping Email *</span>
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
  </label>

  <label>
    <span>Shipping Mobile *</span>
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
  </label>
</div>
      </div>

      <div className={styles.cartModal__summary}>
        <div>
          <span>Total service</span>
          <strong>{quoteSummary.totalVisits}</strong>
        </div>
        <div>
          <span>Total units</span>
          <strong>{quoteSummary.totalUnits}</strong>
        </div>
        <div>
          <span>Estimated subtotal</span>
          <strong>{inr(quoteSummary.subtotal, quoteSummary.currency)}</strong>
        </div>
      </div>
    </div>
  );

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
          {/* <span className={styles.cartModal__eyebrow}>
            {isBulk ? "BULK QUOTE" : "ITEM QUOTE"}
          </span> */}
          <h2 id={titleId}>
            {isBulk ? (
              <React.Fragment>
                Estimation for <span>all items.</span>
              </React.Fragment>
            ) : (
              <React.Fragment>
                Quote for <span>this item.</span>
              </React.Fragment>
            )}
          </h2>
          {/* <p>
            {isBulk
              ? `We'll review your ${quoteSummary.totalVisits} Service${
                  quoteSummary.totalVisits > 1 ? "s" : ""
                } and ${quoteSummary.totalUnits} unit${
                  quoteSummary.totalUnits > 1 ? "s" : ""
                } and get back with a detailed quotation within 24 hours.`
              : `We'll review "${prettyName(
                  activeQuoteItems[0]?.item_name ||
                    activeQuoteItems[0]?.item_code ||
                    ""
                )}" and get back with a detailed quotation.`}
          </p> */}
        </div>

        {!isViewMode && (
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
        )}

        <form
          id={QUOTE_FORM_ID}
          className={`${styles.cartModal__form} ${
            isViewMode ? styles["cartModal__form--preview"] : ""
          }`}
          onSubmit={handleFormSubmit}
          noValidate={false}
          data-view-mode={isViewMode ? "true" : "false"}
        >
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
                Fields are read-only. Click &quot;Edit Details&quot; to make
                changes.
              </span>
            </div>
          )}

          <div className={styles.cartModal__contentWrapper}>
            {isViewMode ? viewModeContent : editModeContent}
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

            {isViewMode ? (
              <React.Fragment>
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
              </React.Fragment>
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