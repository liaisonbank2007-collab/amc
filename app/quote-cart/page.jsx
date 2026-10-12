// app/quote-cart/page.jsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import AMCNavbar from "@/components/Navbar/Navbar.jsx";
import { addToCart, appendToCartItem, removeSubItem } from "@/lib/cart";
import styles from "./cart.module.scss";

import { hasUnitControl, hasVisitControl } from "../../lib/visibility";
import {
  computeItemAmount,
  lineTotal,
  getDiscountForDuration,
  DURATION_OPTIONS,
   monthsToDurationValue,       // ← NEW
  durationValueToMonths,       // ← NEW (for outbound payload)
} from "../../lib/calculations";
import { buildPrintUrl, showQuoteSuccessAlert } from "../../lib/api";

import useCart from "../../hooks/useCart";

import CartHero from "../../components/CartHero";
import EmptyCart from "../../components/EmptyCart";
import QuoteSuccess from "../../components/QuoteSuccess";
import CartItem from "../../components/CartItem";
import CartSummary from "../../components/CartSummary";
import AddItemsModal from "../../components/modals/AddItemsModal";
import LineAddModal from "../../components/modals/LineAddModal";
import QuoteModal from "../../components/modals/QuoteModal";

const API_URL = "/api/frappe/get_amc_items";
const QUOTE_API = "/api/method/create_amc_quotation";
const CART_STORAGE_KEY = "amc_cart";

function readRawCart() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function QuoteCartPage() {
  const {
    cart,
    mounted,
    setVisits,
    setUnits,
    setSubVisits,
    setSubUnits,
    remove: removeItem,
    clear: clearItems,
    refresh: refreshCart,
  } = useCart();

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

  // ★ NEW: shared refresh state for hero + list
  const [refreshing, setRefreshing] = useState(false);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }, []);

  useEffect(() => {
    const anyModalOpen = quoteOpen || addOpen || lineAddOpen;

    // Capture current value so we can restore it on cleanup
    const original = document.body.style.overflow;

    if (anyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      // No modal open → make sure the body is scrollable again.
      document.body.style.overflow = "";
    }

    return () => {
      // On dependency change or unmount, restore the value that was in
      // place before this effect ran.
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

  const shouldFetchCatalog = (addOpen || lineAddOpen) && catalog.length === 0;

  useEffect(() => {
    if (!shouldFetchCatalog) return;
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
        console.error("[QuoteCartPage] catalog fetch failed:", err);
        if (!cancelled) setCatalogError("Could not load items. Please retry.");
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shouldFetchCatalog]);

  const handleRemove = useCallback(
    (itemCode) => {
      removeItem(itemCode);
      showToast("Item removed");
    },
    [removeItem, showToast]
  );

  const handleClear = useCallback(() => {
    if (!confirm("Remove all items from the cart?")) return;
    clearItems();
  }, [clearItems]);

const handleAddFromCatalog = useCallback(
  (item) => {
    // Destructure the API's numeric field out so it doesn't linger in the cart
    const { custom_duration_months, ...rest } = item;

    addToCart([
      {
        ...rest,
        visits: 1,
        units: 1,
        // UI selection — always a string from DURATION_OPTIONS
        selectedDuration: monthsToDurationValue(custom_duration_months),
        // Keep the raw API value under a different key so it survives
        // the round-trip when we build the payload.
        _base_months: Number(custom_duration_months) || 1,
      },
    ]);
    refreshCart();
    showToast(`Added: ${item.item_name || item.item_code}`);
  },
  [refreshCart, showToast]
);

  const handleAddSubItem = useCallback(
    (item) => {
      if (!lineAddParent) return;
      appendToCartItem(lineAddParent.item_code, {
        ...item,
        visits: 1,
        units: 1,
      });
      refreshCart();
      const refreshed = readRawCart().find(
        (c) => c.item_code === lineAddParent.item_code
      );
      if (refreshed) setLineAddParent(refreshed);
      showToast(
        `Added to "${lineAddParent.item_name || lineAddParent.item_code}"`
      );
    },
    [lineAddParent, refreshCart, showToast]
  );

  const handleSubRemove = useCallback(
    (parentCode, subCode) => {
      removeSubItem(parentCode, subCode);
      refreshCart();
      const refreshed = readRawCart().find((c) => c.item_code === parentCode);
      if (refreshed) setLineAddParent(refreshed);
      showToast("Sub-item removed");
    },
    [refreshCart, showToast]
  );

  // ★ UPDATED: parent now owns the refresh lifecycle + min-visible delay
  const handleRefreshItems = useCallback(async () => {
    if (refreshing) return;

    const MIN_VISIBLE_MS = 400;
    const startedAt = Date.now();

    setRefreshing(true);
    try {
      refreshCart();
    } catch (err) {
      console.error("[QuoteCartPage] refresh failed:", err);
    } finally {
      const remaining = MIN_VISIBLE_MS - (Date.now() - startedAt);
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
      setRefreshing(false);
    }
  }, [refreshing, refreshCart]);

  // Handle duration change for a cart item
 const handleDurationChange = useCallback(
  (itemCode, duration) => {
    const rawCart = readRawCart();
    const updatedCart = rawCart.map((item) => {
      if (item.item_code === itemCode) {
        return { ...item, selectedDuration: duration };
      }
      return item;
    });
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
    refreshCart();
  },
  [refreshCart]
);
  // ★ FIXED: Totals calculation with duration-based discounts
  const {
    subtotal,
    payableCount,
    onRequestCount,
    currency,
    totalVisits,
    totalUnits,
    totalDiscount,
  } = useMemo(() => {
    let nextSubtotal = 0;
    let payable = 0;
    let onRequest = 0;
    let visits = 0;
    let units = 0;
    let discountTotal = 0;

 const accumulate = (it, parentDuration) => {
  if (hasVisitControl(it)) visits += Number(it.visits) || 1;
  if (hasUnitControl(it)) units += Number(it.units) || 1;

  const duration =
    parentDuration || it.selectedDuration || "12 Months";

  if (it.rate && it.rate > 0) {
    const { total, discountAmount } = lineTotal(it, duration);
    nextSubtotal += total;
    discountTotal += discountAmount;
    payable += 1;
  } else {
    onRequest += 1;
  }
};

cart.forEach((it) => {
  accumulate(it, null);
  (it.subItems || []).forEach((sub) =>
    accumulate(sub, it.selectedDuration || "12 Months")
  );
});

    return {
      subtotal: nextSubtotal,
      payableCount: payable,
      onRequestCount: onRequest,
      currency: cart[0]?.currency || "INR",
      totalVisits: visits,
      totalUnits: units,
      totalDiscount: discountTotal,
    };
  }, [cart]);

  const openBulkQuote = useCallback(() => {
    setQuoteItems(null);
    setQuoteOpen(true);
  }, []);

  const openItemQuote = useCallback((item) => {
    const flat = [item, ...(item.subItems || [])];
    setQuoteItems(flat);
    setQuoteOpen(true);
  }, []);

  const activeQuoteItems = quoteItems ?? cart;

  const quoteSummary = useMemo(() => {
    let sub = 0;
    let visits = 0;
    let units = 0;
    let discountTotal = 0;

  activeQuoteItems.forEach((it) => {
  const duration = it.selectedDuration || "12 Months";
  if (it.rate && it.rate > 0) {
    const { total, discountAmount } = lineTotal(it, duration);
    sub += total;
    discountTotal += discountAmount;
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
      totalDiscount: discountTotal,
    };
  }, [activeQuoteItems]);

  const handleChange = useCallback((e) => {
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
  }, []);

  const handleSameAsSiteToggle = useCallback((e) => {
    const checked = e.target.checked;
    setForm((f) => {
      if (!checked) return { ...f, sameAsSite: false };
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
  }, []);

const buildQuoteItems = useCallback((lines, propertyType = "Commercial") => {
  const out = [];
  const allowedCategories = ["Residential", "Commercial", "Industrial", "Other"];
  const safeCategory = allowedCategories.includes(propertyType)
    ? propertyType
    : "Commercial";

  lines.forEach((parent) => {
    const parentDuration = parent.selectedDuration || "12 Months";
    const parentDiscount = getDiscountForDuration(parentDuration);

    const pushItem = (it, duration, discount) => {
      const showVisit = hasVisitControl(it);
      const showUnit = hasUnitControl(it);
      const visits = showVisit ? Number(it.visits) || 1 : 1;
      const units = showUnit ? Number(it.units) || 1 : 1;

      const item = {
        item_code: it.item_code,
        category: safeCategory,
        service: "AMC Charges",
        amc_type_id: it.amc_type_id || it.amc_type_name || it.amc_type || "",
        amc_type: it.amc_type_name || it.amc_type || "",
        amc_sub_type_id: it.amc_sub_type_id || it.amc_sub_type || "",
        amc_sub_type: it.amc_sub_type_name || it.amc_sub_type || "",
        custom_min_amount: it.custom_min_amount || "",
        custom_unit: it.custom_unit || " ",
        qty: units,
        custom_visit: visits,
        rate: Number(it.rate) || 0,
        stock_uom: it.stock_uom || it.uom || "Nos",
        // Numeric months for the API
        custom_duration_months: durationValueToMonths(duration),
        custom_discount_percentage: discount,
      };

      if (it.gst_hsn_code) item.gst_hsn_code = it.gst_hsn_code;
      out.push(item);
    };

    pushItem(parent, parentDuration, parentDiscount);
    (parent.subItems || []).forEach((sub) =>
      pushItem(sub, parentDuration, parentDiscount)
    );
  });

  return out;
}, []);
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!activeQuoteItems.length) return;

      setSubmitting(true);
      try {
        const itemsPayload = buildQuoteItems(
          activeQuoteItems,
          form.property_type
        );

        // For bulk quote, use the first item's duration as the header duration
const headerDuration =
  activeQuoteItems[0]?.selectedDuration ||
  form.duration ||
  "12 Months";

        const headerDiscount = getDiscountForDuration(headerDuration);


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
        duration: headerDuration,
        discount_percentage: headerDiscount,
          price_list: form.price_list,
          items: itemsPayload,
        };

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
          clearItems();
        } else {
          removeItem(quoteItems[0].item_code);
          showToast("Quote requested for this item");
        }
        setQuoteOpen(false);

        await showQuoteSuccessAlert(quoteInfo);
      } catch (err) {
        console.error("[QuoteCartPage] quote submit failed:", err);
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
    },
    [
      activeQuoteItems,
      buildQuoteItems,
      form,
      quoteItems,
      clearItems,
      removeItem,
      showToast,
    ]
  );

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

  const inCart = useCallback(
    (itemCode) => cart.some((c) => c.item_code === itemCode),
    [cart]
  );

  const isSubInParent = useCallback(
    (parentCode, subCode) => {
      const parent = cart.find((c) => c.item_code === parentCode);
      if (!parent?.subItems) return false;
      return parent.subItems.some((s) => s.item_code === subCode);
    },
    [cart]
  );

  if (!mounted) return null;

  const shippingLocked = form.sameAsSite;

  return (
    <>
      <AMCNavbar />
      <main className={styles.cartPage}>
        <CartHero
          styles={styles}
          cartLength={cart.length}
          totalVisits={totalVisits}
          totalUnits={totalUnits}
          onAddItems={() => setAddOpen(true)}
          onRequestQuote={openBulkQuote}
          onRefreshItems={handleRefreshItems}
          refreshing={refreshing}
        />

        {submitted && (
          <QuoteSuccess styles={styles} createdQuote={createdQuote} />
        )}

        {!submitted && cart.length === 0 && (
          <EmptyCart
            styles={styles}
            onAddItems={() => setAddOpen(true)}
            refreshing={refreshing}
          />
        )}

        {!submitted && cart.length > 0 && (
          <section className={styles.cartSection} id="checkout">
            <div className={styles.cartGrid}>
              <div className={styles.cartItems}>
                <div className={styles.cartItems__head}>
                  <div>
                    <h2>Items in cart</h2>

                    {/* ★ Swaps to spinner while refreshing */}
                    <p className={styles.cartItems__sub}>
                      {refreshing ? (
                        <span
                          className={styles.cartItems__refreshing}
                          role="status"
                          aria-live="polite"
                        >
                          <span className={styles.spinner} aria-hidden="true" />
                          Refreshing cart…
                        </span>
                      ) : (
                        <>
                          {cart.length} line item
                          {cart.length > 1 ? "s" : ""} · request a quote per
                          item or all at once
                        </>
                      )}
                    </p>
                  </div>

                  <div className={styles.cartItems__actions}>
                    <button
                      type="button"
                      className={styles.cartAddBtn}
                      onClick={() => setAddOpen(true)}
                      disabled={refreshing}
                    >
                      + Add more
                    </button>
                    <button
                      type="button"
                      className={styles.cartClearBtn}
                      onClick={handleClear}
                      disabled={refreshing}
                    >
                      Clear all
                    </button>
                  </div>
                </div>

                {/* ★ List dims + blocks input while refreshing */}
                <ul
                  className={`${styles.cartList} ${
                    refreshing ? styles["cartList--refreshing"] : ""
                  }`}
                  aria-busy={refreshing}
                >
                  {cart.map((it) => (
                    <CartItem
                      key={it.item_code}
                      styles={styles}
                      item={it}
                      onVisitsChange={setVisits}
                      onUnitsChange={setUnits}
                      onSubVisitsChange={setSubVisits}
                      onSubUnitsChange={setSubUnits}
                      onDurationChange={handleDurationChange}
                      onRemove={handleRemove}
                      onRemoveSub={handleSubRemove}
                      onQuote={openItemQuote}
                      onAddMore={(parent) => {
                        setLineAddParent(parent);
                        setLineAddOpen(true);
                      }}
                    />
                  ))}
                </ul>
              </div>

              <CartSummary
                styles={styles}
                cartLength={cart.length}
                subtotal={subtotal}
                currency={currency}
                payableCount={payableCount}
                onRequestCount={onRequestCount}
                totalVisits={totalVisits}
                totalUnits={totalUnits}
                totalDiscount={totalDiscount}
                onRequestQuote={openBulkQuote}
              />
            </div>
          </section>
        )}

        {addOpen && (
          <AddItemsModal
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
            isAdded={inCart}
            retry={() => setCatalog([])}
            cart={cart}
            onClearAll={handleClear}
            onClose={() => setAddOpen(false)}
          />
        )}

        {lineAddOpen && lineAddParent && (
          <LineAddModal
            styles={styles}
            parent={lineAddParent}
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
            isAdded={(code) => isSubInParent(lineAddParent.item_code, code)}
            retry={() => setCatalog([])}
            onClose={() => setLineAddOpen(false)}
          />
        )}

        {quoteOpen && (
          <QuoteModal
            styles={styles}
            isBulk={quoteItems === null}
            activeQuoteItems={activeQuoteItems}
            quoteSummary={quoteSummary}
            form={form}
            shippingLocked={shippingLocked}
            submitting={submitting}
            onChange={handleChange}
            onSameAsSiteToggle={handleSameAsSiteToggle}
            onSubmit={handleSubmit}
            onClose={() => !submitting && setQuoteOpen(false)}
          />
        )}

        {toast && <div className={styles.cartToast}>{toast}</div>}
      </main>
    </>
  );
}