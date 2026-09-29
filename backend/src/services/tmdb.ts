import axios from "axios";
import { eq } from "drizzle-orm";
import { env } from "../config/env";
import { db } from "../db/client";
import { movies } from "../db/schema";

const tmdb = axios.create({
  baseURL: env.tmdbBaseUrl,
  params: { api_key: env.tmdbApiKey },
});

export interface TmdbMovieSummary {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  popularity: number;
  release_date: string | null;
}

interface TmdbDiscoverResponse {
  page: number;
  total_pages: number;
  results: TmdbMovieSummary[];
}

export type CachedMovie = typeof movies.$inferSelect;

/**
 * Fetch every movie TMDB reports as releasing within [startDate, endDate]
 * (YYYY-MM-DD), sorted by popularity. Pages through TMDB's results up to
 * a safety cap so one calendar month doesn't trigger unbounded requests.
 */
export async function discoverMoviesInRange(
  startDate: string,
  endDate: string,
  maxPages = 5
): Promise<TmdbMovieSummary[]> {
  const results: TmdbMovieSummary[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const { data } = await tmdb.get<TmdbDiscoverResponse>("/discover/movie", {
      params: {
        "primary_release_date.gte": startDate,
        "primary_release_date.lte": endDate,
        sort_by: "popularity.desc",
        page,
      },
    });

    results.push(...data.results);

    if (page >= data.total_pages) break;
  }

  return results;
}

export async function searchMovies(query: string): Promise<TmdbMovieSummary[]> {
  const { data } = await tmdb.get<TmdbDiscoverResponse>("/search/movie", {
    params: { query },
  });
  return data.results;
}

/**
 * Earliest theatrical (type 2 limited / 3 wide) release in any country dated
 * after `today`. For an already-released film this is how a scheduled
 * re-release shows up on TMDB: an extra theatrical entry with a future date.
 */
export async function getUpcomingReRelease(id: number, today: string): Promise<string | null> {
  try {
    const { data } = await tmdb.get<{
      results: { release_dates: { type: number; release_date: string }[] }[];
    }>(`/movie/${id}/release_dates`);
    const upcoming = data.results
      .flatMap((c) => c.release_dates)
      .filter((r) => (r.type === 2 || r.type === 3) && r.release_date.slice(0, 10) > today)
      .map((r) => r.release_date.slice(0, 10))
      .sort();
    return upcoming[0] ?? null;
  } catch {
    return null;
  }
}

export async function getMovieDetails(id: number): Promise<TmdbMovieSummary> {
  const { data } = await tmdb.get<TmdbMovieSummary>(`/movie/${id}`);
  return data;
}

/**
 * Upserts TMDB movie summaries into the local cache so the calendar and
 * feed generation don't need to hit TMDB on every request. Returns the
 * cached rows in the same order as the input.
 *
 * NOTE: this only caches the primary_release_date TMDB reports. Release
 * dates change often (delays, regional staggering) — a production version
 * of this app should run a periodic job that re-fetches tracked movies'
 * dates and reconciles any that moved (see trackedMovies.reminderMinutesBefore
 * and the feed generator for where an updated date would need to propagate).
 */
export async function cacheMovies(items: TmdbMovieSummary[]): Promise<CachedMovie[]> {
  const cached: CachedMovie[] = [];

  for (const m of items) {
    const row = {
      id: m.id,
      title: m.title,
      overview: m.overview ?? null,
      posterPath: m.poster_path,
      popularity: m.popularity,
      releaseDate: m.release_date || null,
      lastCheckedAt: new Date().toISOString(),
    };

    await db
      .insert(movies)
      .values(row)
      .onConflictDoUpdate({ target: movies.id, set: row });

    const [saved] = await db.select().from(movies).where(eq(movies.id, m.id));
    cached.push(saved);
  }

  return cached;
}

export function posterUrl(posterPath: string | null): string | null {
  return posterPath ? `${env.tmdbImageBaseUrl}${posterPath}` : null;
}
