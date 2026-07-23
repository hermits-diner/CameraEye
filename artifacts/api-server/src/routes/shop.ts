import { Router, type IRouter } from "express";
import { SHOP_PRODUCTS } from "@workspace/commerce";
import type { InventoryItem } from "@workspace/api-zod";
import { getSoldCounts } from "../lib/orders";

const router: IRouter = Router();

router.get("/shop/inventory", async (_req, res) => {
  const soldCounts = await getSoldCounts();

  const items: InventoryItem[] = SHOP_PRODUCTS.map((product) => {
    const sold = soldCounts.get(product.id) ?? 0;
    if (product.type !== "print" || product.editionSize == null) {
      // Digital and open-edition products never sell out.
      return { productId: product.id, sold, soldOut: false };
    }
    const remaining = Math.max(0, product.editionSize - sold);
    return {
      productId: product.id,
      editionSize: product.editionSize,
      sold,
      remaining,
      soldOut: remaining === 0,
    };
  });

  res.json({ items });
});

export default router;
