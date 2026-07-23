import { cn } from '@/lib/utils';
import {
  ORDER_STATUS_LABELS,
  PRINT_STATUS_FLOW,
  type OrderStatus,
} from '@workspace/commerce';

interface OrderStatusTimelineProps {
  status: OrderStatus;
  className?: string;
}

/**
 * Horizontal step timeline for print orders (접수 → 확인 → 제작 → 배송 →
 * 완료). Digital/cancelled orders render a single status label instead.
 */
export function OrderStatusTimeline({ status, className }: OrderStatusTimelineProps) {
  if (status === 'completed' || status === 'cancelled') {
    const label = ORDER_STATUS_LABELS[status];
    return (
      <span
        className={cn(
          'inline-block border px-2 py-1 text-[10px] uppercase tracking-[0.15em]',
          status === 'cancelled'
            ? 'border-destructive/60 text-destructive'
            : 'border-border text-muted-foreground',
          className,
        )}
      >
        {label.en} · {label.ko}
      </span>
    );
  }

  const activeIndex = PRINT_STATUS_FLOW.indexOf(status);

  return (
    <ol className={cn('flex items-center gap-0', className)} data-testid="order-timeline">
      {PRINT_STATUS_FLOW.map((step, i) => {
        const reached = i <= activeIndex;
        const label = ORDER_STATUS_LABELS[step];
        return (
          <li key={step} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-center">
              <div
                className={cn(
                  'h-px flex-1',
                  i === 0 ? 'bg-transparent' : reached ? 'bg-foreground' : 'bg-border',
                )}
              />
              <span
                className={cn(
                  'h-2.5 w-2.5 shrink-0 rounded-full border',
                  reached ? 'border-foreground bg-foreground' : 'border-border bg-transparent',
                )}
              />
              <div
                className={cn(
                  'h-px flex-1',
                  i === PRINT_STATUS_FLOW.length - 1
                    ? 'bg-transparent'
                    : i < activeIndex
                      ? 'bg-foreground'
                      : 'bg-border',
                )}
              />
            </div>
            <span
              className={cn(
                'text-center text-[9px] uppercase leading-tight tracking-[0.1em]',
                reached ? 'text-foreground' : 'text-muted-foreground/60',
              )}
            >
              {label.ko}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
