"use client";

import { Label } from "@/shcn_components/ui/label";
import type { ThemeConfig } from "@/types/workflow";

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-xs text-gray-500">{label}</Label>
      <div className="flex items-center gap-2 mt-1">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 rounded border cursor-pointer" />
        <span className="text-sm font-mono">{value}</span>
      </div>
    </div>
  );
}

export function ThemeCustomizer({ theme, onChange }: { theme: ThemeConfig; onChange: (t: ThemeConfig) => void }) {
  function set<K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) {
    onChange({ ...theme, [key]: value });
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold text-sm">🎨 Theme</h3>

      <div className="grid grid-cols-2 gap-3">
        <ColorPicker label="Background" value={theme.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
        <ColorPicker label="Primary" value={theme.primaryColor} onChange={(v) => set("primaryColor", v)} />
      </div>

      <div>
        <Label className="text-xs text-gray-500">Font family</Label>
        <select className="lf-input w-full mt-1" value={theme.fontFamily}
          onChange={(e) => set("fontFamily", e.target.value as ThemeConfig["fontFamily"])}>
          <option value="inter">Inter</option>
          <option value="georgia">Georgia</option>
          <option value="roboto">Roboto</option>
        </select>
      </div>

      <div>
        <Label className="text-xs text-gray-500">Border radius</Label>
        <select className="lf-input w-full mt-1" value={theme.borderRadius}
          onChange={(e) => set("borderRadius", e.target.value as ThemeConfig["borderRadius"])}>
          {["none", "sm", "md", "lg", "full"].map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div>
        <Label className="text-xs text-gray-500">Input style</Label>
        <select className="lf-input w-full mt-1" value={theme.inputStyle}
          onChange={(e) => set("inputStyle", e.target.value as ThemeConfig["inputStyle"])}>
          {["outlined", "filled", "underlined"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <Label className="text-xs text-gray-500">Layout density</Label>
        <select className="lf-input w-full mt-1" value={theme.layout}
          onChange={(e) => set("layout", e.target.value as ThemeConfig["layout"])}>
          {["compact", "comfortable", "spacious"].map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
    </div>
  );
}