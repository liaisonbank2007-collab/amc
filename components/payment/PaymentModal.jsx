"use client";
import React, { useEffect, useRef } from "react";

export default function PaymentModal({ url, onClose, onPaid }) {
  const iframeRef = useRef(null);

  // Listen for Razorpay / payment success postMessage OR
  // poll your own backend for payment status while modal is open.
  useEffect(() => {
    if (!url) return;

    // Poll the backend for payment completion every 3s
    let cancelled = false;
    const poll = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/method/check_payment_status?payment_request=${encodeURIComponent(
            window.__amcPaymentRequest || ""
          )}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (!cancelled && data?.message?.paid) {
          clearInterval(poll);
          onPaid?.(data.message);
        }
      } catch {
        /* ignore */
      }
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [url, onPaid]);

  if (!url) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 16px",
          background: "#fff",
          borderBottom: "1px solid #eee",
        }}
      >
        <strong>Complete your payment</strong>
        <button
          onClick={onClose}
          style={{ background: "none", border: 0, fontSize: 18 }}
        >
          ✕
        </button>
      </div>
      <iframe
        ref={iframeRef}
        src={url}
        title="Payment"
        style={{ flex: 1, width: "100%", border: 0, background: "#fff" }}
        allow="payment"
      />
    </div>
  );
}