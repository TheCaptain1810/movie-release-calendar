import { api } from "./client";
import type { CalendarMonthResponse, FeedUrls, Movie, TrackedMovie, User } from "@/types";

export async function registerUser(email: string, password: string, name?: string) {
  const { data } = await api.post<{ token: string; user: User }>("/api/auth/register", { email, password, name });
  return data;
}

export async function loginUser(email: string, password: string) {
  const { data } = await api.post<{ token: string; user: User }>("/api/auth/login", { email, password });
  return data;
}

export async function fetchCalendarMonth(year: number, month: number) {
  const { data } = await api.get<CalendarMonthResponse>("/api/movies/calendar", { params: { year, month } });
  return data;
}

export async function searchMovies(query: string) {
  const { data } = await api.get<{ results: Movie[] }>("/api/movies/search", { params: { query } });
  return data.results;
}

export async function fetchTrackedMovies() {
  const { data } = await api.get<{ tracked: TrackedMovie[] }>("/api/tracked");
  return data.tracked;
}

export async function trackMovie(movieId: number, reminderMinutesBefore?: number) {
  const { data } = await api.post<{ tracked: TrackedMovie }>("/api/tracked", { movieId, reminderMinutesBefore });
  return data.tracked;
}

export async function untrackMovie(movieId: number) {
  await api.delete(`/api/tracked/${movieId}`);
}

export async function fetchMyFeedUrl() {
  const { data } = await api.get<FeedUrls>("/api/feed/me");
  return data;
}

export async function regenerateFeedUrl() {
  const { data } = await api.post<FeedUrls>("/api/feed/regenerate");
  return data;
}
