// lib/calculations.js
import { hasUnitControl, hasVisitControl, usesVisitsForBilling} from "./visibility";


export const DURATION_OPTIONS = [
  // Sub-year terms — 0% discount
  { value: "1 Month",   label: "1 Month",   months: 1,   years: 1 / 12, discount: 0 },
  { value: "2 Months",  label: "2 Months",  months: 2,   years: 2 / 12, discount: 0 },
  { value: "3 Months",  label: "3 Months",  months: 3,   years: 0.25,   discount: 0 },
  { value: "4 Months",  label: "4 Months",  months: 4,   years: 4 / 12, discount: 0 },
  { value: "5 Months",  label: "5 Months",  months: 5,   years: 5 / 12, discount: 0 },
  { value: "6 Months",  label: "6 Months",  months: 6,   years: 0.5,    discount: 0 },
  { value: "7 Months",  label: "7 Months",  months: 7,   years: 7 / 12, discount: 0 },
  { value: "8 Months",  label: "8 Months",  months: 8,   years: 8 / 12, discount: 0 },
  { value: "9 Months",  label: "9 Months",  months: 9,   years: 0.75,   discount: 0 },
  { value: "10 Months", label: "10 Months", months: 10,  years: 10 / 12, discount: 0 },
  { value: "11 Months", label: "11 Months", months: 11,  years: 11 / 12, discount: 0 },

  // Full-year terms — discount applies only from 2 years onward
  { value: "12 Months",  label: "1 Year",   months: 12,  years: 1,  discount: 0  },
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
export const MIN_DISCOUNT_MONTHS = 24;

export const monthsToDurationValue = (months) => {
  const n = Number(months);
  if (!n || n <= 0) return "12 Months";
  const match = DURATION_OPTIONS.find((d) => d.months === n);
  if (match) return match.value;

  const sorted = [...DURATION_OPTIONS].sort((a, b) => b.months - a.months);
  const lower = sorted.find((d) => d.months <= n);
  return lower ? lower.value : "12 Months";
};

export const durationValueToMonths = (value) => {
  const opt = DURATION_OPTIONS.find((d) => d.value === value);
  if (opt) return opt.months;

  const match = /^(\d+)\s*Month/i.exec(String(value || ""));
  if (match) {
    const months = Number(match[1]);
    if (Number.isFinite(months) && months > 0) return months;
  }

  return 12;
};

export const getDiscountForDuration = (duration) => {
  const opt = DURATION_OPTIONS.find((d) => d.value === duration);
  if (opt) {
    if (opt.months < MIN_DISCOUNT_MONTHS) return 0;
    return Math.min(opt.discount, MAX_DISCOUNT_PERCENTAGE);
  }

  const match = /^(\d+)\s*Month/i.exec(String(duration || ""));
  if (match) {
    const months = Number(match[1]);
    if (!Number.isFinite(months) || months < MIN_DISCOUNT_MONTHS) return 0;

    let best = 0;
    for (const tier of DURATION_OPTIONS) {
      if (tier.months >= MIN_DISCOUNT_MONTHS && tier.months <= months) {
        if (tier.discount > best) best = tier.discount;
      }
    }
    return Math.min(best, MAX_DISCOUNT_PERCENTAGE);
  }

  return 0;
};

export const getDurationOption = (duration) =>
  DURATION_OPTIONS.find((d) => d.value === duration) || null;

export const getItemValueCostAmount = (it) => {
  const ranges = it?.item_value_cost;

  if (!Array.isArray(ranges) || ranges.length === 0) return null;

  const selectedUnits = Number(it?.units);
  const units = Number.isFinite(selectedUnits) && selectedUnits > 0 ? selectedUnits : 1;

  const validRanges = ranges
    .map((range) => ({
      min: Number(range.min),
      max: Number(range.max),
      amount: Number(range.amount),
    }))
    .filter(
      (range) =>
        Number.isFinite(range.min) &&
        Number.isFinite(range.max) &&
        Number.isFinite(range.amount) &&
        range.max >= range.min &&
        range.amount >= 0
    )
    .sort((a, b) => a.min - b.min);

  for (let i = 0; i < validRanges.length; i++) {
    const range = validRanges[i];
    const previousRange = validRanges[i - 1];

    const effectiveMin =
      previousRange && range.min === previousRange.max
        ? range.min + 1
        : range.min;

    if (units >= effectiveMin && units <= range.max) {
      return range.amount;
    }
  }

  return null;
};

// export const computeItemAmount = (it) => {
//   const rangeAmount = getItemValueCostAmount(it);
//   if (rangeAmount !== null) return rangeAmount;

//   const rate = Number(it.rate) || 0;
//   if (rate <= 0) return 0;

//   const units = hasUnitControl(it) ? Number(it.units) || 1 : 1;
//   const minAmount = Number(it.custom_min_amount) || 0;
//   const minUnits = hasUnitControl(it) ? Number(it.custom_unit) || 0 : 0;

//   if (minAmount > 0 && minUnits > 0) {
//     if (units <= minUnits) {
//       return minAmount;
//     }
//     return minAmount + (units - minUnits) * rate;
//   }

//   return rate * units;
// };

export const computeItemAmount = (it) => {
  const rangeAmount = getItemValueCostAmount(it);
  if (rangeAmount !== null) return rangeAmount;

  const rate = Number(it.rate) || 0;
  if (rate <= 0) return 0;

  const units = hasUnitControl(it) ? Number(it.units) || 1 : 1;
  const minAmount = Number(it.custom_min_amount) || 0;
  const minUnits = hasUnitControl(it) ? Number(it.custom_unit) || 0 : 0;

  // ✅ NEW LOGIC:
  if (minAmount > 0 && minUnits > 0) {
    // If units are BELOW the min, return the flat min amount
    if (units <= minUnits) {
      return minAmount;
    }
    
    // If units are ABOVE the min, calculate standard rate * units
    // We don't add 1015 here because that causes the bloated total.
    const calculatedAmount = units * rate;
    
    // Ensure it still doesn't go below the min amount
    return Math.max(minAmount, calculatedAmount);
  }

  return rate * units;
};


export const getDurationMultiplier = (it, selectedDuration) => {
  const selectedMonths = durationValueToMonths(selectedDuration);
  const baseMonths =
    Number(it?._base_months) ||
    Number(it?.custom_duration_months) ||
    1;
  if (baseMonths <= 0) return 1;
  return selectedMonths / baseMonths;
};

/**
 * ✅ FIXED: Returns only standard options.
 * 1-11 Months, then 1-10 Years.
 * No custom 18 Months, 30 Months etc.
 */
export const getDurationOptionsForItem = (it) => {
  return DURATION_OPTIONS;
};

export const getMaxVisits = (it, selectedDuration) => {
  const raw = it?.custom_max_visit;

  if (raw === undefined || raw === null || raw === "") return Infinity;
  const baseCap = Number(raw);
  if (!Number.isFinite(baseCap) || baseCap <= 0) return Infinity;

  const multiplier = getDurationMultiplier(it, selectedDuration);
  const safeMul =
    Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;

  return Math.max(1, Math.floor(baseCap * safeMul));
};

export const getScaledVisits = (it, selectedDuration) => {
  const baseVisits = Math.max(1, Number(it?.visits) || 1);
  const max = getMaxVisits(it, selectedDuration); // Infinity if no cap

  if (max === Infinity) return baseVisits;

  return Math.min(Math.max(1, baseVisits), max);
};

export const hasVisitCap = (it) => {
  const raw = it?.custom_max_visit;
  if (raw === undefined || raw === null || raw === "") return false;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0;
};

export const applyDiscount = (amount, discountPercentage) => {
  const d = Math.min(Math.max(discountPercentage, 0), MAX_DISCOUNT_PERCENTAGE);
  return amount * (1 - d / 100);
};

const computeLineSubtotal = (it, selectedDuration) => {
  const baseAmount = computeItemAmount(it);

  if (baseAmount <= 0) return 0;

  if (hasVisitControl(it)) {
    const billedVisits = getScaledVisits(it, selectedDuration);
    return baseAmount * billedVisits;
  }

  const multiplier = getDurationMultiplier(it, selectedDuration);
  return baseAmount * multiplier;
};

export const lineTotal = (it, duration = null) => {
  let subtotal = 0;
  let hasPayable = false;

  const discountPercentage = duration
    ? getDiscountForDuration(duration)
    : Number(it.custom_discount_percentage) || 0;

  if (computeItemAmount(it) > 0) {
    subtotal += computeLineSubtotal(it, duration);
    hasPayable = true;
  }

  (it.subItems || []).forEach((s) => {
    if (computeItemAmount(s) > 0) {
      const subDuration = duration || it.selectedDuration || "12 Months";
      subtotal += computeLineSubtotal(s, subDuration);
      hasPayable = true;
    }
  });

  const discountAmount = subtotal * (discountPercentage / 100);
  const total = subtotal - discountAmount;

  return {
    subtotal,
    discountPercentage,
    discountAmount,
    total,
    hasPayable,
  };
};