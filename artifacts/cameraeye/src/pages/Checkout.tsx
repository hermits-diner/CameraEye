import { useEffect, useMemo, useState } from 'react';
import { Link, useSearch } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Check, Download } from 'lucide-react';
import {
  SHIPPING_COUNTRIES,
  calcShipping,
  getProductById,
  getSize,
  getUnitPrice,
} from '@workspace/commerce';
import {
  redeemDownload,
  useCreateOrder,
  type Order,
} from '@workspace/api-client-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/PageTransition';
import { OptimizedImage } from '@/components/OptimizedImage';
import { Seo } from '@/components/Seo';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { formatKRW } from '@/lib/format';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  recipient: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

const inputClass =
  'bg-transparent border-0 border-b border-border rounded-none px-0 py-3 text-base focus-visible:ring-0 focus-visible:border-foreground text-foreground font-serif placeholder:text-muted-foreground/40';

function DownloadList({ order }: { order: Order }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const open = async (token: string) => {
    setBusy(token);
    try {
      const info = await redeemDownload(token);
      window.open(info.url, '_blank', 'noopener');
      toast({
        title: 'Download started',
        description: `${info.remainingDownloads} downloads remaining for this link.`,
      });
    } catch {
      toast({
        title: 'Download unavailable',
        description: 'This link may have expired or reached its limit.',
        variant: 'destructive',
      });
    } finally {
      setBusy(null);
    }
  };

  if (!order.downloads?.length) return null;
  return (
    <div className="mt-8 border border-border p-6">
      <h3 className="mb-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Your digital files
      </h3>
      <ul className="flex flex-col gap-3">
        {order.downloads.map((d) => (
          <li key={d.token} className="flex items-center justify-between gap-4">
            <span className="font-serif">{d.title}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy === d.token}
              onClick={() => void open(d.token)}
              className="rounded-none text-[10px] uppercase tracking-[0.2em]"
              data-testid={`button-download-${d.productId}`}
            >
              <Download className="mr-2 h-3 w-3" /> Download
            </Button>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[11px] text-muted-foreground">
        Links were also emailed to {order.email}. Each link expires in 7 days.
      </p>
    </div>
  );
}

export default function Checkout() {
  const search = useSearch();
  const { user } = useAuth();
  const { toast } = useToast();
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const { items, lines } = useMemo(() => {
    const params = new URLSearchParams(search);
    const productId = params.get('product') ?? '';
    const sizeId = params.get('size') ?? undefined;
    const qty = Math.max(1, Math.min(10, Number(params.get('qty') ?? '1') || 1));
    const product = getProductById(productId);
    if (!product) return { items: [], lines: [] };
    const item = {
      productId,
      ...(product.type === 'print' && sizeId ? { sizeId } : {}),
      quantity: product.type === 'digital' ? 1 : qty,
    };
    const unitPrice = getUnitPrice(product, sizeId) ?? 0;
    return {
      items: [item],
      lines: [
        {
          product,
          size: getSize(product, sizeId),
          quantity: item.quantity,
          unitPrice,
        },
      ],
    };
  }, [search]);

  const hasPrint = lines.some((l) => l.product.type === 'print');
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      recipient: '',
      country: 'KR',
      city: '',
      postalCode: '',
      addressLine1: '',
      addressLine2: '',
      phone: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (user) {
      if (!form.getValues('name')) form.setValue('name', user.name);
      if (!form.getValues('email')) form.setValue('email', user.email);
    }
  }, [user, form]);

  const country = form.watch('country') || 'KR';
  const quote = hasPrint ? calcShipping(items, country, subtotal) : null;
  const shippingFee = quote?.fee ?? 0;
  const total = subtotal + shippingFee;

  const createOrder = useCreateOrder({
    mutation: {
      onSuccess: (res) => {
        setPlacedOrder(res.order);
        window.scrollTo(0, 0);
      },
      onError: (err) => {
        toast({
          title: 'Order failed',
          description: err.data && typeof err.data === 'object' && 'message' in err.data
            ? String((err.data as { message?: string }).message)
            : 'Please check your details and try again.',
          variant: 'destructive',
        });
      },
    },
    request: { credentials: 'include' },
  });

  const onSubmit = (values: CheckoutValues) => {
    if (hasPrint) {
      const missing = (
        [
          ['recipient', 'Recipient'],
          ['country', 'Country'],
          ['city', 'City'],
          ['postalCode', 'Postal code'],
          ['addressLine1', 'Address'],
        ] as const
      ).filter(([key]) => !values[key]?.trim());
      if (missing.length > 0) {
        for (const [key] of missing) {
          form.setError(key, { message: 'Required for print orders' });
        }
        return;
      }
    }

    createOrder.mutate({
      data: {
        name: values.name,
        email: values.email,
        items,
        ...(hasPrint
          ? {
              shippingAddress: {
                recipient: values.recipient!.trim(),
                country: values.country!,
                city: values.city!.trim(),
                postalCode: values.postalCode!.trim(),
                addressLine1: values.addressLine1!.trim(),
                ...(values.addressLine2?.trim()
                  ? { addressLine2: values.addressLine2.trim() }
                  : {}),
                ...(values.phone?.trim() ? { phone: values.phone.trim() } : {}),
              },
            }
          : {}),
        ...(values.notes?.trim() ? { notes: values.notes.trim() } : {}),
      },
    });
  };

  // ---- Empty / invalid product ----
  if (lines.length === 0) {
    return (
      <PageTransition className="mx-auto flex min-h-screen max-w-[900px] flex-col items-center justify-center px-6 pt-32 text-center">
        <Seo title="Checkout" path="/checkout" />
        <h1 className="mb-6 font-serif text-4xl font-light">Nothing to check out</h1>
        <Link
          href="/shop"
          className="border-b border-border pb-0.5 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
        >
          Browse prints & editions
        </Link>
      </PageTransition>
    );
  }

  // ---- Success ----
  if (placedOrder) {
    return (
      <PageTransition className="mx-auto max-w-[720px] px-6 pb-24 pt-40">
        <Seo title="Order received" path="/checkout" />
        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full border border-foreground">
          <Check className="h-5 w-5" />
        </div>
        <h1 className="mb-4 font-serif text-4xl font-light tracking-tight md:text-5xl">
          {placedOrder.status === 'completed' ? 'Order complete' : 'Order received'}
        </h1>
        <p className="mb-2 text-sm text-muted-foreground">
          Order number{' '}
          <span className="font-mono text-foreground" data-testid="text-order-number">
            {placedOrder.orderNumber}
          </span>
        </p>
        <p className="max-w-md font-serif text-lg leading-relaxed text-foreground/80">
          {placedOrder.status === 'completed'
            ? 'Thank you — your digital files are ready below and have been emailed to you.'
            : 'Thank you — we confirm every print order personally and will email you within 24 hours with production details.'}
        </p>

        <DownloadList order={placedOrder} />

        <div className="mt-12 flex gap-6 text-xs uppercase tracking-[0.2em]">
          <Link
            href="/shop"
            className="border-b border-border pb-0.5 text-muted-foreground hover:text-foreground"
          >
            Continue browsing
          </Link>
          {user && (
            <Link
              href="/account"
              className="border-b border-border pb-0.5 text-muted-foreground hover:text-foreground"
            >
              View order history
            </Link>
          )}
        </div>
      </PageTransition>
    );
  }

  // ---- Form ----
  return (
    <PageTransition className="mx-auto max-w-[1200px] px-6 pb-24 pt-32 md:px-12">
      <Seo title="Checkout" path="/checkout" />
      <Link
        href={`/shop/${lines[0].product.slug}`}
        className="mb-10 flex w-fit items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
        data-testid="link-back-product"
      >
        <ArrowLeft className="h-3 w-3" /> Back
      </Link>

      <h1 className="mb-12 font-serif text-5xl font-light tracking-tight md:text-6xl">Checkout</h1>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-5">
        {/* Form */}
        <div className="lg:col-span-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Jane Doe" className={inputClass} data-testid="input-checkout-name" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="jane@example.com" className={inputClass} data-testid="input-checkout-email" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {hasPrint && (
                <>
                  <h2 className="border-t border-border pt-8 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Shipping address
                  </h2>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="recipient"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            Recipient
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className={inputClass} data-testid="input-recipient" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            Phone (optional)
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className={inputClass} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            Country
                          </FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="w-full border-0 border-b border-border bg-transparent px-0 py-3 font-serif text-base text-foreground focus:border-foreground focus:outline-none"
                              data-testid="select-checkout-country"
                            >
                              {SHIPPING_COUNTRIES.map((c) => (
                                <option key={c.code} value={c.code}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            City
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className={inputClass} data-testid="input-city" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            Postal code
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className={inputClass} data-testid="input-postal" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="addressLine1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            Address
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className={inputClass} data-testid="input-address1" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="addressLine2"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            Address line 2 (optional)
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className={inputClass} data-testid="input-address2" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Notes (optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Anything we should know about this order..."
                        className={`${inputClass} min-h-[100px] resize-none`}
                        data-testid="input-notes"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={createOrder.isPending}
                className="w-full rounded-none bg-primary py-6 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:opacity-85"
                data-testid="button-place-order"
              >
                {createOrder.isPending ? 'Placing order…' : 'Place order'}
              </Button>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {hasPrint
                  ? 'Payment is arranged after manual confirmation — we will contact you with payment details within 24 hours. · 주문 확인 후 24시간 내 결제 안내를 드립니다.'
                  : 'Digital orders are delivered immediately after checkout. · 디지털 주문은 결제 직후 전달됩니다.'}
              </p>
            </form>
          </Form>
        </div>

        {/* Summary */}
        <aside className="lg:col-span-2">
          <div className="sticky top-28 border border-border p-6">
            <h2 className="mb-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Order summary
            </h2>
            {lines.map((line, i) => (
              <div key={i} className="mb-6 flex gap-4">
                <OptimizedImage
                  source={line.product.imageUrl}
                  alt={line.product.title}
                  className="h-24 w-20 shrink-0"
                  sizes="80px"
                />
                <div className="flex flex-col gap-1">
                  <span className="font-serif text-lg leading-tight">{line.product.title}</span>
                  {line.size && (
                    <span className="text-xs text-muted-foreground">{line.size.label}</span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Qty {line.quantity} · {formatKRW(line.unitPrice)}
                  </span>
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatKRW(subtotal)}</span>
              </div>
              {hasPrint && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span data-testid="text-checkout-shipping">
                    {quote?.freeShippingApplied ? 'Free' : formatKRW(shippingFee)}
                  </span>
                </div>
              )}
              <div className="mt-2 flex justify-between border-t border-border pt-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Total
                </span>
                <span className="font-serif text-2xl" data-testid="text-checkout-total">
                  {formatKRW(total)}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </PageTransition>
  );
}
