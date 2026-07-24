import { useMemo, useState } from 'react';
import { Link, useRoute } from 'wouter';
import { ArrowLeft, Heart, Truck } from 'lucide-react';
import {
  FREE_DOMESTIC_SHIPPING_THRESHOLD,
  SHIPPING_COUNTRIES,
  calcShipping,
  getProductBySlug,
  getSize,
} from '@workspace/commerce';
import { getGetInventoryQueryKey, useGetInventory } from '@workspace/api-client-react';
import { PageTransition } from '@/components/PageTransition';
import { OptimizedImage } from '@/components/OptimizedImage';
import { StockBadge } from '@/components/StockBadge';
import { Seo } from '@/components/Seo';
import NotFound from '@/pages/not-found';
import { useProject } from '@/lib/content/adapter';
import { useWishlist } from '@/hooks/use-wishlist';
import { formatKRW } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function ShopProduct() {
  const [, params] = useRoute('/shop/:slug');
  const product = params?.slug ? getProductBySlug(params.slug) : undefined;

  const { has, toggle } = useWishlist();
  const inventoryQuery = useGetInventory({
    query: { queryKey: getGetInventoryQueryKey(), staleTime: 60 * 1000, retry: 1 },
  });
  const { project } = useProject(product?.projectSlug);

  const [sizeId, setSizeId] = useState<string | undefined>(product?.sizes?.[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [country, setCountry] = useState('KR');

  const inventory = useMemo(
    () =>
      inventoryQuery.data?.items.find((item) => item.productId === product?.id),
    [inventoryQuery.data, product?.id],
  );

  if (!product) return <NotFound />;

  const soldOut = inventory?.soldOut ?? false;
  const maxQty = Math.min(10, inventory?.remaining ?? 10) || 1;
  const size = getSize(product, sizeId);
  const unitPrice = product.type === 'digital' ? (product.digital?.price ?? 0) : (size?.price ?? 0);
  const subtotal = unitPrice * quantity;

  const quote =
    product.type === 'print'
      ? calcShipping([{ productId: product.id, sizeId, quantity }], country, subtotal)
      : null;

  const checkoutHref =
    product.type === 'digital'
      ? `/checkout?product=${product.id}&qty=1`
      : `/checkout?product=${product.id}&size=${sizeId ?? ''}&qty=${quantity}`;

  return (
    <PageTransition className="mx-auto max-w-[1400px] px-6 pb-24 pt-32 md:px-12">
      <Seo
        title={product.title}
        description={product.description}
        image={product.imageUrl}
        path={`/shop/${product.slug}`}
        type="product"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.title,
          description: product.description,
          image: product.imageUrl,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'KRW',
            price: unitPrice,
            availability: soldOut
              ? 'https://schema.org/SoldOut'
              : 'https://schema.org/InStock',
          },
        }}
      />

      <Link
        href="/shop"
        className="mb-10 flex w-fit items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
        data-testid="link-back-shop"
      >
        <ArrowLeft className="h-3 w-3" /> All prints
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Imagery */}
        <div className="flex flex-col gap-6">
          <OptimizedImage
            source={product.imageUrl}
            alt={product.title}
            className="aspect-[3/4] w-full"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
          {project && project.images.length > 1 && (
            <div className="grid grid-cols-2 gap-4">
              {project.images.slice(0, 2).map((image, i) => (
                <OptimizedImage
                  key={i}
                  source={image.source}
                  alt={image.alt}
                  className="aspect-square"
                  sizes="25vw"
                />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-6">
            <h1 className="font-serif text-4xl font-light leading-tight tracking-tight md:text-5xl">
              {product.title}
            </h1>
            <button
              type="button"
              onClick={() => toggle(product.id)}
              className="mt-2 shrink-0"
              aria-label={has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              data-testid="button-wishlist-detail"
            >
              <Heart
                className={cn(
                  'h-5 w-5 transition-colors',
                  has(product.id)
                    ? 'fill-red-500 text-red-500'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              />
            </button>
          </div>

          <StockBadge product={product} inventory={inventory} className="mt-4 w-fit" />

          <p className="mt-8 max-w-xl font-serif text-lg leading-relaxed text-foreground/80">
            {product.description}
          </p>

          {project && (
            <Link
              href={`/projects/${project.slug}`}
              className="mt-4 w-fit border-b border-border pb-0.5 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
              data-testid="link-related-project"
            >
              From the series “{project.title}”
            </Link>
          )}

          {/* Size selector (prints) */}
          {product.type === 'print' && product.sizes && (
            <div className="mt-10">
              <span className="mb-3 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Size
              </span>
              <div className="flex flex-col gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSizeId(s.id)}
                    className={cn(
                      'flex items-center justify-between border px-4 py-3 text-left transition-colors',
                      sizeId === s.id
                        ? 'border-foreground'
                        : 'border-border hover:border-foreground/50',
                    )}
                    data-testid={`button-size-${s.id}`}
                  >
                    <span className="text-sm">{s.label}</span>
                    <span className="font-serif text-base">{formatKRW(s.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Digital info */}
          {product.type === 'digital' && product.digital && (
            <div className="mt-10 flex flex-col gap-3 border border-border p-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">File</span>
                <span>{product.digital.fileSpec}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Licence</span>
                <span className="max-w-[60%] text-right">{product.digital.licence}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>Instant download after checkout</span>
              </div>
            </div>
          )}

          {/* Quantity (prints) */}
          {product.type === 'print' && (
            <div className="mt-8 flex items-center gap-6">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Quantity
              </span>
              <div className="flex items-center border border-border">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 text-lg transition-colors hover:bg-muted"
                  aria-label="Decrease quantity"
                  data-testid="button-qty-minus"
                >
                  −
                </button>
                <span className="min-w-10 text-center text-sm" data-testid="text-qty">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  className="px-4 py-2 text-lg transition-colors hover:bg-muted"
                  aria-label="Increase quantity"
                  data-testid="button-qty-plus"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Shipping estimator (prints) */}
          {product.type === 'print' && quote && (
            <div className="mt-8 border border-border p-5">
              <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <Truck className="h-3.5 w-3.5" /> Shipping estimate
              </div>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mb-4 w-full border border-border bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none"
                data-testid="select-country"
              >
                {SHIPPING_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {size ? `${(quote.weightG / 1000).toFixed(1)}kg packed` : ''}
                </span>
                <span data-testid="text-shipping-fee">
                  {quote.freeShippingApplied ? 'Free' : formatKRW(quote.fee)}
                </span>
              </div>
              {country === 'KR' && !quote.freeShippingApplied && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Free domestic shipping on orders over{' '}
                  {formatKRW(FREE_DOMESTIC_SHIPPING_THRESHOLD)}
                </p>
              )}
            </div>
          )}

          {/* Total + CTA */}
          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {product.type === 'print' ? 'Subtotal' : 'Price'}
            </span>
            <span className="font-serif text-3xl" data-testid="text-subtotal">
              {formatKRW(subtotal)}
            </span>
          </div>

          {soldOut ? (
            <div
              className="mt-6 w-full border border-border py-4 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground"
              data-testid="button-sold-out"
            >
              Sold out
            </div>
          ) : (
            <Link
              href={checkoutHref}
              className="mt-6 block w-full bg-primary py-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-85"
              data-testid="button-order"
            >
              {product.type === 'digital' ? 'Buy digital edition' : 'Order this print'}
            </Link>
          )}

          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            {product.type === 'print'
              ? 'Print orders are confirmed manually within 24 hours. Production takes 5–7 business days before shipping. · 프린트 주문은 24시간 내 확인 후 제작(5–7영업일)됩니다.'
              : 'Digital files are delivered instantly by email after checkout. · 디지털 파일은 결제 직후 이메일로 전달됩니다.'}
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
