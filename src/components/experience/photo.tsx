import { useState, type ImgHTMLAttributes } from "react";
import { USE_STOCK_PHOTOS, type Photo as PhotoT } from "@/content/story";
import { cn } from "@/lib/utils";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  photo: PhotoT;
  eager?: boolean;
};

export const photoSrc = (p: PhotoT) => (USE_STOCK_PHOTOS ? p.src : p.fallback);

/** <img> with lazy loading and an automatic fallback to the labelled placeholder. */
export function Photo({ photo, eager, className, alt, ...rest }: Props) {
  const [src, setSrc] = useState(photoSrc(photo));
  return (
    <img
      src={src}
      alt={alt ?? photo.alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      onError={() => src !== photo.fallback && setSrc(photo.fallback)}
      className={cn("h-full w-full object-cover", className)}
      {...rest}
    />
  );
}
