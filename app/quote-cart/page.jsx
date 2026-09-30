"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import AMCNavbar from "@/components/Navbar/Navbar.jsx";
import {
  getCart,
  saveCart,
  removeFromCart,
  clearCart,
  addToCart,
  appendToCartItem,
  removeSubItem,
} from "@/lib/cart";
import styles from "./cart.module.scss";

const API_URL = "/api/frappe/get_amc_items";
const QUOTE_API = "/api/method/create_amc_quotation";
const FRAPPE_BASE_URL = "https://liaisonbank.frappe.cloud";

const inr = (n, currency = "INR") =>
  `${currency} ${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Normalise "Ants,Cockroaches,X" → "Ants, Cockroaches, X"
const prettyName = (name) => (name || "").replace(/,(?!\s)/g, ", ");

const buildPrintUrl = (printUrl, { download = false } = {}) => {
  if (!printUrl) return null;

  let params;
  try {
    const u = new URL(printUrl, FRAPPE_BASE_URL);
    params = u.searchParams;
  } catch {
    return printUrl;
  }

  if (!download) {
    return `${FRAPPE_BASE_URL}${printUrl.startsWith("/") ? "" : "/"}${printUrl}`;
  }

  const qs = new URLSearchParams();
  ["doctype", "name", "format", "no_letterhead", "letterhead", "key"].forEach(
    (k) => {
      const v = params.get(k);
      if (v) qs.set(k, v);
    }
  );

  return `/api/quote-pdf?${qs.toString()}`;
};

/* =========================================================
   Visibility helpers
   ========================================================= */
const hasUnitControl = (it) => {
  const v = it.custom_unit;
  if (v === null || v === undefined) return false;
  const s = String(v).trim();
  if (s === "") return false;
  const n = Number(s);
  return Number.isFinite(n) && n > 0;
};

const hasVisitControl = (it) => {
  const v = it.custom_visit;
  if (v === null || v === undefined) return false;
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
};

const hasQtyControls = (it) => hasUnitControl(it) || hasVisitControl(it);

const computeItemAmount = (it) => {
  const rate = Number(it.rate) || 0;
  if (rate <= 0) return 0;

  const units = hasUnitControl(it) ? Number(it.units) || 1 : 1;
  const threshold = hasUnitControl(it) ? Number(it.custom_unit) || 0 : 0;
  const minAmount = Number(it.custom_min_amount) || 0;

  if (threshold > 0 && units <= threshold) {
    return minAmount > 0 ? minAmount : rate * units;
  }

  return rate * units;
};

const lineTotal = (it) => {
  let total = 0;
  let hasPayable = false;

  if (it.rate && it.rate > 0) {
    const visits = hasVisitControl(it) ? Number(it.visits) || 1 : 1;
    total += computeItemAmount(it) * visits;
    hasPayable = true;
  }

  (it.subItems || []).forEach((s) => {
    if (s.rate && s.rate > 0) {
      const visits = hasVisitControl(s) ? Number(s.visits) || 1 : 1;
      total += computeItemAmount(s) * visits;
      hasPayable = true;
    }
  });

  return { total, hasPayable };
};

/* =========================================================
   SweetAlert success modal
   ========================================================= */
const showQuoteSuccessAlert = async (quote) => {
  const inrFmt = (n, c = "INR") =>
    typeof n === "number"
      ? `${c} ${n.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "—";

  const result = await Swal.fire({
    icon: "success",
    title: "Quotation Created!",
    html: `
      <div style="text-align:left;font-size:0.92rem;line-height:1.6;color:#374151;">
        <p style="margin:0 0 0.6rem;">
          Your AMC quotation has been generated successfully.
        </p>
        <div style="
          background:linear-gradient(180deg,rgba(205,121,19,0.06),rgba(205,121,19,0.02));
          border:1px solid rgba(205,121,19,0.2);
          border-radius:12px;
          padding:0.85rem 1rem;
          margin:0.75rem 0 0.25rem;
        ">
          <div style="display:flex;justify-content:space-between;gap:1rem;padding:0.3rem 0;border-bottom:1px dashed rgba(15,26,20,0.08);">
            <span style="color:#6b7280;font-weight:600;">Quotation No.</span>
            <strong style="color:#0f1a14;">${quote.number || "—"}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;gap:1rem;padding:0.3rem 0;border-bottom:1px dashed rgba(15,26,20,0.08);">
            <span style="color:#6b7280;font-weight:600;">Customer</span>
            <strong style="color:#0f1a14;">${quote.customer || "—"}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;gap:1rem;padding:0.3rem 0;">
            <span style="color:#6b7280;font-weight:600;">Grand Total</span>
            <strong style="color:#cd7913;font-size:1.05rem;">${inrFmt(
              quote.grandTotal,
              quote.currency
            )}</strong>
          </div>
        </div>
      </div>
    `,
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText: "📄 View Quote",
    denyButtonText: "⬇️ Download PDF",
    cancelButtonText: "Close",
    confirmButtonColor: "#cd7913",
    denyButtonColor: "#0f1a14",
    cancelButtonColor: "#6b7280",
    reverseButtons: true,
    focusConfirm: true,
    allowOutsideClick: false,
    customClass: {
      popup: "amc-quote-swal-popup",
      title: "amc-quote-swal-title",
      confirmButton: "amc-quote-swal-btn",
      denyButton: "amc-quote-swal-btn",
      cancelButton: "amc-quote-swal-btn",
    },
  });

  if (result.isConfirmed && quote.viewUrl) {
    window.open(quote.viewUrl, "_blank", "noopener,noreferrer");
  }

  if (result.isDenied && quote.pdfUrl) {
    const a = document.createElement("a");
    a.href = quote.pdfUrl;
    a.download = `${quote.number || "quotation"}.pdf`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

/* =========================================================
   Shared catalog body
   ========================================================= */
function CatalogBody({
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
  addLabel,
  selectedLines = [],
  onClearAll,
}) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    if (!dropdownOpen) return;
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [dropdownOpen]);

  const isAll = activeTypes.length === 0;

  const toggleType = (key) => {
    setActiveTypes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const selectedTotal = selectedLines.reduce(
    (sum, line) => sum + lineTotal(line).total,
    0
  );
  const hasSelectedTotal = selectedLines.some(
    (line) => lineTotal(line).hasPayable
  );

  return (
    <>
      <div className={styles.catalogFilters}>
        {catalogTypes.length > 1 && (
          <div className={styles.catalogDropdown} ref={dropdownRef}>
            <button
              type="button"
              className={styles.catalogDropdown__trigger}
              onClick={() => setDropdownOpen((v) => !v)}
              aria-expanded={dropdownOpen}
            >
              <span>
                {isAll
                  ? "All types"
                  : activeTypes.length === 1
                    ? activeTypes[0]
                    : `${activeTypes.length} types selected`}
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                aria-hidden="true"
              >
                <path
                  d="M2.5 4.5 6 8l3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <div className={styles.catalogDropdown__menu}>
                <label className={styles.catalogDropdown__item}>
                  <input
                    type="checkbox"
                    checked={isAll}
                    onChange={() => setActiveTypes([])}
                  />
                  <span>All types</span>
                  <em>{catalogTypes[0]?.count ?? 0}</em>
                </label>

                {catalogTypes.slice(1).map((t) => (
                  <label key={t.key} className={styles.catalogDropdown__item}>
                    <input
                      type="checkbox"
                      checked={activeTypes.includes(t.key)}
                      onChange={() => toggleType(t.key)}
                    />
                    <span>{t.label}</span>
                    <em>{t.count}</em>
                  </label>
                ))}

                {!isAll && (
                  <button
                    type="button"
                    className={styles.catalogDropdown__clear}
                    onClick={() => setActiveTypes([])}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className={styles.catalogSearch}>
          <span className={styles.catalogSearch__icon}>⌕</span>
          <input
            type="text"
            placeholder="Search by name or code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className={styles.catalogSearch__clear}
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {activeTypes.length > 0 && (
        <div className={styles.catalogChips}>
          {activeTypes.map((key) => (
            <button
              key={key}
              type="button"
              className={`${styles.catalogChip} ${styles["catalogChip--active"]}`}
              onClick={() => toggleType(key)}
            >
              {key}
              <span>×</span>
            </button>
          ))}
        </div>
      )}

      {selectedLines.length > 0 && (
        <div className={styles.catalogSelected}>
          <div className={styles.catalogSelected__head}>
            <strong>Selected ({selectedLines.length})</strong>
            <div className={styles.catalogSelected__headRight}>
              {hasSelectedTotal && (
                <span className={styles.catalogSelected__total}>
                  {inr(selectedTotal)}
                </span>
              )}
              {onClearAll && (
                <button type="button" onClick={onClearAll}>
                  Clear all
                </button>
              )}
            </div>
          </div>
          <ul className={styles.catalogSelected__list}>
            {selectedLines.map((line) => {
              const { total, hasPayable } = lineTotal(line);
              const subCount = (line.subItems || []).length;
              const qtyLabel = hasUnitControl(line)
                ? line.units || 1
                : line.qty || 1;

              return (
                <li key={line.item_code}>
                  <div className={styles.catalogSelected__info}>
                    <strong title={line.item_name || line.item_code}>
                      {prettyName(line.item_name || line.item_code)}
                    </strong>
                    <span>
                      {line.item_code} · Qty {qtyLabel}
                      {subCount > 0 &&
                        ` · ${subCount} add-on${subCount > 1 ? "s" : ""}`}
                    </span>
                  </div>
                  <div className={styles.catalogSelected__price}>
                    <span>
                      {hasPayable ? inr(total, line.currency) : "On request"}
                    </span>
                    {onRemove && (
                      <button
                        type="button"
                        onClick={() => onRemove(line)}
                        aria-label={`Remove ${
                          line.item_name || line.item_code
                        }`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className={styles.catalogList}>
        {catalogLoading && (
          <div className={styles.catalogState}>
            <div className={styles.catalogSpinner} />
            <p>Loading items…</p>
          </div>
        )}

        {catalogError && !catalogLoading && (
          <div className={styles.catalogState}>
            <p>{catalogError}</p>
            <button
              type="button"
              className={styles.catalogRetry}
              onClick={retry}
            >
              Retry
            </button>
          </div>
        )}

        {!catalogLoading &&
          !catalogError &&
          filteredCatalog.length === 0 && (
            <div className={styles.catalogState}>
              <p>No items match your search.</p>
            </div>
          )}

        {!catalogLoading &&
          !catalogError &&
          filteredCatalog.map((it) => {
            const added = isAdded(it.item_code);
            const displayName = it.item_name || it.item_code;
            return (
              <div
                key={it.item_code}
                className={`${styles.catalogItem} ${
                  added ? styles["catalogItem--inCart"] : ""
                }`}
              >
                <div className={styles.catalogItem__thumb}>
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className={styles.catalogItem__info}>
                  <span className={styles.catalogItem__tag}>
                    {it.amc_sub_type_name || it.amc_type_name || "AMC"}
                  </span>
                  <strong title={displayName}>
                    {prettyName(displayName)}
                  </strong>
                  <span className={styles.catalogItem__meta}>
                    {it.item_code} · {it.uom || "Nos"}
                  </span>
                </div>
                <div className={styles.catalogItem__price}>
                  {it.rate && it.rate > 0 ? (
                    inr(it.rate, it.currency)
                  ) : (
                    <span className={styles.catalogItem__onRequest}>
                      On request
                    </span>
                  )}
                </div>
                {added && onRemove ? (
                  <button
                    type="button"
                    className={`${styles.catalogItem__add} ${styles["catalogItem__add--remove"]}`}
                    onClick={() => onRemove(it)}
                  >
                    Remove
                    <span>×</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`${styles.catalogItem__add} ${
                      added ? styles["catalogItem__add--added"] : ""
                    }`}
                    onClick={() => onAdd(it)}
                  >
                    {addLabel(added)}
                    <span>+</span>
                  </button>
                )}
              </div>
            );
          })}
      </div>
    </>
  );
}

/* =========================================================
   Page
   ========================================================= */
export default function QuoteCartPage() {
  const [cart, setCart] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company_name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    property_type: "Commercial",
    shipping_address: "",
    shipping_city: "",
    shipping_state: "",
    shipping_pincode: "",
    shipping_mobile: "",
    shipping_email: "",
    sameAsSite: false,
    duration: "12 Months",
    price_list: "Standard Selling",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdQuote, setCreatedQuote] = useState(null);
  const [toast, setToast] = useState("");

  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteItems, setQuoteItems] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [lineAddOpen, setLineAddOpen] = useState(false);
  const [lineAddParent, setLineAddParent] = useState(null);

  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTypes, setActiveTypes] = useState([]);

  useEffect(() => {
    setMounted(true);

    let stored = getCart();
    let changed = false;

    stored = stored.map((it) => {
      const needsMigration =
        it.visits == null ||
        it.units == null ||
        (it.subItems || []).some((s) => s.visits == null || s.units == null);

      if (!needsMigration) return it;

      changed = true;
      const legacyQty = it.qty || 1;
      const migrated = {
        ...it,
        visits: it.visits ?? 1,
        units: it.units ?? legacyQty,
        subItems: (it.subItems || []).map((s) => ({
          ...s,
          visits: s.visits ?? 1,
          units: s.units ?? s.qty ?? 1,
        })),
      };
      delete migrated.qty;
      return migrated;
    });

    if (changed) saveCart(stored);
    setCart(stored);

    const handler = () => setCart(getCart());
    window.addEventListener("amc-cart-updated", handler);
    return () => window.removeEventListener("amc-cart-updated", handler);
  }, []);

  useEffect(() => {
    if (!quoteOpen && !addOpen && !lineAddOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [quoteOpen, addOpen, lineAddOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (lineAddOpen) setLineAddOpen(false);
      else if (addOpen) setAddOpen(false);
      else if (quoteOpen && !submitting) setQuoteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quoteOpen, addOpen, lineAddOpen, submitting]);

  const shouldFetch = (addOpen || lineAddOpen) && catalog.length === 0;

  useEffect(() => {
    if (!shouldFetch) return;
    let cancelled = false;
    setCatalogLoading(true);
    setCatalogError("");
    fetch(API_URL)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setCatalog(data?.message?.items || []);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setCatalogError("Could not load items. Please retry.");
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shouldFetch]);

  const updateVisits = (item_code, delta) => {
    const next = getCart().map((it) =>
      it.item_code === item_code
        ? { ...it, visits: Math.max(1, (it.visits || 1) + delta) }
        : it
    );
    saveCart(next);
    setCart(next);
  };

  const setVisits = (item_code, value) => {
    const visits = Math.max(1, Number(value) || 1);
    const next = getCart().map((it) =>
      it.item_code === item_code ? { ...it, visits } : it
    );
    saveCart(next);
    setCart(next);
  };

  const updateUnits = (item_code, delta) => {
    const next = getCart().map((it) =>
      it.item_code === item_code
        ? { ...it, units: Math.max(1, (it.units || 1) + delta) }
        : it
    );
    saveCart(next);
    setCart(next);
  };

  const setUnits = (item_code, value) => {
    const units = Math.max(1, Number(value) || 1);
    const next = getCart().map((it) =>
      it.item_code === item_code ? { ...it, units } : it
    );
    saveCart(next);
    setCart(next);
  };

  const handleSubVisits = (parentCode, subCode, value) => {
    const visits = Math.max(1, Number(value) || 1);
    const next = getCart().map((it) =>
      it.item_code === parentCode
        ? {
            ...it,
            subItems: (it.subItems || []).map((s) =>
              s.item_code === subCode ? { ...s, visits } : s
            ),
          }
        : it
    );
    saveCart(next);
    setCart(next);
  };

  const handleSubUnits = (parentCode, subCode, value) => {
    const units = Math.max(1, Number(value) || 1);
    const next = getCart().map((it) =>
      it.item_code === parentCode
        ? {
            ...it,
            subItems: (it.subItems || []).map((s) =>
              s.item_code === subCode ? { ...s, units } : s
            ),
          }
        : it
    );
    saveCart(next);
    setCart(next);
  };

  const handleRemove = (item_code) => {
    removeFromCart(item_code);
    setCart(getCart());
    setToast("Item removed");
    setTimeout(() => setToast(""), 1800);
  };

  const handleClear = () => {
    if (!confirm("Remove all items from the cart?")) return;
    clearCart();
    setCart([]);
  };

  const handleAddFromCatalog = (item) => {
    addToCart([
      {
        ...item,
        visits: 1,
        units: 1,
      },
    ]);
    setCart(getCart());
    setToast(`Added: ${item.item_name || item.item_code}`);
    setTimeout(() => setToast(""), 1800);
  };

  const handleAddSubItem = (item) => {
    if (!lineAddParent) return;
    appendToCartItem(lineAddParent.item_code, {
      ...item,
      visits: 1,
      units: 1,
    });
    setCart(getCart());
    const refreshed = getCart().find(
      (c) => c.item_code === lineAddParent.item_code
    );
    if (refreshed) setLineAddParent(refreshed);
    setToast(`Added to "${lineAddParent.item_name || lineAddParent.item_code}"`);
    setTimeout(() => setToast(""), 1800);
  };

  const handleSubRemove = (parentCode, subCode) => {
    removeSubItem(parentCode, subCode);
    setCart(getCart());
    const refreshed = getCart().find((c) => c.item_code === parentCode);
    if (refreshed) setLineAddParent(refreshed);
    setToast("Sub-item removed");
    setTimeout(() => setToast(""), 1800);
  };

  const {
    subtotal,
    payableCount,
    onRequestCount,
    currency,
    totalVisits,
    totalUnits,
  } = useMemo(() => {
    let subtotal = 0;
    let payable = 0;
    let onRequest = 0;
    let visits = 0;
    let units = 0;

    cart.forEach((it) => {
      if (hasVisitControl(it)) visits += Number(it.visits) || 1;
      if (hasUnitControl(it)) units += Number(it.units) || 1;

      if (it.rate && it.rate > 0) {
        const v = hasVisitControl(it) ? Number(it.visits) || 1 : 1;
        subtotal += computeItemAmount(it) * v;
        payable += 1;
      } else {
        onRequest += 1;
      }

      (it.subItems || []).forEach((s) => {
        if (hasVisitControl(s)) visits += Number(s.visits) || 1;
        if (hasUnitControl(s)) units += Number(s.units) || 1;

        if (s.rate && s.rate > 0) {
          const v = hasVisitControl(s) ? Number(s.visits) || 1 : 1;
          subtotal += computeItemAmount(s) * v;
          payable += 1;
        } else {
          onRequest += 1;
        }
      });
    });

    return {
      subtotal,
      payableCount: payable,
      onRequestCount: onRequest,
      currency: cart[0]?.currency || "INR",
      totalVisits: visits,
      totalUnits: units,
    };
  }, [cart]);

  const openBulkQuote = () => {
    setQuoteItems(null);
    setQuoteOpen(true);
  };

  const openItemQuote = (item) => {
    const flat = [item, ...(item.subItems || [])];
    setQuoteItems(flat);
    setQuoteOpen(true);
  };

  const activeQuoteItems = quoteItems ?? cart;

  const quoteSummary = useMemo(() => {
    let sub = 0;
    let visits = 0;
    let units = 0;

    activeQuoteItems.forEach((it) => {
      if (it.rate && it.rate > 0) {
        const v = hasVisitControl(it) ? Number(it.visits) || 1 : 1;
        sub += computeItemAmount(it) * v;
      }
      if (hasVisitControl(it)) visits += Number(it.visits) || 1;
      if (hasUnitControl(it)) units += Number(it.units) || 1;
    });

    return {
      subtotal: sub,
      totalVisits: visits,
      totalUnits: units,
      lineCount: activeQuoteItems.length,
      currency: activeQuoteItems[0]?.currency || "INR",
    };
  }, [activeQuoteItems]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((f) => {
      const next = { ...f, [name]: value };

      if (f.sameAsSite) {
        if (name === "address") next.shipping_address = value;
        if (name === "city") next.shipping_city = value;
        if (name === "state") next.shipping_state = value;
        if (name === "pincode") next.shipping_pincode = value;
        if (name === "email") next.shipping_email = value;
        if (name === "phone") next.shipping_mobile = value;
      }

      return next;
    });
  };

  const handleSameAsSiteToggle = (e) => {
    const checked = e.target.checked;

    setForm((f) => {
      if (!checked) {
        return { ...f, sameAsSite: false };
      }

      return {
        ...f,
        sameAsSite: true,
        shipping_address: f.address,
        shipping_city: f.city,
        shipping_state: f.state,
        shipping_pincode: f.pincode,
        shipping_email: f.email,
        shipping_mobile: f.phone,
      };
    });
  };

  const buildQuoteItems = (lines, propertyType = "Commercial") => {
    const out = [];

    const allowedCategories = [
      "Residential",
      "Commercial",
      "Industrial",
      "Other",
    ];
    const safeCategory = allowedCategories.includes(propertyType)
      ? propertyType
      : "Commercial";

    lines.forEach((parent) => {
      const pushItem = (it) => {
        const showVisit = hasVisitControl(it);
        const showUnit = hasUnitControl(it);

        const visits = showVisit ? Number(it.visits) || 1 : 1;
        const units = showUnit ? Number(it.units) || 1 : 1;

        const qty = units;
        const custom_visit = visits;

        const item = {
          item_code: it.item_code,
          category: safeCategory,
          service: "AMC Charges",

          amc_type_id: it.amc_type_id || it.amc_type_name || it.amc_type || "",
          amc_type: it.amc_type_name || it.amc_type || "",

          amc_sub_type_id: it.amc_sub_type_id || it.amc_sub_type || "",
          amc_sub_type: it.amc_sub_type_name || it.amc_sub_type || "",

          qty,
          custom_visit,

          rate: Number(it.rate) || 0,

          stock_uom: it.stock_uom || it.uom || "Nos",
        };

        if (it.gst_hsn_code) {
          item.gst_hsn_code = it.gst_hsn_code;
        }

        out.push(item);
      };

      pushItem(parent);
      (parent.subItems || []).forEach(pushItem);
    });

    return out;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeQuoteItems.length) return;

    setSubmitting(true);
    try {
      const itemsPayload = buildQuoteItems(
        activeQuoteItems,
        form.property_type
      );

      const payload = {
        customer_name: form.name.trim(),
        company_name: form.company_name.trim(),
        mobile: form.phone.trim(),
        email: form.email.trim(),

        service_address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),

        shipping_address: (form.shipping_address || "").trim(),
        shipping_city: (form.shipping_city || "").trim(),
        shipping_state: (form.shipping_state || "").trim(),
        shipping_pincode: (form.shipping_pincode || "").trim(),
        shipping_mobile: (form.shipping_mobile || "").trim(),
        shipping_email: (form.shipping_email || "").trim(),

        remarks: form.notes.trim(),
        property_type: form.property_type,

        duration: form.duration,
        price_list: form.price_list,

        items: itemsPayload,
      };

      console.log("[quote] payload →", payload);

      const res = await fetch(QUOTE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();

      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          const j = JSON.parse(raw);
          if (j._server_messages) {
            const msgs = JSON.parse(j._server_messages);
            detail = msgs
              .map((m) => {
                try {
                  const parsed = JSON.parse(m);
                  return parsed.message || m;
                } catch {
                  return m;
                }
              })
              .join("\n");
          } else if (j.exception) {
            detail = j.exception;
          } else if (j.error) {
            detail = j.error;
          }
        } catch {
          detail = raw?.slice(0, 400) || `HTTP ${res.status}`;
        }
        throw new Error(detail);
      }

      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error("Server returned non-JSON: " + raw.slice(0, 200));
      }

      console.log("[quote] created:", data);

      const msg = data?.message || {};

      const viewUrl = buildPrintUrl(msg.print_url);
      const pdfUrl = buildPrintUrl(msg.print_url, { download: true });

      const quoteInfo = {
        number: msg.quotation || "",
        pdfUrl,
        viewUrl,
        grandTotal: msg.grand_total,
        currency: msg.currency || "INR",
        customer: msg.customer || form.name.trim(),
        duration: msg.duration,
        priceList: msg.price_list,
        shareKey: msg.share_key,
      };

      setCreatedQuote(quoteInfo);

      if (quoteItems === null) {
        setSubmitted(true);
        clearCart();
        setCart([]);
      } else {
        removeFromCart(quoteItems[0].item_code);
        setCart(getCart());
        setToast("Quote requested for this item");
        setTimeout(() => setToast(""), 2200);
      }
      setQuoteOpen(false);

      await showQuoteSuccessAlert(quoteInfo);
    } catch (err) {
      console.error("Quote submit failed:", err);
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: err.message || "Please try again.",
        confirmButtonColor: "#cd7913",
        customClass: {
          popup: "amc-quote-swal-popup",
          title: "amc-quote-swal-title",
          confirmButton: "amc-quote-swal-btn",
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const catalogTypes = useMemo(() => {
    const map = new Map();
    catalog.forEach((it) => {
      const key = (it.amc_type_name || it.amc_type || "Other").trim();
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [
      { key: "all", label: "All", count: catalog.length },
      ...Array.from(map.entries()).map(([key, count]) => ({
        key,
        label: key,
        count,
      })),
    ];
  }, [catalog]);

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalog.filter((it) => {
      const typeKey = (it.amc_type_name || it.amc_type || "Other").trim();
      if (activeTypes.length > 0 && !activeTypes.includes(typeKey))
        return false;
      if (!q) return true;
      return (
        (it.item_name || "").toLowerCase().includes(q) ||
        (it.item_code || "").toLowerCase().includes(q) ||
        (it.amc_sub_type_name || "").toLowerCase().includes(q)
      );
    });
  }, [catalog, search, activeTypes]);

  const inCart = (item_code) => cart.some((c) => c.item_code === item_code);

  const isSubInParent = (parentCode, subCode) => {
    const parent = cart.find((c) => c.item_code === parentCode);
    if (!parent?.subItems) return false;
    return parent.subItems.some((s) => s.item_code === subCode);
  };

  if (!mounted) return null;

  const lineAddParentTotal = lineAddParent ? lineTotal(lineAddParent).total : 0;
  const shippingLocked = form.sameAsSite;

  return (
    <>
      <AMCNavbar />
      <main className={styles.cartPage}>
        <section className={styles.cartHero}>
          <div className={styles.cartHero__inner}>
            <div className={styles.cartHero__left}>
              <span className={styles.cartHero__eyebrow}>YOUR SELECTION</span>
              <h1>
                Review your
                <span> maintenance request.</span>
              </h1>
              <p>
                {cart.length === 0
                  ? "Your cart is empty. Add AMC services to start building your request."
                  : `${cart.length} line${
                      cart.length > 1 ? "s" : ""
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
                  onClick={() => setAddOpen(true)}
                >
                  + Add Items
                </button>
                {cart.length > 0 && (
                  <button
                    type="button"
                    className={`${styles.btn} ${styles["btn--primary"]}`}
                    onClick={openBulkQuote}
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

        {submitted && (
          <section className={styles.cartSection}>
            <div className={styles.quoteSuccess}>
              <div className={styles.quoteSuccess__hero}>
                <div className={styles.quoteSuccess__check}>
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 12.5L10 17.5L19 7"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <span className={styles.quoteSuccess__eyebrow}>
                  REQUEST CONFIRMED
                </span>

                <h2 className={styles.quoteSuccess__title}>
                  Your quotation is
                  <span> ready.</span>
                </h2>

                <p className={styles.quoteSuccess__sub}>
                  We&apos;ve created your AMC quotation. Download the PDF
                  below, or check your inbox — our team will follow up within
                  24 hours.
                </p>

                <div className={styles.quoteSuccess__meta}>
                  <div className={styles.quoteSuccess__metaItem}>
                    <span className={styles.quoteSuccess__metaLabel}>
                      Quotation No.
                    </span>
                    <strong className={styles.quoteSuccess__metaValue}>
                      {createdQuote?.number || "—"}
                    </strong>
                  </div>
                  <div className={styles.quoteSuccess__metaDivider} />
                  <div className={styles.quoteSuccess__metaItem}>
                    <span className={styles.quoteSuccess__metaLabel}>
                      Customer
                    </span>
                    <strong className={styles.quoteSuccess__metaValue}>
                      {createdQuote?.customer || "—"}
                    </strong>
                  </div>
                  <div className={styles.quoteSuccess__metaDivider} />
                  <div className={styles.quoteSuccess__metaItem}>
                    <span className={styles.quoteSuccess__metaLabel}>
                      Grand Total
                    </span>
                    <strong className={styles.quoteSuccess__metaValue}>
                      {typeof createdQuote?.grandTotal === "number"
                        ? inr(createdQuote.grandTotal, createdQuote.currency)
                        : "—"}
                    </strong>
                  </div>
                </div>

                <div className={styles.quoteSuccess__actions}>
                  {createdQuote?.pdfUrl ? (
                    <a
                      href={createdQuote.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={`${createdQuote.number || "quotation"}.pdf`}
                      className={styles.quoteSuccess__download}
                    >
                      <span
                        className={styles.quoteSuccess__downloadIcon}
                        aria-hidden="true"
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          width="16"
                          height="16"
                        >
                          <path
                            d="M10 3v9m0 0l-3.5-3.5M10 12l3.5-3.5M4 16h12"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      Download Quotation PDF
                    </a>
                  ) : (
                    <div className={styles.quoteSuccess__pending}>
                      PDF will be emailed shortly
                    </div>
                  )}

                  <Link href="/" className={styles.quoteSuccess__back}>
                    ← Back to AMC Services
                  </Link>
                </div>
              </div>

              <aside className={styles.quoteSuccess__card}>
                <div
                  className={styles.quoteSuccess__cardGlow}
                  aria-hidden="true"
                />

                <header className={styles.quoteSuccess__cardHead}>
                  <span className={styles.quoteSuccess__cardEyebrow}>
                    <span className={styles.quoteSuccess__cardDot} />
                    QUOTATION
                  </span>
                  <h3>{createdQuote?.number || "—"}</h3>
                </header>

                <div className={styles.quoteSuccess__cardBody}>
                  {createdQuote?.customer && (
                    <div className={styles.quoteSuccess__cardRow}>
                      <span>Customer</span>
                      <strong>{createdQuote.customer}</strong>
                    </div>
                  )}
                  {createdQuote?.duration && (
                    <div className={styles.quoteSuccess__cardRow}>
                      <span>Duration</span>
                      <strong>{createdQuote.duration}</strong>
                    </div>
                  )}
                  {createdQuote?.priceList && (
                    <div className={styles.quoteSuccess__cardRow}>
                      <span>Price List</span>
                      <strong>{createdQuote.priceList}</strong>
                    </div>
                  )}
                  <div className={styles.quoteSuccess__cardRow}>
                    <span>Source</span>
                    <strong>Website</strong>
                  </div>
                </div>

                <div className={styles.quoteSuccess__cardTotal}>
                  <div>
                    <span>Grand Total</span>
                    <small>Incl. applicable taxes</small>
                  </div>
                  <strong>
                    {typeof createdQuote?.grandTotal === "number"
                      ? inr(createdQuote.grandTotal, createdQuote.currency)
                      : "—"}
                  </strong>
                </div>

                {createdQuote?.viewUrl && (
                  <a
                    href={createdQuote.viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.quoteSuccess__cardCta}
                  >
                    View Online
                    <span aria-hidden="true">
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        width="14"
                        height="14"
                      >
                        <path
                          d="M4 12L12 4M12 4H6M12 4V10"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </a>
                )}

                <ul className={styles.quoteSuccess__trust}>
                  <li>
                    <span className={styles.quoteSuccess__trustIcon}>
                      <svg
                        viewBox="0 0 12 12"
                        fill="none"
                        width="12"
                        height="12"
                      >
                        <path
                          d="M2.5 6.2L5 8.5L9.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    Emailed to your inbox
                  </li>
                  <li>
                    <span className={styles.quoteSuccess__trustIcon}>
                      <svg
                        viewBox="0 0 12 12"
                        fill="none"
                        width="12"
                        height="12"
                      >
                        <path
                          d="M2.5 6.2L5 8.5L9.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    Valid for 30 days
                  </li>
                </ul>
              </aside>
            </div>
          </section>
        )}

        {!submitted && cart.length === 0 && (
          <section className={styles.cartSection}>
            <div className={styles.cartEmpty}>
              <div className={styles.cartEmpty__icon}>🛒</div>
              <h2>Your cart is empty</h2>
              <p>
                Add AMC services to your cart to build your maintenance
                request.
              </p>
              <div className={styles.cartEmpty__actions}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles["btn--primary"]}`}
                  onClick={() => setAddOpen(true)}
                >
                  + Add Items <span>↗</span>
                </button>
                <Link
                  href="/"
                  className={`${styles.btn} ${styles["btn--ghost"]}`}
                >
                  Explore AMC Services
                </Link>
              </div>
            </div>
          </section>
        )}

        {!submitted && cart.length > 0 && (
          <section className={styles.cartSection} id="checkout">
            <div className={styles.cartGrid}>
              <div className={styles.cartItems}>
                <div className={styles.cartItems__head}>
                  <div>
                    <h2>Items in cart</h2>
                    <p className={styles.cartItems__sub}>
                      {cart.length} line item{cart.length > 1 ? "s" : ""} ·
                      request a quote per item or all at once
                    </p>
                  </div>
                  <div className={styles.cartItems__actions}>
                    <button
                      type="button"
                      className={styles.cartAddBtn}
                      onClick={() => setAddOpen(true)}
                    >
                      + Add more
                    </button>
                    <button
                      type="button"
                      className={styles.cartClearBtn}
                      onClick={handleClear}
                    >
                      Clear all
                    </button>
                  </div>
                </div>

                <ul className={styles.cartList}>
                  {cart.map((it) => {
                    const displayName = it.item_name || it.item_code;
                    const subItems = it.subItems || [];
                    const { total, hasPayable } = lineTotal(it);
                    const subCount = subItems.length;
                    const showVisit = hasVisitControl(it);
                    const showUnit = hasUnitControl(it);

                    return (
                      <li className={styles.cartItem} key={it.item_code}>
                        <div className={styles.cartItem__main}>
                          <div
                            className={styles.cartItem__thumb}
                            aria-hidden="true"
                          >
                            {displayName.slice(0, 2).toUpperCase()}
                          </div>

                          <div className={styles.cartItem__body}>
                            <div className={styles.cartItem__info}>
                              <span className={styles.cartItem__tag}>
                                {it.amc_sub_type_name ||
                                  it.amc_sub_type ||
                                  it.amc_type_name ||
                                  "AMC"}
                              </span>
                              <h3 title={displayName}>
                                {prettyName(displayName)}
                              </h3>
                              <p className={styles.cartItem__meta}>
                                Code {it.item_code} · UOM {it.uom || "Nos"}
                                {subCount > 0 &&
                                  ` · ${subCount} add-on${
                                    subCount > 1 ? "s" : ""
                                  }`}
                              </p>
                            </div>

                            <div className={styles.cartItem__controls}>
                              {hasQtyControls(it) && (
                                <div className={styles.cartItem__counts}>
                                  {showVisit && (
                                    <div className={styles.cartItem__count}>
                                      <span
                                        className={
                                          styles.cartItem__countLabel
                                        }
                                      >
                                        Visits
                                      </span>
                                      <div className={styles.cartItem__qty}>
                                        <button
                                          type="button"
                                          aria-label="Decrease visits"
                                          onClick={() =>
                                            updateVisits(it.item_code, -1)
                                          }
                                        >
                                          −
                                        </button>
                                        <input
                                          type="number"
                                          min="1"
                                          value={it.visits || 1}
                                          onChange={(e) =>
                                            setVisits(
                                              it.item_code,
                                              e.target.value
                                            )
                                          }
                                        />
                                        <button
                                          type="button"
                                          aria-label="Increase visits"
                                          onClick={() =>
                                            updateVisits(it.item_code, 1)
                                          }
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {showUnit && (
                                    <div className={styles.cartItem__count}>
                                      <span
                                        className={
                                          styles.cartItem__countLabel
                                        }
                                      >
                                        Units
                                        <em className={styles.cartItem__uom}>
                                          {it.uom || it.stock_uom || "Nos"}
                                        </em>
                                      </span>
                                      <div className={styles.cartItem__qty}>
                                        <button
                                          type="button"
                                          aria-label="Decrease units"
                                          onClick={() =>
                                            updateUnits(it.item_code, -1)
                                          }
                                        >
                                          −
                                        </button>
                                        <input
                                          type="number"
                                          min="1"
                                          value={it.units || 1}
                                          onChange={(e) =>
                                            setUnits(
                                              it.item_code,
                                              e.target.value
                                            )
                                          }
                                        />
                                        <button
                                          type="button"
                                          aria-label="Increase units"
                                          onClick={() =>
                                            updateUnits(it.item_code, 1)
                                          }
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className={styles.cartItem__price}>
                                {hasPayable ? (
                                  <>
                                    <span className={styles.cartItem__rate}>
                                      {(() => {
                                        const parts = [];
                                        if (showVisit)
                                          parts.push(
                                            `${it.visits || 1} visit${
                                              (it.visits || 1) > 1 ? "s" : ""
                                            }`
                                          );
                                        if (showUnit)
                                          parts.push(
                                            `${it.units || 1} unit${
                                              (it.units || 1) > 1 ? "s" : ""
                                            }`
                                          );
                                        return parts.length
                                          ? parts.join(" × ")
                                          : "Fixed";
                                      })()}
                                    </span>
                                    <span className={styles.cartItem__line}>
                                      {inr(total, it.currency)}
                                    </span>
                                  </>
                                ) : (
                                  <span className={styles.cartItem__onRequest}>
                                    On request
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className={styles.cartItem__actions}>
                            <button
                              type="button"
                              className={styles.cartItem__quote}
                              onClick={() => openItemQuote(it)}
                            >
                              Quote
                              <span>↗</span>
                            </button>

                            <button
                              type="button"
                              className={styles.cartItem__remove}
                              aria-label="Remove item"
                              onClick={() => handleRemove(it.item_code)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {subItems.length > 0 && (
                          <ul className={styles.cartItem__subs}>
                            {subItems.map((s) => {
                              const sName = s.item_name || s.item_code;
                              const sShowVisit = hasVisitControl(s);
                              const sShowUnit = hasUnitControl(s);
                              return (
                                <li
                                  key={s.item_code}
                                  className={styles.subItem}
                                >
                                  <div
                                    className={styles.subItem__thumb}
                                    aria-hidden="true"
                                  >
                                    {sName.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className={styles.subItem__info}>
                                    <strong title={sName}>
                                      {prettyName(sName)}
                                    </strong>
                                    <span>
                                      {s.item_code} · {s.uom || "Nos"}
                                    </span>
                                  </div>

                                  {hasQtyControls(s) && (
                                    <div className={styles.subItem__counts}>
                                      {sShowVisit && (
                                        <div
                                          className={styles.subItem__count}
                                        >
                                          <span
                                            className={
                                              styles.subItem__countLabel
                                            }
                                          >
                                            Visits
                                          </span>
                                          <div className={styles.subItem__qty}>
                                            <button
                                              type="button"
                                              aria-label="Decrease visits"
                                              onClick={() =>
                                                handleSubVisits(
                                                  it.item_code,
                                                  s.item_code,
                                                  (s.visits || 1) - 1
                                                )
                                              }
                                            >
                                              −
                                            </button>
                                            <input
                                              type="number"
                                              min="1"
                                              value={s.visits || 1}
                                              onChange={(e) =>
                                                handleSubVisits(
                                                  it.item_code,
                                                  s.item_code,
                                                  e.target.value
                                                )
                                              }
                                            />
                                            <button
                                              type="button"
                                              aria-label="Increase visits"
                                              onClick={() =>
                                                handleSubVisits(
                                                  it.item_code,
                                                  s.item_code,
                                                  (s.visits || 1) + 1
                                                )
                                              }
                                            >
                                              +
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {sShowUnit && (
                                        <div
                                          className={styles.subItem__count}
                                        >
                                          <span
                                            className={
                                              styles.subItem__countLabel
                                            }
                                          >
                                            Units{" "}
                                            <em className={styles.subItem__uom}>
                                              {s.uom || s.stock_uom || "Nos"}
                                            </em>
                                          </span>
                                          <div className={styles.subItem__qty}>
                                            <button
                                              type="button"
                                              aria-label="Decrease units"
                                              onClick={() =>
                                                handleSubUnits(
                                                  it.item_code,
                                                  s.item_code,
                                                  (s.units || 1) - 1
                                                )
                                              }
                                            >
                                              −
                                            </button>
                                            <input
                                              type="number"
                                              min="1"
                                              value={s.units || 1}
                                              onChange={(e) =>
                                                handleSubUnits(
                                                  it.item_code,
                                                  s.item_code,
                                                  e.target.value
                                                )
                                              }
                                            />
                                            <button
                                              type="button"
                                              aria-label="Increase units"
                                              onClick={() =>
                                                handleSubUnits(
                                                  it.item_code,
                                                  s.item_code,
                                                  (s.units || 1) + 1
                                                )
                                              }
                                            >
                                              +
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  <div className={styles.subItem__price}>
                                    {s.rate && s.rate > 0
                                      ? inr(
                                          computeItemAmount(s) *
                                            (sShowVisit ? s.visits || 1 : 1),
                                          s.currency
                                        )
                                      : "On request"}
                                  </div>
                                  <button
                                    type="button"
                                    className={styles.subItem__remove}
                                    aria-label="Remove sub-item"
                                    onClick={() =>
                                      handleSubRemove(
                                        it.item_code,
                                        s.item_code
                                      )
                                    }
                                  >
                                    ×
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}

                        <div className={styles.cartItem__footer}>
                          <button
                            type="button"
                            className={styles.cartItem__addMore}
                            onClick={() => {
                              setLineAddParent(it);
                              setLineAddOpen(true);
                            }}
                          >
                            + Add more items to this
                          </button>

                          <div className={styles.cartItem__subtotal}>
                            <span>Line total</span>
                            <strong>
                              {hasPayable
                                ? inr(total, it.currency)
                                : "On request"}
                            </strong>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <aside className={styles.cartAside}>
                <div className={styles.cartSummary}>
                  <div
                    className={styles.cartSummary__glow}
                    aria-hidden="true"
                  />

                  <header className={styles.cartSummary__head}>
                    <div className={styles.cartSummary__headLeft}>
                      <span className={styles.cartSummary__eyebrow}>
                        <span className={styles.cartSummary__eyebrowDot} />
                        ORDER SUMMARY
                      </span>
                      <h3>Your request</h3>
                    </div>
                    <div className={styles.cartSummary__headBadge}>
                      {cart.length} line{cart.length > 1 ? "s" : ""}
                    </div>
                  </header>

                  <div className={styles.cartSummary__stats}>
                    <div className={styles.cartSummary__stat}>
                      <span className={styles.cartSummary__statNum}>
                        {totalVisits}
                      </span>
                      <span className={styles.cartSummary__statLabel}>
                        Visits
                      </span>
                    </div>
                    <div className={styles.cartSummary__statDivider} />
                    <div className={styles.cartSummary__stat}>
                      <span className={styles.cartSummary__statNum}>
                        {totalUnits}
                      </span>
                      <span className={styles.cartSummary__statLabel}>
                        Units
                      </span>
                    </div>
                    <div className={styles.cartSummary__statDivider} />
                    <div className={styles.cartSummary__stat}>
                      <span className={styles.cartSummary__statNum}>
                        {payableCount}
                      </span>
                      <span className={styles.cartSummary__statLabel}>
                        Payable
                      </span>
                    </div>
                    <div className={styles.cartSummary__statDivider} />
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
                      <span className={styles.cartSummary__statLabel}>
                        On request
                      </span>
                    </div>
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
                    onClick={openBulkQuote}
                  >
                    <span className={styles.cartSummary__ctaLabel}>
                      Request Quote for All
                    </span>
                    <span
                      className={styles.cartSummary__ctaIcon}
                      aria-hidden="true"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
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
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
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
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
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
            </div>
          </section>
        )}

        {addOpen && (
          <div
            className={styles.cartModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-items-title"
            onClick={() => setAddOpen(false)}
          >
            <div
              className={`${styles.cartModal__panel} ${styles["cartModal__panel--wide"]}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={styles.cartModal__close}
                aria-label="Close"
                onClick={() => setAddOpen(false)}
              >
                ×
              </button>

              <div className={styles.cartModal__head}>
                <span className={styles.cartModal__eyebrow}>
                  ADD AMC SERVICES
                </span>
                <h2 id="add-items-title">
                  Pick items to <span>add to your cart.</span>
                </h2>
                <p>
                  Search or filter by category, then tap an item to add it.
                </p>
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
                onAdd={handleAddFromCatalog}
                onRemove={(it) => handleRemove(it.item_code)}
                isAdded={(code) => inCart(code)}
                retry={() => setCatalog([])}
                addLabel={(added) => (added ? "Add again" : "Add")}
                selectedLines={cart}
                onClearAll={handleClear}
              />

              <div className={styles.cartModal__actions}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles["btn--ghost"]}`}
                  onClick={() => setAddOpen(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {lineAddOpen && lineAddParent && (
          <div
            className={styles.cartModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="line-add-title"
            onClick={() => setLineAddOpen(false)}
          >
            <div
              className={`${styles.cartModal__panel} ${styles["cartModal__panel--wide"]}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={styles.cartModal__close}
                aria-label="Close"
                onClick={() => setLineAddOpen(false)}
              >
                ×
              </button>

              <div className={styles.cartModal__head}>
                <span className={styles.cartModal__eyebrow}>
                  ADD TO THIS CART LINE
                </span>
                <h2 id="line-add-title">
                  Adding to{" "}
                  <span>
                    {prettyName(
                      lineAddParent.item_name || lineAddParent.item_code
                    )}
                  </span>
                </h2>
                <p>
                  Selected items will appear as sub-items under this line.
                  They share the same quote request.
                </p>
              </div>

              <div className={styles.lineAddParent}>
                <div className={styles.lineAddParent__thumb}>
                  {(lineAddParent.item_name || lineAddParent.item_code)
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className={styles.lineAddParent__info}>
                  <strong
                    title={
                      lineAddParent.item_name || lineAddParent.item_code
                    }
                  >
                    {prettyName(
                      lineAddParent.item_name || lineAddParent.item_code
                    )}
                  </strong>
                  <span>
                    {(() => {
                      const parts = [];
                      if (hasVisitControl(lineAddParent))
                        parts.push(
                          `${lineAddParent.visits || 1} visit${
                            (lineAddParent.visits || 1) > 1 ? "s" : ""
                          }`
                        );
                      if (hasUnitControl(lineAddParent))
                        parts.push(
                          `${lineAddParent.units || 1} unit${
                            (lineAddParent.units || 1) > 1 ? "s" : ""
                          }`
                        );
                      parts.push(lineAddParent.uom || "Nos");
                      if ((lineAddParent.subItems || []).length > 0)
                        parts.push(
                          `${lineAddParent.subItems.length} add-on${
                            lineAddParent.subItems.length > 1 ? "s" : ""
                          }`
                        );
                      return parts.join(" · ");
                    })()}
                  </span>
                </div>
                <div className={styles.lineAddParent__priceWrap}>
                  <span>Running total</span>
                  <strong>
                    {lineTotal(lineAddParent).hasPayable
                      ? inr(lineAddParentTotal, lineAddParent.currency)
                      : "On request"}
                  </strong>
                </div>
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
                onAdd={handleAddSubItem}
                onRemove={(it) =>
                  handleSubRemove(lineAddParent.item_code, it.item_code)
                }
                isAdded={(code) =>
                  isSubInParent(lineAddParent.item_code, code)
                }
                retry={() => setCatalog([])}
                addLabel={(added) => (added ? "Add again" : "Add")}
                selectedLines={lineAddParent.subItems || []}
              />

              <div className={styles.cartModal__actions}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles["btn--primary"]}`}
                  onClick={() => setLineAddOpen(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {quoteOpen && (
          <div
            className={styles.cartModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-modal-title"
            onClick={() => !submitting && setQuoteOpen(false)}
          >
            <div
              className={`${styles.cartModal__panel} ${styles["cartModal__panel--wide"]}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={styles.cartModal__close}
                aria-label="Close"
                onClick={() => !submitting && setQuoteOpen(false)}
              >
                ×
              </button>

              <div className={styles.cartModal__head}>
                <span className={styles.cartModal__eyebrow}>
                  {quoteItems === null ? "BULK QUOTE" : "ITEM QUOTE"}
                </span>
                <h2 id="quote-modal-title">
                  {quoteItems === null ? (
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
                  {quoteItems === null
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
                      `${it.visits || 1} visit${
                        (it.visits || 1) > 1 ? "s" : ""
                      }`
                    );
                  if (showUnit)
                    parts.push(
                      `${it.units || 1} unit${
                        (it.units || 1) > 1 ? "s" : ""
                      }`
                    );
                  parts.push(it.uom || it.stock_uom || "Nos");
                  if (it.amc_sub_type_name) parts.push(it.amc_sub_type_name);

                  return (
                    <div
                      key={`${it.item_code}-${idx}`}
                      className={styles.cartModal__previewRow}
                    >
                      <div className={styles.cartModal__previewThumb}>
                        {(it.item_name || it.item_code)
                          .slice(0, 2)
                          .toUpperCase()}
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
                              computeItemAmount(it) *
                                (showVisit ? it.visits || 1 : 1),
                              it.currency
                            )
                          : "On request"}
                      </div>
                    </div>
                  );
                })}
              </div>

              <form
                className={styles.cartModal__form}
                onSubmit={handleSubmit}
              >
                <div className={styles.formSection}>
                  <span className={styles.formSection__label}>
                    Contact details
                  </span>
                  <div className={styles.cartModal__grid}>
                    <label>
                      <span>Full Name *</span>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
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
                        onChange={handleChange}
                        placeholder="e.g. ABC Technologies Pvt Ltd"
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
                        required
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
                        required
                      />
                    </label>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <span className={styles.formSection__label}>
                    Billing details
                  </span>
                  <div className={styles.cartModal__grid}>
                    <label className={styles.cartModal__full}>
                      <span>Service Address *</span>
                      <textarea
                        name="address"
                        rows="2"
                        value={form.address}
                        onChange={handleChange}
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
                        onChange={handleChange}
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
                        onChange={handleChange}
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
                        onChange={handleChange}
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
                        onChange={handleChange}
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
                        onChange={handleSameAsSiteToggle}
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
                        onChange={handleChange}
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
                        onChange={handleChange}
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
                        onChange={handleChange}
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
                        onChange={handleChange}
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
                        onChange={handleChange}
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
                        onChange={handleChange}
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
                    onClick={() => setQuoteOpen(false)}
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
        )}

        {toast && <div className={styles.cartToast}>{toast}</div>}
      </main>
    </>
  );
}