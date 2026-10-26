"use client";

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import "./amc.scss";
import AMCNavbar from "@/components/Navbar/Navbar.jsx";
import styles from "../app/quote-cart/cart.module.scss";
import { useRouter } from "next/navigation";
import { isUserLoggedIn } from "@/lib/auth";

import {
  getCart,
  addToCart,
  appendToCartItem,
  setSubItemQty,
  removeSubItem,
  removeFromCart,
} from "@/lib/cart";

const process = [
  { number: "01", title: "Site Assessment", text: "We inspect your existing systems and understand your maintenance requirements." },
  { number: "02", title: "AMC Planning", text: "A maintenance plan is prepared based on equipment, usage and site requirements." },
  { number: "03", title: "Scheduled Maintenance", text: "Our team performs regular inspections, testing and preventive maintenance." },
  { number: "04", title: "Reports & Support", text: "Maintenance reports are provided with recommendations and ongoing support." },
];

const benefits = [
  { number: "01", title: "Preventive Maintenance", text: "Regular inspections help identify potential issues before they become major failures." },
  { number: "02", title: "Improved Reliability", text: "Keep essential systems operational and reduce unexpected downtime." },
  { number: "03", title: "Safety Focused", text: "Maintain critical fire, electrical and safety systems with structured inspections." },
  { number: "04", title: "Long-Term Support", text: "One maintenance partner for ongoing technical support and service coordination." },
];

const slugify = (str = "") =>
  String(str).toLowerCase().trim().replace(/\u00a0/g, " ").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");

const inr = (n, currency = "INR") =>
  `${currency} ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const lineTotal = (it) => {
  if (!it) return { total: 0, hasPayable: false };
  let total = 0;
  let hasPayable = false;
  if (it.rate && it.rate > 0) { total += it.rate * (it.qty || 1); hasPayable = true; }
  (it.subItems || []).forEach((s) => {
    if (s.rate && s.rate > 0) { total += s.rate * (s.qty || 1); hasPayable = true; }
  });
  return { total, hasPayable };
};

function CatalogBody({
  styles, search, setSearch, catalogTypes, activeTypes, setActiveTypes, catalogLoading, catalogError, filteredCatalog, onAdd, onRemove, isAdded, retry, addLabel, selectedLines = [], onClearAll,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [dropdownOpen]);

  const isAll = activeTypes.length === 0;
  const toggleType = (key) => setActiveTypes((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);

  return (
    <>
      <div className={styles.catalogFilters}>
        {catalogTypes.length > 1 && (
          <div className={styles.catalogDropdown} ref={dropdownRef}>
            <button type="button" className={styles.catalogDropdown__trigger} onClick={() => setDropdownOpen((v) => !v)} aria-expanded={dropdownOpen}>
              <span>{isAll ? "All types" : activeTypes.length === 1 ? activeTypes[0] : `${activeTypes.length} types selected`}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            {dropdownOpen && (
              <div className={styles.catalogDropdown__menu}>
                <label className={styles.catalogDropdown__item}>
                  <input type="checkbox" checked={isAll} onChange={() => setActiveTypes([])} />
                  <span>All types</span><em>{catalogTypes[0]?.count ?? 0}</em>
                </label>
                {catalogTypes.slice(1).map((t) => (
                  <label key={t.key} className={styles.catalogDropdown__item}>
                    <input type="checkbox" checked={activeTypes.includes(t.key)} onChange={() => toggleType(t.key)} />
                    <span>{t.label}</span><em>{t.count}</em>
                  </label>
                ))}
                {!isAll && <button type="button" className={styles.catalogDropdown__clear} onClick={() => setActiveTypes([])}>Clear filters</button>}
              </div>
            )}
          </div>
        )}
        <input type="search" className={styles.catalogSearch} placeholder="Search items…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {activeTypes.length > 0 && (
        <div className={styles.catalogChips}>
          {activeTypes.map((key) => (
            <button key={key} type="button" className={`${styles.catalogChip} ${styles["catalogChip--active"]}`} onClick={() => toggleType(key)}>{key}<span>×</span></button>
          ))}
        </div>
      )}

      {selectedLines.length > 0 && (
        <div className={styles.catalogSelected}>
          <div className={styles.catalogSelected__head}>
            <strong>Selected ({selectedLines.length})</strong>
            <div className={styles.catalogSelected__headRight}>{onClearAll && <button type="button" onClick={onClearAll}>Clear all</button>}</div>
          </div>
          <ul className={styles.catalogSelected__list}>
            {selectedLines.map((line) => (
              <li key={line.item_code}><div className={styles.catalogSelected__info}><strong title={line.item_name || line.item_code}>{line.item_name || line.item_code}</strong></div></li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.catalogList}>
        {catalogLoading && <div className={styles.catalogState}><div className={styles.catalogSpinner} /><p>Loading items…</p></div>}
        {catalogError && !catalogLoading && <div className={styles.catalogState}><p>{catalogError}</p><button type="button" className={styles.catalogRetry} onClick={retry}>Retry</button></div>}
        {!catalogLoading && !catalogError && filteredCatalog.length === 0 && <div className={styles.catalogState}><p>No items match your search.</p></div>}

        {!catalogLoading && !catalogError && filteredCatalog.map((it) => {
            const added = isAdded(it.item_code);
            const displayName = it.item_name || it.item_code;
            return (
              <div key={it.item_code} className={`${styles.catalogItem} ${added ? styles["catalogItem--inCart"] : ""}`}>
                <div className={styles.catalogItem__thumb}>{displayName.slice(0, 2).toUpperCase()}</div>
                <div className={styles.catalogItem__info}>
                  <span className={styles.catalogItem__tag}>{it.amc_sub_type_name || it.amc_type_name || "AMC"}</span>
                  <strong title={displayName}>{displayName}</strong>
                </div>
                {added ? (
                  <button type="button" className={`${styles.catalogItem__add} ${styles["catalogItem__add--remove"]}`} onClick={() => onRemove(it)}>Remove<span>×</span></button>
                ) : (
                  <button type="button" className={styles.catalogItem__add} onClick={() => onAdd(it)}>{addLabel(added)}<span>+</span></button>
                )}
              </div>
            );
          })}
      </div>
    </>
  );
}

export default function Page() {
  const router = useRouter();
  const [amcServices, setAmcServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [lineAddOpen, setLineAddOpen] = useState(false);
  const [lineAddParent, setLineAddParent] = useState(null);
  const [search, setSearch] = useState("");
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [activeTypes, setActiveTypes] = useState([]);
  const [toast, setToast] = useState("");
  const originalOverflowRef = useRef(null);

  const handleOpenAddModal = useCallback(() => {
    if (!isUserLoggedIn()) {
      const redirectTo = encodeURIComponent(window.location.pathname + window.location.search + "#services");
      router.push(`/login?redirect=${redirectTo}`);
      return;
    }
    setAddOpen(true);
  }, [router]);

  useEffect(() => {
    originalOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = originalOverflowRef.current || ""; };
  }, []);

  useEffect(() => {
    setMounted(true);
    setCart(getCart());
    const handler = () => setCart(getCart());
    window.addEventListener("amc-cart-updated", handler);
    return () => window.removeEventListener("amc-cart-updated", handler);
  }, []);

  useEffect(() => {
    const fetchAmcTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/frappe/get_amc_types", { method: "GET", headers: { "Content-Type": "application/json" } });
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const json = await res.json();
        const raw = Array.isArray(json.data) ? json.data : Array.isArray(json.message) ? json.message : [];

        const mapped = raw.map((item) => {
            if (typeof item === "string") return { title: item, description: "", images: [] };
            return {
              title: item?.name || item?.id || item?.title || "",
              description: item?.description || item?.amc_type_description || item?.short_description || "",
              images: Array.isArray(item?.images) 
                ? item.images 
                : item?.image 
                  ? [item.image] 
                  : [],
            };
          }).filter((s) => Boolean(s.title)).map((s, index) => {
            const slug = slugify(s.title);
            return {
              id: slug, slug, href: `/amc/${slug}`,
              number: String(index + 1).padStart(2, "0"),
              title: s.title, 
              images: s.images,
              description: s.description || `Annual maintenance contract covering ${s.title.toLowerCase()} with scheduled inspections, preventive servicing and priority support.`,
              items: ["Scheduled inspections", "Preventive servicing", "Priority support"],
            };
          }).filter((s) => Boolean(s.slug));

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

  useEffect(() => {
    if (!addOpen && !lineAddOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow || "auto"; };
  }, [addOpen, lineAddOpen]);

  useEffect(() => {
    if (!addOpen && !lineAddOpen) {
      const timer = setTimeout(() => { if (document.body.style.overflow === "hidden") document.body.style.overflow = "auto"; }, 100);
      return () => clearTimeout(timer);
    }
  }, [addOpen, lineAddOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (lineAddOpen) setLineAddOpen(false);
      else if (addOpen) setAddOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addOpen, lineAddOpen]);

  const shouldFetch = (addOpen || lineAddOpen) && catalog.length === 0;
  useEffect(() => {
    if (!shouldFetch) return;
    let cancelled = false;
    setCatalogLoading(true);
    setCatalogError("");
    fetch("/api/frappe/get_amc_items").then((r) => r.json()).then((data) => {
        if (cancelled) return;
        setCatalog(data?.message?.items || []);
      }).catch((err) => {
        console.error(err);
        if (!cancelled) setCatalogError("Could not load items. Please retry.");
      }).finally(() => { if (!cancelled) setCatalogLoading(false); });
    return () => { cancelled = true; };
  }, [shouldFetch]);

  const catalogTypes = useMemo(() => {
    const map = new Map();
    catalog.forEach((it) => {
      const key = (it.amc_type_name || it.amc_type || "Other").trim();
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [{ key: "all", label: "All", count: catalog.length }, ...Array.from(map.entries()).map(([key, count]) => ({ key, label: key, count }))];
  }, [catalog]);

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalog.filter((it) => {
      const typeKey = (it.amc_type_name || it.amc_type || "Other").trim();
      if (activeTypes.length > 0 && !activeTypes.includes(typeKey)) return false;
      if (!q) return true;
      return (it.item_name || "").toLowerCase().includes(q) || (it.item_code || "").toLowerCase().includes(q) || (it.amc_sub_type_name || "").toLowerCase().includes(q);
    });
  }, [catalog, search, activeTypes]);

  const cartCount = useMemo(() => cart.reduce((sum, line) => sum + 1 + (line.subItems?.length || 0), 0), [cart]);
  const inCart = useCallback((item_code) => cart.some((c) => c.item_code === item_code), [cart]);
  
  const isSubInParent = (parentCode, subCode) => {
    const parent = cart.find((c) => c.item_code === parentCode);
    if (!parent?.subItems) return false;
    return parent.subItems.some((s) => s.item_code === subCode);
  };

  const flashToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 1800); };

  const handleAddFromCatalog = (item) => { addToCart([{ ...item, qty: 1 }]); setCart(getCart()); flashToast(`Added: ${item.item_name || item.item_code}`); };
  const handleRemoveFromCatalog = (item) => {
    if (typeof removeFromCart === "function") removeFromCart(item.item_code);
    else {
      const next = getCart().filter((c) => c.item_code !== item.item_code);
      localStorage.setItem("amc-cart", JSON.stringify(next));
      window.dispatchEvent(new Event("amc-cart-updated"));
    }
    setCart(getCart()); flashToast(`Removed: ${item.item_name || item.item_code}`);
  };

  const handleClearAllCart = () => {
    const current = getCart();
    current.forEach((line) => { if (typeof removeFromCart === "function") removeFromCart(line.item_code); });
    localStorage.setItem("amc-cart", JSON.stringify([]));
    window.dispatchEvent(new Event("amc-cart-updated"));
    setCart(getCart()); flashToast("Cart cleared");
  };

  const handleAddSubItem = (item) => {
    if (!lineAddParent) return;
    appendToCartItem(lineAddParent.item_code, { ...item, qty: 1 });
    const next = getCart(); setCart(next);
    const refreshed = next.find((c) => c.item_code === lineAddParent.item_code);
    if (refreshed) setLineAddParent(refreshed);
    flashToast(`Added to "${lineAddParent.item_name || lineAddParent.item_code}"`);
  };

  const handleRemoveSubItem = (item) => {
    if (!lineAddParent) return;
    removeSubItem(lineAddParent.item_code, item.item_code);
    const next = getCart(); setCart(next);
    const refreshed = next.find((c) => c.item_code === lineAddParent.item_code);
    if (refreshed) setLineAddParent(refreshed);
    flashToast(`Removed: ${item.item_name || item.item_code}`);
  };

  const retryCatalog = useCallback(() => { setCatalog([]); setCatalogError(""); }, []);
  const lineAddParentTotal = lineAddParent ? lineTotal(lineAddParent).total : 0;

  if (!mounted) return null;

  return (
    <>
      <AMCNavbar />
      <main className="amcPage">
        {/* ============ HERO ============ */}
        <section className="amcHero">
          <div className="amcHero__grid" aria-hidden="true" />
          <div className="amcHero__inner">
            
            {/* LEFT CONTENT */}
            <div className="amcHero__content">
              <span className="amcHero__eyebrow">
                <span className="dot">✦</span>
                Annual Maintenance Contract
              </span>

              <h1 className="amcHero__title">
                Keep your systems
                <span>running with <em>confidence.</em></span>
              </h1>

              <p className="amcHero__lead">
                Professional annual maintenance for fire safety, electrical, PNG and essential
                building systems — engineered for reliability, safety and long-term performance.
              </p>

              <div className="amcHero__cta">
                <button type="button" className="btnPrimary" onClick={handleOpenAddModal}>
                  Select Services For Quotation <span aria-hidden="true">↗</span>
                </button>
                <a href="#services" className="btnGhost">Explore Services <span aria-hidden="true">→</span></a>
              </div>

              <div className="amcHero__stats">
                <div><strong>{amcServices.length || "10"}+</strong><span>Service Types</span></div>
                <div><strong>24/7</strong><span>Support</span></div>
                <div><strong>100%</strong><span>Compliance</span></div>
              </div>
            </div>

            {/* RIGHT PREMIUM VISUAL */}
            <div className="amcHero__visual">
              <div className="amcHero__visual-glow" aria-hidden="true" />

              {/* Main tall image */}
              <div className="amcHero__visual-main">
                <div className="amcHero__visual-img" />
               
              </div>

              {/* Floating detail cards */}
              <div className="amcHero__visual-float amcHero__visual-float--1">
                <div className="amcHero__visual-img" />
              </div>

              <div className="amcHero__visual-float amcHero__visual-float--2">
                <div className="amcHero__visual-img" />
              </div>

              {/* Floating badge */}
              <div className="amcHero__visual-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
            </div>

          </div>
        </section>

        {/* ============ STICKY NAV ============ */}
        <nav className="amcNav" aria-label="AMC sections">
          <div className="amcNav__inner">
            <a href="#services" className="amcNav__link amcNav__link--static">All Services</a>
            <div className="amcNav__viewport">
              <div className="amcNav__track">
                {[...amcServices, ...amcServices].map((s, i) => (<a key={`${s.id}-${i}`} href={`#${s.id}`} className="amcNav__link" title={s.title}>{s.title}</a>))}
              </div>
            </div>
            <a href="#process" className="amcNav__link amcNav__link--end amcNav__link--static">Process</a>
          </div>
        </nav>

        {/* ============ INTRO ============ */}
        <section className="amcIntro">
          {/* <div className="amcIntro__label"><span>01</span><i /><span>Our AMC Services</span></div> */}
          <div className="amcIntro__grid">
            <h2>Maintenance that keeps<em>your operations moving.</em></h2>
            <div className="amcIntro__body">
              <p>Our Annual Maintenance Contracts are designed to reduce unexpected breakdowns, improve system performance and maintain operational safety. From routine inspections to preventive maintenance, our team provides structured support throughout the year.</p>
            </div>
          </div>
        </section>

        {/* ============ SERVICES (BENTO BOX) ============ */}
        <section className="amcServices" id="services">
          <header className="amcServices__header">
            <div>
              <span className="amcTag">What We Maintain</span>
              <h2>Annual Maintenance Contract Services</h2>
            </div>
          </header>

          {loading && <div className="amcState"><span className="amcState__dot" />Loading services…</div>}
          {error && !loading && <div className="amcState amcState--error">Unable to load AMC services. Please try again later.</div>}
          {!loading && !error && amcServices.length === 0 && <div className="amcState">No AMC services available.</div>}

          {!loading && !error && amcServices.length > 0 && (
            <div className="amcBentoGrid">
              {amcServices.map((service, index) => {
                const themeClass = index % 2 === 0 ? "amcBentoCard--white" : "amcBentoCard--white";
                const imagesToShow = service.images || [];

                return (
                  <article key={service.id} id={service.id} className={`amcBentoCard ${themeClass}`}>
                    
                    <div className={`amcBentoCard__media amcBentoCard__media--count-${Math.min(Math.max(imagesToShow.length, 1), 4)}`}>
                      {imagesToShow.length > 0 ? (
                        imagesToShow.slice(0, 4).map((imgSrc, imgIndex) => (
                          <div key={imgIndex} className="amcBentoCard__imgWrap">
                            <Image
                              src={imgSrc}
                              alt={`${service.title} - view ${imgIndex + 1}`}
                              fill
                              sizes="(max-width: 768px) 100vw, 25vw"
                              className="amcBentoCard__img"
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="amcBentoCard__imgWrap amcBentoCard__placeholder">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                          </svg>
                          <span>No Image</span>
                        </div>
                      )}
                    </div>

                    <div className="amcBentoCard__content">
                      <span className="amcBentoCard__tag">AMC</span>
                      <h3 className="amcBentoCard__title">
                        <Link href={service.href}>{service.title}</Link>
                      </h3>
                      <p className="amcBentoCard__text">{service.description}</p>
                      
                      <div className="amcBentoCard__actions">
                        <Link href={service.href} className="amcBentoCard__btn">
                          Explore
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </Link>
                      </div>
                    </div>

                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ============ BENEFITS ============ */}
        <section className="amcBenefits">
          <div className="amcBenefits__inner">
            <div className="amcBenefits__left">
              <span className="amcTag">Why Annual Maintenance Contracts</span>
              <h2>Prevent problems<br />before they become<em> expensive.</em></h2>
            </div>
            <div className="amcBenefits__right">
              {benefits.map((b) => (
                <div key={b.number} className="amcBenefit">
                  <span className="amcBenefit__num">{b.number}</span>
                  <div><h3>{b.title}</h3><p>{b.text}</p></div>
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
              <p>A structured four-step process that keeps your systems reliable, compliant and running at peak performance.</p>
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
              <span className="amcTag amcTag--light">Ready to protect your systems?</span>
              <h2>Let&apos;s build a maintenance<em>plan for your facility.</em></h2>
              <p>Speak with our team about your AMC requirements and get a maintenance solution tailored to your facility.</p>
              <div className="amcCta__actions">
                <a href="https://www.liaisonbank.com/contact-us-liaison-bank" className="btnPrimary btnPrimary--dark" target="_blank" rel="noopener noreferrer">Talk To Our Team<span aria-hidden="true">↗</span></a>
                <a href="tel:+919769458515" className="btnGhost btnGhost--dark">Call Us<span aria-hidden="true">→</span></a>
              </div>
            </div>
            <div className="amcCta__mark" aria-hidden="true">AMC</div>
          </div>
        </section>

        {/* ============ MODALS ============ */}
        {addOpen && (
          <div className={styles.cartModal} role="dialog" aria-modal="true" onClick={() => setAddOpen(false)}>
            <div className={`${styles.cartModal__panel} ${styles["cartModal__panel--wide"]}`} onClick={(e) => e.stopPropagation()}>
              <button type="button" className={styles.cartModal__close} aria-label="Close" onClick={() => setAddOpen(false)}>×</button>
              <div className={styles.cartModal__head}><span className={styles.cartModal__eyebrow}>ADD AMC SERVICES</span></div>
              <CatalogBody styles={styles} search={search} setSearch={setSearch} catalogTypes={catalogTypes} activeTypes={activeTypes} setActiveTypes={setActiveTypes} catalogLoading={catalogLoading} catalogError={catalogError} filteredCatalog={filteredCatalog} onAdd={handleAddFromCatalog} onRemove={handleRemoveFromCatalog} isAdded={inCart} retry={retryCatalog} addLabel={(added) => (added ? "Add again" : "Add To Cart")} selectedLines={cart} onClearAll={handleClearAllCart} />
              <div className={styles.cartModal__actions}>
                <button type="button" className={`${styles.btn} ${styles["btn--ghost"]}`} onClick={() => setAddOpen(false)}>Done</button>
              </div>
            </div>
          </div>
        )}

        {lineAddOpen && lineAddParent && (
          <div className={styles.cartModal} role="dialog" aria-modal="true" onClick={() => setLineAddOpen(false)}>
            <div className={`${styles.cartModal__panel} ${styles["cartModal__panel--wide"]}`} onClick={(e) => e.stopPropagation()}>
              <button type="button" className={styles.cartModal__close} aria-label="Close" onClick={() => setLineAddOpen(false)}>×</button>
              <div className={styles.cartModal__head}>
                <span className={styles.cartModal__eyebrow}>ADD TO THIS CART LINE</span>
                <h2>Adding to <span>{lineAddParent.item_name || lineAddParent.item_code}</span></h2>
                <p>Selected items will appear as sub-items under this line. They share the same quote request.</p>
              </div>
              <div className={styles.lineAddParent}>
                <div className={styles.lineAddParent__thumb}>{(lineAddParent.item_name || lineAddParent.item_code).slice(0, 2).toUpperCase()}</div>
                <div className={styles.lineAddParent__info}>
                  <strong>{lineAddParent.item_name || lineAddParent.item_code}</strong>
                  <span>Qty {lineAddParent.qty || 1} · {lineAddParent.uom || "Nos"}{(lineAddParent.subItems || []).length > 0 && ` · ${lineAddParent.subItems.length} add-on${lineAddParent.subItems.length > 1 ? "s" : ""}`}</span>
                </div>
                <div className={styles.lineAddParent__priceWrap}>
                  <span>Running total</span>
                  <strong>{lineTotal(lineAddParent).hasPayable ? inr(lineAddParentTotal, lineAddParent.currency) : "On request"}</strong>
                </div>
              </div>
              <CatalogBody styles={styles} search={search} setSearch={setSearch} catalogTypes={catalogTypes} activeTypes={activeTypes} setActiveTypes={setActiveTypes} catalogLoading={catalogLoading} catalogError={catalogError} filteredCatalog={filteredCatalog} onAdd={handleAddSubItem} onRemove={handleRemoveSubItem} isAdded={(code) => isSubInParent(lineAddParent.item_code, code)} retry={retryCatalog} addLabel={(added) => (added ? "Add again" : "Add")} selectedLines={lineAddParent.subItems || []} />
              <div className={styles.cartModal__actions}>
                <button type="button" className={`${styles.btn} ${styles["btn--primary"]}`} onClick={() => setLineAddOpen(false)}>Done</button>
              </div>
            </div>
          </div>
        )}

       {cartCount > 0 && (
  <Link href="/quote-cart" className="floating-amc-pill" aria-label={`View AMC Service Hub - ${cartCount} services selected`}>
    <span className="floating-amc-pill__badge">{cartCount}</span>
    <span className="floating-amc-pill__text">AMC Services Added</span>
    <div className="floating-amc-pill__icon">
      <svg width="226" height="226" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Bucket Body */}
        <path d="M8 12L9.5 26C9.7 27.1 10.6 28 11.7 28H20.3C21.4 28 22.3 27.1 22.5 26L24 12H8Z" fill="#EA580C" />
        {/* Bucket Rim */}
        <rect x="6" y="10" width="20" height="4" rx="2" fill="#9A3412" />
        {/* Bucket Handles/Lines */}
        <path d="M10 17H22" stroke="#FDBA74" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M11 22H21" stroke="#FDBA74" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 12V28" stroke="#FDBA74" strokeWidth="1.5" strokeLinecap="round" />

        {/* Floating Icons Above Bucket */}
        {/* Gear */}
        <g transform="translate(4, 3)">
          <circle cx="5" cy="5" r="2.5" stroke="#EA580C" strokeWidth="1.5" />
          <path d="M5 0V1.5M5 8.5V10M0 5H1.5M8.5 5H10M1.5 1.5L2.5 2.5M7.5 7.5L8.5 8.5M1.5 8.5L2.5 7.5M7.5 2.5L8.5 1.5" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Shield + Checkmark */}
        <g transform="translate(12, 0)">
          <path d="M5 0L9 2V5.5C9 8.5 5 10.5 5 10.5C5 10.5 1 8.5 1 5.5V2L5 0Z" fill="#EA580C" stroke="#EA580C" strokeWidth="1" />
          <path d="M3 5L4.5 6.5L7 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Wrench */}
        <g transform="translate(21, 4) rotate(45)">
          <path d="M3 0C2.44772 0 2 0.447715 2 1V3L0 5C-0.5 5.5 -0.5 6.5 0 7L1 8C1.5 8.5 2.5 8.5 3 8L5 6H7C7.55228 6 8 5.55228 8 5V1C8 0.447715 7.55228 0 7 0H3Z" fill="#EA580C" />
        </g>
      </svg>
    </div>
  </Link>
)}
        {toast && <div className={styles.cartToast}>{toast}</div>}
      </main>
    </>
  );
}