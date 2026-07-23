import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { LoginBody, RegisterBody } from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import {
  createSession,
  destroySession,
  hashPassword,
  isAdminEmail,
  requireAuth,
  toApiUser,
  verifyPassword,
} from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const { email, password, name } = parsed.data;

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()))
    .limit(1);
  if (existing.length > 0) {
    res.status(409).json({ message: "This email is already registered" });
    return;
  }

  const [user] = await db
    .insert(usersTable)
    .values({
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
      name,
      isAdmin: isAdminEmail(email),
    })
    .returning();

  await createSession(user.id, res);
  res.status(201).json({ user: toApiUser(user) });
});

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const { email, password } = parsed.data;

  const rows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()))
    .limit(1);
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  // Allow env-driven admin elevation to apply to existing accounts.
  let effectiveUser = user;
  if (!user.isAdmin && isAdminEmail(user.email)) {
    const [updated] = await db
      .update(usersTable)
      .set({ isAdmin: true })
      .where(eq(usersTable.id, user.id))
      .returning();
    effectiveUser = updated;
  }

  await createSession(effectiveUser.id, res);
  res.json({ user: toApiUser(effectiveUser) });
});

router.post("/auth/logout", async (req, res) => {
  await destroySession(req, res);
  res.json({ ok: true });
});

router.get("/auth/me", requireAuth, (req, res) => {
  res.json({ user: toApiUser(req.user!) });
});

export default router;
