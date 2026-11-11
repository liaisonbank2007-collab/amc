"use client";

import { useState } from "react";

export default function PasswordResetPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);



async function handleSubmit(event) {
  event.preventDefault();
  if (!email.trim()) return;

  setLoading(true);

  try {
    // ✅ Proxied through next.config.js rewrite → no CORS
    const url = `/api/frappe/frappe.core.doctype.user.user.reset_password?user=${encodeURIComponent(
      email.trim()
    )}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    });

    // Optional debug — remove after confirming it works
    const text = await res.text().catch(() => '');
    console.log('[reset] proxy status:', res.status, 'body:', text);
  } catch (err) {
    console.warn('Reset request network issue:', err);
  } finally {
    setLoading(false);
    setSubmitted(true);
  }
}

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#faf7f2] px-4 py-12 font-sans antialiased">
      <section
        className="w-full max-w-[460px] rounded-[32px] bg-white p-8 sm:p-10 shadow-[0_20px_40px_-12px_rgba(245,124,0,0.18),0_8px_24px_-6px_rgba(0,0,0,0.06),0_0_0_1px_rgba(245,124,0,0.08)]"
      >
        {/* Premium modern orange logo mark */}
        <div className="flex justify-center mb-7">
          <div
            aria-label="Premium reset logo"
            className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#ff9f4b] via-[#f57c00] to-[#e06b00] shadow-[0_12px_20px_-8px_rgba(245,124,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)]"
          >
            <span
              className="text-[2.9rem] leading-none text-white"
              style={{ textShadow: "0 3px 6px rgba(0,0,0,0.15)", transform: "scale(1.1)" }}
            >
              ↻
            </span>
          </div>
        </div>

        <h1 className="text-center text-[1.9rem] font-semibold tracking-[-0.02em] text-[#1e1e1e]">
          Reset password
        </h1>
        <p className="mt-2 mb-8 px-1 text-center text-[0.95rem] leading-relaxed text-[#5e5e5e]">
          Enter the email associated with your account and we’ll send a reset link.
        </p>

        {submitted ? (
          <div
            role="status"
            className="mt-6 flex items-start gap-3 rounded-2xl border-l-[5px] border-[#f57c00] bg-[#fef7ed] px-5 py-5 text-[0.95rem] leading-relaxed text-[#42403e] shadow-[0_4px_10px_-6px_rgba(245,124,0,0.2)]"
          >
            <span className="mt-[1px] text-[1.3rem] text-[#f57c00]">✓</span>
            <div>
              If an account exists for{" "}
              <span className="font-semibold break-all text-[#f57c00]">{email}</span>,
              you’ll receive password reset instructions shortly.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[0.85rem] font-medium uppercase tracking-[0.3px] text-[#3d3d3d]"
              >
                Email address
              </label>
              <div className="relative flex items-center">
                <svg
                  className="pointer-events-none absolute left-4 h-4 w-4 text-[#b0a8a0]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-full border-[1.5px] border-[#ede8e2] bg-[#fefcf9] px-4 py-3.5 pl-11 text-[0.95rem] font-[450] text-[#1e1e1e] placeholder:text-[0.9rem] placeholder:font-normal placeholder:text-[#b7aea5] outline-none transition focus:border-[#f57c00] focus:bg-white focus:shadow-[0_0_0_4px_rgba(245,124,0,0.12)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2.5 rounded-full border border-white/20 bg-gradient-to-br from-[#f57c00] to-[#e06b00] px-6 py-3.5 text-base font-semibold tracking-[0.2px] text-white shadow-[0_12px_18px_-8px_rgba(245,124,0,0.45),0_4px_8px_-4px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:bg-gradient-to-br hover:from-[#ff8a1f] hover:to-[#f57c00] hover:shadow-[0_20px_24px_-10px_rgba(245,124,0,0.55),0_6px_12px_-4px_rgba(0,0,0,0.08)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-90"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <span>Send reset link</span>
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>
        )}

        {/* Subtle divider */}
        <div className="mt-6 flex items-center text-xs text-[#ddd5cc]">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#ede8e2] to-transparent" />
          <span className="px-3">or</span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#ede8e2] to-transparent" />
        </div>

        {/* Back link */}
        <div className="mt-7 text-center text-[0.9rem]">
          <a
            href="login"
            className="inline-flex items-center gap-1.5 font-medium text-[#f57c00] transition hover:text-[#d45f00] hover:underline hover:underline-offset-[3px]"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to sign in
          </a>
        </div>

        <p className="mt-2 text-center text-xs text-[#aaa29a]">
          Secure reset powered by liaisonbank
        </p>
      </section>
    </main>
  );
}