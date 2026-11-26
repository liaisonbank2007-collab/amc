import ContactPage from "@/components/ContactPage/ContactPage";

export const metadata = {
  title: "Contact Liaison Bank AMC | Business Maintenance & Facility Services",
  description:
    "Get in touch with Liaison Bank AMC for fire safety, electrical audits, pest control, water tank cleaning, PNG infrastructure and business maintenance enquiries. Response within one business day.",
  keywords: [
    "contact Liaison Bank AMC",
    "business maintenance services contact",
    "fire safety services enquiry",
    "electrical audit company",
    "pest control services",
    "water tank cleaning services",
    "PNG infrastructure services",
    "facility maintenance company Mumbai",
  ],
  alternates: {
    canonical: "https://liaisonbankamc.com/contact",
  },
  openGraph: {
    title: "Contact Liaison Bank AMC | Business Maintenance Services",
    description:
      "Reach the Liaison Bank AMC desk for fire safety, electrical audits, pest control, water tank cleaning, PNG infrastructure and business maintenance enquiries.",
    url: "https://liaisonbankamc.com/contact",
    siteName: "Liaison Bank AMC",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://liaisonbankamc.com/og/contact.jpg",
        width: 1200,
        height: 630,
        alt: "Liaison Bank AMC — Contact Desk",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Liaison Bank AMC | Business Maintenance Services",
    description:
      "Speak with our team about fire safety, electrical audits, pest control, water tank cleaning, PNG infrastructure and business maintenance.",
    images: ["https://liaisonbankamc.com/og/contact.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return <ContactPage />;
}