import { NextRequest, NextResponse } from "next/server";
import { listWorkflows, createWorkflow, listWorkflowsByOwner } from "@/lib/firestore";
import { validateAndSanitizeWorkflow } from "@/lib/validation";
import type { WorkflowCreateInput } from "@/lib/validation";
import { DEFAULT_THEME } from "@/types/workflow";
import { verifyToken } from "@/lib/jwt";

function getBearerToken(req: NextRequest) {
  const h = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!h) return null;
  const m = h.match(/^Bearer (.+)$/i);
  return m ? m[1] : null;
}

// List all workflows
// documentaion can be found in docs\API_AND_SENSITIVE.md
export async function GET(req: NextRequest) {
  // return workflows for authenticated user only
  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || !payload.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workflows = await listWorkflowsByOwner(String(payload.sub));
  return NextResponse.json({ workflows });
}

// Create a new workflow
// documentaion can be found in docs\API_AND_SENSITIVE.md
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

  // require auth and attach owner
  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || !payload.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workflow = await createWorkflow({
    name: parsed.name,
    description: parsed.description,
    fields: parsed.fields ?? [],
    theme: parsed.theme ?? DEFAULT_THEME,
    webhookUrl: parsed.webhookUrl ?? "",
    allowedDomains: parsed.allowedDomains ?? [],
    // pass ownerId as an extra property to trigger mapping write in createWorkflow
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ownerId: String(payload.sub),
  } as any & { ownerId: string });

  return NextResponse.json({ workflow }, { status: 201 });
}