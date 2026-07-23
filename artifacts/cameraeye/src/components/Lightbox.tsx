import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { OptimizedImage } from '@/components/OptimizedImage';
import type { ProjectImage } from '@/lib/content/types';

interface LightboxProps {
  images: ProjectImage[];
  /** Index of the open image, or null when closed. */
  openIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const SWIPE_DISTANCE = 80;
const SWIPE_VELOCITY = 400;

/**
 * Fullscreen image viewer with touch gestures: swipe left/right to move
 * between frames, swipe down (or Esc / ✕) to close. Arrow keys work on
 * desktop.
 */
export function Lightbox({ images, openIndex, onClose, onNavigate }: LightboxProps) {
  const isOpen = openIndex !== null;
  const [direction, setDirection] = useState(0);

  const goTo = useCallback(
    (next: number, dir: number) => {
      if (next < 0 || next >= images.length) return;
      setDirection(dir);
      onNavigate(next);
    },
    [images.length, onNavigate],
  );

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && openIndex !== null) goTo(openIndex - 1, -1);
      if (e.key === 'ArrowRight' && openIndex !== null) goTo(openIndex + 1, 1);
    };
    window.addEventListener('keydown', handler);
    // Prevent background scroll while open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, openIndex, goTo, onClose]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (openIndex === null) return;
    const { offset, velocity } = info;
    if (offset.y > SWIPE_DISTANCE && Math.abs(offset.y) > Math.abs(offset.x)) {
      onClose();
      return;
    }
    if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) {
      goTo(openIndex + 1, 1);
    } else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) {
      goTo(openIndex - 1, -1);
    }
  };

  const image = openIndex !== null ? images[openIndex] : undefined;

  return (
    <AnimatePresence>
      {isOpen && image && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          data-testid="lightbox-overlay"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-6 top-6 z-10 p-2 text-white/70 transition-colors hover:text-white"
            aria-label="Close"
            data-testid="lightbox-close"
          >
            <X className="h-6 w-6" />
          </button>

          {openIndex! > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo(openIndex! - 1, -1);
              }}
              className="absolute left-4 z-10 hidden p-3 text-white/50 transition-colors hover:text-white md:block"
              aria-label="Previous image"
              data-testid="lightbox-prev"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}
          {openIndex! < images.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo(openIndex! + 1, 1);
              }}
              className="absolute right-4 z-10 hidden p-3 text-white/50 transition-colors hover:text-white md:block"
              aria-label="Next image"
              data-testid="lightbox-next"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}

          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={openIndex}
              custom={direction}
              initial={{ opacity: 0, x: direction * 120 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -120 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.6}
              onDragEnd={handleDragEnd}
              onClick={(e) => e.stopPropagation()}
              className="flex h-full w-full cursor-grab items-center justify-center p-4 active:cursor-grabbing md:p-12"
            >
              <OptimizedImage
                source={image.source}
                alt={image.alt}
                className="max-h-full max-w-full bg-transparent"
                imgClassName="object-contain max-h-[85vh] w-auto"
                sizes="100vw"
                priority
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>

          <div className="pointer-events-none absolute bottom-6 left-0 right-0 flex flex-col items-center gap-1 text-white/60">
            <span className="text-xs tracking-[0.2em]">
              {openIndex! + 1} / {images.length}
            </span>
            {image.location && (
              <span className="text-[10px] uppercase tracking-[0.2em] opacity-70">
                {image.location.label}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
