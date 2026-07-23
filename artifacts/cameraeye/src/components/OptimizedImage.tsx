import { useState } from 'react';
import { cn } from '@/lib/utils';
import { urlFor } from '@/lib/sanity/image';
import type { ImageSource } from '@/lib/content/types';

const SRCSET_WIDTHS = [480, 768, 1080, 1600, 2000];

interface OptimizedImageProps {
  source: ImageSource | string;
  alt: string;
  /** Class applied to the wrapper element. */
  className?: string;
  /** Class applied to the <img> itself (object-fit etc.). */
  imgClassName?: string;
  /** `sizes` attribute for responsive Sanity sources. */
  sizes?: string;
  /** Above-the-fold images: loads eagerly with high priority. */
  priority?: boolean;
  draggable?: boolean;
}

/**
 * Image component with lazy loading, async decoding and a blur-up reveal.
 * Sanity sources get responsive srcsets served as WebP/AVIF by the Sanity
 * CDN (`auto=format`); static assets are served as-is.
 */
export function OptimizedImage({
  source,
  alt,
  className,
  imgClassName,
  sizes = '100vw',
  priority = false,
  draggable,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const resolved = typeof source === 'string' ? { kind: 'url' as const, src: source } : source;

  let src: string;
  let srcSet: string | undefined;
  if (resolved.kind === 'sanity') {
    src = urlFor(resolved.image).width(1600).auto('format').quality(80).url();
    srcSet = SRCSET_WIDTHS.map(
      (w) =>
        `${urlFor(resolved.image).width(w).auto('format').quality(80).url()} ${w}w`,
    ).join(', ');
  } else {
    src = resolved.src;
  }

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      <img
        src={src}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
        draggable={draggable}
        onLoad={() => setLoaded(true)}
        className={cn(
          'h-full w-full object-cover transition-[opacity,filter,transform] duration-700 ease-out',
          loaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-[1.02]',
          imgClassName,
        )}
      />
    </div>
  );
}
