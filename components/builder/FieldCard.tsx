"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/shcn_components/ui/input";
import { Label } from "@/shcn_components/ui/label";
import { Switch } from "@/shcn_components/ui/switch";
import { Button } from "@/shcn_components/ui/button";
import { generateId } from "@/lib/utils";
import type { FormField, FieldOption } from "@/types/workflow";

const ICON: Record<string, string> = {
  text: "✏️", email: "📧", select: "🔽", radio: "🔘", file: "📎", dynamic_list: "📋",
};

export function FieldCard({
  field,
  onUpdate,
  onDelete,
}: {
  field: FormField;
  onUpdate: (f: FormField) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  function patch(partial: Partial<FormField>) {
    onUpdate({ ...field, ...partial });
  }

  function updateOption(idx: number, partial: Partial<FieldOption>) {
    const next = [...(field.options ?? [])];
    next[idx] = { ...next[idx], ...partial };
    patch({ options: next });
  }


  function addOption() {
    patch({ options: [...(field.options ?? []), { label: "New option", value: `opt_${generateId().slice(0, 6)}` }] });
  }

  function removeOption(idx: number) {
    patch({ options: (field.options ?? []).filter((_, i) => i !== idx) });
  }

  function addSubField() {
    patch({
      subFields: [...(field.subFields ?? []), { id: generateId(), type: "text", label: "Field", required: false }],
    });
  }

  function updateSubField(idx: number, label: string) {
    const next = [...(field.subFields ?? [])];
    next[idx] = { ...next[idx], label };
    patch({ subFields: next });
  }

  function removeSubField(idx: number) {
    patch({ subFields: (field.subFields ?? []).filter((_, i) => i !== idx) });
  }

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg bg-white p-3 space-y-3">
      <div className="flex items-center gap-2">
        <button {...attributes} {...listeners} className="cursor-grab text-gray-400" aria-label="Drag">
          ⠿
        </button>
        <span>{ICON[field.type]}</span>
        <span className="text-xs uppercase tracking-wide text-gray-400">{field.type}</span>
        <div className="flex-1" />
        <Button type="button" variant="ghost" size="sm" onClick={onDelete}>🗑️</Button>
      </div>

      <div>
        <Label className="text-xs text-gray-500">Label</Label>
        <Input value={field.label} onChange={(e) => patch({ label: e.target.value })} />
      </div>

      {field.type !== "dynamic_list" && field.type !== "radio" && field.type !== "select" && (
        <div>
          <Label className="text-xs text-gray-500">Placeholder</Label>
          <Input value={field.placeholder ?? ""} onChange={(e) => patch({ placeholder: e.target.value })} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label className="text-xs text-gray-500">Required</Label>
        <Switch checked={field.required} onCheckedChange={(v) => patch({ required: v })} />
      </div>

      {(field.type === "select" || field.type === "radio") && (
        <div className="space-y-2">
          <Label className="text-xs text-gray-500">Options</Label>
          {field.options?.map((opt, idx) => (
            <div key={idx} className="flex gap-2">
              <Input value={opt.label} onChange={(e) => updateOption(idx, { label: e.target.value })} placeholder="Label" />
              <Input value={opt.value} onChange={(e) => updateOption(idx, { value: e.target.value })} placeholder="value" className="w-28" />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(idx)}>✕</Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addOption}>+ Add option</Button>
        </div>
      )}

      {field.type === "dynamic_list" && (
        <div className="space-y-2">
          <Label className="text-xs text-gray-500">Sub-fields</Label>
          {field.subFields?.map((sub, idx) => (
            <div key={sub.id} className="flex gap-2">
              <Input value={sub.label} onChange={(e) => updateSubField(idx, e.target.value)} />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeSubField(idx)}>✕</Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addSubField}>+ Add sub-field</Button>
        </div>
      )}
    </div>
  );
}