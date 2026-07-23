import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { SubscribeNewsletterBody } from "@workspace/api-zod";
import { db, newsletterSubscribersTable } from "@workspace/db";
import { sendNewsletterWelcome } from "../lib/mailer";

const router: IRouter = Router();

router.post("/newsletter/subscribe", async (req, res) => {
  const parsed = SubscribeNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid email" });
    return;
  }
  const email = parsed.data.email.toLowerCase();

  const existing = await db
    .select()
    .from(newsletterSubscribersTable)
    .where(eq(newsletterSubscribersTable.email, email))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(newsletterSubscribersTable).values({ email });
    await sendNewsletterWelcome(email);
  } else if (existing[0].unsubscribedAt) {
    await db
      .update(newsletterSubscribersTable)
      .set({ unsubscribedAt: null })
      .where(eq(newsletterSubscribersTable.email, email));
    await sendNewsletterWelcome(email);
  }
  // Idempotent: already-subscribed addresses also get { ok: true }.
  res.json({ ok: true });
});

export default router;
