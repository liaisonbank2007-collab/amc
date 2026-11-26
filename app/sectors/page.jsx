"use client";

import { useEffect, useRef, useState } from "react";
import "./sectors.scss";

const sectors = [
  {
    id: "residential",
    number: "01",
    name: "Residential Sector",
    shortName: "Residential",
    tagline: "Complete care for the spaces you call home.",
    description:
      "Comprehensive AMC solutions for individual homes, apartments, housing societies and residential communities. We help maintain safe, hygienic and well-functioning living environments.",
    items: [
      "Individual Houses & Apartments",
      "Residential Societies",
      "High-Rise Buildings & Towers",
      "Gated Communities & Townships",
      "Villas & Bungalows",
      "Residential Complexes",
      "Property Management",
      "Hostels & Paying Guest (PG) Facilities",
    ],
  },
  {
    id: "commercial",
    number: "02",
    name: "Commercial Sector",
    shortName: "Commercial",
    tagline: "Keeping businesses running without interruption.",
    description:
      "End-to-end AMC support for commercial establishments, hospitality businesses, healthcare facilities, offices, retail spaces and institutional properties.",
    items: [
      "Restaurants, Cafés & QSRs",
      "Hotels, Resorts & Hospitality",
      "Banquet Halls & Convention Centres",
      "Hospitals, Clinics & Nursing Homes",
      "Corporate Offices & IT Parks",
      "Shopping Malls & Retail Stores",
      "Supermarkets & Showrooms",
      "Schools, Colleges & Universities",
      "Banks & Financial Institutions",
      "Cinemas & Entertainment Centres",
      "Gyms, Clubs & Sports Facilities",
      "Commercial Complexes & Business Parks",
      "Sweet Shops & Bakeries",
      "Government & Institutional Buildings",
    ],
  },
  {
    id: "industrial",
    number: "03",
    name: "Industrial Sector",
    shortName: "Industrial",
    tagline: "Reliable maintenance for demanding operations.",
    description:
      "Specialised AMC solutions for manufacturing plants, factories, processing units, warehouses and industrial infrastructure, supporting operational reliability and workplace safety.",
    items: [
      "Manufacturing Plants & Factories",
      "Textile & Garment Industries",
      "Pharmaceutical Industries",
      "Chemical & Petrochemical Industries",
      "Food Processing Industries",
      "Engineering & Fabrication Units",
      "Automobile & Automotive Industries",
      "Warehouses & Logistics Centres",
      "Cold Storage Facilities",
      "Packaging & Printing Industries",
      "Plastic & Rubber Industries",
      "Steel & Metal Industries",
      "Paint & Colour Coating Units",
      "Power Plants & Utility Facilities",
      "Industrial Parks & MIDC Units",
      "Workshops & Production Facilities",
    ],
  },
];

const whyChooseUs = [
  {
    number: "01",
    title: "Single Point of Accountability",
    description:
      "One dedicated partner for maintenance, safety, licensing and compliance — no chasing multiple vendors or coordinating between contractors.",
  },
  {
    number: "02",
    title: "Sector-Specific Expertise",
    description:
      "Our teams understand the distinct operational demands of residential societies, commercial establishments and industrial facilities.",
  },
  {
    number: "03",
    title: "Preventive-First Approach",
    description:
      "Scheduled inspections and preventive maintenance reduce downtime, extend equipment life and prevent costly emergency repairs.",
  },
  {
    number: "04",
    title: "Transparent Reporting",
    description:
      "Clear documentation, service logs and compliance records keep you informed and audit-ready at all times.",
  },
  {
    number: "05",
    title: "Rapid Response Support",
    description:
      "Dependable response times for breakdowns and urgent issues, with escalation paths that keep your operations running.",
  },
  {
    number: "06",
    title: "Compliance & Safety Focus",
    description:
      "We help you stay ahead of statutory requirements, safety norms and licensing obligations across every property type.",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Assessment",
    description:
      "We evaluate your property, systems and compliance requirements to understand your exact AMC needs.",
  },
  {
    step: "02",
    title: "Custom Plan",
    description:
      "A tailored maintenance schedule and scope of work is built around your sector, usage and budget.",
  },
  {
    step: "03",
    title: "Execution",
    description:
      "Trained teams carry out scheduled maintenance, inspections and corrective actions with minimal disruption.",
  },
  {
    step: "04",
    title: "Reporting & Review",
    description:
      "Regular reports, service records and review meetings keep your AMC transparent and continuously improving.",
  },
];

const faqs = [
  {
    question: "What is an AMC and why does my property need one?",
    answer:
      "An Annual Maintenance Contract (AMC) is a planned service agreement that covers routine maintenance, inspections and corrective support for your property's systems. It helps prevent breakdowns, extends equipment life, keeps you compliant and reduces unexpected repair costs.",
  },
  {
    question: "Which sectors does Liaison Bank cover?",
    answer:
      "We provide AMC solutions across three major sectors — residential, commercial and industrial. This includes homes, housing societies, offices, hotels, hospitals, retail spaces, factories, warehouses and more.",
  },
  {
    question: "Can the AMC be customised to my property type?",
    answer:
      "Yes. Every AMC is tailored to your property type, usage, systems and compliance requirements. The scope, frequency of visits and service levels are agreed upfront.",
  },
  {
    question: "Do you handle compliance and licensing support?",
    answer:
      "Yes. Along with maintenance, we assist with statutory compliance, safety checks and licensing support so your property stays audit-ready and within regulations.",
  },
  {
    question: "How do I get started with an AMC?",
    answer:
      "Simply reach out through our contact page. We'll assess your property, understand your requirements and propose a maintenance plan suited to your sector and budget.",
  },
];

function useSectorReveal() {
  const containerRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const nodes = root.querySelectorAll("[data-reveal]");
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("isVisible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("isVisible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return containerRef;
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4.5 15.5 15 5M6 5h9v9" />
    </svg>
  );
}

export default function SectorsWeServe() {
  const [activeSector, setActiveSector] = useState("commercial");
  const [detailKey, setDetailKey] = useState(0);
  const pageRef = useSectorReveal();
  const selected = sectors.find((sector) => sector.id === activeSector);

  const selectSector = (id) => {
    if (id === activeSector) return;
    setActiveSector(id);
    setDetailKey((key) => key + 1);
  };

  return (
    <main className="sectorPage" ref={pageRef}>
      {/* HERO */}
      <section className="sectorHero">
        <div className="sectorHeroGlow" aria-hidden="true" />
        <div className="sectorHeroContent">
          <span className="sectorEyebrow sectorReveal sectorReveal--hero" data-reveal>
            <span /> AMC SOLUTIONS ACROSS INDUSTRIES
          </span>

          <h1 className="sectorReveal sectorReveal--hero" data-reveal style={{ "--delay": "100ms" }}>
            Every sector.
            <span>One trusted AMC partner.</span>
          </h1>

          <p className="sectorReveal sectorReveal--hero" data-reveal style={{ "--delay": "200ms" }}>
            From residential communities and housing societies to commercial
            establishments and industrial facilities, Liaison Bank delivers
            dependable Annual Maintenance Contract (AMC) services — covering
            maintenance, safety and licensing support across every property type.
          </p>

          <div className="sectorHeroActions sectorReveal sectorReveal--hero" data-reveal style={{ "--delay": "300ms" }}>
            <a href="/contact" className="sectorPrimaryBtn">
              Discuss your AMC requirements <ArrowIcon />
            </a>
            <a href="#sector-explorer" className="sectorTextLink">
              Explore sectors <span>↓</span>
            </a>
          </div>
        </div>

        <aside className="sectorHeroSide sectorReveal sectorReveal--right" data-reveal>
          <div className="sectorHeroOrbit" aria-hidden="true">
            <span className="sectorOrbitRing sectorOrbitRing--one" />
            <span className="sectorOrbitRing sectorOrbitRing--two" />
            <span className="sectorOrbitDot" />
            <div className="sectorHeroNumber">03</div>
          </div>
          <div className="sectorHeroSideText">
            <strong>Major sectors</strong>
            <span>One comprehensive AMC partner</span>
          </div>
          <div className="sectorHeroLine" />
          <span className="sectorHeroTag">MAINTAINING WHAT MATTERS</span>
        </aside>

        <div className="sectorHeroBottom" aria-hidden="true">
          <span>01 — RESIDENTIAL</span>
          <span>02 — COMMERCIAL</span>
          <span>03 — INDUSTRIAL</span>
        </div>
      </section>

      {/* SECTOR OVERVIEW */}
      <section className="sectorOverview" id="sector-explorer">
        <div className="sectorSectionHeading">
          <div data-reveal className="sectorReveal sectorReveal--up">
            <span className="sectorEyebrow dark">OUR INDUSTRY COVERAGE</span>
            <h2>
              AMC solutions designed
              <br />
              <span>for every environment.</span>
            </h2>
          </div>

          <p data-reveal className="sectorReveal sectorReveal--up" style={{ "--delay": "120ms" }}>
            Different properties. Different operational requirements. One
            dedicated partner for maintenance and support.
          </p>
        </div>

        <div className="sectorCards">
          {sectors.map((sector, index) => {
            const isActive = activeSector === sector.id;
            return (
              <button
                key={sector.id}
                type="button"
                className={`sectorCard ${isActive ? "active" : ""}`}
                onClick={() => selectSector(sector.id)}
                aria-pressed={isActive}
                aria-controls="sector-detail-panel"
                data-reveal
                style={{ "--delay": `${index * 110}ms` }}
              >
                <span className="sectorCardTop">
                  <span className="sectorCardNumber">{sector.number}</span>
                  <span className="sectorCardArrow"><ArrowIcon /></span>
                </span>

                <span className="sectorCardGraphic" aria-hidden="true">
                  <span className={`sectorGraphicShape sectorGraphicShape--${sector.id}`} />
                  <span className="sectorGraphicLine" />
                  <span className="sectorGraphicDot" />
                </span>

                <span className="sectorCardBottom">
                  <span className="sectorCardLabel">AMC SECTOR</span>
                  <span className="sectorCardTitle">{sector.shortName}</span>
                  <span className="sectorCardDescription">{sector.tagline}</span>
                  <span className="sectorCardExplore">
                    {isActive ? "Currently exploring" : "Explore sector"}
                    <span>↗</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* INDUSTRY EXPLORER */}
      <section className="sectorIndustries">
        <div className="sectorIndustriesHeader">
          <div data-reveal className="sectorReveal sectorReveal--left">
            <span className="sectorEyebrow dark">EXPLORE OUR COVERAGE</span>
            <h2>
              Industries we <span>serve.</span>
            </h2>
            <p>
              Explore the property types and establishments covered under
              Liaison Bank AMC services.
            </p>
          </div>

          <div className="sectorSwitcher sectorReveal sectorReveal--right" data-reveal role="tablist" aria-label="Choose a sector">
            {sectors.map((sector) => (
              <button
                key={sector.id}
                id={`tab-${sector.id}`}
                type="button"
                role="tab"
                aria-selected={activeSector === sector.id}
                aria-controls="sector-detail-panel"
                tabIndex={activeSector === sector.id ? 0 : -1}
                className={activeSector === sector.id ? "selected" : ""}
                onClick={() => selectSector(sector.id)}
              >
                {sector.shortName}
              </button>
            ))}
          </div>
        </div>

        <div
          className="sectorDetail"
          id="sector-detail-panel"
          role="tabpanel"
          aria-labelledby={`tab-${selected.id}`}
          key={detailKey}
        >
          <div className="sectorDetailIntro">
            <span className="sectorDetailKicker">{selected.number} / SECTOR</span>
            <div className="sectorDetailBigNumber" aria-hidden="true">{selected.number}</div>
            <h3>{selected.name}</h3>
            <h4>{selected.tagline}</h4>
            <p>{selected.description}</p>
            <div className="sectorDetailStats">
              <strong>{String(selected.items.length).padStart(2, "0")}</strong>
              <span>Property categories<br />covered in this sector</span>
            </div>
          </div>

          <div className="sectorIndustryList">
            <div className="sectorListHeading">
              <div>
                <span className="sectorListEyebrow">PROPERTY TYPES</span>
                <strong>Who we serve</strong>
              </div>
              <span className="sectorListCount">
                {String(selected.items.length).padStart(2, "0")} CATEGORIES
              </span>
            </div>

            <div className="sectorListGrid">
              {selected.items.map((item, index) => (
                <div
                  className="sectorListItem"
                  key={`${selected.id}-${item}`}
                  style={{ "--item-index": index }}
                >
                  <span className="sectorListNumber">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="sectorListName">{item}</span>
                  <span className="sectorListArrow"><ArrowIcon /></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="sectorWhy" aria-labelledby="why-choose-heading">
        <div className="sectorSectionHeading">
          <div data-reveal className="sectorReveal sectorReveal--up">
            <span className="sectorEyebrow dark">WHY CHOOSE LIAISON BANK</span>
            <h2 id="why-choose-heading">
              A maintenance partner
              <br />
              <span>built on trust.</span>
            </h2>
          </div>
          <p data-reveal className="sectorReveal sectorReveal--up" style={{ "--delay": "120ms" }}>
            Reliable AMC support across residential, commercial and industrial
            sectors — with clear accountability, preventive care and compliance
            you can depend on.
          </p>
        </div>

        <div className="sectorWhyGrid">
          {whyChooseUs.map((item, index) => (
            <article
              key={item.number}
              className="sectorWhyCard"
              data-reveal
              style={{ "--delay": `${index * 80}ms` }}
            >
              <span className="sectorWhyNumber">{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="sectorProcess" aria-labelledby="process-heading">
        <div className="sectorSectionHeading">
          <div data-reveal className="sectorReveal sectorReveal--up">
            <span className="sectorEyebrow dark">HOW IT WORKS</span>
            <h2 id="process-heading">
              Our AMC process,
              <br />
              <span>step by step.</span>
            </h2>
          </div>
          <p data-reveal className="sectorReveal sectorReveal--up" style={{ "--delay": "120ms" }}>
            From the first assessment to ongoing reporting — a clear, transparent
            path to dependable maintenance.
          </p>
        </div>

        <ol className="sectorProcessTrack">
          {processSteps.map((step, index) => (
            <li
              key={step.step}
              className="sectorProcessStep"
              data-reveal
              style={{ "--delay": `${index * 90}ms` }}
            >
              <span className="sectorProcessDot" aria-hidden="true" />
              <span className="sectorProcessStepNumber">{step.step}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="sectorFAQ" aria-labelledby="faq-heading">
        <div className="sectorSectionHeading">
          <div data-reveal className="sectorReveal sectorReveal--up">
            <span className="sectorEyebrow dark">FREQUENTLY ASKED QUESTIONS</span>
            <h2 id="faq-heading">
              Answers to common
              <br />
              <span>AMC questions.</span>
            </h2>
          </div>
          <p data-reveal className="sectorReveal sectorReveal--up" style={{ "--delay": "120ms" }}>
            Everything you need to know about AMC services across our sectors.
          </p>
        </div>

        <div className="sectorFAQList">
          {faqs.map((faq, index) => (
            <details
              key={faq.question}
              className="sectorFAQItem"
              data-reveal
              style={{ "--delay": `${index * 60}ms` }}
              open={index === 0}
            >
              <summary>
                <span>{faq.question}</span>
                <span className="sectorFAQIcon" aria-hidden="true" />
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="sectorCTA sectorReveal sectorReveal--clip" data-reveal>
        <div className="sectorCTAGlow" aria-hidden="true" />
        <div className="sectorCTAContent">
          <span className="sectorEyebrow">
            <span /> YOUR PROPERTY. OUR RESPONSIBILITY.
          </span>
          <h2>
            Let’s build a smarter
            <br />
            maintenance plan.
          </h2>
          <p>
            Get dependable AMC support for your property, business or
            industrial facility.
          </p>
        </div>
        <a href="/quote-cart" className="sectorPrimaryBtn light">
          Get an AMC consultation <ArrowIcon />
        </a>
      </section>

      {/* SEO: FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
    </main>
  );
}