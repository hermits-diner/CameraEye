import { Camera, Film } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FORMAT_LABELS, type CaptureFormat } from '@/lib/content/types';

interface FormatBadgeProps {
  format: CaptureFormat;
  filmStock?: string;
  className?: string;
}

/** Small capture-format tag (35mm / Medium Format / Digital). */
export function FormatBadge({ format, filmStock, className }: FormatBadgeProps) {
  const Icon = format === 'digital' ? Camera : Film;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border border-border px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground',
        className,
      )}
      data-testid={`badge-format-${format}`}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {FORMAT_LABELS[format]}
      {filmStock ? <span className="normal-case tracking-normal opacity-70">· {filmStock}</span> : null}
    </span>
  );
}
