// utils/api.js
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const FRAPPE_BASE_URL = "https://liaisonbank.frappe.cloud";

export const buildPrintUrl = (printUrl, { download = false } = {}) => {
  if (!printUrl) return null;

  let params;
  try {
    const u = new URL(printUrl, FRAPPE_BASE_URL);
    params = u.searchParams;
  } catch {
    return printUrl;
  }

  if (!download) {
    return `${FRAPPE_BASE_URL}${printUrl.startsWith("/") ? "" : "/"}${printUrl}`;
  }

  const qs = new URLSearchParams();
  ["doctype", "name", "format", "no_letterhead", "letterhead", "key"].forEach(
    (k) => {
      const v = params.get(k);
      if (v) qs.set(k, v);
    }
  );

  return `/api/quote-pdf?${qs.toString()}`;
};

export const showQuoteSuccessAlert = async (quote) => {
  const inrFmt = (n, c = "INR") =>
    typeof n === "number"
      ? `${c} ${n.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "—";

  const result = await Swal.fire({
    icon: "success",
    title: "Quotation Created!",
    html: `
      <div style="text-align:left;font-size:0.92rem;line-height:1.6;color:#374151;">
        <p style="margin:0 0 0.6rem;">
          Your AMC quotation has been generated successfully.
        </p>
        <div style="
          background:linear-gradient(180deg,rgba(205,121,19,0.06),rgba(205,121,19,0.02));
          border:1px solid rgba(205,121,19,0.2);
          border-radius:12px;
          padding:0.85rem 1rem;
          margin:0.75rem 0 0.25rem;
        ">
          <div style="display:flex;justify-content:space-between;gap:1rem;padding:0.3rem 0;border-bottom:1px dashed rgba(15,26,20,0.08);">
            <span style="color:#6b7280;font-weight:600;">Quotation No.</span>
            <strong style="color:#0f1a14;">${quote.number || "—"}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;gap:1rem;padding:0.3rem 0;border-bottom:1px dashed rgba(15,26,20,0.08);">
            <span style="color:#6b7280;font-weight:600;">Customer</span>
            <strong style="color:#0f1a14;">${quote.customer || "—"}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;gap:1rem;padding:0.3rem 0;">
            <span style="color:#6b7280;font-weight:600;">Grand Total</span>
            <strong style="color:#cd7913;font-size:1.05rem;">${inrFmt(
              quote.grandTotal,
              quote.currency
            )}</strong>
          </div>
        </div>
      </div>
    `,
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText: "📄 View Quote",
    denyButtonText: "⬇️ Download PDF",
    cancelButtonText: "Close",
    confirmButtonColor: "#cd7913",
    denyButtonColor: "#0f1a14",
    cancelButtonColor: "#6b7280",
    reverseButtons: true,
    focusConfirm: true,
    allowOutsideClick: false,
    customClass: {
      popup: "amc-quote-swal-popup",
      title: "amc-quote-swal-title",
      confirmButton: "amc-quote-swal-btn",
      denyButton: "amc-quote-swal-btn",
      cancelButton: "amc-quote-swal-btn",
    },
  });

  if (result.isConfirmed && quote.viewUrl) {
    window.open(quote.viewUrl, "_blank", "noopener,noreferrer");
  }

  if (result.isDenied && quote.pdfUrl) {
    const a = document.createElement("a");
    a.href = quote.pdfUrl;
    a.download = `${quote.number || "quotation"}.pdf`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};