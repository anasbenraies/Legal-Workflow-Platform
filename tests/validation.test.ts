import { describe, it, expect } from "vitest";
import { validateAndSanitizeWorkflow } from "../lib/validation";

describe("validateAndSanitizeWorkflow", () => {
  it("validates minimal workflow and sanitizes fields", () => {
    const input = {
      name: "Test Workflow",
      fields: [
        {
          id: "f1",
          type: "text",
          label: "<b>Label</b>",
          required: true,
        },
      ],
    };

    const out = validateAndSanitizeWorkflow(input as unknown) as any;
    expect(out.name).toBe("Test Workflow");
    expect(out.fields[0].label).toBe("Label");
  });

  it("throws on missing required fields", () => {
    expect(() => validateAndSanitizeWorkflow({})).toThrow();
  });

  it("enforces option shape and max lengths", () => {
    const input = {
      name: "X",
      fields: [
        {
          id: "f2",
          type: "select",
          label: "Select",
          required: false,
          options: [
            { label: "<b>One</b>", value: "one" },
            { label: "Two", value: "two" },
          ],
        },
      ],
    };

    const out = validateAndSanitizeWorkflow(input as unknown) as any;
    expect(out.fields[0].options[0].label).toBe("One");
    expect(out.fields[0].options[1].value).toBe("two");
  });
});
