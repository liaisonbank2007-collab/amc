import React from "react";
import Link from "next/link";

import "./privacy.scss";

export const metadata = {
  title: "Privacy Policy · Liaison Bank",
  description:
    "How Liaison Bank collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "1 January 2025";

export default function PrivacyPolicyPage() {
  return (
    <main className="legal">
      <div className="legal-goldline" aria-hidden="true" />

      <div className="legal-inner">
        {/* ── Breadcrumb ───────────────────────────── */}
        <nav className="legal-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="legal-breadcrumb-sep">·</span>
          <span aria-current="page">Privacy Policy</span>
        </nav>

        {/* ── Masthead ─────────────────────────────── */}
        <header className="legal-header">
          <span className="legal-eyebrow">Legal</span>
          <h1 className="legal-title">Privacy Policy</h1>
          <div className="legal-masthead-rule" aria-hidden="true">
            <span className="legal-masthead-ornament">✦</span>
          </div>
          <p className="legal-subtitle">
            <em>
              Your trust is the foundation of our practice. This policy
              explains how we handle your information with the same care we
              bring to your regulatory matters.
            </em>
          </p>
          <p className="legal-meta">Last updated · {LAST_UPDATED}</p>
        </header>

        <div className="legal-ornament" aria-hidden="true">
          <span className="legal-ornament-line" />
          <span className="legal-ornament-mark">❖</span>
          <span className="legal-ornament-line" />
        </div>

        {/* ── Body ─────────────────────────────────── */}
        <article className="legal-body">
          <section>
            <h2>1. Introduction</h2>
            <p>
              Liaison Bank ("we", "us", or "our") is committed to protecting
              the privacy and confidentiality of the personal information you
              share with us. This Privacy Policy describes how we collect, use,
              disclose, and safeguard your information when you visit our
              website or engage our licensing, regulatory compliance, and
              project liaisoning services.
            </p>
            <p>
              By accessing our website or using our services, you consent to
              the practices described in this policy. If you do not agree with
              any part of this policy, please discontinue use of our website
              and services.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <p>
              We may collect the following categories of information:
            </p>
            <ul>
              <li>
                <strong>Information you provide directly</strong> — your name,
                email address, phone number, company name, and any details you
                submit through our contact forms or correspondence.
              </li>
              <li>
                <strong>Information collected automatically</strong> — IP
                address, browser type, device information, pages visited, and
                other analytical data gathered through cookies and similar
                technologies.
              </li>
              <li>
                <strong>Information from third parties</strong> — where you have
                authorised us to receive information from a representative,
                regulatory body, or business partner in connection with a
                mandate.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Respond to enquiries and provide our services.</li>
              <li>
                Prepare, file, and manage regulatory applications on your
                behalf.
              </li>
              <li>
                Communicate updates, insights, and material relevant to your
                mandate.
              </li>
              <li>
                Comply with legal, regulatory, and professional obligations.
              </li>
              <li>
                Improve the quality, security, and performance of our website
                and services.
              </li>
            </ul>
          </section>

          <section>
            <h2>4. Legal Basis for Processing</h2>
            <p>
              Where applicable, we process personal information on the basis of
              your consent, the performance of a contract, compliance with a
              legal obligation, or our legitimate interest in operating and
              improving our practice.
            </p>
          </section>

          <section>
            <h2>5. Sharing of Information</h2>
            <p>
              We do not sell your personal information. We may share
              information only:
            </p>
            <ul>
              <li>
                With regulatory authorities, where required in connection with
                a filing or mandate.
              </li>
              <li>
                With trusted service providers who assist us in operating our
                website and delivering our services, under confidentiality
                obligations.
              </li>
              <li>
                Where required by law, court order, or a competent authority.
              </li>
              <li>
                In connection with a merger, acquisition, or restructuring of
                our firm, subject to this policy.
              </li>
            </ul>
          </section>

          <section>
            <h2>6. Data Retention</h2>
            <p>
              We retain personal information only for as long as necessary to
              fulfil the purposes described in this policy, to comply with our
              legal and regulatory obligations, or to resolve disputes. When
              information is no longer required, we securely delete or
              anonymise it.
            </p>
          </section>

          <section>
            <h2>7. Data Security</h2>
            <p>
              We implement reasonable technical and organisational measures to
              protect your information against unauthorised access, loss, or
              alteration. However, no method of transmission or storage is
              completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2>8. Your Rights</h2>
            <p>
              Subject to applicable law, you may have the right to access,
              correct, or delete your personal information, to restrict or
              object to its processing, or to withdraw your consent at any
              time. To exercise these rights, please contact us using the
              details below.
            </p>
          </section>

          <section>
            <h2>9. Cookies</h2>
            <p>
              Our website uses cookies and similar technologies to enhance your
              experience and analyse traffic. You can manage or disable cookies
              through your browser settings; however, some features of the
              website may not function properly as a result.
            </p>
          </section>

          <section>
            <h2>10. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not
              responsible for the privacy practices or content of those sites,
              and we encourage you to review their respective privacy policies.
            </p>
          </section>

          <section>
            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The revised
              version will be posted on this page with an updated "Last
              updated" date. We encourage you to review this page periodically.
            </p>
          </section>

          <section>
            <h2>12. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or how your
              information is handled, please reach out:
            </p>
            <address className="legal-address">
              <strong>Liaison Bank</strong>
              <br />
              Plot 466, New Apollo CHSL, Beside Blue Tokai Cafe,
              <br />
              14th Road, Khar West, Mumbai – 400052
              <br />
              <a href="mailto:ceo.desk@liaisonbank.com">
                ceo.desk@liaisonbank.com
              </a>
              <br />
              <a href="tel:+919769458515">+91 97694 58515</a>
            </address>
          </section>
        </article>

        {/* ── Back link ────────────────────────────── */}
        <div className="legal-footer">
          <Link href="/" className="legal-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Return to home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}