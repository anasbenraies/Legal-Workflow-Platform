"use client";

import { useState } from "react";
import { TextField } from "@/components/fields/TextField";
import { SelectField } from "@/components/fields/SelectField";
import { RadioField } from "@/components/fields/RadioField";
import { FileUploadField } from "@/components/fields/FileUploadField";
import { DynamicListField } from "@/components/fields/DynamicListField";
import { Button } from "@/shcn_components/ui/button";
import { validateField } from "@/lib/utils";
import type { FormField, ThemeConfig } from "@/types/workflow";

const RADIUS_MAP: Record<ThemeConfig["borderRadius"], string> = {
  none: "0px", sm: "4px", md: "8px", lg: "16px", full: "9999px",
};

const FONT_MAP: Record<ThemeConfig["fontFamily"], string> = {
  inter: "Inter, sans-serif",
  georgia: "Georgia, serif",
  roboto: "Roboto, sans-serif",
};

const LAYOUT_GAP: Record<ThemeConfig["layout"], string> = {
  compact: "0.75rem", comfortable: "1.25rem", spacious: "2rem",
};


// utilisé à la fois par le Live Preview admin et conceptuellement reproduit en vanilla JS dans embed.js
export function themeToCssVars(theme: ThemeConfig): React.CSSProperties {
  return {
    "--lf-bg": theme.backgroundColor,
    "--lf-primary": theme.primaryColor,
    "--lf-radius": RADIUS_MAP[theme.borderRadius],
    "--lf-gap": LAYOUT_GAP[theme.layout],
    fontFamily: FONT_MAP[theme.fontFamily],
    backgroundColor: theme.backgroundColor,
  } as React.CSSProperties;
}

export function FormRenderer({
  fields,
  theme,
  mode = "live",
  onSubmit,
}: {
  fields: FormField[];
  theme: ThemeConfig;
  mode?: "preview" | "live";
  onSubmit?: (data: Record<string, unknown>) => Promise<void> | void;
}) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function setValue(id: string, v: unknown) {
    setValues((prev) => ({ ...prev, [id]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "preview") return; // pas de soumission réelle dans le builder

    const nextErrors: Record<string, string | null> = {};
    let hasError = false;
    for (const field of fields) {
      const err = validateField(field, values[field.id]);
      nextErrors[field.id] = err;
      if (err) hasError = true;
    }
    setErrors(nextErrors);
    if (hasError) return;

    setSubmitting(true);
    try {
      await onSubmit?.(values);
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ ...themeToCssVars(theme), display: "flex", flexDirection: "column", gap: "var(--lf-gap)" }}
      className="lf-form p-6 rounded-[var(--lf-radius)]"
    >
      {fields.map((field) => {
        const error = errors[field.id];
        switch (field.type) {
          case "text":
          case "email":
            return (
              <TextField key={field.id} field={field} value={values[field.id] as string}
                onChange={(v) => setValue(field.id, v)} error={error} />
            );
          case "select":
            return (
              <SelectField key={field.id} field={field} value={values[field.id] as string}
                onChange={(v) => setValue(field.id, v)} error={error} />
            );
          case "radio":
            return (
              <RadioField key={field.id} field={field} value={values[field.id] as string}
                onChange={(v) => setValue(field.id, v)} error={error} />
            );
          case "file":
            return (
              <FileUploadField key={field.id} field={field}
                onChange={(f) => setValue(field.id, f?.name ?? null)} error={error} />
            );
          case "dynamic_list":
            return (
              <DynamicListField key={field.id} field={field}
                value={(values[field.id] as Record<string, string>[]) ?? []}
                onChange={(rows) => setValue(field.id, rows)} error={error} />
            );
          default:
            return null;
        }
      })}

      <Button
        type="submit"
        disabled={submitting || mode === "preview"}
        style={{ backgroundColor: "var(--lf-primary)", borderRadius: "var(--lf-radius)" }}
        className="text-white mt-2"
      >
        {submitting ? "Submitting…" : success ? "Submitted ✓" : "Submit"}
      </Button>
    </form>
  );
}