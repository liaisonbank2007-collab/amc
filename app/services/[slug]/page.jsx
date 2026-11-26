
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import services, {
  commonIndustries,
  commonBenefits,
} from "@/data/amcServiceDetails";
import "./AMCServiceDetail.scss";

const SITE_URL = "https://liaisonbank.com";

export function generateStaticParams() {
  return Object.keys(services).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = services[slug];

  if (!service) {
    return {
      title: "Service Not Found | Liaison Bank",
      robots: { index: false, follow: false },
    };
  }

  const url = `${SITE_URL}/our-services/amc/${slug}`;

  return {
    title: service.seoTitle,
    description: service.seoDescription,
    keywords: service.keywords,

    alternates: {
      canonical: url,
    },

    openGraph: {
      title: service.seoTitle,
      description: service.seoDescription,
      url,
      siteName: "Liaison Bank",
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: `${SITE_URL}${service.icon}`,
          alt: service.title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: service.seoTitle,
      description: service.seoDescription,
      images: [`${SITE_URL}${service.icon}`],
    },
  };
}

function StructuredData({ data }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

export default async function AMCServiceDetailPage({ params }) {
  const { slug } = await params;
  const service = services[slug];

  if (!service) notFound();

  const currentUrl = `${SITE_URL}/our-services/amc/${slug}`;

  const relatedServices = Object.entries(services)
    .filter(([serviceSlug]) => serviceSlug !== slug)
    .slice(0, 3);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.seoDescription,
    serviceType: service.category,
    url: currentUrl,
    image: `${SITE_URL}${service.icon}`,
    provider: {
      "@type": "Organization",
      name: "Liaison Bank",
      url: SITE_URL,
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "AMC Services",
        item: `${SITE_URL}/our-services/amc`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: service.title,
        item: currentUrl,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <main className="amc-detail-page">

      <StructuredData data={serviceSchema} />
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={faqSchema} />

      {/* BREADCRUMB */}

      <nav className="amc-detail-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/services">AMC Services</Link>
        <span>/</span>
        <span aria-current="page">{service.title}</span>
      </nav>

      {/* HERO */}

      <section className="amc-detail-hero">

        <div className="amc-detail-hero-content">

          {/* <span className="amc-detail-eyebrow">
            <i />
            LIAISON BANK / {service.category}
          </span> */}

          <h1>
            {service.heroTitle}
            <span>{service.heroHighlight}</span>
          </h1>

          <p>{service.heroDescription}</p>

          <div className="amc-detail-actions">
            <Link href="/quote-cart" className="amc-detail-primary">
              Get Service Quote <span>↗</span>
            </Link>

            <Link href="/contact" className="amc-detail-secondary">
              Talk to Our Team <span>→</span>
            </Link>
          </div>

          <div className="amc-detail-trust">
            <span>PLANNED MAINTENANCE</span>
            <i />
            <span>BUSINESS SUPPORT</span>
            <i />
            <span>AMC SOLUTIONS</span>
          </div>

        </div>

        <div className="amc-detail-visual">

          <div className="amc-detail-orbit orbit-a" />
          <div className="amc-detail-orbit orbit-b" />

          <div className="amc-detail-icon-card">
            <div className="amc-detail-icon">
              <Image
                src={service.icon}
                alt={service.title}
                width={110}
                height={110}
                priority
              />
            </div>

            <span>AMC SERVICE</span>
            <strong>{service.shortTitle}</strong>
            <small>BY LIAISON BANK</small>
          </div>

          <div className="amc-detail-floating floating-a">
            <span>✓</span>
            <div>
              <strong>Structured Support</strong>
              <small>Planned Service Coordination</small>
            </div>
          </div>

          <div className="amc-detail-floating floating-b">
            <span>✳</span>
            <div>
              <strong>Business Focused</strong>
              <small>Maintenance Solutions</small>
            </div>
          </div>

        </div>

      </section>

      {/* INTRODUCTION */}

      <section className="amc-detail-intro">

        <div className="amc-detail-section-label">
          01 / ABOUT THIS SERVICE
        </div>

        <div className="amc-detail-two-column">

          <h2>
            {service.introTitle}
          </h2>

          <div className="amc-detail-copy">
            {service.intro.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}

            <Link href="/about-us">
              Discover Liaison Bank <span>↗</span>
            </Link>
          </div>

        </div>

      </section>

      {/* CHALLENGES */}

      <section className="amc-detail-challenges">

        <div className="amc-detail-heading">
          <span>02 / BUSINESS CHALLENGES</span>

          <h2>
            Why Does This Service
            <strong> Matter to Your Business?</strong>
          </h2>

          <p>
            Managing essential business infrastructure requires
            attention to recurring maintenance, inspections and
            operational requirements.
          </p>
        </div>

        <div className="amc-detail-challenge-grid">

          {service.challenges.map((item, index) => (
            <div className="amc-challenge-item" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{item}</p>
              <i>↗</i>
            </div>
          ))}

        </div>

      </section>

      {/* SERVICE SCOPE */}

      <section className="amc-detail-scope">

        <div className="amc-detail-scope-heading">

          <span className="amc-detail-section-label">
            03 / SERVICE SCOPE
          </span>

          <h2>
            What Our
            <strong> {service.title} </strong>
            Service Covers.
          </h2>

          <p>
            Service activities are planned according to the
            establishment, infrastructure and mutually agreed
            maintenance requirements.
          </p>

        </div>

        <div className="amc-detail-scope-list">

          {service.scope.map((item, index) => (
            <div className="amc-scope-item" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{item}</p>
              <i>✓</i>
            </div>
          ))}

        </div>

      </section>

      {/* INDUSTRIES */}

      <section className="amc-detail-industries">

        <div className="amc-detail-heading">
          <span>04 / INDUSTRIES WE SERVE</span>

          <h2>
            Supporting Different
            <strong> Business Environments.</strong>
          </h2>

          <p>
            Our service coordination approach can support
            different commercial and industrial establishments.
          </p>
        </div>

        <div className="amc-detail-industry-grid">

          {commonIndustries.map((industry, index) => (
            <div key={industry} className="amc-detail-industry">
              <span>0{index + 1}</span>
              <h3>{industry}</h3>
            </div>
          ))}

        </div>

      </section>

      {/* WHY LIAISON BANK */}

      <section className="amc-detail-benefits">

        <div className="amc-detail-heading">
          <span>05 / WHY LIAISON BANK</span>

          <h2>
            One Partner.
            <strong> Better Maintenance Coordination.</strong>
          </h2>
        </div>

        <div className="amc-detail-benefit-grid">

          {commonBenefits.map((benefit, index) => (
            <article key={benefit.title}>
              <span>0{index + 1}</span>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          ))}

        </div>

      </section>

      {/* PROCESS */}

      <section className="amc-detail-process">

        <div className="amc-detail-heading">
          <span>06 / OUR PROCESS</span>

          <h2>
            From Assessment
            <strong> to Ongoing Support.</strong>
          </h2>

          <p>{service.processDescription}</p>
        </div>

        <div className="amc-detail-process-grid">

          {[
            ["01", "Site Assessment", "Understand your premises and service requirements."],
            ["02", "AMC Planning", "Identify the appropriate service scope and schedule."],
            ["03", "Service Coordination", "Coordinate agreed inspections and maintenance activities."],
            ["04", "Reports & Support", "Maintain relevant records and provide follow-up assistance."],
          ].map((step) => (
            <article key={step[0]}>
              <span>{step[0]}</span>
              <div />
              <h3>{step[1]}</h3>
              <p>{step[2]}</p>
            </article>
          ))}

        </div>

      </section>

      {/* RELATED SERVICES */}

      <section className="amc-detail-related">

        <div className="amc-detail-heading">
          <span>07 / EXPLORE MORE SERVICES</span>

          <h2>
            More Ways We
            <strong> Support Your Business.</strong>
          </h2>
        </div>

        <div className="amc-related-grid">

          {relatedServices.map(([relatedSlug, related]) => (
            <Link
              href={`/services/${relatedSlug}`}
              className="amc-related-card"
              key={relatedSlug}
            >
              <div className="amc-related-icon">
                <Image
                  src={related.icon}
                  alt=""
                  width={48}
                  height={48}
                />
              </div>

              <span>{related.category}</span>
              <h3>{related.title}</h3>
              <i>Explore Service ↗</i>
            </Link>
          ))}

        </div>

        <Link href="/our-services/amc" className="amc-all-services">
          View All AMC Services <span>↗</span>
        </Link>

      </section>

      {/* FAQ */}

      <section className="amc-detail-faq">

        <div className="amc-detail-faq-heading">

          <span>08 / FREQUENTLY ASKED QUESTIONS</span>

          <h2>
            Everything You
            <strong> Need to Know.</strong>
          </h2>

          <p>
            Find answers to common questions about {service.title.toLowerCase()}
            and our AMC service support.
          </p>

        </div>

        <div className="amc-detail-faq-list">

          {service.faqs.map((faq, index) => (
            <details key={faq.q} className="amc-detail-faq-item">

              <summary>
                <span>0{index + 1}</span>
                <strong>{faq.q}</strong>
                <i>+</i>
              </summary>

              <p>{faq.a}</p>

            </details>
          ))}

        </div>

      </section>

      {/* FINAL CTA */}

      <section className="amc-detail-cta">

        <div className="amc-detail-cta-watermark">AMC</div>

        <div className="amc-detail-cta-content">

          <span>YOUR BUSINESS. OUR SERVICE SUPPORT.</span>

          <h2>
            Let's Plan Your
            <strong> {service.title} Requirements.</strong>
          </h2>

          <p>
            Connect with Liaison Bank to discuss your premises,
            maintenance requirements and a suitable AMC service plan.
          </p>

          <Link href="/quote-cart">
            Request a Service Quote <span>↗</span>
          </Link>

        </div>

      </section>

    </main>
  );
}
