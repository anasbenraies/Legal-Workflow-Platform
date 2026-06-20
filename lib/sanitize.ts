let DOMPurify: any = null;
let _domPurifyInitPromise: Promise<void> | null = null;

const MAX_STRING_LENGTH = 2000;

function initDomPurify(): void {
  if (_domPurifyInitPromise) return;
  // Kick off dynamic import; don't await to keep API synchronous.
  _domPurifyInitPromise = import("isomorphic-dompurify")
    .then((mod) => {
      DOMPurify = (mod && (mod.default || mod));
    })
    .catch(() => {
      // If dynamic import fails (e.g., ESM/CJS interop), leave DOMPurify null
      DOMPurify = null;
    });
}

function fallbackStripTags(s: string): string {
  // Very small and safe fallback: strip tags and attributes using a regex.
  // Not as robust as DOMPurify but avoids build-time ESM require issues.
  let out = s.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<[^>]+>/g, "");
  return out;
}

function sanitizeString(s: string): string {
  // Truncate to avoid very large inputs
  let out = s.slice(0, MAX_STRING_LENGTH);

  // Attempt to use DOMPurify if it's available; otherwise use fallback.
  if (!DOMPurify) {
    // Trigger background init for future calls
    initDomPurify();
    // Use fallback synchronously for now
    out = fallbackStripTags(out);
  } else {
    try {
      out = DOMPurify.sanitize(out, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    } catch (e) {
      out = fallbackStripTags(out);
    }
  }

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