// app/api/method/create_amc_quotation/route.js
// app/api/method/create_amc_quotation/route.js
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FRAPPE_URL =
  "https://liaisonbank.frappe.cloud/api/method/create_amc_quotation";

// 👇 HARDCODED TOKEN HERE
const FRAPPE_AUTH_TOKEN = "token 592d628310f9ca4:669d8384d3f1ef5";

const MAX_BODY_BYTES = 100 * 1024; // 100 KB
const UPSTREAM_TIMEOUT_MS = 25_000;

function authHeader() {
  const key = process.env.FRAPPE_API_KEY;
  const secret = process.env.FRAPPE_API_SECRET;
  if (!key || !secret) return null;
  return `token ${key}:${secret}`;
}

export async function POST(req) {
  // ---- Guard: reject oversized bodies early ----
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "Request body too large" },
      { status: 413 }
    );
  }

  // ---- Parse JSON ----
  let body;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 }
      );
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // ---- Forward to Frappe ----
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
       Authorization: FRAPPE_AUTH_TOKEN, // 👈 ADD THIS
    };

 

   const upstream = await fetch(FRAPPE_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });

    const text = await upstream.text();
    const contentType =
      upstream.headers.get("content-type") || "application/json";

    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": contentType },
    });
  } catch (err) {
    if (err?.name === "AbortError") {
      console.error("[quote-proxy] upstream timeout");
      return NextResponse.json(
        { error: "Upstream Frappe request timed out" },
        { status: 504 }
      );
    }
    console.error("[quote-proxy] upstream failed:", err);
    return NextResponse.json(
      {
        error: "Upstream Frappe request failed",
        ...(process.env.NODE_ENV !== "production" && {
          detail: String(err),
        }),
      },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}

// Explicitly reject other methods so clients get a clear 405.
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}