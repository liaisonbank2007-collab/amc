"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AMCNavbar from "@/components/Navbar/Navbar.jsx";
import "./subservices.scss";

const slugify = (str = "") =>
  String(str)
    .toLowerCase()
    .trim()
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export default function SubServicePage() {
  const params = useParams();
  const slug = params?.slug || "";

  const [subTypes, setSubTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();

    const fetchSubTypes = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/frappe/get_amc_sub_types`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const json = await res.json();

        const raw = Array.isArray(json?.message?.data)
          ? json.message.data
          : Array.isArray(json?.data)
            ? json.data
            : Array.isArray(json?.message)
              ? json.message
              : [];

        const filtered = raw.filter(
          (item) => item?.amc_type && slugify(item.amc_type) === slug
        );

       const mapped = filtered.map((item, index) => {
  const title = item.amc_sub_type || item.name || "Untitled";
  const description = item.description || "";
  const subSlug = slugify(title);

  return {
    id: subSlug,
    docName: item.name,
    number: String(index + 1).padStart(2, "0"),
    title,
    description,
    items: [
      "Scheduled inspections",
      "Preventive servicing",
      "Priority support",
    ],
    href: `/amc/${slug}/${subSlug}`,
  };
});

        setSubTypes(mapped);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Failed to fetch AMC sub types:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubTypes();
    return () => controller.abort();
  }, [slug]);

  const prettyTitle = slug.replace(/-/g, " ");

  return (
    <>
      <AMCNavbar />

      <main className="subservicesPage">
        {/* ============ HERO ============ */}
        <section className="ssHero">
          <div className="ssHero__grid" aria-hidden="true" />

          <div className="ssHero__inner">
            <span className="ssTag">Sub Services</span>

            <h1 className="ssHero__title">
              {prettyTitle}
              <span>maintenance.</span>
            </h1>

            <p className="ssHero__lead">
              Detailed sub-services covered under the{" "}
              <strong className="ssHero__strong">{prettyTitle}</strong> annual
              maintenance contract.
            </p>

            <div className="ssHero__cta">
              <Link href="/" className="ssBtn ssBtn--primary">
                ← Back to All AMC Services
              </Link>
              <a href="#subservices" className="ssBtn ssBtn--ghost">
                Browse Sub Services
                <span aria-hidden="true">→</span>
              </a>
            </div>

            <div className="ssHero__stats">
              <div>
                <strong>{subTypes.length || "—"}</strong>
                <span>Sub Services</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>Support</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>Compliance</span>
              </div>
            </div>
          </div>

          {/* <div className="ssHero__marquee" aria-hidden="true">
            <div className="ssHero__marqueeTrack">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="ssHero__marqueeRow">
                  <span>INSPECTIONS</span>
                  <em>◆</em>
                  <span>SERVICING</span>
                  <em>◆</em>
                  <span>MAINTENANCE</span>
                  <em>◆</em>
                  <span>SUPPORT</span>
                  <em>◆</em>
                </div>
              ))}
            </div>
          </div> */}
        </section>

        {/* ============ STICKY NAV ============ */}
        <nav className="ssNav" aria-label="Sub-service sections">
          <div className="ssNav__inner">
            <a href="#subservices" className="ssNav__link">
              All Sub Services
            </a>

            <div className="ssNav__scroll">
              {subTypes.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="ssNav__link"
                  title={s.title}
                >
                  {s.title}
                </a>
              ))}
            </div>

            <Link href="/" className="ssNav__link ssNav__link--end">
              ← AMC
            </Link>
          </div>
        </nav>

        {/* ============ SUB SERVICES ============ */}
        <section className="ssServices" id="subservices">
          <header className="ssServices__header">
            <div>
              <span className="ssTag">What&apos;s Included</span>
              <h2>Sub Services</h2>
            </div>
            <p>
              Select a sub-service to view available items under the{" "}
              {prettyTitle} contract.
            </p>
          </header>

          {loading && (
            <div className="ssState">
              <span className="ssState__dot" />
              Loading sub-services…
            </div>
          )}

          {error && !loading && (
            <div className="ssState ssState--error">
              Unable to load sub-services. Please try again later.
            </div>
          )}

          {!loading && !error && subTypes.length === 0 && (
            <div className="ssState">
              No sub-services found for <strong>{prettyTitle}</strong>.
            </div>
          )}

          {!loading && !error && subTypes.length > 0 && (
            <div className="ssGrid">
              {subTypes.map((sub) => (
                <article key={sub.id} id={sub.id} className="ssCard">
                  <div className="ssCard__top">
                    <span className="ssCard__num">{sub.number}</span>
                    <span className="ssCard__badge">SUB</span>
                  </div>

                  <h3 className="ssCard__title">
                    <Link href={sub.href} className="ssCard__titleLink">
                      {sub.title}
                    </Link>
                  </h3>

                  <p className="ssCard__text">{sub.description}</p>

                  <ul className="ssCard__list">
                    {sub.items.map((item) => (
                      <li key={item}>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 6.2 4.8 9 10 3.5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={sub.href}
                    className="ssCard__link"
                    aria-label={`View ${sub.title} details`}
                  >
                    View Details
                    <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ============ CTA ============ */}
        <section className="ssCta">
          <div className="ssCta__card">
            <div className="ssCta__glow" aria-hidden="true" />

            <div className="ssCta__content">
              <span className="ssTag ssTag--light">Need more details?</span>

              <h2>
                Talk to us about
                <em>{prettyTitle} maintenance.</em>
              </h2>

              <p>
                Get a customised scope of work, service frequency and pricing
                for your facility.
              </p>

              <div className="ssCta__actions">
                <a
                  href="https://www.liaisonbank.com/contact-us-liaison-bank"
                  className="ssBtn ssBtn--primaryDark"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Talk To Our Team
                  <span aria-hidden="true">↗</span>
                </a>
                <Link href="/" className="ssBtn ssBtn--ghostDark">
                  All AMC Services
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            <div className="ssCta__mark" aria-hidden="true">
              SUB
            </div>
          </div>
        </section>
      </main>
    </>
  );
}