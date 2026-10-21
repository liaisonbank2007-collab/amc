"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

import "./footer.scss";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-goldline" aria-hidden="true" />

      <div className="footer-inner">
        {/* ── Masthead ─────────────────────────────── */}
        <div className="footer-masthead">
          <Link href="/" onClick={scrollToTop} className="footer-logo-link">
            <Image
              src="/logo.png"
              alt="Liaison Bank"
              title="Liaison Bank"
              width={200}
              height={56}
              priority
              className="footer-logo"
            />
          </Link>

          <div className="footer-masthead-rule" aria-hidden="true">
            <span className="footer-masthead-ornament">✦</span>
          </div>

          <p className="footer-tagline">
            <em>Regulatory clarity, delivered with precision.</em>
          </p>
        </div>

        {/* ── Columns ──────────────────────────────── */}
        <div className="footer-columns">
          <div className="footer-col footer-col--brand">
            <h5 className="footer-col-title">The Firm</h5>
            <p className="footer-col-text">
              Established in 2017–2019 as DBRE India Proprietary, the firm
              became DBRE India Private Limited in 2019 and rebranded as
              Liaison Bank in 2023. Headquartered in Mumbai, Liaison Bank
              provides end-to-end licensing, regulatory compliance and
              project liaisoning services.
            </p>
          </div>

          <div className="footer-col">
            <h5 className="footer-col-title">Navigate</h5>
            <ul className="footer-col-list">
              <li><Link href="https://www.liaisonbank.com/about-us-liaison">About</Link></li>
              <li><Link href="https://www.liaisonbank.com/our-services">Services</Link></li>
              <li><Link href="https://www.liaisonbank.com/projects">Projects</Link></li>
              <li><Link href="https://www.liaisonbank.com/client-liaison">Client Liaison</Link></li>
              <li><Link href="https://www.liaisonbank.com/contact-us-liaison-bank">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5 className="footer-col-title">Correspondence</h5>
            <ul className="footer-col-list footer-col-list--contact">
              <li>
                Plot 466, New Apollo CHSL,<br />
                Beside Blue Tokai Cafe, 14th Road,<br />
                Khar West, Mumbai – 400052
              </li>
              <li>
                <a href="tel:+919769458515">+91 97694 58515</a>
                <span className="footer-sep">·</span>
                <a href="tel:+919136066910">+91 91360 66910</a>
              </li>
              <li>
                <a href="mailto:ceo.desk@liaisonbank.com">ceo.desk@liaisonbank.com</a>
              </li>
              <li className="footer-hours">Mon – Sat · 8:00 AM – 5:00 PM</li>
            </ul>
          </div>
        </div>

        {/* ── Ornamental divider ───────────────────── */}
        <div className="footer-ornament" aria-hidden="true">
          <span className="footer-ornament-line" />
          <span className="footer-ornament-mark">❖</span>
          <span className="footer-ornament-line" />
        </div>

        {/* ── Bottom bar ───────────────────────────── */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} Liaison Bank · Mumbai, India
          </p>

          <div className="footer-legal">
            <Link href="/privacy-policy">Privacy</Link>
            <span className="footer-legal-sep">·</span>
            <Link href="/terms-and-conditions">Terms</Link>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="footer-top-btn"
            aria-label="Back to top"
          >
            <span>Top</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}