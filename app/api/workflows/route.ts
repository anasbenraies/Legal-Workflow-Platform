import { NextRequest, NextResponse } from "next/server";
import { listWorkflows, createWorkflow } from "@/lib/firestore";
import { validateAndSanitizeWorkflow } from "@/lib/validation";
import type { WorkflowCreateInput } from "@/lib/validation";
import { DEFAULT_THEME } from "@/types/workflow";

export async function GET() {
  const workflows = await listWorkflows();
  return NextResponse.json({ workflows });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log(JSON.stringify(body, null, 2));
  let parsed: WorkflowCreateInput;
  try {
    parsed = validateAndSanitizeWorkflow(body);
  } catch (err: any) {
    console.error("Validation error:", err);
    return NextResponse.json(
      { error: "Invalid input", details: err?.message ?? String(err) },
      { status: 400 }
    );
  }

  const workflow = await createWorkflow({
    name: parsed.name,
    description: parsed.description,
    fields: parsed.fields ?? [],
    theme: parsed.theme ?? DEFAULT_THEME,
    webhookUrl: parsed.webhookUrl ?? "",
    allowedDomains: parsed.allowedDomains ?? [],
  });

  return NextResponse.json({ workflow }, { status: 201 });
}