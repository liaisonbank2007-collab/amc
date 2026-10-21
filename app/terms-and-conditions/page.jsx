import React from "react";
import Link from "next/link";

import "./terms.scss";

export const metadata = {
  title: "Terms & Conditions · Liaison Bank",
  description:
    "The terms governing your use of Liaison Bank's website and services.",
};

const LAST_UPDATED = "1 January 2025";

export default function TermsAndConditionsPage() {
  return (
    <main className="legal">
      <div className="legal-goldline" aria-hidden="true" />

      <div className="legal-inner">
        {/* ── Breadcrumb ───────────────────────────── */}
        <nav className="legal-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="legal-breadcrumb-sep">·</span>
          <span aria-current="page">Terms &amp; Conditions</span>
        </nav>

        {/* ── Masthead ─────────────────────────────── */}
        <header className="legal-header">
          <span className="legal-eyebrow">Legal</span>
          <h1 className="legal-title">Terms &amp; Conditions</h1>
          <div className="legal-masthead-rule" aria-hidden="true">
            <span className="legal-masthead-ornament">✦</span>
          </div>
          <p className="legal-subtitle">
            <em>
              Please read these terms carefully. By accessing our website or
              engaging our services, you agree to be bound by them.
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
            <h2>1. Acceptance of Terms</h2>
            <p>
              These Terms &amp; Conditions ("Terms") govern your access to and
              use of the website and services of Liaison Bank ("we", "us", or
              "our"). By accessing our website, submitting an enquiry, or
              engaging our services, you confirm that you have read, understood,
              and agree to be bound by these Terms. If you do not agree, please
              discontinue use of our website and services.
            </p>
          </section>

          <section>
            <h2>2. About Our Services</h2>
            <p>
              Liaison Bank provides licensing, regulatory compliance, and
              project liaisoning services. The information on this website is
              provided for general informational purposes only and does not
              constitute legal, financial, or professional advice. Any
              engagement of our services is subject to a separate written
              agreement or engagement letter.
            </p>
          </section>

          <section>
            <h2>3. Use of the Website</h2>
            <p>You agree to use our website lawfully and responsibly. You must not:</p>
            <ul>
              <li>
                Use the website in any way that breaches applicable laws or
                regulations.
              </li>
              <li>
                Attempt to gain unauthorised access to our systems, servers, or
                data.
              </li>
              <li>
                Introduce viruses, malware, or any other harmful code.
              </li>
              <li>
                Copy, reproduce, or redistribute any content from the website
                without our prior written consent.
              </li>
              <li>
                Use the website to transmit unsolicited commercial
                communications.
              </li>
            </ul>
          </section>

          <section>
            <h2>4. Intellectual Property</h2>
            <p>
              All content on this website — including text, graphics, logos,
              images, and software — is the property of Liaison Bank or its
              licensors and is protected by applicable intellectual property
              laws. You may not reproduce, modify, distribute, or use any
              content without our express written permission.
            </p>
          </section>

          <section>
            <h2>5. Engagements and Fees</h2>
            <p>
              Where you engage our services, the scope of work, deliverables,
              timelines, and fees will be set out in a separate engagement
              letter or agreement. Fees are payable in accordance with the terms
              of that agreement and are exclusive of applicable taxes unless
              stated otherwise.
            </p>
          </section>

          <section>
            <h2>6. No Guarantee of Outcome</h2>
            <p>
              While we apply our professional expertise and diligence to every
              mandate, regulatory approvals and outcomes are determined by the
              relevant authorities. We do not guarantee any specific approval,
              timeline, or result unless expressly agreed in writing.
            </p>
          </section>

          <section>
            <h2>7. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites or
              resources. These are provided for convenience only, and we are not
              responsible for the content, accuracy, or practices of any
              third-party site. Accessing such sites is at your own risk.
            </p>
          </section>

          <section>
            <h2>8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Liaison Bank shall not be
              liable for any indirect, incidental, special, or consequential
              damages arising from your use of the website or services,
              including but not limited to loss of profits, data, or business
              opportunity. Our total liability in connection with any engagement
              shall be limited as set out in the relevant engagement letter.
            </p>
          </section>

          <section>
            <h2>9. Indemnity</h2>
            <p>
              You agree to indemnify and hold harmless Liaison Bank, its
              partners, employees, and agents from any claims, liabilities,
              damages, or expenses arising out of your breach of these Terms or
              your misuse of the website or services.
            </p>
          </section>

          <section>
            <h2>10. Confidentiality</h2>
            <p>
              Both parties agree to maintain the confidentiality of any
              non-public information shared in connection with an engagement,
              in accordance with the terms of the relevant agreement and
              applicable law.
            </p>
          </section>

          <section>
            <h2>11. Privacy</h2>
            <p>
              Your use of our website and services is also governed by our{" "}
              <Link href="/legal/privacy-policy">Privacy Policy</Link>, which
              explains how we collect, use, and protect your personal
              information.
            </p>
          </section>

          <section>
            <h2>12. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. The revised version
              will be posted on this page with an updated "Last updated" date.
              Your continued use of the website after changes are posted
              constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2>13. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the
              laws of India. Any disputes arising in connection with these Terms
              shall be subject to the exclusive jurisdiction of the courts at
              Mumbai, Maharashtra.
            </p>
          </section>

          <section>
            <h2>14. Contact Us</h2>
            <p>
              If you have any questions about these Terms &amp; Conditions,
              please reach out:
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