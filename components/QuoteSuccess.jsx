// components/QuoteSuccess.jsx
"use client";

import React from "react";
import Link from "next/link";
import { inr } from "../lib/format";

export default function QuoteSuccess({ styles, createdQuote }) {
  return (
    <section className={styles.cartSection}>
      <div className={styles.quoteSuccess}>
        <div className={styles.quoteSuccess__hero}>
          <div className={styles.quoteSuccess__check}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12.5L10 17.5L19 7"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <span className={styles.quoteSuccess__eyebrow}>
            REQUEST CONFIRMED
          </span>

          <h2 className={styles.quoteSuccess__title}>
            Your quotation is
            <span> ready.</span>
          </h2>

          <p className={styles.quoteSuccess__sub}>
            We&apos;ve created your AMC quotation. Download the PDF below, or
            check your inbox — our team will follow up within 24 hours.
          </p>

          <div className={styles.quoteSuccess__meta}>
            <div className={styles.quoteSuccess__metaItem}>
              <span className={styles.quoteSuccess__metaLabel}>
                Quotation No.
              </span>
              <strong className={styles.quoteSuccess__metaValue}>
                {createdQuote?.number || "—"}
              </strong>
            </div>
            <div className={styles.quoteSuccess__metaDivider} />
            <div className={styles.quoteSuccess__metaItem}>
              <span className={styles.quoteSuccess__metaLabel}>Customer</span>
              <strong className={styles.quoteSuccess__metaValue}>
                {createdQuote?.customer || "—"}
              </strong>
            </div>
            <div className={styles.quoteSuccess__metaDivider} />
            <div className={styles.quoteSuccess__metaItem}>
              <span className={styles.quoteSuccess__metaLabel}>
                Grand Total
              </span>
              <strong className={styles.quoteSuccess__metaValue}>
                {typeof createdQuote?.grandTotal === "number"
                  ? inr(createdQuote.grandTotal, createdQuote.currency)
                  : "—"}
              </strong>
            </div>
          </div>

          <div className={styles.quoteSuccess__actions}>
            {createdQuote?.pdfUrl ? (
              <a
                href={createdQuote.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={`${createdQuote.number || "quotation"}.pdf`}
                className={styles.quoteSuccess__download}
              >
                <span
                  className={styles.quoteSuccess__downloadIcon}
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    width="16"
                    height="16"
                  >
                    <path
                      d="M10 3v9m0 0l-3.5-3.5M10 12l3.5-3.5M4 16h12"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Download Quotation PDF
              </a>
            ) : (
              <div className={styles.quoteSuccess__pending}>
                PDF will be emailed shortly
              </div>
            )}

            <Link href="/" className={styles.quoteSuccess__back}>
              ← Back to AMC Services
            </Link>
          </div>
        </div>

        <aside className={styles.quoteSuccess__card}>
          <div className={styles.quoteSuccess__cardGlow} aria-hidden="true" />

          <header className={styles.quoteSuccess__cardHead}>
            <span className={styles.quoteSuccess__cardEyebrow}>
              <span className={styles.quoteSuccess__cardDot} />
              QUOTATION
            </span>
            <h3>{createdQuote?.number || "—"}</h3>
          </header>

          <div className={styles.quoteSuccess__cardBody}>
            {createdQuote?.customer && (
              <div className={styles.quoteSuccess__cardRow}>
                <span>Customer</span>
                <strong>{createdQuote.customer}</strong>
              </div>
            )}
            {createdQuote?.duration && (
              <div className={styles.quoteSuccess__cardRow}>
                <span>Duration</span>
                <strong>{createdQuote.duration}</strong>
              </div>
            )}
            {createdQuote?.priceList && (
              <div className={styles.quoteSuccess__cardRow}>
                <span>Price List</span>
                <strong>{createdQuote.priceList}</strong>
              </div>
            )}
            <div className={styles.quoteSuccess__cardRow}>
              <span>Source</span>
              <strong>Website</strong>
            </div>
          </div>

          <div className={styles.quoteSuccess__cardTotal}>
            <div>
              <span>Grand Total</span>
              <small>Incl. applicable taxes</small>
            </div>
            <strong>
              {typeof createdQuote?.grandTotal === "number"
                ? inr(createdQuote.grandTotal, createdQuote.currency)
                : "—"}
            </strong>
          </div>

          {createdQuote?.viewUrl && (
            <a
              href={createdQuote.viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.quoteSuccess__cardCta}
            >
              View Online
              <span aria-hidden="true">
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  width="14"
                  height="14"
                >
                  <path
                    d="M4 12L12 4M12 4H6M12 4V10"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </a>
          )}

          <ul className={styles.quoteSuccess__trust}>
            <li>
              <span className={styles.quoteSuccess__trustIcon}>
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  width="12"
                  height="12"
                >
                  <path
                    d="M2.5 6.2L5 8.5L9.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              Emailed to your inbox
            </li>
            <li>
              <span className={styles.quoteSuccess__trustIcon}>
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  width="12"
                  height="12"
                >
                  <path
                    d="M2.5 6.2L5 8.5L9.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              Valid for 30 days
            </li>
          </ul>
        </aside>
      </div>
    </section>
  );
}