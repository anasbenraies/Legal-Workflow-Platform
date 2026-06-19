import { NextRequest, NextResponse } from "next/server";
import { getWorkflowPublic, updateWorkflow, deleteWorkflow } from "@/lib/firestore";
import { workflowCreateSchema } from "@/lib/validation";
import { sanitizeValue } from "@/lib/sanitize";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workflow = await getWorkflowPublic(id);
  if (!workflow) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ workflow });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json();

  // Remove Firestore timestamp objects if the client sent the full document
  // and normalize webhookUrl to a string (accept null -> empty)
  try {
    if (body && typeof body === "object") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const b = body as any;
      delete b.createdAt;
      delete b.updatedAt;
      if (Object.prototype.hasOwnProperty.call(b, "webhookUrl")) {
        if (b.webhookUrl === null || b.webhookUrl === undefined) b.webhookUrl = "";
        else if (typeof b.webhookUrl !== "string") b.webhookUrl = String(b.webhookUrl);
      }
    }
  } catch (e) {
    // ignore
    console.warn("Error sanitizing input in PUT request:", e);
  }

  const { id } = await params;

  // Validate update payload (accept partial fields)
  let parsed;
  try {
    parsed = workflowCreateSchema.partial().parse(body);
  } catch (err: any) {
    console.error("Validation error:", err);
    return NextResponse.json({ error: "Invalid input", details: err?.message ?? String(err) }, { status: 400 });
  }

  const cleaned = sanitizeValue(parsed) as Record<string, unknown>;

  const workflow = await updateWorkflow(id, cleaned);
  if (!workflow) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ workflow });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteWorkflow(id);
  return NextResponse.json({ success: true });
}