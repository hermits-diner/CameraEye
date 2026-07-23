import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { getProductById } from "@workspace/commerce";
import { db, downloadTokensTable } from "@workspace/db";

const router: IRouter = Router();

/**
 * Resolve the file URL for a purchased digital product. When a dedicated
 * asset host is configured (DIGITAL_FILE_BASE_URL), files are expected at
 * `<base>/<productId>.jpg`; otherwise the public preview image is served
 * as a stand-in so the flow works end to end in development.
 */
function digitalFileUrl(productId: string): string {
  const base = process.env.DIGITAL_FILE_BASE_URL;
  if (base) return `${base.replace(/\/+$/, "")}/${productId}.jpg`;
  return getProductById(productId)?.imageUrl ?? `/images/${productId}.jpg`;
}

router.get("/downloads/:token", async (req, res) => {
  const rows = await db
    .select()
    .from(downloadTokensTable)
    .where(eq(downloadTokensTable.token, req.params.token))
    .limit(1);
  const token = rows[0];
  if (!token) {
    res.status(404).json({ message: "Unknown download link" });
    return;
  }
  if (token.expiresAt.getTime() < Date.now()) {
    res.status(410).json({ message: "This download link has expired" });
    return;
  }
  if (token.downloadCount >= token.maxDownloads) {
    res.status(410).json({ message: "Download limit reached for this link" });
    return;
  }

  const [updated] = await db
    .update(downloadTokensTable)
    .set({ downloadCount: sql`${downloadTokensTable.downloadCount} + 1` })
    .where(eq(downloadTokensTable.id, token.id))
    .returning();

  const product = getProductById(token.productId);
  res.json({
    title: product?.title ?? token.productId,
    url: digitalFileUrl(token.productId),
    ...(product?.digital?.fileSpec ? { fileSpec: product.digital.fileSpec } : {}),
    remainingDownloads: Math.max(0, updated.maxDownloads - updated.downloadCount),
  });
});

export default router;
