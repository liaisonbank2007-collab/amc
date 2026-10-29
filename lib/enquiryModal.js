// Tiny pub/sub so any button anywhere can open the modal
const EVENT = "lb:open-enquiry";

export function openEnquiryModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVENT));
  }
}

export function onOpenEnquiryModal(handler) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}