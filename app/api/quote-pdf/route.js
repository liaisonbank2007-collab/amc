// app/api/quote-pdf/route.js
import { NextResponse } from "next/server";

const FRAPPE_URL =
  "https://liaisonbank.frappe.cloud/api/method/frappe.utils.print_format.download_pdf";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  // Forward Frappe's expected print params
  const target = new URL(FRAPPE_URL);
  ["doctype", "name", "format", "no_letterhead", "letterhead", "key"].forEach(
    (k) => {
      const v = searchParams.get(k);
      if (v) target.searchParams.set(k, v);
    }
  );

  console.log("[quote-pdf] fetching →", target.toString());

  try {
    const upstream = await fetch(target.toString(), {
      headers: {
        Accept: "application/pdf",
        // If your Frappe needs auth for download_pdf, uncomment:
        // Authorization: `token ${process.env.FRAPPE_API_KEY}:${process.env.FRAPPE_API_SECRET}`,
      },
      cache: "no-store",
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      console.error("[quote-pdf] upstream error:", upstream.status, text.slice(0, 300));
      return NextResponse.json(
        {
          error: `Frappe returned ${upstream.status}`,
          detail: text.slice(0, 500),
          triedUrl: target.toString(),
        },
        { status: upstream.status }
      );
    }

    const buf = await upstream.arrayBuffer();

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          upstream.headers.get("content-disposition") ||
          `attachment; filename="quotation.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[quote-pdf] proxy error:", err);
    return NextResponse.json(
      { error: "Proxy error", detail: String(err) },
      { status: 502 }
    );
  }
}