import { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { SHOP_PRODUCTS, type ProductType } from '@workspace/commerce';
import { getGetInventoryQueryKey, useGetInventory } from '@workspace/api-client-react';
import { PageTransition } from '@/components/PageTransition';
import { OptimizedImage } from '@/components/OptimizedImage';
import { StockBadge } from '@/components/StockBadge';
import { Seo } from '@/components/Seo';
import { useWishlist } from '@/hooks/use-wishlist';
import { formatKRW } from '@/lib/format';
import { cn } from '@/lib/utils';

const FILTERS: { label: string; value: ProductType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Prints', value: 'print' },
  { label: 'Digital', value: 'digital' },
];

function priceLabel(product: (typeof SHOP_PRODUCTS)[number]): string {
  if (product.type === 'digital') return formatKRW(product.digital?.price ?? 0);
  const prices = (product.sizes ?? []).map((s) => s.price);
  if (prices.length === 0) return '';
  const min = Math.min(...prices);
  return prices.length > 1 ? `from ${formatKRW(min)}` : formatKRW(min);
}

export default function Shop() {
  const [filter, setFilter] = useState<ProductType | 'all'>('all');
  const { has, toggle } = useWishlist();
  const inventoryQuery = useGetInventory({
    query: { queryKey: getGetInventoryQueryKey(), staleTime: 60 * 1000, retry: 1 },
  });
  const inventoryById = new Map(
    (inventoryQuery.data?.items ?? []).map((item) => [item.productId, item]),
  );

  const products =
    filter === 'all'
      ? SHOP_PRODUCTS
      : SHOP_PRODUCTS.filter((p) => p.type === filter);

  return (
    <PageTransition className="mx-auto max-w-[1800px] px-6 pb-24 pt-32 md:px-12">
      <Seo
        title="Prints & Editions"
        description="Fine art prints and digital editions by CameraEye — limited, signed and numbered giclée prints on archival paper."
        path="/shop"
      />

      <div className="mb-16 flex flex-col items-end justify-between gap-8 md:flex-row">
        <div>
          <h1 className="mb-4 font-serif text-5xl font-light tracking-tight md:text-7xl">
            Prints & Editions
          </h1>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Archival prints, signed and numbered
          </p>
        </div>

        <div className="flex w-full gap-6 overflow-x-auto pb-2 md:w-auto">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'whitespace-nowrap text-xs uppercase tracking-[0.15em] transition-colors',
                filter === f.value
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground/80',
              )}
              data-testid={`filter-shop-${f.value}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {products.map((product, i) => {
            const inventory = inventoryById.get(product.id);
            const soldOut = inventory?.soldOut ?? false;
            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="group relative flex flex-col"
              >
                <Link
                  href={`/shop/${product.slug}`}
                  className="relative block aspect-[3/4] overflow-hidden bg-muted"
                  data-testid={`link-product-${product.slug}`}
                >
                  <OptimizedImage
                    source={product.imageUrl}
                    alt={product.title}
                    className="h-full w-full"
                    imgClassName={cn(
                      'transition-transform duration-700 ease-out group-hover:scale-105',
                      soldOut && 'opacity-50 grayscale',
                    )}
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  />
                  {soldOut && (
                    <span className="absolute left-4 top-4 bg-background/90 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground">
                      Sold out
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => toggle(product.id)}
                  className="absolute right-4 top-4 p-1"
                  aria-label={has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  data-testid={`button-wishlist-${product.id}`}
                >
                  <Heart
                    className={cn(
                      'h-4 w-4 transition-colors',
                      has(product.id)
                        ? 'fill-red-500 text-red-500'
                        : 'text-white/80 hover:text-white',
                    )}
                  />
                </button>

                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl">{product.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{priceLabel(product)}</p>
                  </div>
                </div>
                <StockBadge product={product} inventory={inventory} className="mt-3 w-fit" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </PageTransition>
  );
}
