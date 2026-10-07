// utils/visibility.js
export const hasUnitControl = (it) => {
  const v = it.custom_unit;
  if (v === null || v === undefined) return false;
  const s = String(v).trim();
  if (s === "") return false;
  const n = Number(s);
  return Number.isFinite(n) && n > 0;
};

export const hasVisitControl = (it) => {
  const v = it.custom_visit;
  if (v === null || v === undefined) return false;
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
};

export const hasQtyControls = (it) => hasUnitControl(it) || hasVisitControl(it);