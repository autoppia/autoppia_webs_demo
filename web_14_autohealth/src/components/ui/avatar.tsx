import * as React from "react";
import Image from "next/image";
import { cn } from "@/library/utils";

function getInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return initials || "U";
}

type AvatarProps = React.HTMLAttributes<HTMLDivElement> & {
  src?: string;
  alt?: string;
  name?: string;
  size?: number;
};

function Avatar({ className, src, alt, name, size = 44, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-muted",
        className,
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || name || "avatar"}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span className="text-sm font-medium text-muted-foreground">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}

export { Avatar };
