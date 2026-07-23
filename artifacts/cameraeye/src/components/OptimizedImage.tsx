import { useState } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  aspectRatio,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-white/5 dark:bg-white/5 bg-black/5 ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Skeleton Blur Placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse backdrop-blur-sm" />
      )}

      {/* Image */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-700 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-white/40 uppercase tracking-widest bg-zinc-900">
          Image Unavailable
        </div>
      )}
    </div>
  );
}
