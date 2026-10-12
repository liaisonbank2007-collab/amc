// lib/calculations.js
import { hasUnitControl, hasVisitControl } from "./visibility";

export const DURATION_OPTIONS = [
  // Sub-year terms — 0% discount
  { value: "1 Month",   label: "1 Month",   months: 1,   years: 1 / 12, discount: 0 },
  { value: "3 Months",  label: "3 Months",  months: 3,   years: 0.25,   discount: 0 },
  { value: "6 Months",  label: "6 Months",  months: 6,   years: 0.5,    discount: 0 },
  { value: "9 Months",  label: "9 Months",  months: 9,   years: 0.75,   discount: 0 },

  // Full-year terms — 5% per year, capped at 50%
  { value: "12 Months",  label: "1 Year",   months: 12,  years: 1,  discount: 5  },
  { value: "24 Months",  label: "2 Years",  months: 24,  years: 2,  discount: 10 },
  { value: "36 Months",  label: "3 Years",  months: 36,  years: 3,  discount: 15 },
  { value: "48 Months",  label: "4 Years",  months: 48,  years: 4,  discount: 20 },
  { value: "60 Months",  label: "5 Years",  months: 60,  years: 5,  discount: 25 },
  { value: "72 Months",  label: "6 Years",  months: 72,  years: 6,  discount: 30 },
  { value: "84 Months",  label: "7 Years",  months: 84,  years: 7,  discount: 35 },
  { value: "96 Months",  label: "8 Years",  months: 96,  years: 8,  discount: 40 },
  { value: "108 Months", label: "9 Years",  months: 108, years: 9,  discount: 45 },
  { value: "120 Months", label: "10 Years", months: 120, years: 10, discount: 50 },
];

export const MAX_DISCOUNT_PERCENTAGE = 50;

/**
 * API numeric months → dropdown value
 * 1 → "1 Month", 12 → "12 Months", 24 → "24 Months"
 */
export const monthsToDurationValue = (months) => {
  const n = Number(months);
  if (!n || n <= 0) return "12 Months";
  const match = DURATION_OPTIONS.find((d) => d.months === n);
  if (match) return match.value;

  // Fallback: nearest lower option for unfamiliar values (e.g. 18 → "12 Months")
  const sorted = [...DURATION_OPTIONS].sort((a, b) => b.months - a.months);
  const lower = sorted.find((d) => d.months <= n);
  return lower ? lower.value : "12 Months";
};

/**
 * dropdown value → numeric months
 */
export const durationValueToMonths = (value) => {
  const opt = DURATION_OPTIONS.find((d) => d.value === value);
  return opt ? opt.months : 12;
};

export const getDiscountForDuration = (duration) => {
  const opt = DURATION_OPTIONS.find((d) => d.value === duration);
  if (!opt) return 0;
  return Math.min(opt.discount, MAX_DISCOUNT_PERCENTAGE);
};

export const getDurationOption = (duration) =>
  DURATION_OPTIONS.find((d) => d.value === duration) || null;

export const computeItemAmount = (it) => {
  const rate = Number(it.rate) || 0;
  if (rate <= 0) return 0;

  const units = hasUnitControl(it) ? Number(it.units) || 1 : 1;
  const threshold = hasUnitControl(it) ? Number(it.custom_unit) || 0 : 0;
  const minAmount = Number(it.custom_min_amount) || 0;

  if (threshold > 0 && units <= threshold) {
    return minAmount > 0 ? minAmount : rate * units;
  }
  return rate * units;
};

/**
 * Compute the multiplier for a given selected duration.
 *
 * The API's `custom_duration_months` is the BASE period the rate covers
 * (e.g. 1 = rate is per month, 12 = rate is per year).
 *
 * If the user selects 12 Months and the base is 1 month → multiplier = 12
 * If the user selects 24 Months and the base is 12 months → multiplier = 2
 */
export const getDurationMultiplier = (it, selectedDuration) => {
  const selectedMonths = durationValueToMonths(selectedDuration);
  const baseMonths = Number(it.custom_duration_months) || 1;
  if (baseMonths <= 0) return 1;
  return selectedMonths / baseMonths;
};

export const applyDiscount = (amount, discountPercentage) => {
  const d = Math.min(Math.max(discountPercentage, 0), MAX_DISCOUNT_PERCENTAGE);
  return amount * (1 - d / 100);
};

/**
 * Compute subtotal for one line item (no discount applied yet).
 * Includes visits × units/min-amount × duration multiplier.
 */
const computeLineSubtotal = (it, selectedDuration) => {
  if (!it.rate || it.rate <= 0) return 0;

  const visits = hasVisitControl(it) ? Number(it.visits) || 1 : 1;
  const baseAmount = computeItemAmount(it);
  const multiplier = getDurationMultiplier(it, selectedDuration);

  return baseAmount * visits * multiplier;
};

export const lineTotal = (it, duration = null) => {
  let subtotal = 0;
  let hasPayable = false;

  const discountPercentage = duration
    ? getDiscountForDuration(duration)
    : Number(it.custom_discount_percentage) || 0;

  // Parent line
  if (it.rate && it.rate > 0) {
    subtotal += computeLineSubtotal(it, duration);
    hasPayable = true;
  }

  // Sub-items: inherit the parent's selected duration so they scale the same way
  (it.subItems || []).forEach((s) => {
    if (s.rate && s.rate > 0) {
      const subDuration = duration || it.selectedDuration || "12 Months";
      subtotal += computeLineSubtotal(s, subDuration);
      hasPayable = true;
    }
  });

  const discountAmount = subtotal * (discountPercentage / 100);
  const total = subtotal - discountAmount;

  return { subtotal, discountPercentage, discountAmount, total, hasPayable };
};