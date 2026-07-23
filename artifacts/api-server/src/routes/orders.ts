import { Router, type IRouter } from "express";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { CreateOrderBody } from "@workspace/api-zod";
import {
  calcShipping,
  getProductById,
  getSize,
  getUnitPrice,
  type ShopProduct,
} from "@workspace/commerce";
import {
  db,
  downloadTokensTable,
  orderItemsTable,
  ordersTable,
} from "@workspace/db";
import { requireAuth } from "../lib/auth";
import { sendOrderConfirmation } from "../lib/mailer";
import {
  generateDownloadToken,
  generateOrderNumber,
  loadItemsByOrder,
  toApiOrder,
} from "../lib/orders";

const router: IRouter = Router();

const DOWNLOAD_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface ResolvedLine {
  product: ShopProduct;
  sizeId?: string;
  unitPrice: number;
  quantity: number;
}

router.post("/orders", async (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const input = parsed.data;

  // Resolve every line against the shared catalog; prices always come from
  // the catalog, never from the client.
  const lines: ResolvedLine[] = [];
  for (const item of input.items) {
    const product = getProductById(item.productId);
    if (!product) {
      res.status(400).json({ message: `Unknown product: ${item.productId}` });
      return;
    }
    if (product.type === "print" && !getSize(product, item.sizeId)) {
      res.status(400).json({ message: `A valid size is required for ${product.title}` });
      return;
    }
    const unitPrice = getUnitPrice(product, item.sizeId);
    if (unitPrice == null) {
      res.status(400).json({ message: `No price available for ${product.title}` });
      return;
    }
    lines.push({
      product,
      ...(item.sizeId ? { sizeId: item.sizeId } : {}),
      unitPrice,
      quantity: item.quantity,
    });
  }

  const hasPrint = lines.some((l) => l.product.type === "print");
  if (hasPrint && !input.shippingAddress) {
    res.status(400).json({ message: "A shipping address is required for print orders" });
    return;
  }

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const shippingFee = hasPrint
    ? calcShipping(input.items, input.shippingAddress!.country, subtotal).fee
    : 0;
  const total = subtotal + shippingFee;
  const allDigital = lines.every((l) => l.product.type === "digital");

  // Aggregate requested quantity per limited-edition product.
  const limitedQty = new Map<string, { editionSize: number; qty: number }>();
  for (const line of lines) {
    if (line.product.type !== "print" || line.product.editionSize == null) continue;
    const entry = limitedQty.get(line.product.id);
    if (entry) entry.qty += line.quantity;
    else limitedQty.set(line.product.id, {
      editionSize: line.product.editionSize,
      qty: line.quantity,
    });
  }

  let created;
  try {
    created = await db.transaction(async (tx) => {
      // Serialize stock checks per product via advisory locks (sorted to
      // avoid deadlocks between concurrent multi-product orders).
      const limitedIds = [...limitedQty.keys()].sort();
      for (const productId of limitedIds) {
        await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${productId}))`);
      }
      if (limitedIds.length > 0) {
        const soldRows = await tx
          .select({
            productId: orderItemsTable.productId,
            sold: sql<number>`coalesce(sum(${orderItemsTable.quantity}), 0)::int`,
          })
          .from(orderItemsTable)
          .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
          .where(
            sql`${ordersTable.status} <> 'cancelled' and ${inArray(orderItemsTable.productId, limitedIds)}`,
          )
          .groupBy(orderItemsTable.productId);
        const soldMap = new Map(soldRows.map((r) => [r.productId, r.sold]));
        for (const [productId, { editionSize, qty }] of limitedQty) {
          const sold = soldMap.get(productId) ?? 0;
          if (sold + qty > editionSize) {
            const remaining = Math.max(0, editionSize - sold);
            throw new StockError(
              remaining === 0
                ? `${getProductById(productId)?.title ?? productId} is sold out`
                : `Only ${remaining} left of ${getProductById(productId)?.title ?? productId}`,
            );
          }
        }
      }

      const [order] = await tx
        .insert(ordersTable)
        .values({
          orderNumber: generateOrderNumber(),
          userId: req.user?.id ?? null,
          email: input.email.toLowerCase(),
          name: input.name,
          status: allDigital ? "completed" : "pending",
          shippingAddress: input.shippingAddress ?? null,
          subtotal,
          shippingFee,
          total,
          notes: input.notes ?? null,
        })
        .returning();

      const items = await tx
        .insert(orderItemsTable)
        .values(
          lines.map((l) => ({
            orderId: order.id,
            productId: l.product.id,
            productType: l.product.type,
            title: l.product.title,
            sizeId: l.sizeId ?? null,
            unitPrice: l.unitPrice,
            quantity: l.quantity,
          })),
        )
        .returning();

      const digitalLines = lines.filter((l) => l.product.type === "digital");
      const downloads =
        digitalLines.length > 0
          ? await tx
              .insert(downloadTokensTable)
              .values(
                digitalLines.map((l) => ({
                  orderId: order.id,
                  productId: l.product.id,
                  token: generateDownloadToken(),
                  expiresAt: new Date(Date.now() + DOWNLOAD_TOKEN_TTL_MS),
                })),
              )
              .returning()
          : [];

      return { order, items, downloads };
    });
  } catch (err) {
    if (err instanceof StockError) {
      res.status(409).json({ message: err.message });
      return;
    }
    throw err;
  }

  const downloadsWithTitles = created.downloads.map((d) => ({
    ...d,
    title: getProductById(d.productId)?.title ?? d.productId,
  }));

  // Notify buyer (and admins); never let email failures break checkout.
  await sendOrderConfirmation({
    orderNumber: created.order.orderNumber,
    name: created.order.name,
    email: created.order.email,
    total: created.order.total,
    currency: created.order.currency,
    items: created.items.map((i) => ({
      title: i.title,
      sizeId: i.sizeId,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    downloads: downloadsWithTitles.map((d) => ({ title: d.title, token: d.token })),
  });

  res
    .status(201)
    .json({ order: toApiOrder(created.order, created.items, downloadsWithTitles) });
});

router.get("/orders/mine", requireAuth, async (req, res) => {
  const orders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.userId, req.user!.id))
    .orderBy(desc(ordersTable.createdAt));

  const itemsByOrder = await loadItemsByOrder(orders.map((o) => o.id));

  const orderIds = orders.map((o) => o.id);
  const tokens = orderIds.length
    ? await db
        .select()
        .from(downloadTokensTable)
        .where(inArray(downloadTokensTable.orderId, orderIds))
    : [];
  const tokensByOrder = new Map<string, typeof tokens>();
  for (const token of tokens) {
    const list = tokensByOrder.get(token.orderId);
    if (list) list.push(token);
    else tokensByOrder.set(token.orderId, [token]);
  }

  res.json({
    orders: orders.map((order) =>
      toApiOrder(
        order,
        itemsByOrder.get(order.id) ?? [],
        (tokensByOrder.get(order.id) ?? []).map((t) => ({
          ...t,
          title: getProductById(t.productId)?.title ?? t.productId,
        })),
      ),
    ),
  });
});

class StockError extends Error {}

export default router;
