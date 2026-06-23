import crypto from "crypto";


/*
webhook signing utilities.

Why sensitive: signs payloads with HMAC-SHA256 using hmacSecret stored per-workflow. Recipients rely on header X-LegalFlow-Signature.
Functions: generateSecret(), generateHmacSignature(payload, secret), buildWebhookHeaders(payload, secret).
*/
export function generateSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateHmacSignature(payload: object, secret: string): string {
  const body = JSON.stringify(payload);
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

export function buildWebhookHeaders(payload: object, secret: string) {
  return {
    "Content-Type": "application/json",
    "X-LegalFlow-Signature": `sha256=${generateHmacSignature(payload, secret)}`,
    "X-LegalFlow-Timestamp": Date.now().toString(),
  };
}