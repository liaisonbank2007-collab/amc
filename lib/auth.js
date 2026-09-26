// lib/auth.js
export const isUserLoggedIn = () => {
  if (typeof window === "undefined") return false;

  // Check token in localStorage (must match what your login page sets)
  const token =
    localStorage.getItem("full_name") ||
    localStorage.getItem("token");

  return !!token;
};