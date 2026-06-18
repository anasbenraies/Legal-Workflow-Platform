import { adminDb } from "./firebase-admin";
import { generateSecret } from "./hmac";
import type { WorkflowSchema, WorkflowSchemaClient } from "@/types/workflow";
import { Timestamp } from "firebase-admin/firestore";
import { randomUUID } from "crypto";

const WORKFLOWS = "workflows";
const SUBMISSIONS = "submissions";

function stripSecret(doc: WorkflowSchema): WorkflowSchemaClient {
  const { hmacSecret, ...rest } = doc;
  return rest;
}

export async function listWorkflows(): Promise<WorkflowSchemaClient[]> {
  const snap = await adminDb.collection(WORKFLOWS).orderBy("updatedAt", "desc").get();
  return snap.docs.map((d) => stripSecret(d.data() as WorkflowSchema));
}

export async function getWorkflowPublic(id: string): Promise<WorkflowSchemaClient | null> {
  const doc = await adminDb.collection(WORKFLOWS).doc(id).get();
  if (!doc.exists) return null;
  return stripSecret(doc.data() as WorkflowSchema);
}

// Usage interne uniquement (signature webhook) — ne JAMAIS retourner ce résultat dans une réponse HTTP
export async function getWorkflowInternal(id: string): Promise<WorkflowSchema | null> {
  const doc = await adminDb.collection(WORKFLOWS).doc(id).get();
  if (!doc.exists) return null;
  return doc.data() as WorkflowSchema;
}

export async function createWorkflow(
  input: Omit<WorkflowSchemaClient, "id" | "createdAt" | "updatedAt">
): Promise<WorkflowSchemaClient> {
  const id = `wf_${randomUUID()}`;
  const now = Timestamp.now();

  const doc: WorkflowSchema = {
    ...input,
    id,
    hmacSecret: generateSecret(),
    createdAt: now,
    updatedAt: now,
  };

  await adminDb.collection(WORKFLOWS).doc(id).set(doc);
  return stripSecret(doc);
}

export async function updateWorkflow(
  id: string,
  input: Partial<Omit<WorkflowSchemaClient, "id" | "createdAt">>
): Promise<WorkflowSchemaClient | null> {
  const ref = adminDb.collection(WORKFLOWS).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return null;

  await ref.update({ ...input, updatedAt: Timestamp.now() });
  const updated = await ref.get();
  return stripSecret(updated.data() as WorkflowSchema);
}

export async function deleteWorkflow(id: string): Promise<void> {
  await adminDb.collection(WORKFLOWS).doc(id).delete();
}

export async function createSubmission(data: {
  workflowId: string;
  data: Record<string, unknown>;
  origin: string;
}) {
  const ref = adminDb.collection(SUBMISSIONS).doc();
  await ref.set({
    id: ref.id,
    workflowId: data.workflowId,
    data: data.data,
    origin: data.origin,
    webhookStatus: "pending",
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updateSubmissionWebhookStatus(
  submissionId: string,
  status: "sent" | "failed"
) {
  await adminDb.collection(SUBMISSIONS).doc(submissionId).update({ webhookStatus: status });
}