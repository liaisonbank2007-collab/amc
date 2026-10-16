// utils/visibility.js

const isPresent = (v) => v !== null && v !== undefined && String(v).trim() !== "";

export const hasUnitControl = (it) => {
  const v = it.custom_unit;
  if (!isPresent(v)) return false;
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
};

/**
 * Visit control is shown when the item *supports* visits,
 * regardless of whether a cap exists.
 * A value of 0 (or a missing custom_max_visit) means "no cap / unlimited",
 * NOT "no visit field".
 */
export const hasVisitControl = (it) => {
  if (!it) return false;

  // Present field (including "0") ⇒ item supports visits
  if (isPresent(it.custom_visit)) return true;
  if (isPresent(it.custom_max_visit)) return true;

  return false;
};

export const hasQtyControls = (it) =>
  hasUnitControl(it) || hasVisitControl(it);