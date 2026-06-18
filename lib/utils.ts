import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return crypto.randomUUID();
}

import type { FieldType, FormField } from "@/types/workflow";

export function createDefaultField(type: FieldType): FormField {
  const base: FormField = {
    id: generateId(),
    type,
    label: defaultLabelFor(type),
    required: false,
  };

  if (type === "select" || type === "radio") {
    base.options = [
      { label: "Option 1", value: "option_1" },
      { label: "Option 2", value: "option_2" },
    ];
  }

  if (type === "dynamic_list") {
    base.subFields = [{ id: generateId(), type: "text", label: "Field", required: true }];
  }

  if (type === "email") base.placeholder = "you@company.com";

  return base;
}

function defaultLabelFor(type: FieldType): string {
  switch (type) {
    case "text": return "Text field";
    case "email": return "Email address";
    case "select": return "Select an option";
    case "radio": return "Choose one";
    case "file": return "Upload document";
    case "dynamic_list": return "Repeatable list";
  }
}

// Validation client-side (Feature 3.3)
export function validateField(field: FormField, value: unknown): string | null {
  if (field.required) {
    const empty =
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);
    if (empty) return `${field.label} is required`;
  }

  if (field.type === "email" && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value as string)) return "Invalid email format";
  }

  if (field.type === "dynamic_list" && Array.isArray(value) && field.subFields) {
    for (const row of value as Record<string, unknown>[]) {
      for (const sub of field.subFields) {
        if (sub.required && !row[sub.id]) {
          return `${sub.label} is required in ${field.label}`;
        }
      }
    }
  }

  return null;
}