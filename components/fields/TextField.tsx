"use client";

import { Input } from "@/shcn_components/ui/input";
import { Label } from "@/shcn_components/ui/label";

import type { FormField } from "@/types/workflow";


//gère text et email 
export function TextField({
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
      <Input
        id={field.id}
        type={field.type === "email" ? "email" : "text"}
        placeholder={field.placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="lf-input"
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}