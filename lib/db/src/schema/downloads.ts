import {
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { ordersTable } from "./orders";

/**
 * One token per purchased digital item. The token is emailed to the buyer
 * and exchanged (rate-limited by maxDownloads) for the actual file URL.
 */
export const downloadTokensTable = pgTable(
  "download_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => ordersTable.id, { onDelete: "cascade" }),
    productId: varchar("product_id", { length: 64 }).notNull(),
    token: varchar("token", { length: 128 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    maxDownloads: integer("max_downloads").notNull().default(5),
    downloadCount: integer("download_count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("download_tokens_order_id_idx").on(table.orderId)],
);

export type DownloadToken = typeof downloadTokensTable.$inferSelect;
