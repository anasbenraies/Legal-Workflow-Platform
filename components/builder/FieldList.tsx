"use client";

import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Button } from "@/shcn_components/ui/button";
import { FieldCard } from "./FieldCard";
import { createDefaultField } from "@/lib/utils";
import type { FieldType, FormField } from "@/types/workflow";

const FIELD_TYPES: { type: FieldType; label: string; icon: string }[] = [
  { type: "text", label: "Text", icon: "✏️" },
  { type: "email", label: "Email", icon: "📧" },
  { type: "select", label: "Select", icon: "🔽" },
  { type: "radio", label: "Radio", icon: "🔘" },
  { type: "file", label: "File", icon: "📎" },
  { type: "dynamic_list", label: "Dynamic list", icon: "📋" },
];


export function FieldList({
  fields,
  onChange,
}: {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}) {
  function addField(type: FieldType) {
    onChange([...fields, createDefaultField(type)]);
  }

  function updateField(id: string, updated: FormField) {
    onChange(fields.map((f) => (f.id === id ? updated : f)));
  }

  function deleteField(id: string) {
    onChange(fields.filter((f) => f.id !== id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    onChange(arrayMove(fields, oldIndex, newIndex));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {FIELD_TYPES.map((ft) => (
          <Button key={ft.type} type="button" variant="secondary" size="sm" onClick={() => addField(ft.type)}>
            {ft.icon} {ft.label}
          </Button>
        ))}
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {fields.map((field) => (
              <FieldCard
                key={field.id}
                field={field}
                onUpdate={(f) => updateField(field.id, f)}
                onDelete={() => deleteField(field.id)}
              />
            ))}
            {fields.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No fields yet — add one above.</p>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}