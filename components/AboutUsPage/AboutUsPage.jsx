"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  ShieldCheck, Flame, Zap, Bug, Droplets, Building2, Hotel, Utensils,
  Factory, HeartPulse, GraduationCap, ArrowRight, CheckCircle2,
  ClipboardCheck, Settings, Headphones, ChevronDown, Target, Eye,
  Wrench, BriefcaseBusiness, Sparkles,
} from "lucide-react";
import AMCNavbar from "@/components/Navbar/Navbar.jsx";

import "./AboutUsPage.scss";

/* =========================================================
   DATA
   ========================================================= */

const services = [
  { slug: "fire-extinguisher-refilling",   icon: "/images/FireExtinguisherandFlameShieldIcon.png", title: "Fire Extinguisher Refilling", desc: "Maintenance and refilling services for commercial fire extinguishers." },
  { slug: "fire-safety-audit",             icon: "/images/GovernmentCertifiedAuthorityicon.png", title: "Fire Safety Audit", desc: "Fire safety inspection, audit and maintenance-related support." },
  { slug: "electrical-audit",              icon: "/images/HandheldMultimeterwithLightningProbe.png", title: "Electrical Audit", desc: "Electrical inspection and audit-related maintenance services." },
  { slug: "png-infrastructure-audit",      icon: "/images/OrangeHandledPipelineValveIcon.png", title: "PNG Infrastructure Audit", desc: "Gas pipeline inspection and infrastructure maintenance support." },
  { slug: "pest-control",                  icon: "/images/OrangeShieldBugEmblem.png", title: "Pest Control", desc: "Preventive pest management for commercial establishments." },
  { slug: "water-tank-cleaning",           icon: "/images/WaterDropandTestTubeIcon.png", title: "Water Tank Cleaning", desc: "Scheduled cleaning and maintenance of water storage tanks." },
  { slug: "license-renewal-assistance",    icon: "/images/CharcoalChecklistDocumentIcon.png", title: "License Renewal Assistance", desc: "Support for license renewal and related maintenance requirements." },
];

const industries = [
  { icon: Utensils, title: "Food & Beverage", desc: "Restaurants, cafes, cloud kitchens, bakeries and commercial kitchens.", services: "Fire Safety · Pest Control · Electrical Audit · PNG · Water Tank Cleaning" },
  { icon: Hotel, title: "Hospitality", desc: "Hotels, resorts, banquet halls, clubs and hospitality properties.", services: "Fire Safety · Electrical Audit · Pest Control · Water Tank Cleaning" },
  { icon: HeartPulse, title: "Healthcare", desc: "Hospitals, clinics, nursing homes and diagnostic centres.", services: "Fire Safety · Electrical Audit · Pest Control · Water Tank Cleaning" },
  { icon: Building2, title: "Corporate & Commercial", desc: "Offices, IT parks, malls, retail stores and commercial buildings.", services: "Fire Safety · Electrical Audit · Pest Control · License Renewal" },
  { icon: Factory, title: "Industrial & Manufacturing", desc: "Factories, warehouses, textile units and manufacturing facilities.", services: "Fire Safety · Electrical Audit · Pest Control · Infrastructure Audit" },
  { icon: GraduationCap, title: "Education", desc: "Schools, colleges, universities and educational campuses.", services: "Fire Safety · Electrical Audit · Pest Control · Water Tank Cleaning" },
];

const benefits = [
  { icon: Building2, title: "Multiple Services", desc: "Different AMC service categories under one platform." },
  { icon: ClipboardCheck, title: "Planned Maintenance", desc: "Organized maintenance requirements and scheduled visits." },
  { icon: ShieldCheck, title: "Safety Focused", desc: "Maintenance support for essential business safety systems." },
  { icon: Settings, title: "Service Coordination", desc: "Structured communication and service coordination." },
  { icon: CheckCircle2, title: "Transparent Quotations", desc: "Clear service details and applicable quotation information." },
  { icon: Headphones, title: "Customer Support", desc: "Support for your recurring maintenance requirements." },
];

const process = [
  { icon: ClipboardCheck, title: "Explore Services", desc: "Browse AMC service categories." },
  { icon: Settings, title: "Select Requirements", desc: "Choose your services and plan options." },
  { icon: Building2, title: "Submit Enquiry", desc: "Share your business requirements." },
  { icon: Wrench, title: "Assessment & Quote", desc: "Coordinate assessment and quotation where required." },
  { icon: CheckCircle2, title: "Confirm AMC", desc: "Review and confirm your selected service plan." },
  { icon: Headphones, title: "Ongoing Support", desc: "Coordinate planned maintenance and service updates." },
];

const faqs = [
  { q: "What is Liaison Bank AMC?", a: "Liaison Bank AMC is a business maintenance service platform offering annual maintenance contracts and related services across multiple service categories." },
  { q: "Which industries can use your AMC services?", a: "We provide AMC services to restaurants, hotels, hospitals, clinics, offices, factories, retail establishments, educational institutions and other commercial businesses." },
  { q: "What maintenance services do you provide?", a: "Our services include fire extinguisher refilling, fire safety audits, electrical audits, PNG infrastructure audits, pest control, water tank cleaning and license renewal assistance." },
  { q: "Can I select multiple AMC services?", a: "Yes. You can explore and select multiple available AMC service categories based on your business requirements and applicable service terms." },
  { q: "How can I request a quotation?", a: "Browse the available services, select your requirements and submit an enquiry through our website." },
  { q: "Are AMC services available for multiple locations?", a: "You can submit your multi-location requirements to our team for service availability assessment and quotation." },
];

/* =========================================================
   ANIMATION PRIMITIVES — SMOOTHER EASING
   ========================================================= */

const EASE = [0.16, 1, 0.3, 1];
const EASE_SOFT = [0.25, 0.8, 0.25, 1];

const reveal = {
  hidden: { opacity: 0, y: 40, filter: "blur(4px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 1, ease: EASE },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

function AnimatedWords({ text, className = "", delay = 0 }) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text} style={{ display: "inline-block" }}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", marginRight: "0.25em" }}>
          <motion.span
            style={{ display: "inline-block", originY: 1 }}
            variants={{
              hidden: { y: "115%", rotate: 2, opacity: 0 },
              visible: {
                y: "0%", rotate: 0, opacity: 1,
                transition: { duration: 0.9, ease: EASE, delay: delay + i * 0.045 },
              },
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function SectionHeading({ eyebrow, title, description, light = false }) {
  return (
    <motion.div
      className={`about-heading ${light ? "light" : ""}`}
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3, margin: "-40px" }}
    >
      <motion.span
        className="about-eyebrow"
        variants={{
          hidden: { opacity: 0, x: -20, letterSpacing: "0.4em" },
          visible: { opacity: 1, x: 0, letterSpacing: "0.22em", transition: { duration: 0.9, ease: EASE } },
        }}
      >
        {eyebrow}
      </motion.span>
      <h2>
        <AnimatedWords text={title} />
      </h2>
      {description && (
        <motion.p variants={reveal}>{description}</motion.p>
      )}
    </motion.div>
  );
}

function Particles({ count = 12, reduce }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="anim-particle"
          style={{
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 100}%`,
            width: 4 + (i % 4) * 2,
            height: 4 + (i % 4) * 2,
          }}
          animate={reduce ? {} : {
            y: [0, -25 - (i % 5) * 8, 0],
            x: [0, (i % 2 ? 12 : -12), 0],
            opacity: [0.1, 0.45, 0.1],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 6 + (i % 6), repeat: Infinity, delay: i * 0.35, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}

function useParallax(ref, distance = 80) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  return useTransform(scrollYProgress, [0, 1], [distance, -distance]);
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function AboutUsPage() {
  const [activeFaq, setActiveFaq] = useState(null);
  const reduceMotion = useReducedMotion();

  const heroRef = useRef(null);
  const whoRef = useRef(null);
  const ctaRef = useRef(null);

  const heroY = useParallax(heroRef, 50);
  const whoY = useParallax(whoRef, 30);
  const ctaY = useParallax(ctaRef, 40);

  const safeTransition = reduceMotion ? { duration: 0 } : { duration: 1, ease: EASE };

  /* 3D hero card tilt */
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMove = (e) => {
    if (reduceMotion || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: py * -10, ry: px * 10 });
  };

  const handleLeave = () => setTilt({ rx: 0, ry: 0 });

  return (
    <>
      <AMCNavbar />

      <main className="lb-about">

        {/* ============ 01. HERO ============ */}
        <section className="about-hero" ref={heroRef}>
          <motion.div className="hero-orb orb-one" style={{ y: heroY }}
            animate={reduceMotion ? {} : { scale: [1, 1.12, 1], opacity: [0.6, 0.85, 0.6] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="hero-orb orb-two" style={{ y: useTransform(heroY, v => -v) }}
            animate={reduceMotion ? {} : { scale: [1, 1.2, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
          <Particles count={14} reduce={reduceMotion} />

          <div className="hero-grid">
            <motion.div
              className="hero-content"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }}
            >
              <motion.span
                className="hero-tag"
                variants={{
                  hidden: { opacity: 0, y: 15, scale: 0.9 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.9, ease: EASE } },
                }}
              >
                <Sparkles size={14} style={{ marginRight: 8 }} />
                ABOUT US LIAISON BANK AMC
              </motion.span>

              <h1>
                <span style={{ display: "block", overflow: "hidden" }}>
                  <AnimatedWords text="Business Maintenance" />
                </span>
                <span style={{ display: "block", overflow: "hidden" }} className="hero-hl">
                  <AnimatedWords text="Made Simpler." delay={0.12} />
                </span>
                <span style={{ display: "block", overflow: "hidden" }}>
                  <AnimatedWords text="Growth Made Stronger." delay={0.24} />
                </span>
              </h1>

              <motion.p variants={reveal}>
                Discover integrated AMC and maintenance services designed
                to help businesses organize their essential maintenance
                requirements through one convenient platform.
              </motion.p>

              <motion.div variants={reveal} className="hero-actions">
                <motion.a href="/services" className="about-btn primary"
                  whileHover={reduceMotion ? {} : { scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.35, ease: EASE }}>
                  Explore Our Services <ArrowRight size={18} />
                </motion.a>
                <motion.a href="/contact" className="about-btn secondary"
                  whileHover={reduceMotion ? {} : { scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.35, ease: EASE }}>
                  Contact Our Team
                </motion.a>
              </motion.div>
            </motion.div>

            <motion.div
              className="hero-visual"
              initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={safeTransition}
            >
              <motion.div
                ref={cardRef}
                className="hero-main-card"
                onMouseMove={handleMove}
                onMouseLeave={handleLeave}
                style={{ perspective: 1000 }}
                animate={reduceMotion ? {} : { rotateX: tilt.rx, rotateY: tilt.ry }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              >
                <motion.div className="hero-icon"
                  animate={reduceMotion ? {} : { rotate: [0, 360], scale: [1, 1.06, 1] }}
                  transition={{ duration: 16, repeat: Infinity, ease: "linear" }}>
                  <ShieldCheck size={65} />
                </motion.div>
                <span>ONE PLATFORM</span>
                <h3>Multiple AMC Services</h3>
                <p>Integrated Business Maintenance Solutions</p>
                <motion.div className="hero-card-line"
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.7, duration: 0.9, ease: EASE }} />
                <div className="hero-card-footer">
                  {[Flame, Zap, Bug, Droplets].map((Ic, i) => (
                    <motion.span key={i}
                      animate={reduceMotion ? {} : { y: [0, -6, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}>
                      <Ic />
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              <motion.div className="floating-card floating-top"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0, y: reduceMotion ? 0 : [0, -10, 0] }}
                transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut" }, opacity: { delay: 0.5, duration: 0.8 } }}>
                <CheckCircle2 /> Planned Maintenance
              </motion.div>
              <motion.div className="floating-card floating-bottom"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0, y: reduceMotion ? 0 : [0, 8, 0] }}
                transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" }, opacity: { delay: 0.8, duration: 0.8 } }}>
                <Settings /> Professional Coordination
              </motion.div>
            </motion.div>
          </div>

          <motion.div className="hero-scroll" style={{ y: useTransform(heroY, v => v * 0.5) }}>
            <motion.span animate={reduceMotion ? {} : { scaleX: [0.5, 1, 0.5], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
            SCROLL TO EXPLORE
          </motion.div>
        </section>

        {/* ============ 02. WHO WE ARE ============ */}
        <section className="about-who section-padding" ref={whoRef}>
          <div className="who-grid">
            <motion.div className="who-visual" style={{ y: whoY }}
              initial={{ opacity: 0, x: -80, rotate: -3 }}
              whileInView={{ opacity: 1, x: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.25, margin: "-60px" }}
              transition={{ duration: 1.1, ease: EASE }}>
              <motion.div className="who-image-placeholder"
                animate={reduceMotion ? {} : { boxShadow: [
                  "0 30px 60px -20px rgba(58,36,24,0.22)",
                  "0 40px 80px -15px rgba(232,145,58,0.30)",
                  "0 30px 60px -20px rgba(58,36,24,0.22)",
                ] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
                <motion.div animate={reduceMotion ? {} : { y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
                  {/* <Building2 size={100} strokeWidth={1} /> */}
                  <Image
                    src="/logo.png"
                    alt="Who We Are Illustration"
                    width={300}
                    height={300}
                    style={{ objectFit: "contain" }}
                  />
                </motion.div>
                {/* <span>LIAISON BANK AMC</span> */}
                <strong>Maintenance. Simplified.</strong>
              </motion.div>
              <motion.div className="who-accent"
                animate={reduceMotion ? {} : { rotate: [0, 1.5, 0, -1.5, 0], scale: [1, 1.02, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
            </motion.div>

            <motion.div className="who-content"
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25, margin: "-60px" }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}>
              <motion.span className="about-eyebrow" variants={reveal}>GET TO KNOW US</motion.span>
              <motion.h2 variants={reveal}>
                Your Partner in <span style={{ display: "block" }}>
                  <AnimatedWords text="Business Maintenance" delay={0.15} />
                </span>
              </motion.h2>
              {[
                "Liaison Bank is a business solutions organization committed to simplifying essential operational and service requirements.",
                "Through Liaison Bank AMC, we bring different maintenance and facility-related services together, helping businesses manage recurring maintenance needs more conveniently.",
                "Our focus is to simplify service discovery, quotation requests, maintenance planning and professional coordination.",
              ].map((t, i) => (
                <motion.p key={i} variants={reveal}>{t}</motion.p>
              ))}
              <motion.a href="/contact" className="about-text-link" variants={reveal}
                whileHover={reduceMotion ? {} : { x: 4 }}
                transition={{ duration: 0.35, ease: EASE }}>
                Know More About Us <ArrowRight size={18} />
              </motion.a>
            </motion.div>
          </div>
        </section>

        {/* ============ 03. SERVICES ============ */}
        <section className="about-services section-padding">
          <SectionHeading
            eyebrow="OUR EXPERTISE"
            title="Complete AMC & Maintenance Services"
            description="Explore maintenance solutions designed to support your business and its essential operational requirements."
          />

          <motion.div className="services-grid" variants={stagger}
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1, margin: "-40px" }}>
            {services.map((service, index) => {
              const isImageIcon = typeof service.icon === "string";
              const Icon = isImageIcon ? null : service.icon;
              return (
                <motion.a href={`/services/${service.slug}`} className="service-card" key={service.title}
                  variants={{
                    hidden: { opacity: 0, y: 60, scale: 0.92 },
                    visible: {
                      opacity: 1, y: 0, scale: 1,
                      transition: { duration: 0.9, ease: EASE },
                    },
                  }}
                  whileHover={reduceMotion ? {} : { y: -8, scale: 1.02, transition: { duration: 0.4, ease: EASE } }}
                  whileTap={{ scale: 0.98 }}>
                  <motion.span className="service-number"
                    variants={{ hidden: { opacity: 0, scale: 1.6 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE, delay: 0.15 } } }}>
                    0{index + 1}
                  </motion.span>
                  <motion.div className="service-icon"
                    whileHover={reduceMotion ? {} : { rotate: [0, -5, 5, 0], transition: { duration: 0.6 } }}>
                    {isImageIcon ? (
                      <Image
                        src={service.icon}
                        alt={service.title}
                        width={48}
                        height={48}
                        style={{ objectFit: "contain" }}
                      />
                    ) : (
                      <Icon size={30} />
                    )}
                  </motion.div>
                  <h3>{service.title}</h3>
                  <p>{service.desc}</p>
                  <motion.span className="service-link"
                    whileHover={reduceMotion ? {} : { gap: 14 }}
                    transition={{ duration: 0.3 }}>
                    Explore Service <ArrowRight size={16} />
                  </motion.span>
                </motion.a>
              );
            })}
          </motion.div>
        </section>

        {/* ============ 04. INDUSTRIES ============ */}
        <section className="about-industries section-padding">
          <SectionHeading
            eyebrow="INDUSTRIES WE SERVE"
            title="AMC Services for Every Industry"
            description="We provide AMC and maintenance services to businesses across different industries, with solutions based on their individual requirements."
          />

          <div className="industry-list">
            {industries.map((industry, index) => {
              const Icon = industry.icon;
              const reverse = index % 2 !== 0;
              return (
                <motion.article className={`industry-card ${reverse ? "reverse" : ""}`} key={industry.title}
                  initial={{ opacity: 0, x: reverse ? 80 : -80, scale: 0.96 }}
                  whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.2, margin: "-50px" }}
                  transition={{ duration: 1, ease: EASE }}
                  whileHover={reduceMotion ? {} : { x: reverse ? -4 : 4, scale: 1.005, transition: { duration: 0.35 } }}>
                  <motion.div className="industry-icon"
                    whileHover={reduceMotion ? {} : { rotate: 360, transition: { duration: 0.9, ease: EASE } }}
                    animate={reduceMotion ? {} : { boxShadow: [
                      "0 0 0 rgba(232,145,58,0)",
                      "0 0 24px rgba(232,145,58,0.4)",
                      "0 0 0 rgba(232,145,58,0)",
                    ] }}
                    transition={{ boxShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}>
                    <Icon size={42} />
                  </motion.div>
                  <div className="industry-content">
                    <motion.span variants={{ hidden: { opacity: 0, x: -15 }, visible: { opacity: 1, x: 0 } }}>
                      INDUSTRY 0{index + 1}
                    </motion.span>
                    <h3>{industry.title} AMC Services</h3>
                    <p>{industry.desc}</p>
                    <div className="industry-services">{industry.services}</div>
                    <motion.a href="/services" whileHover={reduceMotion ? {} : { x: 4 }} transition={{ duration: 0.3 }}>
                      Explore AMC Solutions <ArrowRight size={16} />
                    </motion.a>
                  </div>
                  <motion.div className="industry-watermark"
                    animate={reduceMotion ? {} : { opacity: [0.05, 0.1, 0.05], x: [0, 6, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
                    0{index + 1}
                  </motion.div>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* ============ 05. BENEFITS ============ */}
        <section className="about-benefits section-padding">
          <SectionHeading
            eyebrow="WHY LIAISON BANK AMC"
            title="More Than Maintenance. A Better Service Experience."
            description="Discover an organized approach to managing your recurring business maintenance requirements."
          />

          <motion.div className="benefits-grid" variants={stagger}
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15, margin: "-40px" }}>
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <motion.div className="benefit-card" key={benefit.title}
                  variants={{
                    hidden: { opacity: 0, scale: 0.75, y: 30 },
                    visible: {
                      opacity: 1, scale: 1, y: 0,
                      transition: { duration: 0.85, ease: EASE },
                    },
                  }}
                  whileHover={reduceMotion ? {} : { scale: 1.04, y: -4, transition: { duration: 0.35, ease: EASE } }}>
                  <motion.div className="benefit-icon"
                    whileHover={reduceMotion ? {} : { rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 0.7 }}>
                    <Icon size={28} />
                  </motion.div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* ============ 06. PROCESS ============ */}
        <section className="about-process section-padding">
          <SectionHeading
            eyebrow="OUR WORKFLOW"
            title="How Our AMC Process Works"
            description="A structured journey from service selection to ongoing maintenance support."
          />

          <div className="process-timeline">
            <motion.div className="process-line"
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
              viewport={{ once: true }} transition={{ duration: 2, ease: EASE_SOFT }} />

            {process.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div className="process-item" key={item.title}
                  initial={{ opacity: 0, y: index % 2 ? 50 : -50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3, margin: "-40px" }}
                  transition={{ delay: index * 0.1, duration: 0.9, ease: EASE }}>
                  <motion.div className="process-number"
                    whileHover={reduceMotion ? {} : { scale: 1.12, transition: { duration: 0.35 } }}
                    animate={reduceMotion ? {} : { boxShadow: [
                      "0 0 0 rgba(232,145,58,0)",
                      "0 0 18px rgba(232,145,58,0.45)",
                      "0 0 0 rgba(232,145,58,0)",
                    ] }}
                    transition={{ boxShadow: { duration: 4, repeat: Infinity, delay: index * 0.5, ease: "easeInOut" } }}>
                    <Icon size={24} />
                  </motion.div>
                  <span>STEP 0{index + 1}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ============ 07. MISSION & VISION ============ */}
        <section className="about-purpose section-padding">
          <motion.div className="purpose-card mission"
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2, margin: "-50px" }}
            transition={{ duration: 1, ease: EASE }}
            whileHover={reduceMotion ? {} : { y: -6, transition: { duration: 0.35 } }}>
            <motion.div animate={reduceMotion ? {} : { rotate: [0, 6, 0, -6, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
              <Target size={44} />
            </motion.div>
            <span>OUR PURPOSE</span>
            <h2>Our Mission</h2>
            <p>
              Our mission is to help businesses focus on what matters most:
              their customers, teams, and growth. We take care of coordinating
              essential AMC services, maintenance, certifications, and
              compliance requirements, helping business owners spend less time
              managing operational hurdles and more time building successful
              businesses.
            </p>
          </motion.div>

          <motion.div className="purpose-card vision"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2, margin: "-50px" }}
            transition={{ duration: 1, ease: EASE, delay: 0.1 }}
            whileHover={reduceMotion ? {} : { y: -6, transition: { duration: 0.35 } }}>
            <motion.div animate={reduceMotion ? {} : { scale: [1, 1.12, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
              <Eye size={44} />
            </motion.div>
            <span>OUR FUTURE</span>
            <h2>Our Vision</h2>
            <p>
              We envision a future where Liaison Bank becomes a household
              name in AMC services across India, helping businesses manage
              their maintenance, licensing, and certification needs with
              confidence. To build a trusted and widely recognised brand that
              makes essential services simple, accessible, and reliable through
              one dependable partner. Ultimately, we aspire to build a brand
              that businesses trust and recommend, making Liaison Bank a
              natural choice for all their AMC service needs.
            </p>
          </motion.div>
        </section>

        {/* ============ 08. COMMITMENT ============ */}
        <section className="about-commitment section-padding">
          <div className="commitment-grid">
            <motion.div className="commitment-visual"
              initial={{ opacity: 0, rotate: -40, scale: 0.4 }}
              whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.3, ease: EASE }}>
              <div className="commitment-circle">
                <motion.div
                  animate={reduceMotion ? {} : { rotate: [0, 360] }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  style={{ display: "grid", placeItems: "center" }}>
                  <ShieldCheck size={100} />
                </motion.div>
              </div>
            </motion.div>

            <div className="commitment-content">
              <SectionHeading
                eyebrow="OUR COMMITMENT"
                title="Your Business. Our Maintenance Commitment."
                description="We believe effective maintenance starts with understanding the needs of every business."
              />

              {[
                "Customer-focused service coordination",
                "Clear service information and quotations",
                "Organized maintenance planning",
                "Professional communication",
                "Service documentation and reports",
                "Long-term customer relationships",
              ].map((point, index) => (
                <motion.div className="commitment-point" key={point}
                  initial={{ opacity: 0, x: 40, filter: "blur(3px)" }}
                  whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ delay: index * 0.09, duration: 0.7, ease: EASE }}
                  whileHover={reduceMotion ? {} : { x: 5, transition: { duration: 0.3 } }}>
                  <motion.span
                    animate={reduceMotion ? {} : { rotate: [0, 360] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: index * 0.25 }}>
                    <CheckCircle2 size={20} />
                  </motion.span>
                  {point}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ 09. FAQ ============ */}
        <section className="about-faq section-padding">
          <SectionHeading
            eyebrow="HAVE QUESTIONS?"
            title="Frequently Asked Questions"
            description="Find answers to common questions about our AMC and maintenance services."
          />

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <motion.div className={`faq-item ${activeFaq === index ? "active" : ""}`} key={faq.q}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2, margin: "-30px" }}
                transition={{ delay: index * 0.06, duration: 0.6, ease: EASE }}
                whileHover={reduceMotion ? {} : { scale: 1.005, transition: { duration: 0.3 } }}>
                <button className="faq-question"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  aria-expanded={activeFaq === index}>
                  {faq.q}
                  <motion.span animate={{ rotate: activeFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.5, ease: EASE }}>
                    <ChevronDown size={22} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {activeFaq === index && (
                    <motion.div className="faq-answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}>
                      <motion.p initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.4, ease: EASE }}>
                        {faq.a}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ============ 10. CTA ============ */}
        <section className="about-cta" ref={ctaRef}>
          <motion.div className="cta-orb" style={{ y: ctaY }}
            animate={reduceMotion ? {} : { scale: [1, 1.3, 1], rotate: [0, 120, 240], opacity: [0.6, 0.95, 0.6] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }} />
          <Particles count={10} reduce={reduceMotion} />

          <motion.div className="cta-content"
            initial={{ opacity: 0, y: 70, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: EASE }}>
            <motion.span
              initial={{ letterSpacing: "0.4em", opacity: 0 }}
              whileInView={{ letterSpacing: "0.22em", opacity: 1 }}
              transition={{ duration: 0.9, ease: EASE }}>
              LET'S WORK TOGETHER
            </motion.span>
            <h2>
              Focus on Your Business.
              <br />
              <strong>
                <AnimatedWords text="We'll Help Simplify Maintenance." delay={0.15} />
              </strong>
            </h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}>
              Discover the right AMC services for your establishment
              and take a more organized approach to business maintenance.
            </motion.p>

            <motion.a href="/quote-cart" className="cta-button"
              whileHover={reduceMotion ? {} : { scale: 1.05, y: -3, boxShadow: "0 20px 45px rgba(0,0,0,0.3)", transition: { duration: 0.35, ease: EASE } }}
              whileTap={{ scale: 0.97 }}>
              Get a Quote <ArrowRight size={20} />
            </motion.a>
          </motion.div>
        </section>

      </main>
    </>
  );
}