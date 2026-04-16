"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateShareRecipientInput } from "@/library/shareValidation";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { cn } from "@/library/utils";

interface ShareBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookTitle: string;
  onCompleteShare: (payload: { recipientName: string; recipientEmail: string }) => void;
}

export function ShareBookDialog({
  open,
  onOpenChange,
  bookTitle,
  onCompleteShare,
}: ShareBookDialogProps) {
  const dyn = useDynamicSystem();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setRecipientName("");
      setRecipientEmail("");
      setError(null);
      return;
    }
    const id = requestAnimationFrame(() => {
      nameInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const result = validateShareRecipientInput(recipientName, recipientEmail);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    onCompleteShare({ recipientName: result.recipientName, recipientEmail: result.recipientEmail });
  };

  if (!open) {
    return null;
  }

  return (
    <dialog
      open
      className="fixed inset-0 z-[100001] m-0 h-screen w-screen max-h-none max-w-none border-0 bg-black/70 p-0 text-inherit backdrop-blur-sm"
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <div
        className={cn(
          "fixed left-1/2 top-1/2 z-[100002] w-[min(100%,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-gradient-to-br from-[#141926] to-[#0a0d14] p-6 text-white shadow-2xl focus:outline-none",
          "animate-in fade-in-0 zoom-in-95"
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">
              {dyn.v3.getVariant("share_dialog_title", TEXT_VARIANTS_MAP, "Share this book")}
            </h2>
            <p className="mt-1 text-sm text-white/60">
              {dyn.v3.getVariant("share_dialog_description", TEXT_VARIANTS_MAP, "Send a recommendation by email (demo only).")}{" "}
              <span className="text-white/80">“{bookTitle}”</span>
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-white/10 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error ? (
            <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white/80">
              {dyn.v3.getVariant("share_recipient_name_label", TEXT_VARIANTS_MAP, "Recipient name")}
            </span>
            <Input
              ref={nameInputRef}
              id={dyn.v3.getVariant("share-recipient-name-input", ID_VARIANTS_MAP, "share-recipient-name-input")}
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              autoComplete="name"
              className={cn(
                "h-11 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20",
                dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, "")
              )}
              placeholder={dyn.v3.getVariant("share_recipient_name_ph", TEXT_VARIANTS_MAP, "Full name")}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white/80">
              {dyn.v3.getVariant("share_recipient_email_label", TEXT_VARIANTS_MAP, "Recipient email")}
            </span>
            <Input
              id={dyn.v3.getVariant("share-recipient-email-input", ID_VARIANTS_MAP, "share-recipient-email-input")}
              type="email"
              inputMode="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              autoComplete="email"
              className={cn(
                "h-11 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20",
                dyn.v3.getVariant("input-text", CLASS_VARIANTS_MAP, "")
              )}
              placeholder={dyn.v3.getVariant("share_recipient_email_ph", TEXT_VARIANTS_MAP, "name@example.com")}
            />
          </label>
          <div className="flex flex-wrap gap-3 pt-2">
              <Button
                type="submit"
                id={dyn.v3.getVariant("share-complete-button", ID_VARIANTS_MAP, "share-complete-button")}
                className={cn(
                  "flex-1 bg-secondary text-black hover:bg-secondary/90 font-semibold",
                  dyn.v3.getVariant("button-primary", CLASS_VARIANTS_MAP, "")
                )}
              >
                {dyn.v3.getVariant("share_complete_action", TEXT_VARIANTS_MAP, "Complete sharing")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="border border-white/15 bg-white/5 text-white hover:bg-white/10"
                onClick={() => onOpenChange(false)}
              >
                {dyn.v3.getVariant("share_cancel", TEXT_VARIANTS_MAP, "Cancel")}
              </Button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
