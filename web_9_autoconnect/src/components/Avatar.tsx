import Image from "next/image";
import { SeedLink } from "@/components/ui/SeedLink";
import { useState } from "react";

export default function Avatar({ src, alt, size = 40, href }: { src: string; alt: string; size?: number; href?: string }) {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const fallback = "https://i.pravatar.cc/150?img=12";

  const img = (
    <Image
      src={imgSrc}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover bg-gray-200 hover:brightness-95 cursor-pointer"
      style={{ width: size, height: size }}
      onError={() => {
        if (imgSrc !== fallback) setImgSrc(fallback);
      }}
    />
  );
  return href ? <SeedLink href={href}>{img}</SeedLink> : img;
}
