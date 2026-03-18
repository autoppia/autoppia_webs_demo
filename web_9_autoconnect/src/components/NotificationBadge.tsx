import { cn } from "@/library/utils";

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export default function NotificationBadge({
  count,
  className,
}: NotificationBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      aria-label={`${count} unread notifications`}
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-red-200 bg-red-50 px-1.5 text-[10px] font-semibold leading-none text-red-700",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
