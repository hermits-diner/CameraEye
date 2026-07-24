import { randomBytes } from "node:crypto";
import { inArray, sql } from "drizzle-orm";
import {
  db,
  orderItemsTable,
  ordersTable,
  type DownloadToken,
  type Order as DbOrder,
  type OrderItem as DbOrderItem,
} from "@workspace/db";
import { isOrderStatus, type OrderStatus } from "@workspace/commerce";
import type { Order as ApiOrder, OrderItem as ApiOrderItem } from "@workspace/api-zod";

export function generateOrderNumber(): string {
  const now = new Date();
  const y = String(now.getFullYear()).slice(2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `WV-${y}${m}${d}-${suffix}`;
}

export function generateDownloadToken(): string {
  return randomBytes(24).toString("base64url");
}

function toApiOrderItem(item: DbOrderItem): ApiOrderItem {
  return {
    id: item.id,
    productId: item.productId,
    productType: item.productType,
    title: item.title,
    ...(item.sizeId ? { sizeId: item.sizeId } : {}),
    unitPrice: item.unitPrice,
    quantity: item.quantity,
  };
}

export function toApiOrder(
  order: DbOrder,
  items: DbOrderItem[],
  downloads?: (DownloadToken & { title: string })[],
): ApiOrder {
  const status: OrderStatus = isOrderStatus(order.status)
    ? order.status
    : "pending";
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status,
    email: order.email,
    name: order.name,
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    total: order.total,
    currency: order.currency,
    ...(order.trackingNumber ? { trackingNumber: order.trackingNumber } : {}),
    ...(order.notes ? { notes: order.notes } : {}),
    createdAt: order.createdAt.toISOString(),
    ...(order.shippingAddress ? { shippingAddress: order.shippingAddress } : {}),
    items: items.map(toApiOrderItem),
    ...(downloads?.length
      ? {
          downloads: downloads.map((d) => ({
            productId: d.productId,
            title: d.title,
            token: d.token,
            expiresAt: d.expiresAt.toISOString(),
            remainingDownloads: Math.max(0, d.maxDownloads - d.downloadCount),
          })),
        }
      : {}),
  };
}

/** Loads the items of many orders in one query, grouped by order id. */
export async function loadItemsByOrder(
  orderIds: string[],
): Promise<Map<string, DbOrderItem[]>> {
  const map = new Map<string, DbOrderItem[]>();
  if (orderIds.length === 0) return map;
  const rows = await db
    .select()
    .from(orderItemsTable)
    .where(inArray(orderItemsTable.orderId, orderIds));
  for (const row of rows) {
    const list = map.get(row.orderId);
    if (list) list.push(row);
    else map.set(row.orderId, [row]);
  }
  return map;
}

/**
 * Sold units per product id, counting every order that is not cancelled.
 * Used both for the public inventory endpoint and stock checks.
 */
export async function getSoldCounts(): Promise<Map<string, number>> {
  const rows = await db
    .select({
      productId: orderItemsTable.productId,
      sold: sql<number>`coalesce(sum(${orderItemsTable.quantity}), 0)::int`,
    })
    .from(orderItemsTable)
    .innerJoin(ordersTable, sql`${orderItemsTable.orderId} = ${ordersTable.id}`)
    .where(sql`${ordersTable.status} <> 'cancelled'`)
    .groupBy(orderItemsTable.productId);
  return new Map(rows.map((r) => [r.productId, r.sold]));
}
