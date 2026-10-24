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
      {/* ── CTA strip ─────────────────────────────── */}
      <div className="footer-cta">
        <div className="footer-cta-inner">
          <div className="footer-cta-copy">
            <span className="footer-cta-eyebrow">Start a conversation</span>
            <h4 className="footer-cta-title">
              Regulatory clarity,<br />
              <em>delivered with precision.</em>
            </h4>
          </div>
          <Link
            href="https://www.liaisonbank.com/contact-us-liaison-bank"
            className="footer-cta-btn"
          >
            <span>Speak with our team</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="footer-goldline" aria-hidden="true" />

      <div className="footer-inner">
        {/* ── Top: brand + columns grid ──────────── */}
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
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
            <p className="footer-brand-text">
              Established in 2017–2019 as DBRE India Proprietary, the firm became
              DBRE India Private Limited in 2019 and rebranded as Liaison Bank in
              2023. Headquartered in Mumbai, we provide end-to-end licensing,
              regulatory compliance and project liaisoning services.
            </p>
            <div className="footer-brand-badges">
              <span className="footer-badge">Est. 2017</span>
              <span className="footer-badge">Mumbai</span>
              <span className="footer-badge">Licensing · Compliance</span>
            </div>
          </div>

          {/* Navigate */}
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

          {/* Correspondence */}
          <div className="footer-col">
            <h5 className="footer-col-title">Correspondence</h5>
            <ul className="footer-col-list footer-col-list--contact">
              <li className="footer-address">
                Plot 466, New Apollo CHSL,<br />
                Beside Blue Tokai Cafe, 14th Road,<br />
                Khar West, Mumbai – 400052
              </li>
              <li className="footer-phones">
                <a href="tel:+919769458515">+91 97694 58515</a>
                <span className="footer-sep">·</span>
                <a href="tel:+919136066910">+91 91360 66910</a>
              </li>
              <li>
                <a href="mailto:ceo.desk@liaisonbank.com">ceo.desk@liaisonbank.com</a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="footer-col">
            <h5 className="footer-col-title">Office Hours</h5>
            <div className="footer-hours-card">
              <div className="footer-hours-row">
                <span>Mon – Sat</span>
                <span>8:00 AM – 5:00 PM</span>
              </div>
              <div className="footer-hours-row">
              
              </div>
              <div className="footer-hours-row footer-hours-row--closed">
                <span>Sunday</span>
                <span>Closed</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────── */}
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
            <span>Back to top</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}