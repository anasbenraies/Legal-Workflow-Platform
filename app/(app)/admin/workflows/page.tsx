"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/shcn_components/ui/button";
import type { WorkflowSchemaClient } from "@/types/workflow";
import { Plus, ArrowRight, Workflow as WorkflowIcon, Layers } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function AdminDashboard() {
  const [workflows, setWorkflows] = useState<WorkflowSchemaClient[]>([]);
  const [loading, setLoading] = useState(true);

  const { token } = useAuth();

  useEffect(() => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    fetch("/api/workflows", { headers })
      .then((r) => r.json())
      .then((data) => setWorkflows(Array.isArray(data?.workflows) ? data.workflows : []))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-10 sm:py-14">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gray-900 shadow-sm">
              <WorkflowIcon className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                Workflows
              </h1>
              <p className="text-sm text-gray-500">
                {loading
                  ? "Fetching your workflows…"
                  : `${(workflows?.length ?? 0)} workflow${(workflows?.length ?? 0) === 1 ? "" : "s"} configured`}
              </p>
            </div>
          </div>

          <Link href="/admin/workflows/new">
            <Button className="gap-2 bg-gray-900 hover:bg-gray-800 text-white shadow-sm hover:shadow-md transition-all">
              <Plus className="w-4 h-4" />
              New workflow
            </Button>
          </Link>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-xl p-4 flex items-center justify-between animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100" />
                  <div className="space-y-2">
                    <div className="h-3.5 w-36 bg-gray-100 rounded" />
                    <div className="h-2.5 w-20 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="w-4 h-4 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Workflow list */}
        {!loading && (
          <div className="grid gap-3">
            {workflows.map((wf) => (
              <Link
                key={wf.id}
                href={`/admin/workflows/${wf.id}/edit`}
                className="group border border-gray-200 rounded-xl p-4 bg-white hover:border-gray-300 hover:shadow-md transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 group-hover:bg-gray-100 transition-colors flex-shrink-0">
                    <Layers className="w-4 h-4 text-gray-500" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{wf.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {wf.fields.length} field{wf.fields.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </Link>
            ))}

            {/* Empty state */}
            {workflows.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-gray-200 rounded-xl">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 border border-gray-100 mb-4">
                  <WorkflowIcon className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-gray-700 font-medium mb-1">No workflows yet</p>
                <p className="text-sm text-gray-400 mb-6 max-w-xs">
                  Create your first workflow to start automating your process.
                </p>
                <Link href="/admin/workflows/new">
                  <Button className="gap-2 bg-gray-900 hover:bg-gray-800 text-white">
                    <Plus className="w-4 h-4" />
                    Create workflow
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}