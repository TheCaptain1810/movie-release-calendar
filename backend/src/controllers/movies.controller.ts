import { Request, Response } from "express";
import { z } from "zod";
import { cacheMovies, CachedMovie, discoverMoviesInRange, getMovieDetails, getUpcomingReRelease, posterUrl, searchMovies } from "../services/tmdb";

const calendarQuerySchema = z.object({
  year: z.coerce.number().int().min(1900).max(2200),
  month: z.coerce.number().int().min(1).max(12), // 1-indexed, matches how a calendar UI thinks about months
});

function monthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0)); // day 0 of next month = last day of this month
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { startDate: iso(start), endDate: iso(end) };
}

/**
 * GET /api/movies/calendar?year=2026&month=10
 * Returns every movie releasing that month, grouped by day, sorted by
 * popularity within each day — this is what powers the month grid.
 */
export async function getCalendarMonth(req: Request, res: Response) {
  const parsed = calendarQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { year, month } = parsed.data;
  const { startDate, endDate } = monthRange(year, month);

  const tmdbResults = await discoverMoviesInRange(startDate, endDate);
  const cached = await cacheMovies(tmdbResults);

  const byDay: Record<string, ReturnType<typeof toMovieDto>[]> = {};
  for (const movie of cached) {
    if (!movie.releaseDate) continue;
    (byDay[movie.releaseDate] ??= []).push(toMovieDto(movie));
  }
  for (const key of Object.keys(byDay)) {
    byDay[key].sort((a, b) => b.popularity - a.popularity);
  }

  return res.json({ year, month, days: byDay });
}

export async function search(req: Request, res: Response) {
  const query = String(req.query.query ?? "").trim();
  if (!query) return res.status(400).json({ error: "Missing query parameter" });

  const results = await searchMovies(query);
  const cached = await cacheMovies(results);
  const today = todayIso();
  // Only already-released films can have a re-release worth looking up.
  const dtos = await Promise.all(
    cached.map(async (movie) => {
      const dto = toMovieDto(movie);
      if (dto.isReleased) dto.nextReleaseDate = await getUpcomingReRelease(movie.id, today);
      return dto;
    })
  );
  return res.json({ results: dtos });
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid movie id" });

  const details = await getMovieDetails(id);
  const [cached] = await cacheMovies([details]);
  return res.json(toMovieDto(cached));
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function toMovieDto(movie: CachedMovie) {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterUrl: posterUrl(movie.posterPath),
    popularity: movie.popularity,
    releaseDate: movie.releaseDate,
    // Released = primary release date is today or earlier.
    isReleased: !!movie.releaseDate && movie.releaseDate <= todayIso(),
    // Upcoming re-release of an already-released film (search results only).
    nextReleaseDate: null as string | null,
  };
}
