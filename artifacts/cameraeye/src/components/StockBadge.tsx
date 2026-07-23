import { cn } from '@/lib/utils';
import type { ShopProduct } from '@workspace/commerce';
import type { InventoryItem } from '@workspace/api-client-react';

interface StockBadgeProps {
  product: ShopProduct;
  inventory?: InventoryItem;
  className?: string;
}

/**
 * Edition / stock label for a product: "Edition of 50 · 12 remaining",
 * "Sold out", "Open edition" or "Digital download". Degrades gracefully to
 * the edition size alone when live inventory is unavailable.
 */
export function StockBadge({ product, inventory, className }: StockBadgeProps) {
  let text: string;
  let soldOut = false;

  if (product.type === 'digital') {
    text = 'Digital download';
  } else if (product.editionSize == null) {
    text = 'Open edition';
  } else if (inventory?.soldOut) {
    text = 'Sold out';
    soldOut = true;
  } else if (inventory?.remaining != null) {
    text = `Edition of ${product.editionSize} · ${inventory.remaining} remaining`;
  } else {
    text = `Limited edition of ${product.editionSize}`;
  }

  return (
    <span
      className={cn(
        'inline-block border px-2 py-1 text-[10px] uppercase tracking-[0.15em]',
        soldOut
          ? 'border-destructive/60 text-destructive'
          : 'border-border text-muted-foreground',
        className,
      )}
      data-testid={`badge-stock-${product.id}`}
    >
      {text}
    </span>
  );
}
