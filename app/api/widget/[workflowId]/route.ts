import { NextRequest, NextResponse } from "next/server";
import { getWorkflowInternal } from "@/lib/firestore";
import type { WidgetConfigResponse } from "@/types/workflow";

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");

  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}


/*
 get widget config (public info only, no secret fields)
 documentaion can be found in docs\API_AND_SENSITIVE.md
*/
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params;

  const origin = req.headers.get("origin");

  const workflow = await getWorkflowInternal(workflowId);

  if (!workflow) {
    return NextResponse.json(
      { error: "Workflow not found" },
      {
        status: 404,
        headers: corsHeaders(origin),
      }
    );
  }

  const allowed = workflow.allowedDomains ?? [];

  const isAllowed =
    allowed.includes("*") || (origin && allowed.includes(origin));

  if (!isAllowed) {
    return NextResponse.json(
      { error: "Origin not allowed" },
      {
        status: 403,
        headers: corsHeaders(origin),
      }
    );
  }

  const response: WidgetConfigResponse = {
    id: workflow.id,
    name: workflow.name,
    fields: workflow.fields,
    theme: workflow.theme,
  };

  return NextResponse.json(response, {
    headers: {
      ...corsHeaders(origin),
      "Cache-Control": "no-store",
    },
  });
}