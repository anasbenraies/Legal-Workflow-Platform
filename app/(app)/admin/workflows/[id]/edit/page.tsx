"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/shcn_components/ui/input";
import { Button } from "@/shcn_components/ui/button";
import { FieldList } from "@/components/builder/FieldList";
import { ThemeCustomizer } from "@/components/builder/ThemeCustomizer";
import { WorkflowPreview } from "@/components/builder/WorkflowPreview";
import type { WorkflowSchemaClient } from "@/types/workflow";
import { ArrowLeft, Code2, Webhook, Globe, Save, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function EditWorkflowPage() {
  const { id } = useParams<{ id: string }>();
  const [workflow, setWorkflow] = useState<WorkflowSchemaClient | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const { token } = useAuth();
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [allowedDomainsInput, setAllowedDomainsInput] = useState<string>(() => workflow?.allowedDomains?.join(", ") ?? "");

  useEffect(() => {
    if (workflow) setAllowedDomainsInput(workflow.allowedDomains.join(", "));
  }, [workflow?.allowedDomains]);

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

  useEffect(() => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    fetch(`/api/workflows/${id}`, { headers })
      .then((r) => {
        if (r.status === 401) {
          // unauthorized — clear workflow and bail
          setWorkflow(null);
          return { workflow: null };
        }
        return r.json();
      })
      .then((d) => setWorkflow(d.workflow))
      .catch((e) => {
        console.error("Failed to load workflow:", e);
        setWorkflow(null);
      });
  }, [id, token]);

  const copyEmbedSnippet = async () => {
    await navigator.clipboard.writeText(embedSnippet);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  async function handleSave() {
    if (!workflow) return;
    setSaving(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`/api/workflows/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(workflow),
      });

      if (res.status === 401) {
        // optional: show message or force logout elsewhere; for now log
        console.warn("Unauthorized when saving workflow");
      }
    } finally {
      setSaving(false);
    }
  }

  if (!workflow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-sm">Loading workflow…</p>
        </div>
      </div>
    );
  }

  // Normalize NEXT_PUBLIC_APP_URL to avoid duplicate slashes when concatenating
  const rawBase = process.env.NEXT_PUBLIC_APP_URL || "";
  const base = rawBase.replace(/\/+$/g, "");
  const embedUrl = base ? `${base}/embed.js` : "/embed.js";

  const embedSnippet = `<div id="legalflow-widget"></div>
<script
  src="${embedUrl}"
  data-workflow-id="${workflow.id}"
></script>`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-2 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/admin/workflows"
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Input
              value={workflow.name}
              onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
              className="text-xl font-semibold border-none shadow-none px-0 focus-visible:ring-0 w-auto min-w-0 tracking-tight"
            />
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
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Embed snippet */}
        <details className="group mb-8 border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
          <summary className="cursor-pointer select-none list-none flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Code2 className="w-4 h-4 text-gray-400" />
            Embed snippet

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault(); // prevents details from opening/closing
                e.stopPropagation();
                copyEmbedSnippet();
              }}
              className="ml-2 px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-100"
            >
              {copied ? "Copied!" : "Copy"}
            </button>

            <span className="ml-auto text-gray-300 text-xs group-open:rotate-180 transition-transform">
              ▾
            </span>
          </summary>
          <pre className="text-xs m-3 mt-0 bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto leading-relaxed">
            {embedSnippet}
          </pre>
        </details>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column — settings */}
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Webhook className="w-4 h-4 text-gray-400" />
                Connection settings
              </div>
              <p className="text-xs text-gray-400">Hmac are stored in the database. For now, use your own database to find hmac keys, or ask the administrator.</p>
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
                    value={allowedDomainsInput}
                    onChange={(e) => setAllowedDomainsInput(e.target.value)}
                    onBlur={() =>
                      setWorkflow({
                        ...workflow,
                        allowedDomains: allowedDomainsInput.split(",").map((s) => s.trim()).filter(Boolean),
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

          {/* Right column — preview */}
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