import type { Timestamp } from "firebase-admin/firestore";

export type FieldType =
  | "text"
  | "email"
  | "select"
  | "radio"
  | "file"
  | "dynamic_list";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string; // uuid stable — jamais l'index du tableau
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: FieldOption[]; // select / radio
  subFields?: Omit<FormField, "subFields">[]; // dynamic_list
}

export interface ThemeConfig {
  backgroundColor: string;
  primaryColor: string;
  fontFamily: "inter" | "georgia" | "roboto";
  borderRadius: "none" | "sm" | "md" | "lg" | "full";
  inputStyle: "outlined" | "filled" | "underlined";
  layout: "compact" | "comfortable" | "spacious";
}

export interface WorkflowSchema {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  theme: ThemeConfig;
  webhookUrl: string;
  allowedDomains: string[];
  hmacSecret: string; // ⚠️ ne JAMAIS sérialiser dans une réponse API
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

// Ce que l'admin manipule côté client (sans le secret, jamais transmis au navigateur)
export type WorkflowSchemaClient = Omit<WorkflowSchema, "hmacSecret">;

// Ce que /api/widget/[workflowId] renvoie publiquement
export interface WidgetConfigResponse {
  id: string;
  name: string;
  fields: FormField[];
  theme: ThemeConfig;
}

export const DEFAULT_THEME: ThemeConfig = {
  backgroundColor: "#ffffff",
  primaryColor: "#4f46e5",
  fontFamily: "inter",
  borderRadius: "md",
  inputStyle: "outlined",
  layout: "comfortable",
};

export function createEmptyWorkflow(): WorkflowSchemaClient {
  return {
    id: "",
    name: "Untitled workflow",
    description: "",
    fields: [],
    theme: DEFAULT_THEME,
    webhookUrl: "",
    allowedDomains: [],
    createdAt: "",
    updatedAt: "",
  };
}