// lib/auth.js
export const isUserLoggedIn = () => {
  if (typeof window === "undefined") return false;

  // Check token in localStorage (must match what your login page sets)
  const token =
    localStorage.getItem("user_email") ||
    localStorage.getItem("full_name");

  return !!token;
};