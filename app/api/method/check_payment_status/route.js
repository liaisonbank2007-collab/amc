// app/api/method/check_payment_status/route.js

const UPSTREAM_BASE = "https://liaisonbank.frappe.cloud";

// Frappe sends booleans as true/false, 0/1, "0"/"1", "true"/"false", "yes"/"no".
// Boolean("0") === true — so we must coerce manually.
function toBool(v) {
  if (v === true || v === 1) return true;
  if (v === false || v === 0 || v == null) return false;
  const s = String(v).trim().toLowerCase();
  return (
    s === "1" ||
    s === "true" ||
    s === "yes" ||
    s === "paid" ||
    s === "completed" ||
    s === "captured" ||
    s === "authorized"
  );
}

function unwrap(data) {
  if (!data || typeof data !== "object") return {};
  const m = data.message;
  if (m && typeof m === "object") return m;
  return data;
}

function normalizeStatus(msg) {
  const raw =
    msg.payment_status ||
    msg.status ||
    msg.status_detail ||
    msg.payment_state ||
    "";
  return String(raw).trim().toLowerCase() || null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const paymentRequest = searchParams.get("payment_request");

  if (!paymentRequest) {
    return Response.json(
      { paid: false, error: "payment_request is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.FRAPPE_API_KEY;
  const apiSecret = process.env.FRAPPE_API_SECRET;
  if (!apiKey || !apiSecret) {
    console.error(
      "[check_payment_status] Missing FRAPPE_API_KEY / FRAPPE_API_SECRET"
    );
    return Response.json(
      { paid: false, error: "Server is not configured to verify payments." },
      { status: 500 }
    );
  }

  const upstreamUrl =
    `${UPSTREAM_BASE}/api/method/check_payment_status` +
    `?payment_request=${encodeURIComponent(paymentRequest)}`;

  let upstream;
  try {
    upstream = await fetch(upstreamUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `token ${apiKey}:${apiSecret}`,
      },
      cache: "no-store",
    });
  } catch (err) {
    console.error("[check_payment_status] upstream fetch failed:", err);
    return Response.json(
      { paid: false, error: String(err?.message || err) },
      { status: 502 }
    );
  }

  const text = await upstream.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    return Response.json(
      {
        paid: false,
        error: "Upstream returned non-JSON",
        raw: text.slice(0, 200),
      },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    const detail =
      data?.exception ||
      data?._server_messages ||
      data?.error ||
      `HTTP ${upstream.status}`;
    return Response.json(
      { paid: false, error: String(detail) },
      { status: upstream.status }
    );
  }

  const msg = unwrap(data);
  const status = normalizeStatus(msg);

  const paid =
    toBool(msg.paid) ||
    toBool(msg.payment_completed) ||
    toBool(msg.is_paid) ||
    status === "paid" ||
    status === "completed" ||
    status === "captured" ||
    status === "authorized";

  return Response.json(
    {
      paid,
      status,
      grandTotal: msg.grand_total ?? msg.grandTotal ?? null,
      currency: msg.currency ?? null,
      payment_request: paymentRequest,
    },
    { status: 200 }
  );
}