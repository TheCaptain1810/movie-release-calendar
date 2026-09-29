import * as React from "react";
import { MonthView } from "@/components/calendar/MonthView";
import { DayDetailDialog } from "@/components/calendar/DayDetailDialog";
import { Button } from "@/components/ui/button";
import { fetchCalendarMonth, fetchTrackedMovies, trackMovie, untrackMovie } from "@/api";
import type { Movie } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function HomePage() {
  const { user } = useAuth();
  const now = new Date();
  const [year, setYear] = React.useState(now.getFullYear());
  const [month, setMonth] = React.useState(now.getMonth() + 1); // 1-indexed

  const [days, setDays] = React.useState<Record<string, Movie[]>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [trackedIds, setTrackedIds] = React.useState<Set<number>>(new Set());

  const [selectedDay, setSelectedDay] = React.useState<{ key: string; movies: Movie[] } | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchCalendarMonth(year, month)
      .then((data) => {
        if (!cancelled) setDays(data.days);
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "Couldn't load release data. Make sure TMDB_API_KEY is set in backend/.env and the backend is running."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [year, month]);

  React.useEffect(() => {
    if (!user) {
      setTrackedIds(new Set());
      return;
    }
    fetchTrackedMovies()
      .then((tracked) => setTrackedIds(new Set(tracked.map((t) => t.movieId))))
      .catch(() => {
        /* non-fatal: tracked-state just won't be pre-filled */
      });
  }, [user]);

  function goToMonth(delta: number) {
    const d = new Date(Date.UTC(year, month - 1 + delta, 1));
    setYear(d.getUTCFullYear());
    setMonth(d.getUTCMonth() + 1);
  }

  async function handleToggleTrack(movie: Movie) {
    if (!user) {
      setError("Log in to track movies and add them to your calendar feed.");
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
      setError("Couldn't update tracking for that movie. Try again.");
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {MONTH_LABELS[month - 1]} <span className="font-normal text-muted-foreground">{year}</span>
        </h1>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => goToMonth(-1)} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setYear(now.getFullYear());
              setMonth(now.getMonth() + 1);
            }}
          >
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => goToMonth(1)} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid animate-pulse grid-cols-1 gap-3 sm:grid-cols-7 sm:gap-px sm:overflow-hidden sm:rounded-xl sm:border sm:border-border sm:bg-border">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted sm:h-28 sm:rounded-none" />
          ))}
        </div>
      ) : (
        <MonthView
          year={year}
          month={month}
          days={days}
          trackedIds={trackedIds}
          onSelectDay={(key, movies) => setSelectedDay({ key, movies })}
        />
      )}

      {selectedDay && (
        <DayDetailDialog
          open={!!selectedDay}
          onOpenChange={(open) => !open && setSelectedDay(null)}
          dateLabel={new Date(selectedDay.key + "T00:00:00Z").toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
          })}
          movies={selectedDay.movies}
          trackedIds={trackedIds}
          onToggleTrack={handleToggleTrack}
        />
      )}
    </div>
  );
}
