import { NextRequest, NextResponse } from "next/server";
import {
  getWorkflowInternal,
  createSubmission,
  updateSubmissionWebhookStatus,
} from "@/lib/firestore";
import { sanitizeValue } from "@/lib/sanitize";
import { buildWebhookHeaders } from "@/lib/hmac";

// --------------------
// CORS helper (NEW)
// --------------------
function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// --------------------
// OPTIONS handler (NEW)
// --------------------
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");

  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

/*
 submit workflow data, trigger webhook if configured
 documentaion can be found in docs\API_AND_SENSITIVE.md
*/
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const origin = req.headers.get("origin") ?? "";

  const workflow = await getWorkflowInternal((await params).workflowId);

  if (!workflow) {
    return NextResponse.json(
      { error: "Workflow not found" },
      {
        status: 404,
        headers: corsHeaders(origin),
      }
    );
  }

  // 1. Vérifier Origin
  const allowed = workflow.allowedDomains ?? [];

  if (!allowed.includes(origin) && !allowed.includes("*")) {
    return NextResponse.json(
      { error: "Origin not allowed" },
      {
        status: 403,
        headers: corsHeaders(origin),
      }
    );
  }

  const body = await req.json();

  // 2. Sanitizer
  const cleanData = sanitizeValue(body.data) as Record<string, unknown>;

  // 3. Écrire dans Firestore
  const submissionId = await createSubmission({
    workflowId: workflow.id,
    data: cleanData,
    origin,
  });

  // 4 + 5. Webhook (UNCHANGED)
  if (workflow.webhookUrl) {
    const payload = {
      submissionId,
      workflowId: workflow.id,
      data: cleanData,
    };

    const headers = buildWebhookHeaders(payload, workflow.hmacSecret);

    try {
      const res = await fetch(workflow.webhookUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });

      await updateSubmissionWebhookStatus(
        submissionId,
        res.ok ? "sent" : "failed"
      );

      if (!res.ok) {
        console.error(`Webhook failed with status ${res.status}`);
      }
    } catch (err) {
      await updateSubmissionWebhookStatus(submissionId, "failed");
      console.error("Webhook delivery error:", err);
    }
  }

  // 6. Response (ONLY CORS ADDED)
  return NextResponse.json(
    { success: true, submissionId },
    {
      headers: corsHeaders(origin),
    }
  );
}