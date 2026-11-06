import { NextResponse } from "next/server";

const FRAPPE_URL =
  "https://liaisonbank.frappe.cloud/api/method/get_razorpay_checkout_details";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const upstream = await fetch(FRAPPE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "token 592d628310f9ca4:a7f40b20f9cbeb5",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await upstream.text();

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (err) {
    console.error("[razorpay-proxy] upstream failed:", err);
    return NextResponse.json(
      { error: "Upstream Frappe request failed", detail: String(err) },
      { status: 502 }
    );
  }
}