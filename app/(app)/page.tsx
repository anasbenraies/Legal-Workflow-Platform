"use client"

import type { FC, ComponentType, ReactNode } from "react";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  GripVertical,
  Type,
  Mail,
  ChevronDown,
  Disc,
  Paperclip,
  ListPlus,
  ShieldCheck,
  Lock,
  Webhook,
  Code2,
  ArrowRight,
  CheckCircle2,
  PenTool,
} from "lucide-react";
import { Button } from "@/shcn_components/ui/button";
import { Card, CardContent } from "@/shcn_components/ui/card";
import { Badge } from "@/shcn_components/ui/badge";

// Thème clair : la page est blanche partout, sauf deux "moments d'encre"
// volontaires (bloc de code signé + bande CTA finale) qui restent sombres —
// écho au sceau d'un document légal signé plutôt qu'un simple dark→light flip.
const C: Record<string, string> = {
  paper: "#FFFFFF",
  line: "rgba(11,17,32,0.08)",
  indigo: "#4F46E5",
  indigoGlow: "#818CF8",
  indigoDeep: "#4338CA", // pour le texte/accents qui ont besoin de contraste sur blanc
  seal: "#92400E", // ambre assombri pour rester lisible en texte sur fond blanc
  sealDot: "#D9A441", // décoratif uniquement (petit point), pas de contrainte de contraste
  ink: "#0B1120",
  slate: "#5B6478",
  frost: "#E9ECF8", // réservé aux surfaces sombres (code panels, CTA finale)
};

const FONT_DISPLAY = "'Fraunces', serif";
const FONT_BODY = "'Inter', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

function hexA(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type Feature = { icon: ComponentType<any>; title: string; body: string };

const FEATURES: Feature[] = [
  { icon: GripVertical, title: "Drag-and-drop builder", body: "Reorder fields by dragging — the order you see is the order that's saved." },
  { icon: PenTool, title: "Match your firm's look", body: "Set colors, font, radius and density once. Every embedded form inherits it." },
  { icon: Code2, title: "One script tag to embed", body: "Drop a single <script> on your site. No iframe wrestling, no CSS conflicts." },
  { icon: ListPlus, title: "Repeatable fields", body: "Let clients add shareholders, dependents or attachments — as many rows as they need." },
  { icon: Webhook, title: "Signed webhook delivery", body: "Every submission ships to your endpoint with an HMAC-SHA256 signature you can verify." },
  { icon: ShieldCheck, title: "Sanitized before it's stored", body: "Input is cleaned on write, and forms only render on domains you allow." },
];

type Step = { n: string; title: string; body: string };

const STEPS: Step[] = [
  { n: "01", title: "Design the form", body: "Add fields, reorder them, set the theme. The preview updates as you work — nothing is saved until you choose to." },
  { n: "02", title: "Embed the snippet", body: "Paste one script tag into your site. It renders the live form, themed and ready." },
  { n: "03", title: "Receive signed submissions", body: "Each submission is sanitized, stored, and forwarded to your webhook with a signature you can verify." },
];

const FieldRow: FC<{ icon: ComponentType<any>; label: string; last?: boolean }> = ({ icon: Icon, label, last }) => {
  return (
    <div className={`flex items-center gap-2 text-xs py-1.5 ${last ? "" : "mb-1"}`} style={{ color: "#334155" }}>
      <GripVertical className="h-3 w-3 opacity-40" />
      <Icon className="h-3 w-3" style={{ color: C.indigoGlow }} />
      <span>{label}</span>
    </div>
  );
};

const TrustItem: FC<{ icon: ComponentType<any>; text: ReactNode }> = ({ icon: Icon, text }) => {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon className="h-3.5 w-3.5" />
      {text}
    </span>
  );
};

const Divider: FC = () => {
  return <span className="hidden sm:inline-block h-3 w-px" style={{ background: C.line }} />;
};

export default function LegalFlowLanding() {
  const router = useRouter();

  // On mount, if the user already has a persisted auth token, redirect
  // them straight to the admin workflows; otherwise send to the auth page.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("lf_auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token) {
          router.push("/admin/workflows");
          return;
        }
      }
    } catch (e) {
      // ignore parse errors
    }
    // not logged in: send to auth
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden" style={{ background: C.paper, color: C.ink, fontFamily: FONT_BODY }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
        .lf-fade { animation: lfFadeUp 0.7s ease both; }
        @keyframes lfFadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .lf-black-btn{ background:#000 !important; color:#fff !important; box-shadow: none !important; }
        .lf-black-btn:hover{ filter:brightness(1.05) }
      `}</style>

      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(60% 50% at 80% 0%, ${hexA(C.indigo, 0.06)}, transparent 60%), radial-gradient(40% 40% at 10% 10%, ${hexA(C.indigoGlow, 0.05)}, transparent 60%)`,
        }}
      />

      

      {/* HERO */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="lf-fade">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest px-3 py-1 rounded-full mb-6" style={{ border: `1px solid ${C.line}`, color: C.indigoDeep, fontFamily: FONT_MONO }}>
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: C.sealDot }} />
            Intake forms, signed and embedded
          </div>

          <h1 className="text-4xl sm:text-5xl leading-[1.05] font-medium mb-6" style={{ fontFamily: FONT_DISPLAY }}>
            Turn client intake into a five-minute build.
          </h1>

          <p className="text-base sm:text-lg mb-8 max-w-md" style={{ color: C.slate }}>
            Build a branded intake form, embed it on your site with one script tag, and get every
            submission delivered to you — sanitized, stored, and signed.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Button asChild className="lf-black-btn">
              <a href="/admin/auth" className="inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-medium transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2">Start building <ArrowRight className="h-4 w-4" /></a>
            </Button>
            <Button asChild className="lf-white-btn" variant="ghost" size="sm">
              <a href="#how-it-works" className="text-sm font-medium">See how it works</a>
            </Button>
          </div>
        </div>

        {/* signature visual: builder + live preview, mirrors the actual product */}
        <div className="lf-fade" style={{ animationDelay: "0.15s" }}>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <CardContent className="p-0">
                <p className="text-[11px] uppercase tracking-widest mb-2" style={{ fontFamily: FONT_MONO }}>Fields</p>
                <FieldRow icon={Type} label="Full name" />
                <FieldRow icon={Mail} label="Email" />
                <FieldRow icon={ChevronDown} label="Matter type" />
                <FieldRow icon={Disc} label="Urgency" />
                <FieldRow icon={Paperclip} label="Upload ID" last />
              </CardContent>
            </Card>

            <Card className="p-3">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] uppercase tracking-widest" style={{ fontFamily: FONT_MONO }}>Preview</p>
                  <Badge variant="secondary">Live</Badge>
                </div>
                <div className="space-y-2">
                  <div className="h-7 rounded-md bg-muted" />
                  <div className="h-7 rounded-md bg-muted" />
                  <div className="h-7 rounded-md w-2/3 bg-muted" />
                  <div className="h-8 rounded-md mt-3 flex items-center justify-center text-xs font-medium bg-primary text-primary-foreground">Submit</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-16">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-x-10 gap-y-3 py-5 px-6 rounded-xl text-xs sm:text-sm" style={{ border: `1px solid ${C.line}`, color: C.slate, fontFamily: FONT_MONO }}>
          <TrustItem icon={Lock} text="HMAC-SHA256 signed payloads" />
          <Divider />
          <TrustItem icon={ShieldCheck} text="Sanitized on write" />
          <Divider />
          <TrustItem icon={Webhook} text="Origin-locked widget" />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="max-w-xl mb-12">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: C.indigoDeep, fontFamily: FONT_MONO }}>What's included</p>
          <h2 className="text-3xl font-medium" style={{ fontFamily: FONT_DISPLAY }}>Everything an intake form needs, nothing it doesn't.</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="p-5 transition-transform hover:-translate-y-1">
                <CardContent className="p-0">
                  <Icon className="h-5 w-5 mb-3 text-muted-foreground" />
                  <h3 className="text-sm font-semibold mb-1.5">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="max-w-xl mb-12">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: C.indigoDeep, fontFamily: FONT_MONO }}>Process</p>
          <h2 className="text-3xl font-medium" style={{ fontFamily: FONT_DISPLAY }}>From blank form to signed submission.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s) => (
            <div key={s.n}>
              <p className="text-3xl mb-3" style={{ fontFamily: FONT_DISPLAY, color: C.indigoDeep }}>{s.n}</p>
              <h3 className="text-base font-semibold mb-2">{s.title}</h3>
              <p className="text-sm mb-4" style={{ color: C.slate }}>{s.body}</p>
              {s.n === "02" && (
                // Bloc "d'encre" volontaire : reste sombre même en thème clair (cf. note en haut du fichier)
                <pre className="text-[11px] rounded-lg p-3 overflow-x-auto" style={{ background: "#070B14", border: `1px solid rgba(233,236,248,0.12)`, color: C.frost, fontFamily: FONT_MONO }}>
{`<div id="legalflow-widget"></div>
<script
  src="https://legal-workflow-platform/embed.js"
  data-workflow-id="wf_8f2a1c"
></script>`}
                </pre>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-10 rounded-2xl p-8 md:p-10" style={{ background: "#F6F7FB", border: `1px solid ${C.line}` }}>
          <div>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: C.seal, fontFamily: FONT_MONO }}>Built for sensitive data</p>
            <h2 className="text-2xl font-medium mb-4" style={{ fontFamily: FONT_DISPLAY }}>Client data deserves more than a contact form.</h2>
            <ul className="space-y-3 text-sm" style={{ color: C.slate }}>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: C.indigoDeep }} /> Every field is stripped of scripts and markup before it's stored.</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: C.indigoDeep }} /> Forms only render on the domains you list — nowhere else.</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: C.indigoDeep }} /> Each webhook payload carries a signature only you can verify.</li>
            </ul>
          </div>
          {/* Deuxième bloc d'encre : même logique que le snippet ci-dessus */}
          <div className="rounded-xl p-5 text-xs" style={{ background: "#070B14", border: `1px solid rgba(233,236,248,0.12)`, fontFamily: FONT_MONO, color: C.slate }}>
            <p className="mb-2" style={{ color: C.frost }}>POST /your-endpoint</p>
            <p style={{ color: C.frost }}>X-LegalFlow-Signature: sha256=8f3a1c…</p>
            <p className="mb-3" style={{ color: C.frost }}>X-LegalFlow-Timestamp: 1750000000</p>
            <p style={{ color: C.frost }}>{"{"}</p>
            <p className="pl-4" style={{ color: C.frost }}>"submissionId": "sub_4e2a",</p>
            <p className="pl-4" style={{ color: C.frost }}>"workflowId": "wf_8f2a1c",</p>
            <p className="pl-4" style={{ color: C.frost }}>"data": {"{ …sanitized… }"}</p>
            <p style={{ color: C.frost }}>{"}"}</p>
          </div>
        </div>
      </section>

      {/* FINAL CTA — l'autre moment d'encre volontaire, en symétrie avec les blocs de code */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
          <div className="rounded-2xl px-8 py-14 text-center" style={{ background: `#000`, border: `1px solid rgba(255,255,255,0.06)` }}>
          <h2 className="text-3xl sm:text-4xl font-medium mb-4" style={{ fontFamily: FONT_DISPLAY, color: C.frost }}>Start building your first workflow.</h2>
          <p className="text-sm sm:text-base mb-8 max-w-md mx-auto" style={{ color: "rgba(233,236,248,0.75)" }}>No credit card. No code. Just a form your clients can fill out, and you can trust.</p>
          <Button asChild className="lf-white-btn">
            <a href="/admin/auth" className="inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2">Get started <ArrowRight className="h-4 w-4" /></a>
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderTop: `1px solid ${C.line}`, color: C.slate }}>
        <span>© {new Date().getFullYear()} LegalFlow</span>
        <span style={{ fontFamily: FONT_MONO }}>Built on signed webhooks, not promises.</span>
      </footer>
    </div>
  );
}