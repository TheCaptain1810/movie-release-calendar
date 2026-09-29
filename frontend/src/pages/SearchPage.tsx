import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchTrackedMovies, searchMovies as searchMoviesApi, trackMovie, untrackMovie } from "@/api";
import type { Movie } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { Bookmark, BookmarkCheck, Search as SearchIcon } from "lucide-react";

export function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Movie[]>([]);
  const [trackedIds, setTrackedIds] = React.useState<Set<number>>(new Set());
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) return;
    fetchTrackedMovies()
      .then((tracked) => setTrackedIds(new Set(tracked.map((t) => t.movieId))))
      .catch(() => {});
  }, [user]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const movies = await searchMoviesApi(query.trim());
      setResults(movies);
    } catch {
      setError("Search failed. Make sure TMDB_API_KEY is set in backend/.env.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleTrack(movie: Movie) {
    if (!user) {
      setError("Log in to track movies.");
      return;
    }
    const isTracked = trackedIds.has(movie.id);
    try {
      if (isTracked) {
        await untrackMovie(movie.id);
        setTrackedIds((prev) => {
          const next = new Set(prev);
          next.delete(movie.id);
          return next;
        });
      } else {
        await trackMovie(movie.id);
        setTrackedIds((prev) => new Set(prev).add(movie.id));
      }
    } catch {
      setError("Couldn't update tracking for that movie.");
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <h1 className="text-xl font-semibold">Search movies</h1>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input placeholder="Search TMDB…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button type="submit" disabled={loading}>
          <SearchIcon className="h-4 w-4" />
          {loading ? "Searching…" : "Search"}
        </Button>
      </form>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {results.map((movie) => {
          const isTracked = trackedIds.has(movie.id);
          return (
            <Card key={movie.id} className="overflow-hidden">
              {movie.posterUrl ? (
                <img src={movie.posterUrl} alt={movie.title} className="aspect-[2/3] w-full object-cover" />
              ) : (
                <div className="aspect-[2/3] w-full bg-muted" />
              )}
              <CardContent className="flex flex-col gap-2 p-2">
                <span className="line-clamp-2 text-xs font-medium">{movie.title}</span>
                <span className="text-[11px] text-muted-foreground">{movie.releaseDate ?? "TBA"}</span>
                <Button size="sm" variant={isTracked ? "secondary" : "default"} onClick={() => handleToggleTrack(movie)}>
                  {isTracked ? (
                    <>
                      <BookmarkCheck className="h-3.5 w-3.5" /> Tracked
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-3.5 w-3.5" /> Track
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
