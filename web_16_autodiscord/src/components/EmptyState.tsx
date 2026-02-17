"use client";

import { MessageSquare } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
      <MessageSquare className="w-16 h-16 text-gray-500 flex-shrink-0" aria-hidden />
      <p className="text-gray-400 font-medium">{title}</p>
      {description && <p className="text-gray-500 text-sm max-w-sm">{description}</p>}
    </div>
  );
}
