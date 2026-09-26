"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import "./amc.scss";
import AMCNavbar from "@/components/Navbar/Navbar.jsx";
import styles from "../app/quote-cart/cart.module.scss";
import {
  getCart,
  addToCart,
  appendToCartItem,
  setSubItemQty,
  removeSubItem,
} from "@/lib/cart";

const process = [
  {
    number: "01",
    title: "Site Assessment",
    text: "We inspect your existing systems and understand your maintenance requirements.",
  },
  {
    number: "02",
    title: "AMC Planning",
    text: "A maintenance plan is prepared based on equipment, usage and site requirements.",
  },
  {
    number: "03",
    title: "Scheduled Maintenance",
    text: "Our team performs regular inspections, testing and preventive maintenance.",
  },
  {
    number: "04",
    title: "Reports & Support",
    text: "Maintenance reports are provided with recommendations and ongoing support.",
  },
];

const benefits = [
  {
    number: "01",
    title: "Preventive Maintenance",
    text: "Regular inspections help identify potential issues before they become major failures.",
  },
  {
    number: "02",
    title: "Improved Reliability",
    text: "Keep essential systems operational and reduce unexpected downtime.",
  },
  {
    number: "03",
    title: "Safety Focused",
    text: "Maintain critical fire, electrical and safety systems with structured inspections.",
  },
  {
    number: "04",
    title: "Long-Term Support",
    text: "One maintenance partner for ongoing technical support and service coordination.",
  },
];

const slugify = (str = "") =>
  String(str)
    .toLowerCase()
    .trim()
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const inr = (n, currency = "INR") =>
  `${currency} ${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// compute a cart line's subtotal = parent + all sub-items
const lineTotal = (it) => {
  if (!it) return { total: 0, hasPayable: false };
  let total = 0;
  let hasPayable = false;
  if (it.rate && it.rate > 0) {
    total += it.rate * (it.qty || 1);
    hasPayable = true;
  }
  (it.subItems || []).forEach((s) => {
    if (s.rate && s.rate > 0) {
      total += s.rate * (s.qty || 1);
      hasPayable = true;
    }
  });
  return { total, hasPayable };
};

/* ------------------------------------------------------------------ */
/* Shared CatalogBody                                                  */
/* ------------------------------------------------------------------ */
function CatalogBody({
  styles,
  search,
  setSearch,
  catalogTypes,
  activeType,
  setActiveType,
  catalogLoading,
  catalogError,
  filteredCatalog,
  onAdd,
  isAdded,
  retry,
  addLabel,
}) {
  return (
    <>
    

      {catalogTypes.length > 1 && (
        <div className={styles.catalogChips}>
          {catalogTypes.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`${styles.catalogChip} ${
                activeType === t.key ? styles["catalogChip--active"] : ""
              }`}
              onClick={() => setActiveType(t.key)}
            >
              {t.label}
              <span>{t.count}</span>
            </button>
          ))}
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

        {!catalogLoading && !catalogError && filteredCatalog.length === 0 && (
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
                  <strong title={displayName}>{displayName}</strong>
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
              </div>
            );
          })}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function Page() {
  const [amcServices, setAmcServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // cart (persisted)
  const [cart, setCart] = useState([]);
  const [mounted, setMounted] = useState(false);

  // global "Add Items" modal
  const [addOpen, setAddOpen] = useState(false);

  // line-add modal
  const [lineAddOpen, setLineAddOpen] = useState(false);
  const [lineAddParent, setLineAddParent] = useState(null);

  // catalog state
  const [search, setSearch] = useState("");
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [activeType, setActiveType] = useState("all");

  const [toast, setToast] = useState("");

  /* -------- hydrate cart -------- */
  useEffect(() => {
    setMounted(true);
    setCart(getCart());
    const handler = () => setCart(getCart());
    window.addEventListener("amc-cart-updated", handler);
    return () => window.removeEventListener("amc-cart-updated", handler);
  }, []);

  /* -------- fetch AMC types for the services section -------- */
  useEffect(() => {
    const fetchAmcTypes = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/frappe/get_amc_types", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const json = await res.json();

        const raw = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.message)
            ? json.message
            : [];

const mapped = raw
  .map((item) => {
    // Normalize: keep the whole object when possible
    if (typeof item === "string") {
      return { title: item, description: "" };
    }
    return {
      title: item?.name || item?.id || item?.title || "",
      description:
        item?.description ||
        item?.amc_type_description ||
        item?.short_description ||
        "",
    };
  })
  .filter((s) => Boolean(s.title))
  .map((s, index) => {
    const slug = slugify(s.title);

    return {
      id: slug,
      slug,
      href: `/amc/${slug}`,
      number: String(index + 1).padStart(2, "0"),
      title: s.title,
      // 👇 use API description (fallback to short if empty)
      description:
        s.description ||
        `Annual maintenance contract covering ${s.title.toLowerCase()} with scheduled inspections, preventive servicing and priority support.`,
      items: [
        "Scheduled inspections",
        "Preventive servicing",
        "Priority support",
      ],
    };
  })
  .filter((s) => Boolean(s.slug));
        setAmcServices(mapped);
      } catch (err) {
        console.error("Failed to fetch AMC types:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAmcTypes();
  }, []);

  /* -------- lock body scroll while a modal is open -------- */
  useEffect(() => {
    if (!addOpen && !lineAddOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [addOpen, lineAddOpen]);

  /* -------- esc closes modal -------- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (lineAddOpen) setLineAddOpen(false);
      else if (addOpen) setAddOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addOpen, lineAddOpen]);

  /* -------- fetch catalog when any modal opens -------- */
  const shouldFetch = (addOpen || lineAddOpen) && catalog.length === 0;

  useEffect(() => {
    if (!shouldFetch) return;
    let cancelled = false;
    setCatalogLoading(true);
    setCatalogError("");

    fetch("/api/frappe/get_amc_items")
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

  /* -------- derived catalog -------- */
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
      if (activeType !== "all" && typeKey !== activeType) return false;
      if (!q) return true;
      return (
        (it.item_name || "").toLowerCase().includes(q) ||
        (it.item_code || "").toLowerCase().includes(q) ||
        (it.amc_sub_type_name || "").toLowerCase().includes(q)
      );
    });
  }, [catalog, search, activeType]);

  /* -------- helpers -------- */
  const inCart = useCallback(
    (item_code) => cart.some((c) => c.item_code === item_code),
    [cart]
  );

  const isSubInParent = (parentCode, subCode) => {
    const parent = cart.find((c) => c.item_code === parentCode);
    if (!parent?.subItems) return false;
    return parent.subItems.some((s) => s.item_code === subCode);
  };

  const flashToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  };

  const handleAddFromCatalog = (item) => {
    addToCart([{ ...item, qty: 1 }]);
    setCart(getCart());
    flashToast(`Added: ${item.item_name || item.item_code}`);
  };

  const handleAddSubItem = (item) => {
    if (!lineAddParent) return;
    appendToCartItem(lineAddParent.item_code, { ...item, qty: 1 });
    const next = getCart();
    setCart(next);
    // keep parent reference fresh so running total updates
    const refreshed = next.find((c) => c.item_code === lineAddParent.item_code);
    if (refreshed) setLineAddParent(refreshed);
    flashToast(
      `Added to "${lineAddParent.item_name || lineAddParent.item_code}"`
    );
  };

  const retryCatalog = useCallback(() => {
    setCatalog([]);
    setCatalogError("");
  }, []);

  /* -------- parent subtotal for the line-add modal -------- */
  const lineAddParentTotal = lineAddParent
    ? lineTotal(lineAddParent).total
    : 0;

  if (!mounted) return null;

  return (
    <>
      <AMCNavbar />

      <main className="amcPage">
        {/* ============ HERO ============ */}
        <section className="amcHero">
          <div className="amcHero__grid" aria-hidden="true" />

          <div className="amcHero__inner">
            <span className="amcTag">Annual Maintenance Contract</span>

            <h1 className="amcHero__title">
              Keep your systems
              <span>running with confidence.</span>
            </h1>

            <p className="amcHero__lead">
              Professional annual maintenance for fire safety, electrical, PNG
              and essential building systems — engineered for reliability,
              safety and long-term performance.
            </p>

            <div className="amcHero__cta">
              <button
                type="button"
                className="btnPrimary"
                onClick={() => setAddOpen(true)}
              >
                Select Services For Quotation
                <span aria-hidden="true">↗</span>
              </button>
              <a href="#services" className="btnPrimary">
                Explore Services
                <span aria-hidden="true">↗</span>
              </a>
              <a href="#process" className="btnGhost">
                How We Work
                <span aria-hidden="true">→</span>
              </a>
            </div>

            <div className="amcHero__stats">
              <div>
                <strong>{amcServices.length || "10"}+</strong>
                <span>Service Types</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>Support</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>Compliance</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============ STICKY NAV ============ */}
        <nav className="amcNav" aria-label="AMC sections">
          <div className="amcNav__inner">
            <a href="#services" className="amcNav__link amcNav__link--static">
              All Services
            </a>

            <div className="amcNav__viewport">
              <div className="amcNav__track">
                {[...amcServices, ...amcServices].map((s, i) => (
                  <a
                    key={`${s.id}-${i}`}
                    href={`#${s.id}`}
                    className="amcNav__link"
                    title={s.title}
                  >
                    {s.title}
                  </a>
                ))}
              </div>
            </div>

            <a
              href="#process"
              className="amcNav__link amcNav__link--end amcNav__link--static"
            >
              Process
            </a>
          </div>
        </nav>

        {/* ============ INTRO ============ */}
        <section className="amcIntro">
          <div className="amcIntro__label">
            <span>01</span>
            <i />
            <span>Our AMC Services</span>
          </div>

          <div className="amcIntro__grid">
            <h2>
              Maintenance that keeps
              <em>your operations moving.</em>
            </h2>

            <div className="amcIntro__body">
              <p>
                Our Annual Maintenance Contracts are designed to reduce
                unexpected breakdowns, improve system performance and maintain
                operational safety. From routine inspections to preventive
                maintenance, our team provides structured support throughout
                the year.
              </p>
            </div>
          </div>
        </section>

        {/* ============ SERVICES ============ */}
        <section className="amcServices" id="services">
          <header className="amcServices__header">
            <div>
              <span className="amcTag">What We Maintain</span>
              <h2>AMC Services</h2>
            </div>
            <p>
              Comprehensive maintenance solutions tailored to your facility,
              equipment and operational requirements.
            </p>
          </header>

          {loading && (
            <div className="amcState">
              <span className="amcState__dot" />
              Loading services…
            </div>
          )}

          {error && !loading && (
            <div className="amcState amcState--error">
              Unable to load AMC services. Please try again later.
            </div>
          )}

          {!loading && !error && amcServices.length === 0 && (
            <div className="amcState">No AMC services available.</div>
          )}

          {!loading && !error && amcServices.length > 0 && (
            <div className="amcGrid">
              {amcServices.map((service) => (
                
                <article key={service.id} id={service.id} className="amcCard">
                  <div className="amcCard__top">
                    <span className="amcCard__num">{service.number}</span>
                    <span className="amcCard__badge">AMC</span>
                  </div>

                  <h3 className="amcCard__title">
                    <Link href={service.href} className="amcCard__titleLink">
                      {service.title}
                    </Link>
                  </h3>

                  <p className="amcCard__text">{service.description}</p>

                  <ul className="amcCard__list">
                    {service.items.map((item) => (
                      <li key={item}>
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
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="amcCard__actions">
                    <Link
                      href={service.href}
                      className="amcCard__link"
                      aria-label={`View ${service.title} details`}
                    >
                      View Service
                      <span aria-hidden="true">→</span>
                    </Link>

                 
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ============ BENEFITS ============ */}
        <section className="amcBenefits">
          <div className="amcBenefits__inner">
            <div className="amcBenefits__left">
              <span className="amcTag">Why AMC</span>
              <h2>
                Prevent problems
                <br />
                before they become
                <em> expensive.</em>
              </h2>
            </div>

            <div className="amcBenefits__right">
              {benefits.map((b) => (
                <div key={b.number} className="amcBenefit">
                  <span className="amcBenefit__num">{b.number}</span>
                  <div>
                    <h3>{b.title}</h3>
                    <p>{b.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ PROCESS ============ */}
        <section className="amcProcess" id="process">
          <div className="amcProcess__inner">
            <header className="amcProcess__header">
              <span className="amcTag amcTag--light">Our Approach</span>
              <h2>How We Work</h2>
              <p>
                A structured four-step process that keeps your systems
                reliable, compliant and running at peak performance.
              </p>
            </header>

            <ol className="amcProcess__grid">
              {process.map((p) => (
                <li key={p.number} className="amcStep">
                  <span className="amcStep__num">{p.number}</span>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section className="amcCta" id="contact">
          <div className="amcCta__card">
            <div className="amcCta__glow" aria-hidden="true" />

            <div className="amcCta__content">
              <span className="amcTag amcTag--light">
                Ready to protect your systems?
              </span>

              <h2>
                Let&apos;s build a maintenance
                <em>plan for your facility.</em>
              </h2>

              <p>
                Speak with our team about your AMC requirements and get a
                maintenance solution tailored to your facility.
              </p>

              <div className="amcCta__actions">
                <a
                  href="https://www.liaisonbank.com/contact-us-liaison-bank"
                  className="btnPrimary btnPrimary--dark"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Talk To Our Team
                  <span aria-hidden="true">↗</span>
                </a>
                <a href="tel:+919769458515" className="btnGhost btnGhost--dark">
                  Call Us
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>

            <div className="amcCta__mark" aria-hidden="true">
              AMC
            </div>
          </div>
        </section>

        {/* ── GLOBAL ADD ITEMS MODAL ── */}
        {addOpen && (
          <div
            className={styles.cartModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-items-title"
            onClick={() => setAddOpen(false)}
          >
            <div
              className={`${styles.cartModal__panel} ${
                styles["cartModal__panel--wide"]
              }`}
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
               
              
              </div>

              <CatalogBody
                styles={styles}
                search={search}
                setSearch={setSearch}
                catalogTypes={catalogTypes}
                activeType={activeType}
                setActiveType={setActiveType}
                catalogLoading={catalogLoading}
                catalogError={catalogError}
                filteredCatalog={filteredCatalog}
                onAdd={handleAddFromCatalog}
                isAdded={(code) => inCart(code)}
                retry={retryCatalog}
                addLabel={(added) => (added ? "Add again" : "Add")}
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

        {/* ── LINE-ADD MODAL (the one from quote-cart) ── */}
        {lineAddOpen && lineAddParent && (
          <div
            className={styles.cartModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="line-add-title"
            onClick={() => setLineAddOpen(false)}
          >
            <div
              className={`${styles.cartModal__panel} ${
                styles["cartModal__panel--wide"]
              }`}
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
                    {lineAddParent.item_name || lineAddParent.item_code}
                  </span>
                </h2>
                <p>
                  Selected items will appear as sub-items under this line.
                  They share the same quote request.
                </p>
              </div>

              {/* parent summary with running subtotal */}
              <div className={styles.lineAddParent}>
                <div className={styles.lineAddParent__thumb}>
                  {(lineAddParent.item_name || lineAddParent.item_code)
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className={styles.lineAddParent__info}>
                  <strong>
                    {lineAddParent.item_name || lineAddParent.item_code}
                  </strong>
                  <span>
                    Qty {lineAddParent.qty || 1} ·{" "}
                    {lineAddParent.uom || "Nos"}
                    {(lineAddParent.subItems || []).length > 0 &&
                      ` · ${lineAddParent.subItems.length} add-on${
                        lineAddParent.subItems.length > 1 ? "s" : ""
                      }`}
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
                activeType={activeType}
                setActiveType={setActiveType}
                catalogLoading={catalogLoading}
                catalogError={catalogError}
                filteredCatalog={filteredCatalog}
                onAdd={handleAddSubItem}
                isAdded={(code) =>
                  isSubInParent(lineAddParent.item_code, code)
                }
                retry={retryCatalog}
                addLabel={(added) => (added ? "Add again" : "Add")}
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

        {toast && <div className={styles.cartToast}>{toast}</div>}
      </main>
    </>
  );
}