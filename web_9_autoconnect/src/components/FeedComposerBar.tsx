"use client";

import Avatar from "@/components/Avatar";

interface FeedComposerBarProps {
  avatarSrc: string;
  avatarAlt: string;
  placeholder: string;
  postAriaLabel: string;
  inputClassName: string;
  buttonClassName: string;
  onOpenComposer: () => void;
}

export default function FeedComposerBar({
  avatarSrc,
  avatarAlt,
  placeholder,
  postAriaLabel,
  inputClassName,
  buttonClassName,
  onOpenComposer,
}: FeedComposerBarProps) {
  return (
    <div className="sticky top-16 z-20 mb-6">
      <div className="bg-white/95 backdrop-blur rounded-lg shadow p-4 flex gap-3 items-center border border-gray-100">
        <Avatar src={avatarSrc} alt={avatarAlt} size={44} />
        <button
          type="button"
          className={inputClassName}
          onClick={onOpenComposer}
        >
          {placeholder}
        </button>
        <button
          type="button"
          aria-label={postAriaLabel}
          className={buttonClassName}
          onClick={onOpenComposer}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 20l18-8L3 4v6l12 2-12 2v6z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
