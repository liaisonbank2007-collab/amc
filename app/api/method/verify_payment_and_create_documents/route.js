// app/api/method/verify_payment_and_create_documents/route.js
import { NextResponse } from "next/server";

const FRAPPE_URL =
  "https://liaisonbank.frappe.cloud/api/method/verify_payment_and_create_documents";

const REQUIRED_FIELDS = [
  "payment_request",
  "razorpay_payment_id",
  "razorpay_signature",
];

export async function POST(req) {
  // 1) Auth guard — replace QUOTE_SHARE_KEY with your real secret.
  //    Do NOT reuse the hard-coded DEFAULT_SHARE_KEY from the client bundle.
  const shareKey = req.headers.get("x-share-key");
  if (!shareKey || shareKey !== process.env.QUOTE_SHARE_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Parse JSON body
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 3) Validate required fields
  for (const field of REQUIRED_FIELDS) {
    if (!body || !body[field]) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      );
    }
  }

  // 4) Whitelist — never forward arbitrary keys to Frappe
  const safeBody = {};
  for (const field of REQUIRED_FIELDS) {
    safeBody[field] = body[field];
  }

  // 5) Proxy to Frappe with a timeout
  let upstream;
  try {
    upstream = await fetch(FRAPPE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `token ${process.env.FRAPPE_API_KEY}:${process.env.FRAPPE_API_SECRET}`,
      },
      body: JSON.stringify(safeBody),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
  } catch (err) {
    const isTimeout =
      err && (err.name === "TimeoutError" || err.name === "AbortError");
    console.error("[verify-payment-proxy] upstream failed:", err);
    return NextResponse.json(
      { error: isTimeout ? "Upstream timed out" : "Upstream request failed" },
      { status: isTimeout ? 504 : 502 }
    );
  }

  // 6) Read body once
  const contentType = upstream.headers.get("content-type") || "";
  const text = await upstream.text();

  // 7) Reject non-JSON upstream responses (login pages, HTML errors, etc.)
  if (!contentType.includes("application/json")) {
    console.error(
      "[verify-payment-proxy] non-JSON upstream response",
      upstream.status,
      text.slice(0, 300)
    );
    return NextResponse.json(
      { error: "Upstream returned non-JSON", status: upstream.status },
      { status: 502 }
    );
  }

  // 8) Pass through JSON response with the upstream status
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}