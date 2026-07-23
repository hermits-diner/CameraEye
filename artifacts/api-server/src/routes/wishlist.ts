import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { UpdateWishlistBody } from "@workspace/api-zod";
import { getProductById } from "@workspace/commerce";
import { db, wishlistsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/wishlist", requireAuth, async (req, res) => {
  const rows = await db
    .select({ productId: wishlistsTable.productId })
    .from(wishlistsTable)
    .where(eq(wishlistsTable.userId, req.user!.id));
  res.json({ productIds: rows.map((r) => r.productId) });
});

router.put("/wishlist", requireAuth, async (req, res) => {
  const parsed = UpdateWishlistBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  // Silently drop ids that are not in the catalog (e.g. removed products).
  const productIds = [...new Set(parsed.data.productIds)].filter((id) =>
    getProductById(id),
  );

  await db.transaction(async (tx) => {
    await tx.delete(wishlistsTable).where(eq(wishlistsTable.userId, req.user!.id));
    if (productIds.length > 0) {
      await tx
        .insert(wishlistsTable)
        .values(productIds.map((productId) => ({ userId: req.user!.id, productId })));
    }
  });

  res.json({ productIds });
});

export default router;
