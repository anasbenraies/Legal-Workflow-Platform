import { z } from "zod";
import { sanitizeValue } from "./sanitize";
import { create } from "domain";

const FieldOption = z.object({
  label: z.string().max(200),
  value: z.string().max(200),
});

// SubField has the same shape as FormField but WITHOUT nested subFields (one-level deep)
const SubField = z.object({
  id: z.string(),
  type: z.enum(["text", "email", "select", "radio", "file", "dynamic_list"]),
  label: z.string().max(200),
  placeholder: z.string().max(500).optional(),
  required: z.boolean(),
  options: z.array(FieldOption).optional(),
});

const FormField = z.object({
  id: z.string(),
  type: z.enum(["text", "email", "select", "radio", "file", "dynamic_list"]),
  label: z.string().max(200),
  placeholder: z.string().max(500).optional(),
  required: z.boolean(),
  options: z.array(FieldOption).optional(),
  subFields: z.array(SubField).optional(),
});

const ThemeSchema = z.object({
  backgroundColor: z.string(),
  primaryColor: z.string(),
  fontFamily: z.enum(["inter", "georgia", "roboto"]),
  borderRadius: z.enum(["none", "sm", "md", "lg", "full"]),
  inputStyle: z.enum(["outlined", "filled", "underlined"]),
  layout: z.enum(["compact", "comfortable", "spacious"]),
});

export const workflowCreateSchema = z.object({
  id: z.string().min(0).max(200).optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  fields: z.array(FormField).optional().default([]),
  theme: ThemeSchema.optional(),
  webhookUrl: z.string().url().or(z.literal("")).optional().default(""),
  allowedDomains: z.array(z.string()).optional().default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type WorkflowCreateInput = z.infer<typeof workflowCreateSchema>;

export function validateAndSanitizeWorkflow(input: unknown): WorkflowCreateInput {
  const parsed = workflowCreateSchema.parse(input);

  // sanitize all strings recursively
  const cleaned = sanitizeValue(parsed) as WorkflowCreateInput;

  return cleaned;
}
