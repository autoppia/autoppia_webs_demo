"use client";

import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-discord-darkest flex flex-col items-center justify-center gap-4 p-6">
      <AlertCircle className="w-12 h-12 text-red-400 flex-shrink-0" aria-hidden />
      <p className="text-red-400 text-center max-w-md">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-2 rounded-md bg-discord-accent hover:bg-discord-accent/90 text-white font-medium transition-colors"
        data-testid="error-retry"
      >
        Retry
      </button>
    </div>
  );
}
