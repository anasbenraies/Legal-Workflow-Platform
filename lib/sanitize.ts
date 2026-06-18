import DOMPurify from "isomorphic-dompurify";

export function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") {
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, sanitizeValue(v)])
    );
  }
  return value;
}