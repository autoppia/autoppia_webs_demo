"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MAIL_TEMPLATES, type MailTemplate } from "@/data/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { cn } from "@/library/utils";

type TemplateState = Record<
  string,
  {
    to: string;
    from: string;
    body: string;
  }
>;

const DEFAULT_FROM = "me@gmail.com";

export default function TemplatesPage() {
  const router = useRouter();
  const [activeTemplateId, setActiveTemplateId] = useState<string>(
    MAIL_TEMPLATES[0]?.id ?? ""
  );
  const [templatesState, setTemplatesState] = useState<TemplateState>(() =>
    MAIL_TEMPLATES.reduce((acc, template) => {
      acc[template.id] = {
        to: "",
        from: DEFAULT_FROM,
        body: template.body,
      };
      return acc;
    }, {} as TemplateState)
  );

  useEffect(() => {
    logEvent(EVENT_TYPES.VIEW_TEMPLATES, {
      template_count: MAIL_TEMPLATES.length,
    });
  }, []);

  const activeTemplate = useMemo(
    () => MAIL_TEMPLATES.find((t) => t.id === activeTemplateId),
    [activeTemplateId]
  );

  const handleSelectTemplate = (template: MailTemplate) => {
    setActiveTemplateId(template.id);
    logEvent(EVENT_TYPES.TEMPLATE_SELECTED, {
      template_id: template.id,
      template_name: template.name,
      subject: template.subject,
    });
  };

  const updateTemplateState = (id: string, updates: Partial<TemplateState[string]>) => {
    setTemplatesState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...updates,
      },
    }));
  };

  const handleBodyChange = (template: MailTemplate, value: string) => {
    updateTemplateState(template.id, { body: value });
    logEvent(EVENT_TYPES.TEMPLATE_BODY_EDITED, {
      template_id: template.id,
      template_name: template.name,
      subject: template.subject,
      body_length: value.length,
    });
  };

  const handleSend = (template: MailTemplate) => {
    const state = templatesState[template.id];
    logEvent(EVENT_TYPES.TEMPLATE_SENT, {
      template_id: template.id,
      template_name: template.name,
      subject: template.subject,
      to: state.to,
      from: state.from,
      body: state.body,
    });
  };

  const handleSaveDraft = (template: MailTemplate) => {
    const state = templatesState[template.id];
    logEvent(EVENT_TYPES.TEMPLATE_SAVED_DRAFT, {
      template_id: template.id,
      template_name: template.name,
      subject: template.subject,
      to: state.to,
      from: state.from,
      body: state.body,
    });
  };

  const handleCancel = (template: MailTemplate) => {
    updateTemplateState(template.id, { body: template.body, to: "" });
    logEvent(EVENT_TYPES.TEMPLATE_CANCELED, {
      template_id: template.id,
      template_name: template.name,
      subject: template.subject,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/60 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="px-3" onClick={() => router.push("/")}>
            ← Back to inbox
          </Button>
          <Badge variant="outline" className="text-xs">
            Templates Lab
          </Badge>
          <h1 className="text-xl font-semibold text-foreground">Email templates</h1>
        </div>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition">
          Return to mail
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Templates
          </h2>
          <div className="space-y-2">
            {MAIL_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg border transition hover:border-primary/50",
                  activeTemplateId === template.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                )}
              >
                <div className="text-sm font-medium text-foreground">{template.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {template.subject}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {activeTemplate && (
            <div className="p-6 shadow-sm border border-border rounded-2xl bg-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Template</p>
                  <h3 className="text-lg font-semibold text-foreground">{activeTemplate.name}</h3>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {activeTemplate.subject}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-muted-foreground">To</label>
                  <Input
                    placeholder="recipient@email.com"
                    value={templatesState[activeTemplate.id]?.to || ""}
                    onChange={(e) => updateTemplateState(activeTemplate.id, { to: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-muted-foreground">From</label>
                  <Input
                    value={templatesState[activeTemplate.id]?.from || DEFAULT_FROM}
                    onChange={(e) => updateTemplateState(activeTemplate.id, { from: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-muted-foreground">Body</label>
                  <Textarea
                    rows={12}
                    value={templatesState[activeTemplate.id]?.body || ""}
                    onChange={(e) => handleBodyChange(activeTemplate, e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <Button onClick={() => handleSend(activeTemplate)}>Send</Button>
                <Button variant="secondary" onClick={() => handleSaveDraft(activeTemplate)}>
                  Save draft
                </Button>
                <Button variant="ghost" onClick={() => handleCancel(activeTemplate)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
