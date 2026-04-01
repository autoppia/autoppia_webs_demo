import Image, { type ImageProps } from "next/image";
import { useState, type SyntheticEvent } from "react";

type SafeImageProps = ImageProps & {
  fallbackSrc?: string;
  fallbackText?: string;
  wrapperClassName?: string;
};

const DEFAULT_FALLBACK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 140"><rect width="200" height="140" fill="#eef2f7"/><text x="100" y="74" text-anchor="middle" font-size="14" fill="#64748b" font-family="Arial, sans-serif">Image unavailable</text></svg>'
)}`;

export function SafeImage({
  fallbackSrc = DEFAULT_FALLBACK_SVG,
  fallbackText = "No image",
  wrapperClassName,
  onError,
  className,
  ...rest
}: SafeImageProps) {
  const [errored, setErrored] = useState(false);

  const handleError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    if (!errored) {
      setErrored(true);
    }
    if (onError) {
      onError(e);
    }
  };

  // Handle empty or invalid src
  const src = rest.src;
  const isEmptySrc = !src || src === "";
  const shouldUseFallback = errored || isEmptySrc;
  const imageSrc = shouldUseFallback ? fallbackSrc : src;

  const wrapperClasses = `${rest.fill ? "relative w-full h-full" : "relative inline-block"} ${
    wrapperClassName ?? ""
  }`.trim();

  return (
    <div className={wrapperClasses}>
      <Image
        {...rest}
        className={className}
        src={imageSrc}
        onError={handleError}
      />
      {shouldUseFallback && fallbackText && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 text-zinc-500 text-sm font-semibold">
          {fallbackText}
        </div>
      )}
    </div>
  );
}
