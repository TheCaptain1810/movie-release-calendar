import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
});

// One personal, unguessable token per user, used to build their
// webcal://.../feed/{token}.ics subscription URL. Kept separate from
// the user id so it can be regenerated/revoked without touching the account.
export const feedTokens = sqliteTable("feed_tokens", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  token: text("token").notNull().unique().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
});

// Cached TMDB movie metadata. Refreshed opportunistically when a movie is
// fetched or tracked; release dates can move, so lastCheckedAt lets a
// future background job decide what to re-verify with TMDB.
export const movies = sqliteTable("movies", {
  id: integer("id").primaryKey(), // TMDB movie id, used as-is (not auto-generated)
  title: text("title").notNull(),
  overview: text("overview"),
  posterPath: text("poster_path"),
  popularity: real("popularity").notNull().default(0),
  releaseDate: text("release_date"), // YYYY-MM-DD, primary release date used for calendar placement
  lastCheckedAt: text("last_checked_at").notNull().default(sql`(current_timestamp)`),
});

export const trackedMovies = sqliteTable(
  "tracked_movies",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    movieId: integer("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
    addedAt: text("added_at").notNull().default(sql`(current_timestamp)`),
    // used when generating the VALARM in the .ics feed
    reminderMinutesBefore: integer("reminder_minutes_before").notNull().default(60),
  },
  (table) => [uniqueIndex("tracked_movies_user_movie_idx").on(table.userId, table.movieId)]
);
