"use client";

import { useEffect, useState } from "react";
import { Label } from "@/shcn_components/ui/label";
import { Input } from "@/shcn_components/ui/input";
import { Button } from "@/shcn_components/ui/button";
import { generateId } from "@/lib/utils";
import type { FormField } from "@/types/workflow";

type Row = { rowId: string; values: Record<string, string> };

export function DynamicListField({
  field,
  value,
  onChange,
  error,
}: {
  field: FormField;
  value: Record<string, string>[];
  onChange: (rows: Record<string, string>[]) => void;
  error?: string | null;
}) {
  const subFields = field.subFields ?? [];

  const [rows, setRows] = useState<Row[]>(() => {
    if (value?.length) return value.map((v) => ({ rowId: generateId(), values: v }));
    return [{ rowId: generateId(), values: {} }]; // minimum 1 entrée pré-remplie
  });

  useEffect(() => {
    onChange(rows.map((r) => r.values));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  function updateCell(rowId: string, subFieldId: string, val: string) {
    setRows((prev) =>
      prev.map((r) => (r.rowId === rowId ? { ...r, values: { ...r.values, [subFieldId]: val } } : r))
    );
  }

  function addRow() {
    setRows((prev) => [...prev, { rowId: generateId(), values: {} }]);
  }

  function removeRow(rowId: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.rowId !== rowId) : prev));
  }

  return (
    <div className="lf-field">
      <Label>
        {field.label} {field.required && <span className="text-red-500">*</span>}
      </Label>

      <div className="flex flex-col gap-3 mt-2">
        {rows.map((row) => (
          <div key={row.rowId} className="flex items-end gap-2 border rounded-[var(--lf-radius)] p-3">
            {subFields.map((sub) => (
              <div key={sub.id} className="flex-1">
                <Label className="text-xs text-gray-500">{sub.label}</Label>
                <Input
                  placeholder={sub.placeholder}
                  value={row.values[sub.id] ?? ""}
                  onChange={(e) => updateCell(row.rowId, sub.id, e.target.value)}
                  className="lf-input"
                />
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeRow(row.rowId)}
              aria-label="Remove row"
            >
              ✕
            </Button>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addRow}>
        + Add {field.label.replace(/s$/, "")}
      </Button>

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}