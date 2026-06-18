import { NextRequest, NextResponse } from "next/server";
import { getWorkflowPublic, updateWorkflow, deleteWorkflow } from "@/lib/firestore";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workflow = await getWorkflowPublic(id);
  if (!workflow) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ workflow });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json();

  const { id } = await params;
  const workflow = await updateWorkflow(id, body);
  if (!workflow) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ workflow });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteWorkflow(id);
  return NextResponse.json({ success: true });
}