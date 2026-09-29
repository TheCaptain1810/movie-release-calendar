export interface Movie {
  id: number;
  title: string;
  overview: string | null;
  posterUrl: string | null;
  popularity: number;
  releaseDate: string | null; // YYYY-MM-DD
  isReleased: boolean;
  nextReleaseDate?: string | null; // scheduled re-release of an already-released film
}

export interface CalendarMonthResponse {
  year: number;
  month: number; // 1-indexed
  days: Record<string, Movie[]>; // key = YYYY-MM-DD
}

export interface TrackedMovie {
  id: string;
  userId: string;
  movieId: number;
  addedAt: string;
  reminderMinutesBefore: number;
  movie: Movie;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface FeedUrls {
  httpsUrl: string;
  webcalUrl: string;
}
