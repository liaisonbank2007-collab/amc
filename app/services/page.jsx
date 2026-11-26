"use client";

import { useEffect } from "react";
import Link from "next/link";
import "./AMCServicesPage.scss";

const services = [
  {
    icon: "/images/FireExtinguisherandFlameShieldIcon.png",
    title: "Fire Extinguisher Refilling",
    slug: "fire-extinguisher-refilling",
    desc: "Professional fire extinguisher inspection, refilling and maintenance support to help keep your fire protection equipment ready.",
    tag: "Fire Protection",
  },
  {
    icon: "/images/GovernmentCertifiedAuthorityicon.png",
    title: "Fire Safety Audit",
    slug: "fire-safety-audit",
    desc: "Fire safety inspections, audit coordination and maintenance-related support for commercial and industrial premises.",
    tag: "Safety & Inspection",
  },
  {
    icon: "/images/HandheldMultimeterwithLightningProbe.png",
    title: "Electrical Audit",
    slug: "electrical-audit",
    desc: "Electrical system inspections and audit-related maintenance support to help identify potential operational risks.",
    tag: "Electrical Safety",
  },
  {
    icon: "/images/OrangeHandledPipelineValveIcon.png",
    title: "PNG Infrastructure Audit",
    slug: "png-infrastructure-audit",
    desc: "PNG pipeline and gas infrastructure inspection support to help maintain safe and reliable gas installations.",
    tag: "Gas Infrastructure",
  },
  {
    icon: "/images/OrangeShieldBugEmblem.png",
    title: "Pest Control",
    slug: "pest-control",
    desc: "Preventive pest management solutions designed for restaurants, hotels, offices and other commercial environments.",
    tag: "Hygiene & Protection",
  },
  {
    icon: "/images/WaterDropandTestTubeIcon.png",
    title: "Water Tank Cleaning",
    slug: "water-tank-cleaning",
    desc: "Scheduled water tank cleaning and maintenance services to support hygienic water storage and facility upkeep.",
    tag: "Water Hygiene",
  },
  {
    icon: "/images/CharcoalChecklistDocumentIcon.png",
    title: "License Renewal Assistance",
    slug: "license-renewal-assistance",
    desc: "Assistance with tracking license validity, renewal requirements and associated documentation for businesses.",
    tag: "Business Licensing",
  },
];

const industries = [
  { icon: "🍽️", title: "Restaurants & F&B", desc: "Restaurants, cafes, cloud kitchens, bakeries and food establishments." },
  { icon: "🏨", title: "Hotels & Hospitality", desc: "Hotels, resorts, banquet halls and hospitality facilities." },
  { icon: "🏥", title: "Healthcare", desc: "Hospitals, clinics, nursing homes and healthcare facilities." },
  { icon: "🏢", title: "Commercial Offices", desc: "Corporate offices, business centres and commercial properties." },
  { icon: "🏭", title: "Industrial Facilities", desc: "Factories, warehouses, manufacturing and industrial units." },
  { icon: "🛍️", title: "Retail & Commercial", desc: "Shopping outlets, supermarkets and retail establishments." },
];

const process = [
  { no: "01", title: "Site Assessment", desc: "Understand your premises, infrastructure and maintenance requirements." },
  { no: "02", title: "AMC Planning", desc: "Identify relevant services and develop a suitable maintenance plan." },
  { no: "03", title: "Scheduled Maintenance", desc: "Coordinate planned inspections and maintenance activities." },
  { no: "04", title: "Reports & Support", desc: "Maintain service records and provide ongoing assistance." },
];

const benefits = [
  ["01", "One Service Partner", "Coordinate multiple maintenance requirements through one professional service partner."],
  ["02", "Preventive Maintenance", "Plan periodic maintenance to identify potential issues before they become major concerns."],
  ["03", "Improved Reliability", "Support the consistent operation of essential business infrastructure."],
  ["04", "Safety Focused", "Prioritise fire safety, electrical inspections and infrastructure upkeep."],
  ["05", "Dedicated Support", "Get assistance with service coordination and recurring maintenance requirements."],
  ["06", "Long-Term Support", "Build a structured approach to maintaining your commercial premises."],
];

const faqs = [
  {
    q: "What are AMC services?",
    a: "Annual Maintenance Contract (AMC) services are planned maintenance arrangements designed to support the inspection, upkeep and servicing of business infrastructure and essential equipment over an agreed period.",
  },
  {
    q: "Which AMC services does Liaison Bank provide?",
    a: "Liaison Bank offers fire extinguisher refilling, fire safety audit support, electrical audit support, PNG infrastructure audits, pest control, water tank cleaning and license renewal assistance.",
  },
  {
    q: "Which industries can benefit from AMC services?",
    a: "Restaurants, hotels, hospitals, clinics, offices, factories, warehouses, retail outlets, commercial kitchens and other commercial establishments can benefit from structured AMC services.",
  },
  {
    q: "Can I choose individual AMC services?",
    a: "Yes. Businesses can enquire about individual maintenance services or discuss a combination of services based on their premises, operational requirements and service scope.",
  },
  {
    q: "How can I request an AMC quotation?",
    a: "Contact Liaison Bank through the enquiry form or contact details on our website. Share your business type, location and required services to discuss a suitable quotation.",
  },
  {
    q: "Does Liaison Bank provide AMC services for restaurants and hotels?",
    a: "Yes. Our service offerings include fire safety, pest control, electrical audit, PNG infrastructure audit, water tank cleaning and license renewal assistance for restaurants, hotels and hospitality establishments.",
  },
];

export default function AMCServicesPage() {
  useEffect(() => {
    const elements = document.querySelectorAll(
      ".amc-services-page .amc-reveal"
    );

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) =>
        element.classList.add("amc-visible")
      );
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("amc-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -45px 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="amc-services-page">

      {/* HERO */}
      <section className="amc-hero">
        <div className="amc-hero-grid" />

        <div className="amc-hero-content amc-reveal amc-reveal--hero">
          <h1>
            Complete AMC Services
            <span> For Smarter Businesses.</span>
          </h1>

          <p>
            One professional partner for essential business maintenance.
            From fire safety and electrical audits to pest control,
            water tank cleaning and licensing assistance.
          </p>

          <div className="amc-hero-actions">
            <Link href="/quote-cart" className="amc-btn-primary">
              Get AMC Quote <span>↗</span>
            </Link>

            <a href="#our-amc-services" className="amc-btn-outline">
              Explore Our Services <span>↓</span>
            </a>
          </div>

          <div className="amc-hero-bottom">
            <span>SAFETY</span>
            <i />
            <span>MAINTENANCE</span>
            <i />
            <span>BUSINESS SUPPORT</span>
          </div>
        </div>

        <div className="amc-hero-visual amc-reveal amc-reveal--zoom">
          <div className="amc-orbit orbit-one" />
          <div className="amc-orbit orbit-two" />

          <div className="amc-hero-center">
            {/* <span className="amc-center-icon">LB</span> */}
            <strong>AMC</strong>
            <small>CARE FOR YOUR BUSINESS</small>
          </div>

          <div className="amc-floating-card float-top">
            <span>✳</span>
            <div>
              <strong>7 Core Services</strong>
              <small>One Service Partner</small>
            </div>
          </div>

          <div className="amc-floating-card float-bottom">
            <span>✓</span>
            <div>
              <strong>Planned Maintenance</strong>
              <small>Structured Service Support</small>
            </div>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="amc-intro">
        <div className="amc-section-label amc-reveal amc-reveal--fade">
          01 / ABOUT OUR AMC
        </div>

        <div className="amc-intro-layout">
          <h2 className="amc-reveal amc-reveal--left">
            Your Business Deserves
            <span> Consistent Care.</span>
          </h2>

          <div className="amc-intro-copy amc-reveal amc-reveal--right">
            <p>
              Managing multiple maintenance requirements should not
              distract you from running your business. Liaison Bank
              brings essential Annual Maintenance Contract services
              together through a coordinated service approach.
            </p>

            <p>
              We support commercial establishments with fire safety,
              electrical inspections, PNG infrastructure audits,
              pest management, water tank cleaning and license renewal
              assistance. Our objective is to simplify maintenance
              coordination and help businesses maintain their facilities.
            </p>

            <Link href="/about-us" className="amc-text-link">
              Discover Liaison Bank <span>↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="amc-services-section" id="our-amc-services">
        <div className="amc-section-label amc-reveal amc-reveal--fade">
          02 / WHAT WE DO
        </div>

        <div className="amc-section-heading amc-reveal amc-reveal--up">
          <div>
            <span className="amc-orange-label">OUR EXPERTISE</span>
            <h2>
              Essential Services.
              <span> One Reliable Partner.</span>
            </h2>
          </div>

          <p>
            Explore our range of AMC services designed to support
            the safety, hygiene and maintenance needs of commercial
            and industrial establishments.
          </p>
        </div>

        <div className="amc-service-list">
          {services.map((service, index) => (
            <article
              className="amc-service-row amc-reveal amc-reveal--service"
              key={service.slug}
              style={{ "--delay": `${index * 100}ms` }}
            >
              <span className="amc-service-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="amc-service-icon">
                <img src={service.icon} alt="" loading="lazy" />
              </div>

              <div className="amc-service-copy">
                <span className="amc-service-tag">{service.tag}</span>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
              </div>

              <Link
                href={`services/${service.slug}`}
                className="amc-service-link"
                aria-label={`Explore ${service.title}`}
              >
                <span>Explore Service</span>
                <span aria-hidden="true">↗</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="amc-industries">
        <div className="amc-industries-heading amc-reveal amc-reveal--right">
          <div>
            <div className="amc-section-label">
              03 / INDUSTRIES WE SERVE
            </div>

            <h2>
              Supporting Businesses
              <span> Across Industries.</span>
            </h2>
          </div>

          <p>
            Our AMC service portfolio addresses the recurring
            maintenance needs of diverse commercial and industrial
            environments.
          </p>
        </div>

        <div className="amc-industry-grid">
          {industries.map((item, index) => (
            <div
              className="amc-industry-card amc-reveal amc-reveal--flip"
              key={item.title}
              style={{ "--delay": `${index * 120}ms` }}
            >
              <span className="amc-industry-number">
                0{index + 1}
              </span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="amc-why">
        <div className="amc-why-heading amc-reveal amc-reveal--left">
          <div className="amc-section-label">
            04 / WHY LIAISON BANK
          </div>

          <h2>
            Maintenance Made
            <span> More Manageable.</span>
          </h2>

          <p>
            A structured approach to essential maintenance,
            service coordination and long-term business support.
          </p>
        </div>

        <div className="amc-benefits-grid">
          {benefits.map((item, index) => (
            <div
              className="amc-benefit amc-reveal amc-reveal--blur"
              key={item[0]}
              style={{ "--delay": `${index * 110}ms` }}
            >
              <span>{item[0]}</span>
              <h3>{item[1]}</h3>
              <p>{item[2]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="amc-process">
        <div className="amc-section-label amc-reveal amc-reveal--fade">
          05 / HOW WE WORK
        </div>

        <div className="amc-process-heading amc-reveal amc-reveal--up">
          <h2>
            A Clear Process.
            <span> Consistent Support.</span>
          </h2>

          <p>
            From understanding your requirements to ongoing
            service coordination, we keep the process structured.
          </p>
        </div>

        <div className="amc-process-grid">
          {process.map((step, index) => (
            <div
              className="amc-process-step amc-reveal amc-reveal--process"
              key={step.no}
              style={{ "--delay": `${index * 150}ms` }}
            >
              <span className="amc-process-number">{step.no}</span>

              <div className="amc-process-line">
                <span />
              </div>

              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="amc-faq">
        <div className="amc-faq-heading amc-reveal amc-reveal--left">
          <div className="amc-section-label">
            06 / COMMON QUESTIONS
          </div>

          <h2>
            Frequently Asked
            <span> Questions.</span>
          </h2>

          <p>
            Learn more about our AMC services and how we support
            commercial maintenance requirements.
          </p>
        </div>

        <div className="amc-faq-list">
          {faqs.map((faq, index) => (
            <details
              className="amc-faq-item amc-reveal amc-reveal--faq"
              key={faq.q}
              style={{ "--delay": `${index * 100}ms` }}
            >
              <summary>
                <span className="amc-faq-index">
                  0{index + 1}
                </span>
                <strong>{faq.q}</strong>
                <span className="amc-faq-toggle">+</span>
              </summary>

              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="amc-final-cta">
        <div className="amc-cta-content amc-reveal amc-reveal--clip">
          <span>LET'S TAKE CARE OF YOUR BUSINESS</span>

          <h2>
            Focus on Growing.
            <br />
            <em>We'll Help with the Maintenance.</em>
          </h2>

          <p>
            Discuss your maintenance requirements with Liaison Bank
            and explore a suitable AMC service plan for your business.
          </p>

          <Link href="/contact" className="amc-cta-button">
            Get Your AMC Quote <span>↗</span>
          </Link>
        </div>

        <div className="amc-cta-watermark amc-reveal amc-reveal--zoom">
          AMC
        </div>
      </section>

    </main>
  );
}