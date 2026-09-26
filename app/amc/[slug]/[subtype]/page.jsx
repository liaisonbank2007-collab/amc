"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import AMCNavbar from "@/components/Navbar/Navbar.jsx";
import { addToCart, getCartCount } from "@/lib/cart";
import { isUserLoggedIn } from "@/lib/auth";
import "./items.scss";

const slugify = (str = "") =>
  String(str)
    .toLowerCase()
    .trim()
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// ---------- SweetAlert2 Toast helper ----------
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  width: "420px",
  padding: "1.25rem 1.5rem",
  didOpen: (el) => {
    el.addEventListener("mouseenter", Swal.stopTimer);
    el.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export default function SubServiceItemsPage() {
  const params = useParams();
  const router = useRouter();
  const amcTypeSlug = params?.slug || "";
  const subtypeSlug = params?.subtype || "";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selected, setSelected] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);

  // ---------- fetch items ----------
  useEffect(() => {
    if (!amcTypeSlug || !subtypeSlug) return;
    const controller = new AbortController();

    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/frappe/get_amc_items`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const json = await res.json();

        const raw = Array.isArray(json?.message?.items)
          ? json.message.items
          : Array.isArray(json?.items)
            ? json.items
            : Array.isArray(json?.message?.data)
              ? json.message.data
              : [];

        const filtered = raw.filter((it) => {
          const subName = it?.amc_sub_type_name || it?.amc_sub_type || "";
          return slugify(subName) === subtypeSlug;
        });

        setItems(filtered);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Failed to fetch AMC items:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
    return () => controller.abort();
  }, [amcTypeSlug, subtypeSlug]);

  // ---------- cart + login state ----------
  useEffect(() => {
    setCartCount(getCartCount());
    setLoggedIn(isUserLoggedIn());

    const cartHandler = () => setCartCount(getCartCount());
    const loginHandler = () => setLoggedIn(isUserLoggedIn());

    window.addEventListener("amc-cart-updated", cartHandler);
    window.addEventListener("amc-auth-updated", loginHandler);
    window.addEventListener("storage", loginHandler);

    return () => {
      window.removeEventListener("amc-cart-updated", cartHandler);
      window.removeEventListener("amc-auth-updated", loginHandler);
      window.removeEventListener("storage", loginHandler);
    };
  }, []);

  // ---------- selection helpers ----------
  const toggle = (code) =>
    setSelected((prev) => ({ ...prev, [code]: !prev[code] }));

  const allSelected =
    items.length > 0 && items.every((it) => selected[it.item_code]);

  const toggleAll = () => {
    if (allSelected) setSelected({});
    else {
      const next = {};
      items.forEach((it) => (next[it.item_code] = true));
      setSelected(next);
    }
  };

  const selectedItems = useMemo(
    () => items.filter((it) => selected[it.item_code]),
    [items, selected]
  );

  const buildCartPayload = (list) =>
    list.map((it) => ({
      item_code: it.item_code,
      item_name: it.item_name,
      uom: it.uom,
      rate: it.rate,
      currency: it.currency,
      amc_type: it.amc_type,
      amc_sub_type: it.amc_sub_type,
      amc_sub_type_name: it.amc_sub_type_name,
      qty: 1,
    }));

  // ---------- 🔒 login guard ----------
  const requireLogin = () => {
    if (isUserLoggedIn()) return true;

    setLoggedIn(false);

    Toast.fire({
      icon: "warning",
      title: "Please log in to add items to cart",
    });

    const returnTo = encodeURIComponent(`/amc/${amcTypeSlug}/${subtypeSlug}`);
    setTimeout(() => {
      router.push(`/login?redirect=${returnTo}`);
    }, 1200);

    return false;
  };

  // ---------- add handlers (guarded) ----------
  const handleAddSelected = () => {
    if (!selectedItems.length) return;
    if (!requireLogin()) return;

    addToCart(buildCartPayload(selectedItems));

    Toast.fire({
      icon: "success",
      title: `${selectedItems.length} item(s) added to cart`,
    });

    setSelected({});
  };

  const handleAddOne = (item) => {
    if (!requireLogin()) return;

    addToCart(buildCartPayload([item]));

    Toast.fire({
      icon: "success",
      title: `${item.item_name || item.item_code} added to cart`,
    });
  };

  const prettySubtype = subtypeSlug.replace(/-/g, " ");

  return (
    <>
      <AMCNavbar />

      <main className="itemsPage">
        {/* ============ HERO ============ */}
        <section className="ipHero">
          <div className="ipHero__grid" aria-hidden="true" />

          <div className="ipHero__inner">
            <span className="ipTag">Items</span>

            <h1 className="ipHero__title">
              {prettySubtype}
              <span>items.</span>
            </h1>

            <p className="ipHero__lead">
              Select one or more items and add them to your quotation cart. You
              currently have{" "}
              <strong className="ipHero__count">{cartCount}</strong>{" "}
              item{cartCount === 1 ? "" : "s"} in your cart.
            </p>

            <div className="ipHero__cta">
              <Link href={`/amc/${amcTypeSlug}`} className="ipBtn ipBtn--ghost">
                ← Back to Sub Services
              </Link>

              {loggedIn ? (
                <Link href="/quote-cart" className="ipBtn ipBtn--primary">
                  View Cart
                  <span aria-hidden="true">↗</span>
                </Link>
              ) : (
                <Link
                  href={`/login?redirect=${encodeURIComponent(
                    `/amc/${amcTypeSlug}/${subtypeSlug}`
                  )}`}
                  className="ipBtn ipBtn--primary"
                >
                  Log in to Add Items
                  <span aria-hidden="true">↗</span>
                </Link>
              )}
            </div>

            <div className="ipHero__stats">
              <div>
                <strong>{items.length || "—"}</strong>
                <span>Items Available</span>
              </div>
              <div>
                <strong>{selectedItems.length}</strong>
                <span>Selected</span>
              </div>
              <div>
                <strong>{cartCount}</strong>
                <span>In Cart</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============ TOOLBAR ============ */}
        {!loading && !error && items.length > 0 && (
          <div className="ipToolbar">
            <div className="ipToolbar__inner">
              <label className="ipToolbar__check">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                />
                <span>Select all ({items.length})</span>
              </label>

              <div className="ipToolbar__actions">
                <span className="ipToolbar__count">
                  {selectedItems.length} selected
                </span>
                <button
                  type="button"
                  className="ipToolbar__btn"
                  disabled={!selectedItems.length}
                  onClick={handleAddSelected}
                >
                  Add Selected to Cart
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ ITEMS ============ */}
        <section className="ipItems" id="items">
          <header className="ipItems__header">
            <div>
              <span className="ipTag">Available Items</span>
              <h2>Choose Items</h2>
            </div>
            <p>
              Add items individually, or select multiple and use the bulk action
              above.
            </p>
          </header>

          {loading && (
            <div className="ipState">
              <span className="ipState__dot" />
              Loading items…
            </div>
          )}

          {error && !loading && (
            <div className="ipState ipState--error">
              Unable to load items. Please try again later.
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="ipState">
              No items found for <strong>{prettySubtype}</strong>.
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="ipGrid">
              {items.map((it, index) => {
                const isSel = !!selected[it.item_code];
                const rateLabel =
                  it.rate === 0
                    ? "On request"
                    : `${it.currency || "INR"} ${it.rate}`;

                return (
                  <article
                    key={it.item_code}
                    className={`ipCard ${isSel ? "is-selected" : ""}`}
                    onClick={() => toggle(it.item_code)}
                    role="checkbox"
                    aria-checked={isSel}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggle(it.item_code);
                      }
                    }}
                  >
                    <div className="ipCard__top">
                      <span className="ipCard__num">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <label
                        className="ipCard__check"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSel}
                          onChange={() => toggle(it.item_code)}
                        />
                        <span className="ipCard__checkBox" aria-hidden="true">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2 6.2 4.8 9 10 3.5"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </label>
                    </div>

                    <h3 className="ipCard__title">
                      {it.item_name || it.item_code}
                    </h3>

                    <p className="ipCard__text">
                      {it.amc_sub_type_name || it.amc_sub_type || "—"}
                    </p>

                    <ul className="ipCard__list">
                      <li>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 6.2 4.8 9 10 3.5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Code: {it.item_code}
                      </li>
                      <li>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 6.2 4.8 9 10 3.5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        UOM: {it.uom || "Nos"}
                      </li>
                    </ul>

                    <div className="ipCard__price-row">
                      <span className="ipCard__price">{rateLabel}</span>
                      <span
                        className={`ipCard__state ${isSel ? "is-on" : ""}`}
                      >
                        {isSel ? "Selected" : "Tap to select"}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="ipCard__add"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddOne(it);
                      }}
                    >
                      Add to Cart
                      <span aria-hidden="true">＋</span>
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}