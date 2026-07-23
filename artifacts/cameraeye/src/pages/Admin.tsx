import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetAdminOrdersQueryKey,
  useGetAdminOrders,
  useUpdateOrderStatus,
  type Order,
} from '@workspace/api-client-react';
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  isOrderStatus,
  nextStatuses,
  type OrderStatus,
} from '@workspace/commerce';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/PageTransition';
import { Seo } from '@/components/Seo';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatKRW } from '@/lib/format';
import { cn } from '@/lib/utils';

function StatusChip({ status }: { status: OrderStatus }) {
  const label = ORDER_STATUS_LABELS[status];
  return (
    <span
      className={cn(
        'inline-block border px-2 py-0.5 text-[10px] uppercase tracking-[0.15em]',
        status === 'cancelled'
          ? 'border-destructive/60 text-destructive'
          : status === 'delivered' || status === 'completed'
            ? 'border-foreground/50 text-foreground'
            : 'border-border text-muted-foreground',
      )}
    >
      {label.ko}
    </span>
  );
}

function AdminOrderRow({ order }: { order: Order }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tracking, setTracking] = useState(order.trackingNumber ?? '');
  const status = isOrderStatus(order.status) ? order.status : 'pending';
  const transitions = nextStatuses(status);

  const updateStatus = useUpdateOrderStatus({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getGetAdminOrdersQueryKey(),
          exact: false,
        });
        toast({ title: 'Order updated', description: `${order.orderNumber} status changed.` });
      },
      onError: () => {
        toast({
          title: 'Update failed',
          description: 'The status change was rejected.',
          variant: 'destructive',
        });
      },
    },
    request: { credentials: 'include' },
  });

  const move = (next: OrderStatus) => {
    updateStatus.mutate({
      orderId: order.id,
      data: {
        status: next,
        ...(next === 'shipped' && tracking.trim()
          ? { trackingNumber: tracking.trim() }
          : {}),
      },
    });
  };

  return (
    <div className="border border-border p-5" data-testid={`admin-order-${order.orderNumber}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm">{order.orderNumber}</span>
          <StatusChip status={status} />
        </div>
        <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
      </div>

      <div className="mb-3 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
        <div>
          <span className="text-muted-foreground">{order.name}</span>{' '}
          <span className="text-xs text-muted-foreground">· {order.email}</span>
          {order.shippingAddress && (
            <p className="mt-1 text-xs text-muted-foreground">
              {order.shippingAddress.recipient} · {order.shippingAddress.addressLine1},{' '}
              {order.shippingAddress.city} {order.shippingAddress.postalCode},{' '}
              {order.shippingAddress.country}
            </p>
          )}
        </div>
        <div className="md:text-right">
          <span className="font-serif text-lg">{formatKRW(order.total)}</span>
          {order.shippingFee > 0 && (
            <span className="ml-2 text-xs text-muted-foreground">
              (shipping {formatKRW(order.shippingFee)})
            </span>
          )}
        </div>
      </div>

      <ul className="mb-4 flex flex-col gap-1 text-xs text-muted-foreground">
        {order.items.map((item) => (
          <li key={item.id}>
            {item.title}
            {item.sizeId ? ` · ${item.sizeId.toUpperCase()}` : ''} × {item.quantity}
          </li>
        ))}
        {order.notes && <li className="italic">Note: {order.notes}</li>}
      </ul>

      {transitions.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
          {transitions.includes('shipped') && (
            <input
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="Tracking number"
              className="border border-border bg-transparent px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none"
              data-testid={`input-tracking-${order.orderNumber}`}
            />
          )}
          {transitions.map((next) => (
            <Button
              key={next}
              type="button"
              variant={next === 'cancelled' ? 'outline' : 'default'}
              size="sm"
              disabled={updateStatus.isPending}
              onClick={() => move(next)}
              className={cn(
                'rounded-none text-[10px] uppercase tracking-[0.15em]',
                next === 'cancelled' && 'border-destructive/50 text-destructive hover:text-destructive',
              )}
              data-testid={`button-move-${order.orderNumber}-${next}`}
            >
              → {ORDER_STATUS_LABELS[next].ko}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const adminParams = statusFilter === 'all' ? undefined : { status: statusFilter };
  const ordersQuery = useGetAdminOrders(adminParams, {
    query: {
      queryKey: getGetAdminOrdersQueryKey(adminParams),
      enabled: Boolean(user?.isAdmin),
      retry: false,
      refetchInterval: 60_000,
    },
    request: { credentials: 'include' },
  });

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) setLocation(user ? '/account' : '/login');
  }, [isLoading, user, setLocation]);

  const orders = useMemo(() => ordersQuery.data?.orders ?? [], [ordersQuery.data]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const order of orders) {
      map.set(order.status, (map.get(order.status) ?? 0) + 1);
    }
    return map;
  }, [orders]);

  const revenue = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0),
    [orders],
  );

  if (isLoading || !user?.isAdmin) {
    return (
      <PageTransition className="flex min-h-screen items-center justify-center pt-32">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Loading…</span>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="mx-auto max-w-[1200px] px-6 pb-24 pt-32 md:px-12">
      <Seo title="Order dashboard" path="/admin" />
      <h1 className="mb-4 font-serif text-5xl font-light tracking-tight">Orders</h1>
      <p className="mb-10 text-sm text-muted-foreground">
        {orders.length} orders{statusFilter === 'all' ? '' : ' (filtered)'} · revenue{' '}
        {formatKRW(revenue)}
      </p>

      <div className="mb-10 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={cn(
            'text-xs uppercase tracking-[0.15em] transition-colors',
            statusFilter === 'all'
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground/80',
          )}
          data-testid="filter-status-all"
        >
          All
        </button>
        {ORDER_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={cn(
              'text-xs uppercase tracking-[0.15em] transition-colors',
              statusFilter === status
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground/80',
            )}
            data-testid={`filter-status-${status}`}
          >
            {ORDER_STATUS_LABELS[status].ko}
            {counts.get(status) ? ` (${counts.get(status)})` : ''}
          </button>
        ))}
      </div>

      {ordersQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading orders…</p>
      ) : ordersQuery.isError ? (
        <p className="text-sm text-destructive">
          Failed to load orders — is the API server running?
        </p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders in this view.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => (
            <AdminOrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </PageTransition>
  );
}
