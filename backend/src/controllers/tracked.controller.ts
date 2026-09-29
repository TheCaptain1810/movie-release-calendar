import { Response } from "express";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { trackedMovies, movies } from "../db/schema";
import { AuthedRequest } from "../middleware/auth.middleware";

const addSchema = z.object({
  movieId: z.number().int(),
  reminderMinutesBefore: z.number().int().min(0).optional(),
});

export async function listTracked(req: AuthedRequest, res: Response) {
  const rows = await db
    .select({ tracked: trackedMovies, movie: movies })
    .from(trackedMovies)
    .innerJoin(movies, eq(trackedMovies.movieId, movies.id))
    .where(eq(trackedMovies.userId, req.user!.userId))
    .orderBy(desc(trackedMovies.addedAt));

  return res.json({ tracked: rows.map((r) => ({ ...r.tracked, movie: r.movie })) });
}

export async function addTracked(req: AuthedRequest, res: Response) {
  const parsed = addSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { movieId, reminderMinutesBefore } = parsed.data;
  const userId = req.user!.userId;

  const [movie] = await db.select().from(movies).where(eq(movies.id, movieId));
  if (!movie) {
    return res.status(404).json({ error: "Movie not cached yet — fetch it via /api/movies first" });
  }

  const [existing] = await db
    .select()
    .from(trackedMovies)
    .where(and(eq(trackedMovies.userId, userId), eq(trackedMovies.movieId, movieId)));

  const [tracked] = existing
    ? await db
        .update(trackedMovies)
        .set({ reminderMinutesBefore: reminderMinutesBefore ?? existing.reminderMinutesBefore })
        .where(eq(trackedMovies.id, existing.id))
        .returning()
    : await db
        .insert(trackedMovies)
        .values({ userId, movieId, reminderMinutesBefore: reminderMinutesBefore ?? 60 })
        .returning();

  return res.status(201).json({ tracked: { ...tracked, movie } });
}

export async function removeTracked(req: AuthedRequest, res: Response) {
  const movieId = Number(req.params.movieId);
  if (Number.isNaN(movieId)) return res.status(400).json({ error: "Invalid movie id" });

  await db
    .delete(trackedMovies)
    .where(and(eq(trackedMovies.userId, req.user!.userId), eq(trackedMovies.movieId, movieId)));

  return res.status(204).send();
}
