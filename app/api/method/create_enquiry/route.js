import { NextResponse } from "next/server";

const FRAPPE_BASE_URL = "https://liaisonbank.frappe.cloud";

export async function POST(request) {
  try {
    const payload = await request.json();

    const body = new URLSearchParams();
    Object.entries(payload).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      body.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
    });

    const res = await fetch(
      `${FRAPPE_BASE_URL}/api/method/create_enquiry`,
      {
        method: "POST",
        // Add auth header here only if your backend requires it:
        // headers: { Authorization: `token ${process.env.FRAPPE_API_KEY}:${process.env.FRAPPE_API_SECRET}` },
        body,
        cache: "no-store",
      }
    );

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!res.ok) {
      const msg =
        (data._server_messages && JSON.parse(data._server_messages).join(" ")) ||
        data.exc ||
        data.raw ||
        `Request failed (${res.status})`;
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("create_enquiry proxy error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}