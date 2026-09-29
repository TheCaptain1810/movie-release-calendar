import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { users, feedTokens } from "../db/schema";
import { signToken } from "../utils/jwt";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
});

export async function register(req: Request, res: Response) {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password, name } = parsed.data;

  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(users).values({ email, passwordHash, name }).returning();

  // every user gets a subscribe-able feed on signup
  await db.insert(feedTokens).values({ userId: user.id });

  const token = signToken({ userId: user.id, email: user.email });
  return res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
}

export async function login(req: Request, res: Response) {
  const parsed = credentialsSchema.pick({ email: true, password: true }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken({ userId: user.id, email: user.email });
  return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
}
