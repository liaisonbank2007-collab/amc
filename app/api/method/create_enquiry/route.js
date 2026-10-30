import { NextResponse } from "next/server";

const FRAPPE_BASE_URL = "https://liaisonbank.frappe.cloud";

export async function POST(request) {
  try {
    const payload = await request.json();

    const res = await fetch(
      `${FRAPPE_BASE_URL}/api/method/create_enquiry`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          // Add auth header here only if your backend requires it:
          // Authorization: `token ${process.env.FRAPPE_API_KEY}:${process.env.FRAPPE_API_SECRET}`,
        },
        // Send the raw JSON string directly
        body: JSON.stringify(payload), 
        cache: "no-store",
      }
    );

    const text = await res.text();
    let data;
    try { 
      data = JSON.parse(text); 
    } catch { 
      data = { raw: text }; 
    }

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