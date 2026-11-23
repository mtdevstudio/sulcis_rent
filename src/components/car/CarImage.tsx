import type { CarImageData, Lang } from "@/lib/types";
import { tr } from "@/lib/i18n";

/**
 * <CarImage /> — immagini auto con le varianti WebP generate dall'API PHP (640/1280/2048)
 * o dallo script dei segnaposto. Con l'export statico next/image non ottimizza al volo:
 * qui srcset/sizes nativi, lazy di default, dimensioni esplicite → zero layout shift.
 */
export function CarImage({
  image, lang, sizes = "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw", priority = false, className = "", style,
}: { image?: CarImageData; lang: Lang; sizes?: string; priority?: boolean; className?: string; style?: React.CSSProperties }) {
  if (!image) return <div className={`bg-sand-200 ${className}`} style={style} aria-hidden />;
  const widths = [...image.widths].sort((a, b) => a - b);
  const srcSet = widths.map((w) => `${image.base}-${w}.webp ${w}w`).join(", ");
  const src = `${image.base}-${widths[Math.min(1, widths.length - 1)]}.webp`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      width={image.w}
      height={image.h}
      alt={tr(image.alt, lang)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={className}
      style={style}
    />
  );
}
