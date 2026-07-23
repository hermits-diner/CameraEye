import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { UpdateOrderStatusBody } from "@workspace/api-zod";
import { canTransition, isOrderStatus } from "@workspace/commerce";
import { db, ordersTable } from "@workspace/db";
import { requireAdmin } from "../lib/auth";
import { sendOrderStatusUpdate } from "../lib/mailer";
import { loadItemsByOrder, toApiOrder } from "../lib/orders";

const router: IRouter = Router();

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

router.get("/admin/orders", requireAdmin, async (req, res) => {
  const statusFilter =
    typeof req.query.status === "string" && isOrderStatus(req.query.status)
      ? req.query.status
      : undefined;

  const orders = await db
    .select()
    .from(ordersTable)
    .where(statusFilter ? eq(ordersTable.status, statusFilter) : undefined)
    .orderBy(desc(ordersTable.createdAt))
    .limit(500);

  const itemsByOrder = await loadItemsByOrder(orders.map((o) => o.id));

  res.json({
    orders: orders.map((order) =>
      toApiOrder(order, itemsByOrder.get(order.id) ?? []),
    ),
  });
});

router.patch("/admin/orders/:orderId/status", requireAdmin, async (req, res) => {
  const orderId = String(req.params.orderId);
  if (!UUID_RE.test(orderId)) {
    res.status(404).json({ message: "Unknown order" });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const { status: nextStatus, trackingNumber } = parsed.data;

  const rows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);
  const order = rows[0];
  if (!order) {
    res.status(404).json({ message: "Unknown order" });
    return;
  }

  const currentStatus = isOrderStatus(order.status) ? order.status : "pending";
  if (!canTransition(currentStatus, nextStatus)) {
    res.status(400).json({
      message: `Cannot move an order from "${currentStatus}" to "${nextStatus}"`,
    });
    return;
  }

  const [updated] = await db
    .update(ordersTable)
    .set({
      status: nextStatus,
      ...(trackingNumber !== undefined ? { trackingNumber } : {}),
      updatedAt: new Date(),
    })
    .where(eq(ordersTable.id, orderId))
    .returning();

  await sendOrderStatusUpdate({
    orderNumber: updated.orderNumber,
    name: updated.name,
    email: updated.email,
    status: nextStatus,
    trackingNumber: updated.trackingNumber,
  });

  const itemsByOrder = await loadItemsByOrder([updated.id]);
  res.json({ order: toApiOrder(updated, itemsByOrder.get(updated.id) ?? []) });
});

export default router;
