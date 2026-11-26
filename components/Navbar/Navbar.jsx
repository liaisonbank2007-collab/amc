"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { isUserLoggedIn } from "@/lib/auth";
import "./Navbar.scss";

const services = [
  { slug: "fire-extinguisher-refilling", icon: "/images/FireExtinguisherandFlameShieldIcon.png", name: "Fire Extinguisher Refilling", desc: "Maintenance and refilling services for commercial fire extinguishers." },
  { slug: "fire-safety-audit",           icon: "/images/GovernmentCertifiedAuthorityicon.png", name: "Fire Safety Audit", desc: "Fire safety inspection, audit and maintenance-related support." },
  { slug: "electrical-audit",            icon: "/images/HandheldMultimeterwithLightningProbe.png", name: "Electrical Audit", desc: "Electrical inspection and audit-related maintenance services." },
  { slug: "png-infrastructure-audit",    icon: "/images/OrangeHandledPipelineValveIcon.png", name: "PNG Infrastructure Audit", desc: "Gas pipeline inspection and infrastructure maintenance support." },
  { slug: "pest-control",                icon: "/images/OrangeShieldBugEmblem.png", name: "Pest Control", desc: "Preventive pest management for commercial establishments." },
  { slug: "water-tank-cleaning",         icon: "/images/WaterDropandTestTubeIcon.png", name: "Water Tank Cleaning", desc: "Scheduled cleaning and maintenance of water storage tanks." },
  { slug: "license-renewal-assistance",  icon: "/images/CharcoalChecklistDocumentIcon.png", name: "License Renewal Assistance", desc: "Support for license renewal and related maintenance requirements." },
];

/* External links must NOT use next/link */
function SmartLink({ href, external, children, className, onClick, ...rest }) {
  if (!href) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("SmartLink: missing href", { children });
    }
    return null;
  }

  if (external) {
    return (
      <a
        href={href}
        className={className}
        onClick={onClick}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}

export default function AMCNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const lastScrollY = useRef(0);
  const closeTimer = useRef(null);
  const servicesRef = useRef(null);

  /* ---------- bootstrap ---------- */
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => { setIsLoggedIn(isUserLoggedIn()); }, [pathname]);

  useEffect(() => {
    const sync = () => setIsLoggedIn(isUserLoggedIn());
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  /* ---------- scroll ---------- */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setHidden(y > lastScrollY.current && y > 220 && !menuOpen);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  /* ---------- body lock ---------- */
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [menuOpen]);

  /* ---------- ESC ---------- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setServicesOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- click outside mega menu ---------- */
  useEffect(() => {
    if (!servicesOpen) return;
    const onDown = (e) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [servicesOpen]);

  useEffect(() => { if (!menuOpen) setMobileServicesOpen(false); }, [menuOpen]);

  /* ---------- helpers ---------- */
  const openServices = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setServicesOpen(true);
  }, []);

  const closeServices = useCallback(() => {
    closeTimer.current = setTimeout(() => setServicesOpen(false), 140);
  }, []);

  const closeAll = useCallback(() => {
    setMenuOpen(false);
    setServicesOpen(false);
    setMobileServicesOpen(false);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    closeAll();
    if (!isUserLoggedIn()) {
      router.push(`/login?redirect=${encodeURIComponent("/quote-cart")}`);
      return;
    }
    router.push("/quote-cart");
  };

  const handleLogout = (e) => {
    e.preventDefault();
    closeAll();
    try {
      localStorage.removeItem("user_email");
      localStorage.removeItem("full_name");
    } catch { /* ignore */ }
    setIsLoggedIn(false);
    router.push("/");
    router.refresh();
  };

  const loginHref = `/login?redirect=${encodeURIComponent("/quote-cart")}`;

  const isActive = (path) => {
    if (!pathname) return false;
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(path + "/");
  };

  const isCartActive = pathname === "/quote-cart";
  const isLoginActive = pathname === "/login";

  const navClass = (path) =>
    `an__cta an__cta--nav ${isActive(path) ? "" : "an__cta--ghost"}`;

  /* ---------- logo ---------- */
  const Logo = ({ className = "" }) => (
    <Link
      href="/"
      className={`an__logo ${className}`}
      onClick={() => { closeAll(); scrollToTop(); }}
      aria-label="Liaison Bank — Home"
    >
      <Image
        src="/logo.png"
        alt="Liaison Bank"
        width={320}
        height={80}
        priority
        className="an__logoImg"
      />
    </Link>
  );

  /* ---------- mobile drawer ---------- */
  const mobileDrawer = (
    <div
      className={`an__mobile ${menuOpen ? "is-open" : ""}`}
      aria-hidden={!menuOpen}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      <div className="an__mobileTop">
        <Logo className="an__logo--mobile" />
        <button
          type="button"
          className="an__mobileClose"
          onClick={closeAll}
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      <div className="an__mobileInner">
        <span className="an__mobileLabel">NAVIGATION</span>

        <Link
          href="/"
          className={`an__mobileLink ${isActive("/") ? "is-active" : ""}`}
          onClick={() => { closeAll(); scrollToTop(); }}
          scroll={false}
        >
          <span>01</span> Home <b aria-hidden="true">↗</b>
        </Link>

        <Link
          href="/about-us"
          className={`an__mobileLink ${isActive("/about-us") ? "is-active" : ""}`}
          onClick={closeAll}
        >
          <span>02</span> About <b aria-hidden="true">↗</b>
        </Link>

        <button
          type="button"
          className="an__mobileLink an__mobileLink--button"
          onClick={() => setMobileServicesOpen((v) => !v)}
          aria-expanded={mobileServicesOpen}
        >
          <span>03</span> Services <b aria-hidden="true">{mobileServicesOpen ? "−" : "+"}</b>
        </button>

        {mobileServicesOpen && (
          <div className="an__mobileServices">
            {services.map((s) => (
              <SmartLink
                key={s.slug}
                href={`/services/${s.slug}`}
                onClick={closeAll}
              >
                {s.name}
              </SmartLink>
            ))}
          </div>
        )}

        <SmartLink
          href="https://www.liaisonbank.com/projects"
          external
          className="an__mobileLink"
          onClick={closeAll}
        >
          <span>04</span> Projects <b aria-hidden="true">↗</b>
        </SmartLink>

        <a
          href="/quote-cart"
          className={`an__mobileCta ${isCartActive ? "" : "an__mobileCta--ghost"}`}
          onClick={handleCartClick}
        >
          Quote Cart <span aria-hidden="true">↗</span>
        </a>

        {isLoggedIn ? (
          <button type="button" className="an__mobileCta an__mobileCta--ghost" onClick={handleLogout}>
            Logout <span aria-hidden="true">↗</span>
          </button>
        ) : (
          <Link
            href={loginHref}
            className={`an__mobileCta ${isLoginActive ? "" : "an__mobileCta--ghost"}`}
            onClick={closeAll}
          >
            Sign in <span aria-hidden="true">↗</span>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      <header
        className={[
          "an",
          scrolled ? "an--scrolled" : "",
          hidden && !menuOpen ? "an--hidden" : "",
          menuOpen ? "an--menuOpen" : "",
        ].filter(Boolean).join(" ")}
      >
        <div className="an__inner">
          <Logo />

          <nav className="an__nav" aria-label="Primary">
            <Link href="/" className={navClass("/")}>
              <span className="an__ctaText">Home</span>
            </Link>

            <Link href="/about-us" className={navClass("/about-us")}>
              <span className="an__ctaText">About</span>
            </Link>

            <div
              ref={servicesRef}
              className="an__services"
              onMouseEnter={openServices}
              onMouseLeave={closeServices}
            >
              <button
                type="button"
                className={`an__cta an__cta--nav an__cta--ghost ${servicesOpen ? "is-open" : ""}`}
                onClick={() => setServicesOpen((v) => !v)}
                aria-expanded={servicesOpen}
                aria-haspopup="true"
                aria-controls="an-mega-menu"
              >
                <span className="an__ctaText">Services</span>
                <span className="an__ctaArrow" aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </span>
              </button>

              <div
                id="an-mega-menu"
                className={`an__mega ${servicesOpen ? "is-visible" : ""}`}
              >
                <div className="an__megaInner">
                  <div className="an__megaIntro">
                    <span className="an__eyebrow">WHAT WE DO</span>
                    <h3>
                      Solutions built
                      <br />
                      around your needs.
                    </h3>
                    <p>
                      From liaisoning and licensing to fire, electrical, PNG and
                      AMC services — engineered for reliability.
                    </p>
                    <SmartLink
                      href="/services"
                      external
                      className="an__megaCta"
                      onClick={closeAll}
                    >
                      View all services <span aria-hidden="true">↗</span>
                    </SmartLink>
                  </div>

                  <div className="an__megaGrid">
                    {services.map((s, i) => (
                      <SmartLink
                        key={s.slug}
                        href={`/services/${s.slug}`}
                        className="an__megaItem"
                        onClick={closeAll}
                      >
                        <span className="an__megaNum">{String(i + 1).padStart(2, "0")}</span>
                        <span className="an__megaText">
                          <strong>{s.name}</strong>
                          <small>{s.desc}</small>
                        </span>
                        <span className="an__megaArrow" aria-hidden="true">↗</span>
                      </SmartLink>
                    ))}
                  </div>
                </div>
              </div>
            </div>

           <Link href="/sectors" className={navClass("/sectors")}>
              <span className="an__ctaText">sectors</span>
            </Link>

 <Link href="/articles" className={navClass("/articles")}>
              <span className="an__ctaText">Articles</span>
            </Link>
          </nav>

          <div className="an__right">
            <a
              href="/quote-cart"
              className={`an__cta ${isCartActive ? "" : "an__cta--ghost"}`}
              onClick={handleCartClick}
              aria-label="Quote Cart"
            >
              <svg
                className="an__ctaIcon"
                width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="an__ctaText">Quote Cart</span>
              <span className="an__ctaArrow" aria-hidden="true">↗</span>
            </a>

            {isLoggedIn ? (
              <button type="button" className="an__cta an__cta--ghost" onClick={handleLogout} aria-label="Logout">
                <svg
                  className="an__ctaIcon"
                  width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span className="an__ctaText">Logout</span>
                <span className="an__ctaArrow" aria-hidden="true">↗</span>
              </button>
            ) : (
              <Link
                href={loginHref}
                className={`an__cta ${isLoginActive ? "" : "an__cta--ghost"}`}
                aria-label="Sign in"
              >
                <svg
                  className="an__ctaIcon"
                  width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="an__ctaText">Sign in</span>
                <span className="an__ctaArrow" aria-hidden="true">↗</span>
              </Link>
            )}

            <button
              type="button"
              className={`an__burger ${menuOpen ? "is-active" : ""}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span className="an__burgerLine" />
              <span className="an__burgerLine" />
            </button>
          </div>
        </div>
      </header>

      {mounted && createPortal(mobileDrawer, document.body)}
    </>
  );
}