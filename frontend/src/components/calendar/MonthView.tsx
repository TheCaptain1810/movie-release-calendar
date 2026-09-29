import * as React from "react";
import { DayCell } from "./DayCell";
import { cn } from "@/lib/utils";
import type { Movie } from "@/types";
import { Bookmark, CalendarX } from "lucide-react";

interface MonthViewProps {
  year: number;
  month: number; // 1-indexed
  days: Record<string, Movie[]>;
  trackedIds: Set<number>;
  onSelectDay: (dateKey: string, movies: Movie[]) => void;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function MonthView({ year, month, days, trackedIds, onSelectDay }: MonthViewProps) {
  const cells = React.useMemo(() => {
    const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const startWeekday = firstOfMonth.getUTCDay(); // 0 = Sunday
    const gridStart = new Date(firstOfMonth);
    gridStart.setUTCDate(gridStart.getUTCDate() - startWeekday);

    // Always render 6 full weeks (42 cells) so the grid height is stable
    // across months, matching Google Calendar's month view.
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart);
      date.setUTCDate(gridStart.getUTCDate() + i);
      return date;
    });
  }, [year, month]);

  const todayKey = toKey(new Date());

  // Phones: a 7-column grid is unreadable, so show an agenda of the month's release days instead.
  const agenda = cells
    .filter((date) => date.getUTCMonth() === month - 1)
    .map((date) => ({ date, key: toKey(date), movies: days[toKey(date)] ?? [] }))
    .filter((d) => d.movies.length > 0);

  return (
    <>
      {/* Desktop / tablet grid */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm sm:block">
        <div className="grid grid-cols-7 border-b border-border bg-muted/50">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="p-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 [&>button:nth-child(7n)]:border-r-0 [&>button:nth-last-child(-n+7)]:border-b-0">
          {cells.map((date) => {
            const key = toKey(date);
            const isCurrentMonth = date.getUTCMonth() === month - 1;
            const dayMovies = days[key] ?? [];

            return (
              <DayCell
                key={key}
                date={date}
                isCurrentMonth={isCurrentMonth}
                isToday={key === todayKey}
                movies={dayMovies}
                trackedIds={trackedIds}
                onClick={() => onSelectDay(key, dayMovies)}
              />
            );
          })}
        </div>
      </div>

      {/* Mobile agenda */}
      <div className="flex flex-col gap-3 sm:hidden">
        {agenda.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-sm text-muted-foreground">
            <CalendarX className="h-6 w-6" />
            No releases this month
          </div>
        ) : (
          agenda.map(({ date, key, movies }) => {
            const isToday = key === todayKey;
            return (
              <button
                key={key}
                onClick={() => onSelectDay(key, movies)}
                className="flex gap-3 rounded-xl border border-border bg-card p-3 text-left shadow-sm transition-colors active:bg-accent"
              >
                <div
                  className={cn(
                    "flex h-14 w-12 flex-shrink-0 flex-col items-center justify-center rounded-lg",
                    isToday ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  )}
                >
                  <span className="text-[10px] font-semibold uppercase">{WEEKDAY_LABELS[date.getUTCDay()]}</span>
                  <span className="text-lg font-semibold leading-none">{date.getUTCDate()}</span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  {movies
                    .slice()
                    .sort((a, b) => b.popularity - a.popularity)
                    .slice(0, 4)
                    .map((movie) => (
                      <div key={movie.id} className="flex min-w-0 items-center gap-2">
                        {movie.posterUrl ? (
                          <img src={movie.posterUrl} alt="" loading="lazy" className="h-9 w-6 flex-shrink-0 rounded object-cover" />
                        ) : (
                          <div className="h-9 w-6 flex-shrink-0 rounded bg-muted" />
                        )}
                        <span className="line-clamp-2 min-w-0 flex-1 text-sm font-medium">{movie.title}</span>
                        {trackedIds.has(movie.id) && (
                          <Bookmark className="h-3.5 w-3.5 flex-shrink-0 fill-primary text-primary" />
                        )}
                      </div>
                    ))}
                  {movies.length > 4 && (
                    <span className="text-xs text-muted-foreground">+{movies.length - 4} more</span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </>
  );
}
