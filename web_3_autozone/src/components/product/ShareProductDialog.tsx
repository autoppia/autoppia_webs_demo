"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { logEvent, EVENT_TYPES } from "@/events";

type Dyn = ReturnType<typeof useDynamicSystem>;

function isValidEmail(value: string): boolean {
  const t = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

type ShareProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dyn: Dyn;
  productId: string;
  productTitle: string;
  shareUrl: string;
  productEventPayload: Record<string, unknown>;
};

export function ShareProductDialog({
  open,
  onOpenChange,
  dyn,
  productId,
  productTitle,
  shareUrl,
  productEventPayload,
}: ShareProductDialogProps) {
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const t = (key: string, fallback: string) =>
    dyn.v3.getVariant(key, TEXT_VARIANTS_MAP, fallback);

  const resetForm = () => {
    setRecipientName("");
    setRecipientEmail("");
    setError(null);
  };

  const handleCompleteShare = () => {
    const name = recipientName.trim();
    const email = recipientEmail.trim();
    if (name.length < 2) {
      setError(t("share_name_error", "Enter the recipient name."));
      return;
    }
    if (!isValidEmail(email)) {
      setError(t("share_email_error", "Enter a valid email address."));
      return;
    }
    setError(null);
    const payload = {
      ...productEventPayload,
      productId,
      productTitle,
      shareUrl,
      recipientName: name,
      recipientEmail: email,
      stage: "completed",
    };
    logEvent(EVENT_TYPES.SHARE_COMPLETED, {
      ...payload,
    });
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
    >
      <DialogContent
        id={dyn.v3.getVariant("share-dialog", ID_VARIANTS_MAP, "share-product-dialog")}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>{t("share_dialog_title", "Share this product")}</DialogTitle>
          <DialogDescription>
            {t(
              "share_dialog_hint",
              "Add who you are sending it to. This is a demo — no email is sent."
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-1">
            <label
              htmlFor={dyn.v3.getVariant("share-recipient-name", ID_VARIANTS_MAP, "share-recipient-name")}
              className="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              {t("recipient_name", "Recipient name")}
            </label>
            <Input
              id={dyn.v3.getVariant("share-recipient-name", ID_VARIANTS_MAP, "share-recipient-name")}
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              autoComplete="name"
              placeholder={t("recipient_name_ph", "Jordan Lee")}
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor={dyn.v3.getVariant("share-recipient-email", ID_VARIANTS_MAP, "share-recipient-email")}
              className="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              {t("recipient_email", "Recipient email")}
            </label>
            <Input
              id={dyn.v3.getVariant("share-recipient-email", ID_VARIANTS_MAP, "share-recipient-email")}
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              autoComplete="email"
              placeholder={t("recipient_email_ph", "friend@example.com")}
            />
          </div>
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <Button
            type="button"
            id={dyn.v3.getVariant("share-complete-btn", ID_VARIANTS_MAP, "share-complete-button")}
            className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800"
            onClick={handleCompleteShare}
          >
            {t("complete_share", "Complete share")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
