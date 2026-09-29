import { Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { feedTokens } from "../db/schema";
import { env } from "../config/env";
import { buildIcsFeedForToken } from "../services/icsGenerator";
import { AuthedRequest } from "../middleware/auth.middleware";

function toUrls(token: string) {
  const httpsUrl = `${env.appBaseUrl}/api/feed/${token}.ics`;
  return { httpsUrl, webcalUrl: httpsUrl.replace(/^https?:\/\//, "webcal://") };
}

/** GET /api/feed/me — returns the caller's subscribe-able feed URL (auth required) */
export async function getMyFeedUrl(req: AuthedRequest, res: Response) {
  const [feedToken] = await db.select().from(feedTokens).where(eq(feedTokens.userId, req.user!.userId));
  if (!feedToken) return res.status(404).json({ error: "No feed token found for this user" });

  return res.json(toUrls(feedToken.token));
}

/** POST /api/feed/regenerate — invalidates the old feed URL and issues a new one */
export async function regenerateFeedToken(req: AuthedRequest, res: Response) {
  await db.delete(feedTokens).where(eq(feedTokens.userId, req.user!.userId));
  const [feedToken] = await db.insert(feedTokens).values({ userId: req.user!.userId }).returning();

  return res.status(201).json(toUrls(feedToken.token));
}

/** GET /api/feed/:token.ics — public, no auth (the token itself is the secret) */
export async function serveIcsFeed(req: AuthedRequest, res: Response) {
  const rawToken = req.params.token;
  const token = rawToken.endsWith(".ics") ? rawToken.slice(0, -4) : rawToken;

  const ics = await buildIcsFeedForToken(token);
  if (ics === null) return res.status(404).send("Feed not found");

  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", 'inline; filename="movie-releases.ics"');
  return res.send(ics);
}
