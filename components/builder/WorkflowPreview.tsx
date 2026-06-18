"use client";

import { Badge } from "@/shcn_components/ui/badge";
import { FormRenderer } from "@/components/widget/FormRenderer";
import type { FormField, ThemeConfig } from "@/types/workflow";


export function WorkflowPreview({ fields, theme }: { fields: FormField[]; theme: ThemeConfig }) {
  return (
    <div className="sticky top-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-gray-600"></h3>
        <Badge className="bg-green-100 text-green-700">● Preview — Live</Badge>
      </div>
      <div className="border rounded-xl overflow-hidden shadow-sm">
        <FormRenderer fields={fields} theme={theme} mode="preview" />
      </div>
    </div>
  );
}