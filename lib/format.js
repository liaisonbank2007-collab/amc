const LOCALE = "en-IN";

const inrFmt = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrFmt2 = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function inr(value, currency = "INR") {
  if (value == null || Number.isNaN(Number(value))) return "—";
  const n = Number(value);
  if (currency && currency !== "INR") {
    return new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  }
  return Number.isInteger(n) ? inrFmt.format(n) : inrFmt2.format(n);
}

export function prettyName(str) {
  if (!str) return "";
  return String(str)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}