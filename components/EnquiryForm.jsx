"use client";

import React, { useState } from "react";
import Link from "next/link";
import "./EnquiryForm.scss";

const SERVICES = [
  "License Renewal",
  "Pest Control",
  "Fire Extinguisher Refilling",
  "Water Tank Cleaning",
];

const COUNTRIES = [
  { code: "+91", country: "IN" },
  { code: "+1", country: "US/CA" },
  { code: "+44", country: "UK" },
  { code: "+971", country: "UAE" },
  { code: "+65", country: "SG" },
  { code: "+61", country: "AU" },
];

const INITIAL = {
  name: "",
  email: "",
  countryCode: "+91", // Default country code
  phone: "",
  company: "",
  service: [],
  message: "",
};

function getErrorMessage(data) {
  if (typeof data?.message?.error === "string") return data.message.error;
  if (typeof data?.message?.message === "string") return data.message.message;
  if (typeof data?.error === "string") return data.error;
  if (typeof data?.detail === "string") return data.detail;

  if (Array.isArray(data?.detail)) {
    return data.detail.map((item) => item.msg).filter(Boolean).join(" ");
  }

  if (typeof data?.message === "string") return data.message;

  if (typeof data?._server_messages === "string") {
    try {
      const messages = JSON.parse(data._server_messages);
      const decoded = messages
        .map((item) => {
          try {
            const parsed = typeof item === "string" ? JSON.parse(item) : item;
            return parsed.message || parsed.title || "";
          } catch {
            return typeof item === "string" ? item : "";
          }
        })
        .filter(Boolean);

      if (decoded.length) return decoded.join(" ");
    } catch {
      // ignore fallback
    }
  }

  return "Unable to submit your enquiry. Please try again.";
}

function hasApiError(data) {
  return (
    data?.success === false ||
    data?.status === "error" ||
    data?.message?.status === "error" ||
    Boolean(data?.error) ||
    Boolean(data?.message?.error)
  );
}

export default function EnquiryForm({ onSuccess }) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");

  const update = (field) => (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));

    setServerError("");

    if (status === "error") {
      setStatus("idle");
    }
  };

  const validate = () => {
    const next = {};

    if (!form.name.trim()) next.name = "Please enter your name.";

    if (!form.email.trim()) {
      next.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Please enter a valid email address.";
    }

    // Updated Phone Validation
    const cleanPhone = form.phone.replace(/\D/g, ""); // strip non-digits
    if (!form.phone.trim()) {
      next.phone = "Please enter your phone number.";
    } else if (cleanPhone.length < 7 || cleanPhone.length > 12) {
      next.phone = "Please enter a valid phone number.";
    }

if (!form.service.length) next.service = "Please select at least one service.";
if (!form.message.trim()) next.message = "Please tell us about your requirement.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };



  const updateMulti = (field) => (e) => {
  const values = Array.from(e.target.selectedOptions, (opt) => opt.value);

  setForm((prev) => ({
    ...prev,
    [field]: values,
  }));

  setErrors((prev) => ({
    ...prev,
    [field]: undefined,
  }));

  setServerError("");

  if (status === "error") {
    setStatus("idle");
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (status === "submitting") return;
    if (!validate()) return;

    setStatus("submitting");

    try {
      // Format the phone number with the selected country code
      const rawPhone = form.phone.replace(/\D/g, ""); // strip non-digits
      const formattedPhone = `${form.countryCode} ${rawPhone}`;

      const payload = {
        company_name: form.company.trim(),
        contact_person: form.name.trim(),
        phone_number: formattedPhone,
        email_id: form.email.trim(),
        enquiry_details: form.message.trim(),
        type_of_services: ["AMC"],
        amc_type: form.service,
        form_source: "AMC Enquiry Form",
      };

      const response = await fetch("/api/method/create_enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      console.log("AMC enquiry API response:", data);

      if (!response.ok || hasApiError(data)) {
        throw new Error(getErrorMessage(data));
      }

      setStatus("success");
      setForm({ ...INITIAL, service: [] });
      setErrors({});
      setServerError("");

      onSuccess?.();
    } catch (err) {
      console.error("Enquiry submission error:", err);
      setServerError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="enquiry-success" role="status">
        <div className="enquiry-success-icon" aria-hidden="true">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2>Thank you — enquiry received.</h2>
        <p>
          A member of our team will be in touch within one business day. For
          urgent matters, call <a href="tel:+919769458515">+91 97694 58515</a>.
        </p>
        <button
          type="button"
          className="enquiry-btn enquiry-btn--ghost"
          onClick={() => {
            setStatus("idle");
            setServerError("");
          }}
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <form className="enquiry-form" onSubmit={handleSubmit} noValidate>
      <div className="enquiry-grid">
        {/* Full name */}
        <div className="enquiry-field">
          <label htmlFor="enq-name">
            Full name <span className="req">*</span>
          </label>
          <input
            id="enq-name"
            name="name"
            type="text"
            value={form.name}
            onChange={update("name")}
            placeholder="e.g. Ananya Sharma"
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "enq-name-error" : undefined}
          />
          {errors.name && (
            <span id="enq-name-error" className="enquiry-error">
              {errors.name}
            </span>
          )}
        </div>

        {/* Email */}
        <div className="enquiry-field">
          <label htmlFor="enq-email">
            Email <span className="req">*</span>
          </label>
          <input
            id="enq-email"
            name="email"
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="you@company.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "enq-email-error" : undefined}
          />
          {errors.email && (
            <span id="enq-email-error" className="enquiry-error">
              {errors.email}
            </span>
          )}
        </div>

        {/* Phone with editable country code */}
        <div className="enquiry-field">
          <label htmlFor="enq-phone">
            Phone <span className="req">*</span>
          </label>
          <div className="enquiry-phone-wrapper">
            <select
              className="enquiry-phone-code"
              value={form.countryCode}
              onChange={update("countryCode")}
              aria-label="Country code"
            >
              {COUNTRIES.map((c) => (
                <option key={c.country} value={c.code}>
                  {c.code} ({c.country})
                </option>
              ))}
            </select>
            <input
              id="enq-phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={update("phone")}
              placeholder="98765 43210"
              autoComplete="tel-national"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "enq-phone-error" : undefined}
              maxLength={15}
            />
          </div>
          {errors.phone && (
            <span id="enq-phone-error" className="enquiry-error">
              {errors.phone}
            </span>
          )}
        </div>

        {/* Company */}
        <div className="enquiry-field">
          <label htmlFor="enq-company">Company / organisation</label>
          <input
            id="enq-company"
            name="company"
            type="text"
            value={form.company}
            onChange={update("company")}
            placeholder="Optional"
            autoComplete="organization"
          />
        </div>

        {/* Service */}
  {/* Service — multi-select via checkboxes */}
<div className="enquiry-field enquiry-field--full">
  <span id="enq-service-label" className="enquiry-label">
    Service of interest <span className="req">*</span>
  </span>
  <div
    className="enquiry-checkboxes"
    role="group"
    aria-labelledby="enq-service-label"
    aria-invalid={!!errors.service}
    aria-describedby={errors.service ? "enq-service-error" : undefined}
  >
    {SERVICES.map((service) => (
      <label key={service} className="enquiry-checkbox">
        <input
          type="checkbox"
          name="service"
          value={service}
          checked={form.service.includes(service)}
          onChange={(e) => {
            const { checked, value } = e.target;
            setForm((prev) => ({
              ...prev,
              service: checked
                ? [...prev.service, value]
                : prev.service.filter((s) => s !== value),
            }));
            setErrors((prev) => ({ ...prev, service: undefined }));
            setServerError("");
            if (status === "error") setStatus("idle");
          }}
        />
        <span>{service}</span>
      </label>
    ))}
  </div>
  {errors.service && (
    <span id="enq-service-error" className="enquiry-error">
      {errors.service}
    </span>
  )}
</div>
        {/* Message */}
        <div className="enquiry-field enquiry-field--full">
          <label htmlFor="enq-message">
            Your requirement <span className="req">*</span>
          </label>
          <textarea
            id="enq-message"
            name="message"
            rows={4}
            value={form.message}
            onChange={update("message")}
            placeholder="Briefly describe your requirement, timeline, and location…"
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "enq-message-error" : undefined}
          />
          {errors.message && (
            <span id="enq-message-error" className="enquiry-error">
              {errors.message}
            </span>
          )}
        </div>
      </div>

      {status === "error" && (
        <p className="enquiry-form-error" role="alert">
          {serverError || "Something went wrong. Please try again or email"}{" "}
          <a href="mailto:ceo.desk@liaisonbank.com">ceo.desk@liaisonbank.com</a>.
        </p>
      )}

      <div className="enquiry-actions">
        <button
          type="submit"
          className="enquiry-btn"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : "Submit enquiry"}
          {status !== "submitting" && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        <p className="enquiry-privacy">
          By submitting, you agree to our{" "}
          <Link href="/privacy-policy">Privacy Policy</Link>.
        </p>
      </div>
    </form>
  );
}