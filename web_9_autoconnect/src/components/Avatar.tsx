import Image from "next/image";
import Link from "next/link";

export default function Avatar({ src, alt, size = 40, href }: { src: string; alt: string; size?: number; href?: string }) {
  const img = (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover bg-gray-200 hover:brightness-95 cursor-pointer"
      style={{ width: size, height: size }}
    />
  );
  return href ? <Link href={href}>{img}</Link> : img;
}
