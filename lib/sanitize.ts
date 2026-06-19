import DOMPurify from "isomorphic-dompurify";

const MAX_STRING_LENGTH = 2000;

function sanitizeString(s: string): string {
  // Truncate to avoid very large inputs
  let out = s.slice(0, MAX_STRING_LENGTH);

  // Remove HTML tags and attributes
  out = DOMPurify.sanitize(out, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

  // Strip dangerous URI schemes that could be abused in attributes or text
  out = out.replace(/(?:javascript|vbscript|data)\s*:/gi, "");

  // Normalize whitespace
  out = out.replace(/\u0000/g, "").trim();

  return out;
}

export function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") {
    return sanitizeString(value);
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