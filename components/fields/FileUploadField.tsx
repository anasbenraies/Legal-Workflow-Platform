"use client";

import { useRef, useState } from "react";
import { Label } from "@/shcn_components/ui/label";
import type { FormField } from "@/types/workflow";

export function FileUploadField({
  field,
  onChange,
  error,
}: {
  field: FormField;
  onChange: (file: File | null) => void;
  error?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFile(file: File | null) {
    if (file && file.type !== "application/pdf") return;
    setFileName(file?.name ?? null);
    onChange(file);
  }

  return (
    <div className="lf-field">
      <Label>
        {field.label} {field.required && <span className="text-red-500">*</span>}
      </Label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files[0] ?? null);
        }}
        className={`mt-1 flex flex-col items-center justify-center border-2 border-dashed rounded-[var(--lf-radius)] p-8 text-center cursor-pointer transition
          ${dragOver ? "border-[var(--lf-primary)] bg-[var(--lf-primary)]/5" : "border-gray-300"}`}
      >
        <span className="text-2xl mb-2">📄</span>
        <p className="text-sm text-gray-600">
          {fileName ?? "Drop your PDF here, or click to browse"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}