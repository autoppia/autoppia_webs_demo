"use client";

import type React from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEmail } from "@/contexts/EmailContext";
import { useLayout } from "@/contexts/LayoutContext";
import { cn } from "@/library/utils";
import { TextStructureConfig } from "@/utils/textStructureProvider";
import { Send, Paperclip, Smile, X, Minus, Square, Bold, Italic, Underline, Link, List, Save } from "lucide-react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";

interface ComposeModalProps {
  textStructure?: TextStructureConfig;
}

export function ComposeModal({ textStructure }: ComposeModalProps) {
  const { currentVariant } = useLayout();
  const dyn = useDynamicSystem();
  const { isComposeOpen, composeData, toggleCompose, updateComposeData, sendEmail, saveDraft } = useEmail();

  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [toInput, setToInput] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");

  const handleToKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      if (toInput.trim()) {
        const newTo = [...composeData.to, toInput.trim()];
        updateComposeData({ to: newTo });
        setToInput("");
      }
    }
  };

  const removeToEmail = (index: number) => {
    const newTo = composeData.to.filter((_, i) => i !== index);
    updateComposeData({ to: newTo });
  };

  const handleSend = () => {
    if (composeData.to.length === 0 && !toInput.trim()) {
      alert("Please add at least one recipient");
      return;
    }

    const allTo = toInput.trim() ? [...composeData.to, toInput.trim()] : composeData.to;
    const allCc = ccInput.trim() ? [...(composeData.cc || []), ccInput.trim()] : composeData.cc || [];
    const allBcc = bccInput.trim() ? [...(composeData.bcc || []), bccInput.trim()] : composeData.bcc || [];

    updateComposeData({ to: allTo, cc: allCc, bcc: allBcc });

    if (composeData.action === "forward" && composeData.forwardedEmailId) {
      logEvent(EVENT_TYPES.FORWARD_EMAIL, {
        email_id: composeData.forwardedEmailId,
        subject: composeData.forwardedSubject || composeData.subject,
        from: composeData.forwardedFrom,
        to: allTo,
        cc: allCc,
        bcc: allBcc,
      });
    }

    logEvent(EVENT_TYPES.SEND_EMAIL, {
      to: allTo,
      cc: allCc,
      bcc: allBcc,
      subject: composeData.subject || "",
      body: composeData.body || "",
      action: composeData.action,
    });

    sendEmail();
  };

  const handleSaveDraft = () => {
    const allTo = toInput.trim() ? [...composeData.to, toInput.trim()] : composeData.to;
    const allCc = ccInput.trim() ? [...(composeData.cc || []), ccInput.trim()] : composeData.cc || [];
    const allBcc = bccInput.trim() ? [...(composeData.bcc || []), bccInput.trim()] : composeData.bcc || [];
    logEvent(EVENT_TYPES.EMAIL_SAVE_AS_DRAFT, {
      to: allTo,
      cc: allCc,
      bcc: allBcc,
      subject: composeData.subject || "",
      body: composeData.body || "",
    });
    saveDraft();
  };

  const canSend = composeData.to.length > 0 || toInput.trim();
  const composeTitle = dyn.v3.getVariant("compose_email", TEXT_VARIANTS_MAP, textStructure?.email_content?.new_message || "New message");

  const fieldLabel = (key: string, fallback: string) => dyn.v3.getVariant(key, TEXT_VARIANTS_MAP, fallback);
  const inputId = (key: string, fallback: string) => dyn.v3.getVariant(key, ID_VARIANTS_MAP, fallback);
  const toPlaceholder = dyn.v3.getVariant("compose_to_placeholder", TEXT_VARIANTS_MAP, textStructure?.email_content.compose_to || "To");
  const subjectPlaceholder = dyn.v3.getVariant("compose_subject_placeholder", TEXT_VARIANTS_MAP, textStructure?.email_content.subject_placeholder || "Subject");
  const bodyPlaceholder = dyn.v3.getVariant("compose_body_placeholder", TEXT_VARIANTS_MAP, textStructure?.email_content.message_placeholder || "Type your message...");

  const containerClass = cn(
    dyn.v3.getVariant("compose-modal", CLASS_VARIANTS_MAP, "rounded-xl border border-border shadow-xl bg-background"),
    "max-w-2xl max-h-[80vh] p-0 gap-0 compose-modal"
  );

  return dyn.v1.addWrapDecoy("compose-modal-shell", (
    <Dialog open={isComposeOpen} onOpenChange={(open: boolean) => toggleCompose(open)}>
      <DialogContent className={containerClass} id={dyn.v3.getVariant("compose-modal", ID_VARIANTS_MAP, "compose-modal")}>
        <DialogHeader className="flex flex-row items-center justify-between p-3 pb-2 border-b border-border/50">
          <DialogTitle className="text-base font-semibold text-foreground">
            {composeTitle}
          </DialogTitle>
          <div className="flex items-center gap-1">
            <Button
              id={dyn.v3.getVariant("compose-modal", ID_VARIANTS_MAP, "compose-close-button")}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted border border-border/50"
              onClick={() => toggleCompose(false)}
              aria-label="Close compose"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="px-4 py-3 space-y-3">
            <div className="flex items-start gap-3">
              <Label className="text-xs font-medium text-muted-foreground w-4 pt-2">
                {fieldLabel("compose-to", textStructure?.email_content?.to || "To")}
              </Label>
              <div className="flex-1 min-h-[36px] border border-border rounded-md p-2 focus-within:ring-1 focus-within:ring-primary/50 bg-background">
                <div className="flex flex-wrap gap-1 items-center">
                  {composeData.to.map((email, index) => (
                    <Badge key={`to-${email}`} variant="secondary" className="gap-1 px-1.5 py-0.5 text-xs">
                      {email}
                      <Button variant="ghost" size="icon" className="h-3 w-3 p-0 hover:bg-transparent" onClick={() => removeToEmail(index)}>
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  ))}
                  {dyn.v1.addWrapDecoy("compose-to-input", (
                    <Input
                      id={inputId("compose-to", textStructure?.email_ids.to_input || "to-input")}
                      value={toInput}
                      onChange={(e) => setToInput(e.target.value)}
                      onKeyDown={handleToKeyDown}
                      placeholder={composeData.to.length === 0 ? (textStructure?.email_content.compose_to || fieldLabel("compose-to", "To")) : ""}
                      aria-label={textStructure?.email_aria_labels.to_input || "Recipient email address"}
                      className={dyn.v3.getVariant("label-selector", CLASS_VARIANTS_MAP, "border-none focus-visible:ring-0")}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Label className="text-xs font-medium text-muted-foreground w-4 pt-2">
                {fieldLabel("compose-subject", textStructure?.email_content?.subject || "Subject")}
              </Label>
              {dyn.v1.addWrapDecoy("compose-subject", (
                <Input
                  id={inputId("compose-subject", textStructure?.email_ids.subject_input || "subject-input")}
                  value={composeData.subject || ""}
                  onChange={(e) => updateComposeData({ subject: e.target.value })}
                  placeholder={textStructure?.email_content.subject_placeholder || "Subject"}
                  aria-label="Subject"
                />
              ))}
            </div>

            <div className="flex items-start gap-3">
              <Label className="text-xs font-medium text-muted-foreground w-4 pt-2">
                {fieldLabel("compose-body", textStructure?.email_content?.message || "Message")}
              </Label>
              {dyn.v1.addWrapDecoy("compose-body", (
                <Textarea
                  id={inputId("compose-body", textStructure?.email_ids.body_input || "body-input")}
                  value={composeData.body || ""}
                  onChange={(e) => updateComposeData({ body: e.target.value })}
                  placeholder={textStructure?.email_content.message_placeholder || "Type your message..."}
                  className="min-h-[240px]"
                />
              ))}
            </div>

            <div className="flex flex-wrap gap-2 text-muted-foreground">
              {[Bold, Italic, Underline, Link, List, Smile].map((Icon, idx) => (
                dyn.v1.addWrapDecoy(`compose-toolbar-${idx}`, (
                  <Button key={idx} variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Icon className="h-4 w-4" />
                  </Button>
                ))
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between px-4 py-3 gap-3">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSend}
                disabled={!canSend}
                className={dyn.v3.getVariant("send-button", CLASS_VARIANTS_MAP, "")}
                id={dyn.v3.getVariant("send-button", ID_VARIANTS_MAP, "send-button")}
              >
                <Send className="h-4 w-4 mr-2" />
                {fieldLabel("send_action", "Send")}
              </Button>

              <Button
                variant="secondary"
                onClick={handleSaveDraft}
                className={dyn.v3.getVariant("save-draft-button", CLASS_VARIANTS_MAP, "")}
                id={dyn.v3.getVariant("save-draft-button", ID_VARIANTS_MAP, "save-draft-button")}
              >
                <Save className="h-4 w-4 mr-2" />
                {fieldLabel("save_draft", "Save draft")}
              </Button>

              <Button variant="ghost" size="icon">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Smile className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Minimize">
                <Minus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Resize">
                <Square className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => toggleCompose(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  ));
}
