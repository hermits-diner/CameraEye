import { useEffect, useState } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { Download, Heart, LogOut, Package, User as UserIcon } from 'lucide-react';
import {
  getGetMyOrdersQueryKey,
  redeemDownload,
  useGetMyOrders,
  type Order,
} from '@workspace/api-client-react';
import { getProductById, isOrderStatus } from '@workspace/commerce';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/PageTransition';
import { OptimizedImage } from '@/components/OptimizedImage';
import { OrderStatusTimeline } from '@/components/OrderStatusTimeline';
import { Seo } from '@/components/Seo';
import { useAuth } from '@/hooks/use-auth';
import { useWishlist } from '@/hooks/use-wishlist';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatKRW } from '@/lib/format';

function OrderCard({ order }: { order: Order }) {
  const status = isOrderStatus(order.status) ? order.status : 'pending';
  return (
    <div className="border border-border p-6" data-testid={`card-order-${order.orderNumber}`}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-mono text-sm">{order.orderNumber}</span>
        <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
      </div>
      <ul className="mb-5 flex flex-col gap-2 text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4">
            <span className="font-serif">
              {item.title}
              {item.sizeId ? ` · ${item.sizeId.toUpperCase()}` : ''} × {item.quantity}
            </span>
            <span className="text-muted-foreground">
              {formatKRW(item.unitPrice * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mb-5 flex justify-between border-t border-border pt-3 text-sm">
        <span className="text-muted-foreground">
          Total{order.shippingFee > 0 ? ` (incl. shipping ${formatKRW(order.shippingFee)})` : ''}
        </span>
        <span className="font-serif text-lg">{formatKRW(order.total)}</span>
      </div>
      <OrderStatusTimeline status={status} />
      {order.trackingNumber && (
        <p className="mt-4 text-xs text-muted-foreground">
          Tracking: <span className="font-mono text-foreground">{order.trackingNumber}</span>
        </p>
      )}
    </div>
  );
}

function DownloadsTab({ orders }: { orders: Order[] }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const downloads = orders.flatMap((order) =>
    (order.downloads ?? []).map((d) => ({ ...d, orderNumber: order.orderNumber })),
  );

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

  if (downloads.length === 0) {
    return <p className="text-sm text-muted-foreground">No digital purchases yet.</p>;
  }
  return (
    <ul className="flex flex-col gap-4">
      {downloads.map((d) => (
        <li
          key={d.token}
          className="flex items-center justify-between gap-4 border border-border p-4"
        >
          <div className="flex flex-col">
            <span className="font-serif">{d.title}</span>
            <span className="text-xs text-muted-foreground">
              {d.orderNumber} · {d.remainingDownloads} downloads left · expires{' '}
              {formatDate(d.expiresAt)}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy === d.token || d.remainingDownloads === 0}
            onClick={() => void open(d.token)}
            className="rounded-none text-[10px] uppercase tracking-[0.2em]"
            data-testid={`button-account-download-${d.productId}`}
          >
            <Download className="mr-2 h-3 w-3" /> Download
          </Button>
        </li>
      ))}
    </ul>
  );
}

function WishlistTab() {
  const { productIds, toggle } = useWishlist();
  const products = productIds
    .map((id) => getProductById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (products.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nothing saved yet — tap the heart on any print to keep it here.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
      {products.map((product) => (
        <div key={product.id} className="group flex flex-col">
          <Link href={`/shop/${product.slug}`} className="block aspect-[3/4] overflow-hidden">
            <OptimizedImage
              source={product.imageUrl}
              alt={product.title}
              className="h-full w-full"
              imgClassName="transition-transform duration-700 group-hover:scale-105"
              sizes="(min-width: 768px) 33vw, 50vw"
            />
          </Link>
          <div className="mt-3 flex items-start justify-between gap-2">
            <span className="font-serif text-sm leading-tight">{product.title}</span>
            <button
              type="button"
              onClick={() => toggle(product.id)}
              aria-label="Remove from wishlist"
              data-testid={`button-remove-wishlist-${product.id}`}
            >
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Account() {
  const { user, isLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const initialTab = new URLSearchParams(search).get('tab') ?? 'orders';

  const ordersQuery = useGetMyOrders({
    query: {
      queryKey: getGetMyOrdersQueryKey(),
      enabled: Boolean(user),
      retry: false,
    },
    request: { credentials: 'include' },
  });

  useEffect(() => {
    if (!isLoading && !user) setLocation('/login');
  }, [isLoading, user, setLocation]);

  if (isLoading || !user) {
    return (
      <PageTransition className="flex min-h-screen items-center justify-center pt-32">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Loading…</span>
      </PageTransition>
    );
  }

  const orders = ordersQuery.data?.orders ?? [];

  return (
    <PageTransition className="mx-auto max-w-[1000px] px-6 pb-24 pt-32 md:px-12">
      <Seo title="Account" path="/account" />
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="mb-2 font-serif text-5xl font-light tracking-tight">Account</h1>
          <p className="text-sm text-muted-foreground">
            {user.name} · {user.email}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {user.isAdmin && (
            <Link
              href="/admin"
              className="border border-border px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors hover:border-foreground"
              data-testid="link-admin"
            >
              Admin dashboard
            </Link>
          )}
          <button
            type="button"
            onClick={() => void logout()}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            data-testid="button-logout"
          >
            <LogOut className="h-3.5 w-3.5" /> Log out
          </button>
        </div>
      </div>

      <Tabs defaultValue={initialTab}>
        <TabsList className="mb-10 h-auto w-full justify-start gap-8 rounded-none border-b border-border bg-transparent p-0">
          {[
            { value: 'orders', label: 'Orders', icon: Package },
            { value: 'downloads', label: 'Downloads', icon: Download },
            { value: 'wishlist', label: 'Wishlist', icon: Heart },
            { value: 'profile', label: 'Profile', icon: UserIcon },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b border-transparent bg-transparent px-0 pb-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              data-testid={`tab-${tab.value}`}
            >
              <tab.icon className="mr-2 h-3.5 w-3.5" /> {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="orders">
          {ordersQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading orders…</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No orders yet —{' '}
              <Link href="/shop" className="border-b border-border pb-0.5 text-foreground">
                browse prints & editions
              </Link>
              .
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="downloads">
          <DownloadsTab orders={orders} />
        </TabsContent>

        <TabsContent value="wishlist">
          <WishlistTab />
        </TabsContent>

        <TabsContent value="profile">
          <div className="flex max-w-sm flex-col gap-4 text-sm">
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">Name</span>
              <span>{user.name}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">Email</span>
              <span>{user.email}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">Role</span>
              <span>{user.isAdmin ? 'Admin' : 'Customer'}</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageTransition>
  );
}
