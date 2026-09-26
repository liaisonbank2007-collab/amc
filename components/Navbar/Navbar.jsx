"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isUserLoggedIn } from "@/lib/auth";
import "./Navbar.scss";

const services = [
  { name: "Liaisoning", href: "https://www.liaisonbank.com/our-services/liaisoning", desc: "Approvals & permits" },
  { name: "Licensing", href: "https://www.liaisonbank.com/our-services/licensing", desc: "Statutory compliance" },
  { name: "Fire & FAPA", href: "https://www.liaisonbank.com/our-services/fire-fapa", desc: "Fire safety systems" },
  { name: "PNG", href: "https://www.liaisonbank.com/our-services/png", desc: "Piped natural gas" },
  { name: "Electrical", href: "https://www.liaisonbank.com/our-services/electrical", desc: "Power infrastructure" },
  { name: "AMC", href: "/amc", desc: "Annual maintenance" },
];

export default function AMCNavbar() {
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const lastScrollY = useRef(0);
  const closeTimer = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setHidden(y > lastScrollY.current && y > 220);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [menuOpen]);

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

  useEffect(() => {
    if (!menuOpen) setMobileServicesOpen(false);
  }, [menuOpen]);

  const openServices = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setServicesOpen(true);
  };

  const closeServices = () => {
    closeTimer.current = setTimeout(() => setServicesOpen(false), 120);
  };

  const closeAll = () => {
    setMenuOpen(false);
    setServicesOpen(false);
    setMobileServicesOpen(false);
  };

  // ---------- 🔒 Cart guard ----------
  const handleCartClick = (e) => {
    e.preventDefault();
    closeAll();

    if (!isUserLoggedIn()) {
      const returnTo = encodeURIComponent("/quote-cart");
      router.push(`/login?redirect=${returnTo}`);
      return;
    }

    router.push("/quote-cart");
  };

  const mobileDrawer = (
    <div
      className={`an__mobile ${menuOpen ? "is-open" : ""}`}
      aria-hidden={!menuOpen}
    >
      <div className="an__mobileInner">
        <span className="an__mobileLabel">NAVIGATION</span>

        <Link href="/" className="an__mobileLink" onClick={closeAll}>
          <span>01</span>
          Home
          <b aria-hidden="true">↗</b>
        </Link>

        <Link
          href="https://www.liaisonbank.com/about-us-liaison"
          className="an__mobileLink"
          onClick={closeAll}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>02</span>
          About
          <b aria-hidden="true">↗</b>
        </Link>

        <button
          type="button"
          className="an__mobileLink an__mobileLink--button"
          onClick={() => setMobileServicesOpen((v) => !v)}
          aria-expanded={mobileServicesOpen}
        >
          <span>03</span>
          Services
          <b aria-hidden="true">{mobileServicesOpen ? "−" : "+"}</b>
        </button>

        {mobileServicesOpen && (
          <div className="an__mobileServices">
            {services.map((s) => (
              <Link key={s.name} href={s.href} onClick={closeAll}>
                {s.name}
              </Link>
            ))}
          </div>
        )}

        <Link
          href="https://www.liaisonbank.com/projects"
          className="an__mobileLink"
          onClick={closeAll}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>04</span>
          Projects
          <b aria-hidden="true">↗</b>
        </Link>

        {/* 👇 Mobile cart CTA — now guarded */}
        <a
          href="/quote-cart"
          className="an__mobileCta"
          onClick={handleCartClick}
        >
          Quote Cart
          <span aria-hidden="true">↗</span>
        </a>
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
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="an__inner">
          {/* DESKTOP NAV */}
          <nav className="an__nav" aria-label="Primary">
            <Link href="/" className="an__link">
              Home
            </Link>

            <Link
              href="https://www.liaisonbank.com/about-us-liaison"
              className="an__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              About
            </Link>

            <div
              className="an__services"
              onMouseEnter={openServices}
              onMouseLeave={closeServices}
            >
              <button
                type="button"
                className={`an__link an__link--button ${
                  servicesOpen ? "is-open" : ""
                }`}
                onClick={() => setServicesOpen((v) => !v)}
                aria-expanded={servicesOpen}
                aria-haspopup="true"
              >
                Services
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                  <path
                    d="M1 3l4 4 4-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <div className={`an__mega ${servicesOpen ? "is-visible" : ""}`}>
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
                    <Link
                      href="https://www.liaisonbank.com/our-services"
                      className="an__megaCta"
                      onClick={closeAll}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View all services
                      <span aria-hidden="true">↗</span>
                    </Link>
                  </div>

                  <div className="an__megaGrid">
                    {services.map((s, i) => (
                      <Link
                        key={s.name}
                        href={s.href}
                        className="an__megaItem"
                        onClick={closeAll}
                      >
                        <span className="an__megaNum">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="an__megaText">
                          <strong>{s.name}</strong>
                          <small>{s.desc}</small>
                        </span>
                        <span className="an__megaArrow" aria-hidden="true">
                          ↗
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="https://www.liaisonbank.com/projects"
              className="an__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Projects
            </Link>
          </nav>

          {/* RIGHT */}
          <div className="an__right">
            {/* 👇 Desktop cart CTA — now guarded */}
            <a
              href="/quote-cart"
              className="an__cta"
              onClick={handleCartClick}
              aria-label="Quote Cart"
            >
              <svg
                className="an__ctaIcon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="an__ctaText">Quote Cart</span>
              <span className="an__ctaArrow" aria-hidden="true">
                ↗
              </span>
            </a>

            <button
              type="button"
              className={`an__burger ${menuOpen ? "is-active" : ""}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {mounted && createPortal(mobileDrawer, document.body)}
    </>
  );
}