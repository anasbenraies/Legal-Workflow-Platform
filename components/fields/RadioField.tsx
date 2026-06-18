"use client";

import { Label } from "@/shcn_components/ui/label";
import type { FormField } from "@/types/workflow";


// (inclut le warning "high urgency" — Feature 3.2)
export function RadioField({
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
      <div className="flex flex-col gap-2 mt-1">
        {field.options?.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={field.id}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              style={{ accentColor: "var(--lf-primary)" }}
            />
            {opt.label}
          </label>
        ))}
      </div>

      {/* Comportement spécifique défini dans la spec : champ "urgency" + valeur "high" */}
      {field.id === "urgency" && value === "high" && (
        <p className="text-sm text-red-600 mt-2">
          ⚠️ High urgency submissions are reviewed within 2 hours.
        </p>
      )}

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}