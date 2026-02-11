"use client";

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
  const [error, setError] = React.useState(false);

  const processedSrc = React.useMemo(() => {
    if (!src) return src;

    // Check for doctor ID pattern (d + numbers) anywhere in the URL
    const match = src.match(/d(\d+)\.(jpg|jpeg|png|webp)$/i);
    if (match) {
      const numericPart = parseInt(match[1], 10);
      if (!isNaN(numericPart)) {
        // Map any numeric ID to the available 1-50 range
        const imageNumber = ((numericPart - 1) % 50) + 1;
        const newSrc = `/images/doctors/d${imageNumber}.jpg`;
        return newSrc;
      }
    }
    return src;
  }, [src]);

  React.useEffect(() => {
    setError(false);
  }, [processedSrc]);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-muted",
        className,
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      {processedSrc && !error ? (
        <Image
          src={processedSrc}
          alt={alt || name || "avatar"}
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setError(true)}
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
