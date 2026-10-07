// utils/calculations.js
import { hasUnitControl, hasVisitControl } from "./visibility";

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

export const lineTotal = (it) => {
  let total = 0;
  let hasPayable = false;

  if (it.rate && it.rate > 0) {
    const visits = hasVisitControl(it) ? Number(it.visits) || 1 : 1;
    total += computeItemAmount(it) * visits;
    hasPayable = true;
  }

  (it.subItems || []).forEach((s) => {
    if (s.rate && s.rate > 0) {
      const visits = hasVisitControl(s) ? Number(s.visits) || 1 : 1;
      total += computeItemAmount(s) * visits;
      hasPayable = true;
    }
  });

  return { total, hasPayable };
};