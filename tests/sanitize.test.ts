import { describe, it, expect } from "vitest";
import { sanitizeValue } from "../lib/sanitize";

describe("sanitizeValue", () => {
  it("removes script and HTML tags from strings", () => {
    const input = "<script>alert(1)</script><b>Hello</b>";
    const out = sanitizeValue(input) as string;
    expect(out).toBe("Hello");
  });

  it("strips dangerous URI schemes", () => {
    const input = "javascript:alert('x')";
    const out = sanitizeValue(input) as string;
    expect(out.includes("javascript:")).toBe(false);
  });

  it("sanitizes nested objects and arrays", () => {
    const input = {
      name: "<b>Name</b>",
      tags: ["<i>a</i>", "<script>bad</script>good"],
      meta: { descr: "<img src=x onerror=alert(1)>OK" },
    };

    const out = sanitizeValue(input) as any;
    expect(out.name).toBe("Name");
    expect(out.tags).toEqual(["a", "good"]);
    expect(out.meta.descr).toBe("OK");
  });

  it("truncates long strings to the max length", () => {
    const long = "a".repeat(5000);
    const out = sanitizeValue(long) as string;
    expect(out.length).toBeLessThanOrEqual(2000);
  });
});
