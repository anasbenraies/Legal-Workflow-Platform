import { NextRequest, NextResponse } from "next/server";
import { listWorkflows, createWorkflow } from "@/lib/firestore";

export async function GET() {
  const workflows = await listWorkflows();
  return NextResponse.json({ workflows });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const workflow = await createWorkflow({
    name: body.name,
    description: body.description,
    fields: body.fields ?? [],
    theme: body.theme,
    webhookUrl: body.webhookUrl ?? "",
    allowedDomains: body.allowedDomains ?? [],
  });
  return NextResponse.json({ workflow }, { status: 201 });
}