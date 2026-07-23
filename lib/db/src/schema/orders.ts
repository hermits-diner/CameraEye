import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export interface OrderShippingAddress {
  recipient: string;
  country: string;
  city: string;
  postalCode: string;
  addressLine1: string;
  addressLine2?: string;
  phone?: string;
}

export const ordersTable = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderNumber: varchar("order_number", { length: 32 }).notNull().unique(),
    userId: uuid("user_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    email: varchar("email", { length: 320 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    /** One of the statuses in @workspace/commerce ORDER_STATUSES. */
    status: varchar("status", { length: 24 }).notNull().default("pending"),
    shippingAddress: jsonb("shipping_address").$type<OrderShippingAddress>(),
    /** All amounts in KRW (integers). */
    subtotal: integer("subtotal").notNull(),
    shippingFee: integer("shipping_fee").notNull().default(0),
    total: integer("total").notNull(),
    currency: varchar("currency", { length: 8 }).notNull().default("KRW"),
    trackingNumber: varchar("tracking_number", { length: 64 }),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("orders_user_id_idx").on(table.userId),
    index("orders_status_idx").on(table.status),
    index("orders_email_idx").on(table.email),
  ],
);

export type Order = typeof ordersTable.$inferSelect;

export const orderItemsTable = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => ordersTable.id, { onDelete: "cascade" }),
    /** Catalog product id from @workspace/commerce. */
    productId: varchar("product_id", { length: 64 }).notNull(),
    productType: varchar("product_type", { length: 16 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    sizeId: varchar("size_id", { length: 16 }),
    /** Unit price in KRW at time of order. */
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
    index("order_items_product_id_idx").on(table.productId),
  ],
);

export type OrderItem = typeof orderItemsTable.$inferSelect;
