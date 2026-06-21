"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/shcn_components/ui/input";
import { Button } from "@/shcn_components/ui/button";
import { FieldList } from "@/components/builder/FieldList";
import { ThemeCustomizer } from "@/components/builder/ThemeCustomizer";
import { WorkflowPreview } from "@/components/builder/WorkflowPreview";
import { createEmptyWorkflow } from "@/types/workflow";
import type { WorkflowSchemaClient } from "@/types/workflow";
import { ArrowLeft, Webhook, Globe, Save, Loader2, Sparkles, PlusCircle } from "lucide-react";

export default function NewWorkflowPage() {
  const router = useRouter();
  const [workflow, setWorkflow] = useState<WorkflowSchemaClient>(createEmptyWorkflow());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  async function handleGenerate() {
    setAiError(null);
    setAiLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/workflows/generate", {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAiError(data?.error || data?.message || "AI generation failed");
        return;
      }

      setWorkflow((prev) => ({ ...prev, ...(data?.fields ? { fields: data.fields } : {}), ...(data?.theme ? { theme: data.theme } : {}) } as any));
    } catch (e: any) {
      setAiError(e?.message || "AI request failed");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/workflows", {
        method: "POST",
        headers,
        body: JSON.stringify(workflow),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || data?.message || "Failed to create workflow");
        return;
      }

      if (!data?.workflow?.id) {
        setError("Unexpected response from server");
        return;
      }

      router.push(`/admin/workflows/${data.workflow.id}/edit`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/admin/workflows"
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex-shrink-0">
                <PlusCircle className="w-4 h-4" />
              </span>
              <Input
                value={workflow.name}
                onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                className="text-xl font-semibold border-none shadow-none px-0 focus-visible:ring-0 w-auto min-w-0 tracking-tight"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-gray-900 hover:bg-gray-800 text-white shadow-sm flex-shrink-0"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save workflow
              </>
            )}
          </Button>
          {error && <div className="text-sm text-red-600 ml-4">{error}</div>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panneau gauche : builder */}
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Webhook className="w-4 h-4 text-gray-400" />
                Connection settings
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Webhook URL</label>
                  <Input
                    placeholder="https://example.com/webhook"
                    value={workflow.webhookUrl}
                    onChange={(e) => setWorkflow({ ...workflow, webhookUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                    Allowed domains
                  </label>
                  <Input
                    placeholder="example.com, app.example.com"
                    value={workflow.allowedDomains.join(", ")}
                    onChange={(e) =>
                      setWorkflow({
                        ...workflow,
                        allowedDomains: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-5">
              <ThemeCustomizer theme={workflow.theme} onChange={(theme) => setWorkflow({ ...workflow, theme })} />
            </div>
            
            {/* AI generator */}
            <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">AI generator</div>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder='E.g. "Give me a friendly, light-themed slip-and-fall intake flow"'
                className="w-full min-h-[72px] p-2 border rounded-md"
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  disabled={!token || aiLoading || aiPrompt.trim() === ""}
                  onClick={handleGenerate}
                  className="px-3 py-1 bg-black text-white rounded"
                >
                  {aiLoading ? "Generating…" : "Generate with  AI"}
                </button>
                <div className="text-sm text-red-600">{aiError}</div>
                {!token && <div className="text-sm text-gray-500">Sign in to use AI generator</div>}
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-5">
              <FieldList fields={workflow.fields} onChange={(fields) => setWorkflow({ ...workflow, fields })} />
            </div>
          </div>

          {/* Panneau droit : preview live */}
          <div className="lg:sticky lg:top-24 self-start">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Sparkles className="w-4 h-4 text-gray-400" />
              Live preview
            </div>
            <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-5">
              <WorkflowPreview fields={workflow.fields} theme={workflow.theme} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}