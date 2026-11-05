"use client";

import Image, { type ImageProps } from "next/image";

const assetBase = "https://jacopopeca-assets-089081311517-prod.s3.eu-central-1.amazonaws.com";

// The optimizer must fetch the file, rather than an internal 308 redirect.
export default function StoreImage({ src, alt, ...props }: ImageProps) {
  const resolvedSrc = typeof src === "string" && src.startsWith("/wp-content/uploads/")
    ? `${assetBase}${src}`
    : src;
  return <Image {...props} src={resolvedSrc} alt={alt} />;
}
