import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import type { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import type { FormField, ThemeConfig } from "@/types/workflow";

function normalizeTheme(input: any): ThemeConfig {
  const allowedFonts = ["inter", "roboto", "georgia"] as const;
  const allowedRadii = ["none", "sm", "md", "lg", "full"] as const;

  const defaultTheme: ThemeConfig = {
    backgroundColor: "#ffffff",
    primaryColor: "#4f46e5",
    fontFamily: "inter",
    borderRadius: "md",
    inputStyle: "outlined",
    layout: "comfortable",
  };

  if (!input || typeof input !== "object") return defaultTheme;

  const font = String(input.fontFamily || "").toLowerCase();
  const borderRadius = String(input.borderRadius || "").toLowerCase();

  return {
    backgroundColor: typeof input.backgroundColor === "string" ? input.backgroundColor : defaultTheme.backgroundColor,
    primaryColor: typeof input.primaryColor === "string" ? input.primaryColor : defaultTheme.primaryColor,
    fontFamily: (allowedFonts.includes(font as any) ? (font as any) : defaultTheme.fontFamily) as ThemeConfig["fontFamily"],
    borderRadius: (allowedRadii.includes(borderRadius as any) ? (borderRadius as any) : defaultTheme.borderRadius) as ThemeConfig["borderRadius"],
    inputStyle: input.inputStyle === "filled" || input.inputStyle === "underlined" ? input.inputStyle : defaultTheme.inputStyle,
    layout: input.layout === "compact" || input.layout === "spacious" ? input.layout : defaultTheme.layout,
  };
}

function ensureThreeFields(raw: any): FormField[] {
  // Always return exactly 3 fields: text, email, select (2 options)
  // If the AI returns something usable, try to map it; otherwise create sensible defaults.
  const textField: FormField = {
    id: uuidv4(),
    type: "text",
    label: "Full name",
    placeholder: "Enter full name",
    required: true,
  };

  const emailField: FormField = {
    id: uuidv4(),
    type: "email",
    label: "Email",
    placeholder: "you@example.com",
    required: true,
  };

  const selectField: FormField = {
    id: uuidv4(),
    type: "select",
    label: "Case type",
    required: true,
    options: [
      { label: "Slip-and-fall", value: "slip_and_fall" },
      { label: "Other", value: "other" },
    ],
  };

  try {
    if (!raw || typeof raw !== "object") return [textField, emailField, selectField];

    const fields = Array.isArray(raw.fields) ? raw.fields : [];
    const mapped: FormField[] = [];

    // pick first text-like
    const t = fields.find((f: any) => f.type === "text" || /name|full name|client/i.test(String(f.label || "")));
    if (t) mapped.push({ id: uuidv4(), type: "text", label: String(t.label || textField.label), placeholder: String(t.placeholder || textField.placeholder), required: !!t.required });
    else mapped.push(textField);

    const e = fields.find((f: any) => f.type === "email" || /email/i.test(String(f.label || "")));
    if (e) mapped.push({ id: uuidv4(), type: "email", label: String(e.label || emailField.label), placeholder: String(e.placeholder || emailField.placeholder), required: !!e.required });
    else mapped.push(emailField);

    const s = fields.find((f: any) => f.type === "select" || Array.isArray(f?.options));
    if (s) {
      const opts = Array.isArray(s.options) && s.options.length >= 2 ? s.options.slice(0, 2).map((o: any) => ({ label: String(o.label || o.value || "Option"), value: String(o.value || o.label || "option") })) : selectField.options;
      mapped.push({ id: uuidv4(), type: "select", label: String(s.label || selectField.label), required: !!s.required, options: opts });
    } else mapped.push(selectField);

    return mapped.slice(0, 3);
  } catch (e) {
    return [textField, emailField, selectField];
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token || !verifyToken(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const prompt = body?.prompt;
    if (!prompt || typeof prompt !== "string") return NextResponse.json({ error: "Missing prompt" }, { status: 400 });

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "AI provider not configured" }, { status: 501 });

    // Build a clear system prompt asking for strict JSON
    const system = `You are an assistant that outputs machine-readable JSON only. Given a plain-language request to generate a small intake form, return a JSON object with two keys: \"fields\" (an array of form field objects) and \"theme\" (an object with keys backgroundColor, primaryColor, fontFamily, borderRadius, inputStyle, layout). fontFamily must be one of: inter, roboto, georgia. borderRadius must be one of: none, sm, md, lg, full. Always return exactly three fields in the \"fields\" array: a text input, an email input, and a select with two options. Example: { \"fields\": [{\"type\":\"text\",\"label\":\"Full name\"},...], \"theme\": { ... } }`;

    const payload = {
      prompt: `${system}\n\nUser request: ${prompt}`,
      // model specifics may vary; using Google's text-bison endpoint format
      model: "text-bison-001",
      temperature: 0.2,
      max_output_tokens: 512,
    };

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${system}\n\nUser request: ${prompt}`
              }
            ]
          }
        ]
      })
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");

      console.log("Google Status:", res.status);
      console.log("Google Response:", text);

      return NextResponse.json(
        {
          error: "AI provider error",
          status: res.status,
          details: text,
        },
        { status: 502 }
      );
    }

    const j = await res.json().catch(() => null);
    // Attempt to extract text from Google's response
   const content = j?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    // Expect AI to return pure JSON; try parse
    let parsed: any = null;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      // Try to extract JSON substring
      const m = content.match(/\{[\s\S]*\}/m);
      if (m) {
        try {
          parsed = JSON.parse(m[0]);
        } catch (e) {
          parsed = null;
        }
      }
    }

    const fields = ensureThreeFields(parsed?.fields || parsed);
    const theme = normalizeTheme(parsed?.theme || null);

    return NextResponse.json({ fields, theme });
  } catch (err) {
    console.error("Generate workflow error:", err);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
