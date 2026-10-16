// app/api/method/create_sales_order_from_quotation/route.js
import { NextResponse } from "next/server";

const FRAPPE_URL =
  "https://liaisonbank.frappe.cloud/api/method/create_sales_order_from_quotation";

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
        Authorization:
          "token 819b3f5078a36d3:1a585f86efcb3b3",
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
    console.error("[sales-order-proxy] upstream failed:", err);
    return NextResponse.json(
      { error: "Upstream Frappe request failed", detail: String(err) },
      { status: 502 }
    );
  }
}