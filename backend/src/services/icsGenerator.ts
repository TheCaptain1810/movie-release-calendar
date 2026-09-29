import ical, { ICalAlarmType, ICalEventTransparency } from "ical-generator";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { feedTokens, trackedMovies, movies, users } from "../db/schema";

/**
 * Builds a personal .ics feed (as a string) for the given feed token,
 * containing one all-day event per tracked movie with a VALARM reminder.
 * This is what a user subscribes to from Google/Apple/Outlook via
 * webcal://<host>/api/feed/<token>.ics — the calendar app re-fetches this
 * URL periodically, so any change here (a movie added, removed, or a
 * release date correction) propagates without further action.
 */
export async function buildIcsFeedForToken(token: string): Promise<string | null> {
  const [feedToken] = await db.select().from(feedTokens).where(eq(feedTokens.token, token));
  if (!feedToken) return null;

  const [user] = await db.select().from(users).where(eq(users.id, feedToken.userId));
  if (!user) return null;

  const rows = await db
    .select({ tracked: trackedMovies, movie: movies })
    .from(trackedMovies)
    .innerJoin(movies, eq(trackedMovies.movieId, movies.id))
    .where(eq(trackedMovies.userId, user.id));

  const calendar = ical({ name: `${user.name ?? "My"} Movie Releases` });

  for (const { tracked, movie } of rows) {
    if (!movie.releaseDate) continue;

    const event = calendar.createEvent({
      id: `movie-${movie.id}@movie-release-calendar`,
      start: new Date(movie.releaseDate),
      allDay: true,
      summary: `🎬 ${movie.title} releases today`,
      description: movie.overview ?? undefined,
      transparency: ICalEventTransparency.TRANSPARENT,
    });

    event.createAlarm({
      type: ICalAlarmType.display,
      // NOTE: VALARM triggers on all-day events are interpreted differently
      // across calendar apps (Apple honors them well; Google's handling of
      // alarms on subscribed/read-only calendars is inconsistent). If you
      // need guaranteed custom notifications, add the direct Google Calendar
      // API push option described in the project notes / README.
      triggerBefore: tracked.reminderMinutesBefore * 60,
    });
  }

  return calendar.toString();
}
