"use client";

import Avatar from "@/components/Avatar";
import type { FormEvent, RefObject } from "react";

interface PostComposerModalProps {
  isOpen: boolean;
  avatarSrc: string;
  avatarAlt: string;
  value: string;
  placeholder: string;
  postButtonLabel: string;
  postButtonClassName: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onChange: (value: string, el: HTMLTextAreaElement) => void;
}

export default function PostComposerModal({
  isOpen,
  avatarSrc,
  avatarAlt,
  value,
  placeholder,
  postButtonLabel,
  postButtonClassName,
  textareaRef,
  onClose,
  onSubmit,
  onChange,
}: PostComposerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close composer"
        onClick={onClose}
      />
      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-100 p-4 sm:p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Create post</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close composer"
            className="h-8 w-8 inline-flex items-center justify-center rounded-full text-gray-600 bg-gray-100 border border-gray-200 shadow-sm hover:bg-gray-200 hover:text-gray-800"
          >
            <span aria-hidden="true" className="text-lg leading-none">×</span>
          </button>
        </div>
        <div className="flex gap-3">
          <Avatar src={avatarSrc} alt={avatarAlt} size={40} />
          <textarea
            ref={textareaRef}
            className="w-full min-h-[180px] max-h-[55vh] resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-blue-500"
            value={value}
            onChange={(e) => onChange(e.target.value, e.target)}
            placeholder={placeholder}
            maxLength={300}
            autoFocus
          />
        </div>
        <div className="mt-3 flex items-center justify-end">
          <button
            type="submit"
            className={postButtonClassName}
            disabled={!value.trim()}
          >
            {postButtonLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
