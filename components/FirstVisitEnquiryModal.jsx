"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import EnquiryForm from "./EnquiryForm";
import { onOpenEnquiryModal } from "@/lib/enquiryModal";
import "./FirstVisitEnquiryModal.scss";

const STORAGE_KEY = "enquiry_modal_seen_v1";

export default function FirstVisitEnquiryModal() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [manual, setManual] = useState(false); // true = opened via button

  useEffect(() => { setMounted(true); }, []);

  // Auto-open on first visit
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const t = setTimeout(() => {
      setManual(false);
      setOpen(true);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  // Listen for manual open requests (footer button, etc.)
  useEffect(() => {
    const off = onOpenEnquiryModal(() => {
      setManual(true);
      setOpen(true);
    });
    return off;
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    // Only mark "seen" when the auto-modal is dismissed
    if (!manual) {
      try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    }
    setManual(false);
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) close();
  };

  if (!mounted || !open) return null;

  const modal = (
    <div
      className="fvm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fvm-title"
      onClick={handleBackdrop}
    >
      <div className="fvm__panel" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="fvm__close"
          onClick={close}
          aria-label="Close enquiry form"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="fvm__inner">
          <span className="fvm__eyebrow">Welcome to Liaison Bank</span>
          <h2 id="fvm-title" className="fvm__title">
            Tell us what you need.<br />
            <em>We&apos;ll take it from there.</em>
          </h2>
          <EnquiryForm />
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}