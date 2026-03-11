"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type SafeImageProps = ImageProps & {
  fallbackSrc?: ImageProps["src"];
};

export function SafeImage({
  fallbackSrc = "/images/homepage_categories/coffee_machine.jpg",
  src,
  ...rest
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState<ImageProps["src"]>(src);

  const handleError = () => {
    if (currentSrc === fallbackSrc) return;
    setCurrentSrc(fallbackSrc);
  };

  return (
    <Image
      {...rest}
      src={currentSrc || fallbackSrc}
      onError={handleError}
    />
  );
}
