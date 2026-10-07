// utils/format.js
export const inr = (n, currency = "INR") =>
  `${currency} ${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const prettyName = (name) => (name || "").replace(/,(?!\s)/g, ", ");