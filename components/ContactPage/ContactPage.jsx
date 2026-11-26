"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

import EnquiryForm from "@/components/EnquiryForm";
import "./contact.scss";

/* -----------------------------------------------------------
   ICONS
----------------------------------------------------------- */
const Icon = {
  Phone: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Mail: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Pin: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Clock: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Arrow: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Shield: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  ExternalLink: (p) => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Directions: (p) => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  ),
};

/* -----------------------------------------------------------
   ADDRESS + MAP DATA
   (FIX: lat/lng kept separate from the address text so the
   embed URL receives real coordinates and always shows a pin)
----------------------------------------------------------- */
const ADDRESS = {
  line1: "Plot 466, New Apollo CHSL",
  line2: "Beside Blue Tokai Coffee, 14th Road",
  line3: "Khar West, Mumbai – 400052",
  country: "India",
  lat: 19.0702,
  lng: 72.8356,
};

const FULL_ADDRESS = `${ADDRESS.line1}, ${ADDRESS.line2}, ${ADDRESS.line3}, ${ADDRESS.country}`;

// Marker ALWAYS renders when q=lat,lng is used
const MAPS_EMBED = `https://maps.google.com/maps?q=${ADDRESS.lat},${ADDRESS.lng}&z=17&t=&ie=UTF8&iwloc=B&output=embed`;

const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  FULL_ADDRESS
)}`;

const MAPS_DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${ADDRESS.lat},${ADDRESS.lng}`;

/* -----------------------------------------------------------
   CONTACT CHANNELS
----------------------------------------------------------- */
const CONTACT_CHANNELS = [
  {
    icon: Icon.Phone,
    tag: "Call us",
    title: "+91 91360 66910",
    desc: "Mon–Fri · 9:00–18:00 IST",
    href: "tel:+919136066910",
  },
  {
    icon: Icon.Mail,
    tag: "Email",
    title: "ceo.desk@liaisonbank.com",
    desc: "Replies within one business day",
    href: "mailto:ceo.desk@liaisonbank.com",
  },
  {
    icon: Icon.Pin,
    tag: "Visit",
    title: "Khar West",
    desc: "Mumbai – 400052 · India",
    href: "#office",
  },
  {
    icon: Icon.Clock,
    tag: "Support",
    title: "24/7 Client Desk",
    desc: "Always-on ops & settlement",
    href: "#",
  },
];

/* -----------------------------------------------------------
   ANIMATION VARIANTS
----------------------------------------------------------- */
const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -45 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 45 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.08 } },
};

const cardReveal = {
  hidden: { opacity: 0, y: 35, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

/* -----------------------------------------------------------
   PAGE COMPONENT
----------------------------------------------------------- */
export default function ContactPage() {
  const shouldReduceMotion = useReducedMotion();
  const initialState = shouldReduceMotion ? false : "hidden";
  const viewport = { once: true, amount: 0.15 };

  const hoverCard = shouldReduceMotion
    ? {}
    : { y: -9, scale: 1.015, transition: { duration: 0.3, ease: "easeOut" } };

  const hoverButton = shouldReduceMotion
    ? {}
    : { scale: 1.04, y: -3, transition: { duration: 0.25 } };

  return (
    <div className="lb-contact">
      {/* ============== HERO ============== */}
      <section className="ct-hero">
        <motion.div
          className="ct-hero-inner"
          variants={staggerContainer}
          initial={initialState}
          animate="visible"
        >
          <motion.span className="ct-eyebrow" variants={fadeUp}>
            Contact Us
          </motion.span>

          <motion.h1 variants={fadeUp}>
            Let's start a <span className="ct-hl">conversation</span>.
          </motion.h1>

          <motion.p variants={fadeUp}>
            Fire safety, electrical audits, pest control, water tank cleaning or
            PNG infrastructure — talk to the Liaison Bank AMC desk about your
            business maintenance requirements.
          </motion.p>

          <motion.div className="ct-hero-chips" variants={staggerContainer}>
            <motion.span className="ct-chip" variants={cardReveal}>
              <Icon.Check width="14" />
              Response under 24h
            </motion.span>
            <motion.span className="ct-chip" variants={cardReveal}>
              <Icon.Shield width="14" />
              Compliance-first
            </motion.span>
            <motion.span className="ct-chip" variants={cardReveal}>
              <Icon.Clock width="14" />
              Ops desk 24/7
            </motion.span>
          </motion.div>
        </motion.div>

        <motion.div
          className="ct-hero-art"
          aria-hidden="true"
          initial={initialState}
          animate="visible"
          variants={fadeRight}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="ct-orb ct-orb-a"
            animate={shouldReduceMotion ? {} : { y: [0, -20, 0], x: [0, 12, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="ct-orb ct-orb-b"
            animate={shouldReduceMotion ? {} : { y: [0, 18, 0], x: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="ct-mini-card"
            whileHover={hoverCard}
            animate={shouldReduceMotion ? {} : { y: [0, -8, 0] }}
            transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
          >
            <Icon.Mail width="26" />
            <div>
              <strong>We read every message</strong>
              <span>No ticket queues — real people, real replies.</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ============== CHANNELS ============== */}
      <section className="ct-channels">
        <motion.div
          className="ct-channels-grid"
          variants={staggerContainer}
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
        >
          {CONTACT_CHANNELS.map((c) => {
            const I = c.icon;
            return (
              <motion.a
                key={c.title}
                className="ct-channel"
                href={c.href}
                variants={cardReveal}
                whileHover={hoverCard}
                whileTap={{ scale: 0.97 }}
              >
                <motion.div
                  className="ct-channel-icon"
                  whileHover={shouldReduceMotion ? {} : { rotate: -8, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <I width="22" />
                </motion.div>
                <span className="ct-channel-tag">{c.tag}</span>
                <strong>{c.title}</strong>
                <span className="ct-channel-desc">{c.desc}</span>
              </motion.a>
            );
          })}
        </motion.div>
      </section>

      {/* ============== MAP + ENQUIRY FORM ============== */}
      <section className="ct-main" id="office">
        <div className="ct-main-inner">
          {/* ---- MAP CARD ---- */}
          <motion.div
            className="ct-map-card"
            variants={fadeLeft}
            initial={initialState}
            whileInView="visible"
            viewport={viewport}
            whileHover={shouldReduceMotion ? {} : { y: -5, transition: { duration: 0.3 } }}
          >
            <motion.div
              className="ct-map-head"
              variants={staggerContainer}
              initial={initialState}
              whileInView="visible"
              viewport={viewport}
            >
              <div>
                <motion.span className="ct-map-eyebrow" variants={fadeUp}>
                  Visit us
                </motion.span>
                <motion.h2 variants={fadeUp}>Khar West, Mumbai</motion.h2>
              </div>

              <motion.a
                className="ct-map-directions"
                href={MAPS_DIRECTIONS}
                target="_blank"
                rel="noreferrer"
                whileHover={hoverButton}
                whileTap={{ scale: 0.96 }}
              >
                <Icon.Directions />
                Directions
              </motion.a>
            </motion.div>

            <motion.div
              className="ct-map-frame"
              initial={initialState}
              whileInView="visible"
              viewport={viewport}
              variants={fadeUp}
            >
              <iframe
                title="Liaison Bank AMC — Khar West office map"
                src={MAPS_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />

              <motion.div
                className="ct-map-badge"
                initial={initialState}
                whileInView="visible"
                viewport={viewport}
                variants={fadeUp}
              >
                <Icon.Pin width="14" />
                Liaison Bank AMC
              </motion.div>
            </motion.div>

            <motion.div
              className="ct-map-body"
              variants={staggerContainer}
              initial={initialState}
              whileInView="visible"
              viewport={viewport}
            >
              <motion.div
                className="ct-map-address"
                variants={fadeUp}
                whileHover={shouldReduceMotion ? {} : { scale: 1.015 }}
              >
                <Icon.Pin width="18" />
                <address>
                  <strong>{ADDRESS.line1}</strong>
                  <span>{ADDRESS.line2}</span>
                  <span>{ADDRESS.line3}, {ADDRESS.country}</span>
                </address>
              </motion.div>

              <motion.div className="ct-map-meta" variants={staggerContainer}>
                <motion.div className="ct-map-meta-item" variants={cardReveal} whileHover={hoverCard}>
                  <Icon.Clock width="16" />
                  <div>
                    <span className="ct-map-meta-label">Office hours</span>
                    <strong>Mon–Sat · 8:00 AM – 5:00 PM</strong>
                  </div>
                </motion.div>
                <motion.div className="ct-map-meta-item" variants={cardReveal} whileHover={hoverCard}>
                  <Icon.Phone width="16" />
                  <div>
                    <span className="ct-map-meta-label">Reception</span>
                    <strong><a href="tel:+919136066910">+91 91360 66910</a></strong>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div className="ct-map-actions" variants={staggerContainer}>
                <motion.a
                  className="ct-btn primary"
                  href={MAPS_LINK}
                  target="_blank"
                  rel="noreferrer"
                  variants={fadeUp}
                  whileHover={hoverButton}
                  whileTap={{ scale: 0.96 }}
                >
                  Open in Google Maps
                  <Icon.ExternalLink />
                </motion.a>
                <motion.a
                  className="ct-btn ghost"
                  href="tel:+919136066910"
                  variants={fadeUp}
                  whileHover={hoverButton}
                  whileTap={{ scale: 0.96 }}
                >
                  Call the desk
                  <Icon.Phone width="14" />
                </motion.a>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ---- ENQUIRY FORM ---- */}
          <motion.div
            className="ct-form-card"
            variants={fadeRight}
            initial={initialState}
            whileInView="visible"
            viewport={viewport}
            whileHover={shouldReduceMotion ? {} : { y: -5, transition: { duration: 0.3 } }}
          >
            <motion.header
              variants={staggerContainer}
              initial={initialState}
              whileInView="visible"
              viewport={viewport}
            >
              <motion.span className="ct-form-eyebrow" variants={fadeUp}>
                Send an enquiry
              </motion.span>
              <motion.h2 variants={fadeUp}>Tell us what you need.</motion.h2>
              <motion.p variants={fadeUp}>
                All fields marked <em>*</em> are required.
              </motion.p>
            </motion.header>
            <EnquiryForm />
          </motion.div>
        </div>

        {/* ============== ASIDE ============== */}
        <motion.div
          className="ct-aside"
          variants={staggerContainer}
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
        >
          {/* HEAD OFFICE */}
          <motion.div className="ct-aside-card dark" variants={cardReveal} whileHover={hoverCard}>
            <motion.span className="ct-aside-eyebrow" variants={fadeUp}>Head office</motion.span>
            <motion.h3 variants={fadeUp}>Liaison Bank AMC</motion.h3>
            <motion.p variants={fadeUp}>
              {ADDRESS.line1}<br />{ADDRESS.line2}<br />{ADDRESS.line3} · {ADDRESS.country}
            </motion.p>
            <motion.a
              className="ct-aside-link"
              href={MAPS_LINK}
              target="_blank"
              rel="noreferrer"
              whileHover={{ x: 5 }}
            >
              View on map
              <Icon.Arrow />
            </motion.a>
          </motion.div>

          {/* DIRECT CONTACT */}
          <motion.div className="ct-aside-card" variants={cardReveal} whileHover={hoverCard}>
            <span className="ct-aside-eyebrow">Prefer a direct line?</span>
            <ul className="ct-mini-list">
              <li><span>Client desk</span><strong>+91 91360 66910</strong></li>
              <li><span>Email</span><strong>ceo.desk@liaisonbank.com</strong></li>
              <li><span>Careers</span><strong>careers@liaisonbank.com</strong></li>
            </ul>
          </motion.div>

          {/* FAQ */}
          <motion.div className="ct-aside-card accent" variants={cardReveal} whileHover={hoverCard}>
            <span className="ct-aside-eyebrow">Quick FAQ</span>
            <ul className="ct-faq-mini">
              <li><strong>Response time?</strong><span>Within 1 business day.</span></li>
              <li><strong>Regions served?</strong><span>India, UAE, Singapore.</span></li>
              <li><strong>Site audit?</strong><span>Booked within 48 hours.</span></li>
            </ul>
          </motion.div>
        </motion.div>
      </section>

      {/* ============== CTA STRIP ============== */}
      <section className="ct-cta">
        <motion.div
          className="ct-cta-orb"
          aria-hidden="true"
          animate={shouldReduceMotion ? {} : { scale: [1, 1.15, 1], x: [0, -25, 0], y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="ct-cta-inner"
          variants={staggerContainer}
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
        >
          <motion.span variants={fadeUp}>Or visit us</motion.span>
          <motion.h2 variants={fadeUp}>
            Find the Liaison <strong>desk</strong>.
          </motion.h2>
          <motion.p variants={fadeUp}>
            Walk-ins welcome Monday to Saturday, 8:00 AM–5:00 PM IST.
            Book ahead for advisory or site-audit sessions.
          </motion.p>
          <motion.a
            className="ct-btn accent"
            href={MAPS_LINK}
            target="_blank"
            rel="noreferrer"
            variants={fadeUp}
            whileHover={hoverButton}
            whileTap={{ scale: 0.96 }}
          >
            Open in Maps
            <Icon.Arrow />
          </motion.a>
        </motion.div>
      </section>
    </div>
  );
}