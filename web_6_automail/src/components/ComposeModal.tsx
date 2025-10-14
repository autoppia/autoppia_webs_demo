"use client";

import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEmail } from "@/contexts/EmailContext";
import {
  Send,
  Paperclip,
  Smile,
  X,
  Minus,
  Square,
  Bold,
  Italic,
  Underline,
  Link,
  List,
  Save,
} from "lucide-react";
import { EVENT_TYPES, logEvent } from "@/library/events";

export function ComposeModal() {
  const {
    isComposeOpen,
    composeData,
    toggleCompose,
    updateComposeData,
    sendEmail,
    saveDraft,
  } = useEmail();

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

    if (toInput.trim()) {
      updateComposeData({ to: [...composeData.to, toInput.trim()] });
    }
    if (ccInput.trim()) {
      updateComposeData({ cc: [...(composeData.cc || []), ccInput.trim()] });
    }
    if (bccInput.trim()) {
      updateComposeData({ bcc: [...(composeData.bcc || []), bccInput.trim()] });
    }

    logEvent(EVENT_TYPES.SEND_EMAIL, {
      to: [...composeData.to, toInput.trim()],
      subject: composeData.subject || "",
      body: composeData.body || "",
    });

    sendEmail();
  };

  const handleSaveDraft = () => {
    // Only include the uncommitted toInput, ccInput, and bccInput in the event, do not update composeData arrays
    const allTo = toInput.trim()
      ? [...composeData.to, toInput.trim()]
      : composeData.to;
    const allCc = ccInput.trim()
      ? [...(composeData.cc || []), ccInput.trim()]
      : composeData.cc || [];
    const allBcc = bccInput.trim()
      ? [...(composeData.bcc || []), bccInput.trim()]
      : composeData.bcc || [];
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

  return (
    <Dialog
      open={isComposeOpen}
      onOpenChange={(open: boolean) => toggleCompose(open)}
    >
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 gap-0 compose-modal">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between p-3 pb-2 border-b border-border/50">
          <DialogTitle className="text-base font-semibold text-foreground">
            New Message
          </DialogTitle>
          <div className="flex items-center gap-1">
            <Button id="compose-minimize-button" variant="ghost" size="icon" className="h-6 w-6">
              <Minus className="h-3 w-3" />
            </Button>
            <Button id="compose-maximize-button" variant="ghost" size="icon" className="h-6 w-6">
              <Square className="h-3 w-3" />
            </Button>
            <Button
              id="compose-close-button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => toggleCompose(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Recipients Section */}
          <div className="px-4 py-3 space-y-3">
            {/* To Field */}
            <div className="flex items-start gap-3">
              <Label className="text-xs font-medium text-muted-foreground w-4 pt-2">
                To
              </Label>
              <div className="flex-1 min-h-[36px] border border-border rounded-md p-2 focus-within:ring-1 focus-within:ring-primary/50 bg-background">
                <div className="flex flex-wrap gap-1 items-center">
                  {composeData.to.map((email, index) => (
                    <Badge
                      key={`to-${email}`}
                      variant="secondary"
                      className="gap-1 px-1.5 py-0.5 text-xs"
                    >
                      {email}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-3 w-3 p-0 hover:bg-transparent"
                        onClick={() => removeToEmail(index)}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  ))}
                  <Input
                    id="compose-to-input"
                    value={toInput}
                    onChange={(e) => setToInput(e.target.value)}
                    onKeyDown={handleToKeyDown}
                    placeholder={
                      composeData.to.length === 0 ? "Recipients" : ""
                    }
                    className="border-0 shadow-none focus-visible:ring-0 h-auto p-0 flex-1 min-w-[120px] bg-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-primary hover:text-primary/80 px-2"
                  onClick={() => setShowCc(!showCc)}
                >
                  Cc
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-primary hover:text-primary/80 px-2"
                  onClick={() => setShowBcc(!showBcc)}
                >
                  Bcc
                </Button>
              </div>
            </div>

            {/* Subject */}
            <div className="flex items-center gap-3">
              <Label className="text-xs font-medium text-muted-foreground w-10">
                Subject
              </Label>
              <Input
                id="compose-subject-input"
                value={composeData.subject}
                onChange={(e) => updateComposeData({ subject: e.target.value })}
                placeholder="Subject"
                className="flex-1 h-9 border-border focus-visible:ring-1 focus-visible:ring-primary/50"
              />
            </div>
          </div>

          <Separator className="mx-4" />

          {/* Formatting Toolbar */}
          <div className="px-4 py-2 border-b border-border/50">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Bold className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Italic className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Underline className="h-3 w-3" />
              </Button>
              <Separator orientation="vertical" className="h-4" />
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <List className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Link className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Message Body */}
          <div className="flex-1 px-4 py-3">
            <Textarea
              id="compose-body-textarea"
              value={composeData.body}
              onChange={(e) => updateComposeData({ body: e.target.value })}
              placeholder="Compose your message..."
              className="min-h-[200px] resize-none border-0 shadow-none focus-visible:ring-0 text-sm leading-relaxed bg-transparent"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/20">
            <div className="flex items-center gap-2">
              <Button
                id="compose-send-button"
                onClick={handleSend}
                disabled={!canSend}
                className="btn-primary-gradient h-8 px-4"
              >
                <Send className="h-3 w-3 mr-2" />
                Send
              </Button>

              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Paperclip className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Smile className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <Button
              id="compose-save-draft-button"
              variant="ghost"
              onClick={handleSaveDraft}
              className="h-8 px-3 text-sm"
            >
              <Save className="h-3 w-3 mr-1" />
              Save Draft
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
