"use client";

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
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

const iconByTitle = (keyword) =>
  coreDivisions.find((d) => new RegExp(keyword, "i").test(d.title))?.icon;

const getServiceIcon = (title = "") => {
  const t = title.toLowerCase();
  if (/licen[cs]e|renew|permit/.test(t)) return iconByTitle("license");
  if (/png|gas|pipeline|leak/.test(t))   return iconByTitle("png");
  if (/fire|safety/.test(t))             return iconByTitle("fire");
  if (/electr|audit/.test(t))            return iconByTitle("electrical");
  if (/pest/.test(t))                    return iconByTitle("pest");
  if (/water|tank/.test(t))              return iconByTitle("water");
  return genericServiceIcon;
};

const benefits = [
  {
    number: "1",
    title: "Preventive Maintenance",
    text: "Minimize unexpected downtime & ensure smooth operation with regular inspections.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    number: "2",
    title: "Improved Reliability",
    text: "Protect against major failures & keep essential systems fully operational.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h4l3-8 4 16 3-8h4" />
      </svg>
    ),
  },
  {
    number: "3",
    title: "Safety Focused",
    text: "Maintain critical fire, electrical and safety systems with structured inspections.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    number: "4",
    title: "Long-Term Support",
    text: "Tailored services for businesses of all sizes with a single dedicated partner.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
      </svg>
    ),
  },
  {
    number: "5",
    title: "Dedicated Support Team",
    text: "Quick response time for troubleshooting, updates, and emergency coordination.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    ),
  },
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

/* =========================================================
   SIX CORE DIVISIONS DATA
   ========================================================= */
const coreDivisions = [
  {
    id: 1,
    title: "01 License Renewal",
    desc: "Tracking municipal validity, health permits.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "02 PNG Infra",
    desc: "Gas pipeline checks, leak detection.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: 3,
    title: "03 Fire & Safety",
    desc: "Firefighting checks, Form A & B.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
  },
  {
    id: 4,
    title: "04 Electrical Audit",
    desc: "Thermal imaging, short-circuit checks.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    id: 5,
    title: "05 Pest Control",
    desc: "Gel baiting, structural proofing.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    id: 6,
    title: "06 Water Tank",
    desc: "6-stage cleaning, lab sampling.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
  },
];

/* Desktop positions relative to center (in px) */
const desktopPositions = [
  { x: -170, y: -170 }, // 1: Top Left
  { x: 170, y: -170 },  // 2: Top Right
  { x: 280, y: 0 },     // 3: Right
  { x: 170, y: 170 },   // 4: Bottom Right
  { x: -170, y: 170 },  // 5: Bottom Left
  { x: -280, y: 0 },    // 6: Left
];

/* Mobile positions relative to center (in px) — scaled to fit small screens */
const mobilePositions = [
  { x: -95, y: -95 },   // 1: Top Left
  { x: 95, y: -95 },    // 2: Top Right
  { x: 155, y: 0 },     // 3: Right
  { x: 95, y: 95 },     // 4: Bottom Right
  { x: -95, y: 95 },    // 5: Bottom Left
  { x: -155, y: 0 },    // 6: Left
];

/* Small mobile positions for <= 640px */
const smallPositions = [
  { x: -82, y: -82 },
  { x: 82, y: -82 },
  { x: 132, y: 0 },
  { x: 82, y: 82 },
  { x: -82, y: 82 },
  { x: -132, y: 0 },
];

/* =========================================================
   ANIMATED CORE DIVISIONS COMPONENT
   ========================================================= */
function AnimatedCoreDivisions() {
  const prefersReduced = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(null);

  // Track viewport width for position scaling
  const [viewport, setViewport] = useState("desktop"); // "desktop" | "mobile" | "small"

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w <= 640) setViewport("small");
      else if (w <= 900) setViewport("mobile");
      else setViewport("desktop");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const positions =
    viewport === "small"
      ? smallPositions
      : viewport === "mobile"
      ? mobilePositions
      : desktopPositions;

  return (
    <motion.div
      className="amcCoreDivisions"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {/* ---- 1. SVG ARMS (rendered on ALL viewports for consistent look) ---- */}
      <svg
        className="amcCoreDivisions__svg-layer"
        viewBox="0 0 600 600"
        aria-hidden="true"
      >
        {positions.map((pos, i) => {
          // Convert px offset to SVG coords (viewBox is 600x600 centered at 300,300)
          // Desktop max offset is 280 → 300 + 280 = 580 (within 600)
          // Mobile offsets are proportionally smaller
          const endX = 300 + pos.x;
          const endY = 300 + pos.y;
          return (
            <motion.path
              key={i}
              className={`arm-line line-${i + 1}`}
              d={`M 300 300 L ${endX} ${endY}`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: activeIndex === i ? 0.9 : 0.3 }}
              transition={{
                pathLength: { duration: 1.2, delay: 0.3 + i * 0.1, ease: "easeOut" },
                opacity: { duration: 0.3 },
              }}
              style={{
                stroke: "var(--accent)",
                strokeWidth: activeIndex === i ? 4 : 3,
              }}
            />
          );
        })}
      </svg>

      {/* ---- 2. CENTER HUB ---- */}
      <motion.div
        className="amcCoreDivisions__center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        whileHover={prefersReduced ? undefined : { scale: 1.05 }}
      >
        {!prefersReduced && (
          <motion.span
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              border: "2px solid rgba(232,145,58,0.4)",
              pointerEvents: "none",
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <div className="amcCoreDivisions__centerInner">
          <strong>
            Our Core <br /> Divisions
          </strong>
        </div>
      </motion.div>

      {/* ---- 3. SIX ANIMATED SERVICE NODES ---- */}
      {coreDivisions.map((item, i) => {
        const pos = positions[i];
        const isActive = activeIndex === i;
        const dimmed = activeIndex !== null && !isActive;

        return (
          <motion.div
            key={item.id}
            className={`amcCoreDivisions__item amcCoreDivisions__item--${item.id}`}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              x: pos.x,
              y: pos.y,
              translateX: "-50%",
              translateY: "-50%",
            }}
            // Entrance animation
            initial={{ opacity: 0, scale: 0.3 }}
            // Continuous floating or static
            animate={
              prefersReduced
                ? { opacity: 1, scale: 1 }
                : {
                    opacity: 1,
                    scale: isActive ? 1.15 : 1,
                    y: [pos.y - 6, pos.y + 6, pos.y - 6],
                  }
            }
            transition={{
              y: { duration: 4 + i * 0.4, repeat: Infinity, ease: "easeInOut" },
              scale: { type: "spring", stiffness: 300, damping: 20 },
              opacity: { duration: 0.2 },
              delay: 0.4 + i * 0.1,
            }}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
            whileHover={prefersReduced ? undefined : { zIndex: 20 }}
          >
            <motion.div
              className="amcCoreDivisions__icon"
              animate={
                isActive && !prefersReduced
                  ? { scale: 1.1, rotate: 10 }
                  : { scale: 1, rotate: 0 }
              }
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              style={{
                background: isActive ? "var(--accent)" : "var(--white)",
                color: isActive ? "var(--white)" : "var(--accent-3)",
              }}
            >
              {item.icon}
            </motion.div>

            <motion.div
              className="amcCoreDivisions__text"
              animate={{
                opacity: dimmed ? 0.4 : 1,
                scale: isActive ? 1.05 : 1,
              }}
              transition={{ duration: 0.3 }}
              style={{
                borderColor: isActive ? "var(--accent)" : "rgba(232, 145, 58, 0.15)",
                boxShadow: isActive
                  ? "0 12px 30px -8px rgba(232,145,58,0.4)"
                  : "var(--shadow-sm)",
              }}
            >
              <strong>{item.title}</strong>
              <p>{item.desc}</p>
            </motion.div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}





/* =========================================================
   CATALOG BODY
   ========================================================= */
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

/* =========================================================
   PAGE
   ========================================================= */
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


  const [flippedCards, setFlippedCards] = useState(() => new Set());

const toggleFlip = useCallback((id) => {
  setFlippedCards((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
}, []);

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
                WHEN THINGS GET TANGLED,

                <span>WE UNTANGLED. </span>
              </h1>

              <p className="amcHero__lead">
                Professional annual maintenance for license renewal, fire safety, electrical, PNG, water tank cleaning, pest control and essential
                building systems — engineered for reliability, safety and long-term performance.
              </p>

              <div className="amcHero__cta">
                <button type="button" className="btnPrimary" onClick={handleOpenAddModal}>
                  Select Services For Quotation <span aria-hidden="true">↗</span>
                </button>
                <a href="#services" className="btnGhost">Explore Services <span aria-hidden="true">→</span></a>
              </div>
            </div>

            {/* RIGHT PREMIUM VISUAL: Six Core Service Divisions */}
            <div className="amcHero__visual">
              <div className="amcHero__visual-glow" aria-hidden="true" />
              <AnimatedCoreDivisions />
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
          <div className="amcIntro__grid">
            <h2>Maintenance that keeps<em>your operations moving.</em></h2>
            <div className="amcIntro__body">
              <p>Our Annual Maintenance Contract (AMC) services are designed to keep your business facilities operating smoothly, safely and efficiently throughout the year. From preventive maintenance and routine inspections to equipment servicing, license renewals and essential certifications, we provide dependable, end-to-end support that minimises disruptions, extends equipment life and helps businesses focus on their core operations..</p>
            </div>
          </div>
        </section>

        {/* ============ WHY CHOOSE US ============ */}
        <section className="amcWhyChoose">
          <div className="amcWhyChoose__container">
            <div className="amcWhyChoose__header">
              {/* <span className="amcTag">Our Advantage</span> */}
              <h2>WHY WE'RE <em>THE RIGHT CHOICE?</em></h2>
            </div>

            <div className="amcWhyChoose__grid">

              {/* Point 1 */}
              <div className="amcWhyCard">
                <div className="amcWhyCard__iconWrap">
                  <img
                    src="/images/GovernmentCertifiedAuthorityicon.png"
                    width={48}
                    height={48}
                    alt="Government Certified Authority"
                  />
                </div>
                <div className="amcWhyCard__content">
                  <h3>GOVERNMENT CERTIFIED AUTHORITY</h3>
                  <p>We handle all approvals, permits and registrations with government and municipal authorities on your behalf.</p>
                </div>
              </div>

              {/* Point 2 */}
              <div className="amcWhyCard">
                <div className="amcWhyCard__iconWrap">
                  <img
                    src="/images/ProactiveRenewalTrackingicon.png"
                    width={48}
                    height={48}
                    alt="Proactive Renewal Tracking"
                  />
                </div>
                <div className="amcWhyCard__content">
                  <h3>PROACTIVE RENEWAL TRACKING</h3>
                  <p>Certificates, licences and contracts are tracked in advance so renewals are never missed or delayed.</p>
                </div>
              </div>

              {/* Point 3 */}
              <div className="amcWhyCard">
                <div className="amcWhyCard__iconWrap">
                  <img src="/images/OneStopSolutionicon.png" width="48" height="48" alt="" />
                </div>
                <div className="amcWhyCard__content">
                  <h3>ONE-STOP SOLUTION</h3>
                  <p>A single point of contact for planning, scheduling and delivery of every annual maintenance activity.</p>
                </div>
              </div>

              {/* Point 4 */}
              <div className="amcWhyCard">
                <div className="amcWhyCard__iconWrap">
                  <img src="/images/ServiceRecordsReportsicon.png" width="48" height="48" alt="Service Records & Reports" />
                </div>
                <div className="amcWhyCard__content">
                  <h3>SERVICE RECORDS & REPORTS</h3>
                  <p>Our services cover multiple needs with proper documents, and we handle the entire process from our side to keep things smooth.</p>
                </div>
              </div>

            </div>
          </div>
        </section>

{/* ============ SERVICES (BENTO BOX) ============ */}
<section className="amcServices" id="services">
  <header className="amcServices__header">
    <div>
      <span className="amcTag">What We Maintain</span>
      <h2>Annual Maintenance <em>Contracts</em></h2>
    </div>
  </header>

  {loading && <div className="amcState"><span className="amcState__dot" />Loading services…</div>}
  {error && !loading && <div className="amcState amcState--error">Unable to load AMC services. Please try again later.</div>}
  {!loading && !error && amcServices.length === 0 && <div className="amcState">No AMC services available.</div>}

 {!loading && !error && amcServices.length > 0 && (
  <div className="amcBentoGrid">
    {amcServices.map((service, index) => {
      const themeClass = "amcBentoCard--white";
      const icon = getServiceIcon(service.title);
      const firstImage = service.images?.[0];
      const isFlipped = flippedCards.has(service.id);

      return (
        <article
          key={service.id}
          id={service.id}
          className={`amcBentoCard ${themeClass}`}
        >
          {/* ---- FLIP CONTAINER ---- */}
          <div
            className={`amcBentoCard__flipInner ${isFlipped ? "is-flipped" : ""}`}
            onClick={() => toggleFlip(service.id)}
            role="button"
            tabIndex={0}
            aria-pressed={isFlipped}
            aria-label={`${isFlipped ? "Hide" : "Show"} image for ${service.title}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleFlip(service.id);
              }
            }}
          >
            {/* ---- FRONT: ICON ---- */}
            <div className="amcBentoCard__face amcBentoCard__face--front">
              <div className="amcBentoCard__iconWrap">
                <div className="amcBentoCard__icon">{icon}</div>
              </div>
              {/* <span className="amcBentoCard__flipHint">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
                View image
              </span> */}
            </div>

            {/* ---- BACK: IMAGE (or placeholder) ---- */}
            <div className="amcBentoCard__face amcBentoCard__face--back">
              {firstImage ? (
                <Image
                  src={firstImage}
                  alt={`${service.title} visual`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="amcBentoCard__img"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className="amcBentoCard__placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <span>No Image</span>
                </div>
              )}
              <span className="amcBentoCard__flipHint amcBentoCard__flipHint--back">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
                Back
              </span>
            </div>
          </div>

          {/* ---- CONTENT (outside the flip so it stays put) ---- */}
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

        {/* ============ BENEFITS (SLANTED DESIGN) ============ */}
        <section className="amcBenefitsNew">
          <div className="amcBenefitsNew__header">
            <span className="amcTag">Why Annual Maintenance Contracts</span>
            <h2>Prevent problems before they become expensive.</h2>
          </div>

          <div className="amcBenefitsNew__grid">
          {benefits.map((b, i) => (
  <motion.div
    key={b.number}
    className="amcBenefitItem"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
    whileHover="hover"
    variants={{
      hover: { y: -8 }
    }}
  >
    <div className="amcBenefitItem__numberWrap">
      <motion.div
        className="amcBenefitItem__icon"
        variants={{
          hover: { scale: 1.15, rotate: 10, y: -8, color: "var(--accent-2)" }
        }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        {b.icon}
      </motion.div>

      <motion.div
        className="amcBenefitItem__slash"
        variants={{
          hover: { scaleX: 1.2, scaleY: 1.05, x: 10, backgroundColor: "var(--accent-soft)" }
        }}
        initial={{ opacity: 0, scale: 0.8, x: -20 }}
        whileInView={{ opacity: 1, scale: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: i * 0.1 + 0.2, ease: "easeOut" }}
      />
    </div>

    <div className="amcBenefitItem__content">
      <motion.h3
        className="amcBenefitItem__title"
        variants={{
          hover: { x: 6, color: "var(--accent-3)" }
        }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {b.title}
      </motion.h3>

      <motion.p
        className="amcBenefitItem__text"
        variants={{
          hover: { opacity: 1, x: 6 }
        }}
        initial={{ opacity: 0.8 }}
        transition={{ duration: 0.3 }}
      >
        <span className="dash">—</span> {b.text}
      </motion.p>
    </div>

    <motion.div
      className="amcBenefitItem__line"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: i * 0.1 + 0.4, ease: [0.22, 1, 0.36, 1] }}
      variants={{
        hover: { scaleX: 1.05, height: "3px", backgroundColor: "var(--accent)" }
      }}
    />

    <motion.div
      className="amcBenefitItem__hoverBg"
      variants={{
        hover: { opacity: 1, scale: 1 }
      }}
      initial={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    />
  </motion.div>
))}
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
                <path d="M8 12L9.5 26C9.7 27.1 10.6 28 11.7 28H20.3C21.4 28 22.3 27.1 22.5 26L24 12H8Z" fill="#EA580C" />
                <rect x="6" y="10" width="20" height="4" rx="2" fill="#9A3412" />
                <path d="M10 17H22" stroke="#FDBA74" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M11 22H21" stroke="#FDBA74" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M16 12V28" stroke="#FDBA74" strokeWidth="1.5" strokeLinecap="round" />
                <g transform="translate(4, 3)">
                  <circle cx="5" cy="5" r="2.5" stroke="#EA580C" strokeWidth="1.5" />
                  <path d="M5 0V1.5M5 8.5V10M0 5H1.5M8.5 5H10M1.5 1.5L2.5 2.5M7.5 7.5L8.5 8.5M1.5 8.5L2.5 7.5M7.5 2.5L8.5 1.5" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" />
                </g>
                <g transform="translate(12, 0)">
                  <path d="M5 0L9 2V5.5C9 8.5 5 10.5 5 10.5C5 10.5 1 8.5 1 5.5V2L5 0Z" fill="#EA580C" stroke="#EA580C" strokeWidth="1" />
                  <path d="M3 5L4.5 6.5L7 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </g>
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