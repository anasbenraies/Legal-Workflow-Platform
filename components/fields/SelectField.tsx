"use client";

import { Label } from "@/shcn_components/ui/label";
import type { FormField } from "@/types/workflow";

export function SelectField({
  field,
  value,
  onChange,
  error,
}: {
  field: FormField;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
}) {
  return (
    <div className="lf-field">
      <Label htmlFor={field.id}>
        {field.label} {field.required && <span className="text-red-500">*</span>}
      </Label>
      <select
        id={field.id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="lf-input w-full"
      >
        <option value="" disabled>
          {field.placeholder ?? "Select…"}
        </option>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}