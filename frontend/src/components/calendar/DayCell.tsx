import { cn } from "@/lib/utils";
import type { Movie } from "@/types";
import { Bookmark } from "lucide-react";

interface DayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  movies: Movie[];
  trackedIds: Set<number>;
  onClick: () => void;
}

const MAX_VISIBLE = 3;

export function DayCell({ date, isCurrentMonth, isToday, movies, trackedIds, onClick }: DayCellProps) {
  // Tracked movies first, then by popularity, so what you care about is never hidden behind "+N more".
  const sorted = movies
    .slice()
    .sort((a, b) => Number(trackedIds.has(b.id)) - Number(trackedIds.has(a.id)) || b.popularity - a.popularity);
  const visible = sorted.slice(0, MAX_VISIBLE);
  const overflow = sorted.length - visible.length;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex min-h-[132px] flex-col gap-1.5 border-b border-r border-border p-2 text-left align-top transition-colors hover:bg-accent/60 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        !isCurrentMonth && "bg-muted/40 text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
          isToday && "bg-primary font-semibold text-primary-foreground shadow-sm"
        )}
      >
        {date.getUTCDate()}
      </span>

      <div className="flex min-w-0 flex-col gap-1">
        {visible.map((movie) => {
          const isTracked = trackedIds.has(movie.id);
          return (
            <div
              key={movie.id}
              title={movie.title}
              className={cn(
                "flex min-w-0 items-center gap-1.5 rounded-md p-0.5 pr-1.5 text-[11px] font-medium leading-tight",
                isTracked
                  ? "bg-primary/15 text-foreground ring-1 ring-primary/40"
                  : "bg-secondary text-secondary-foreground",
                !isCurrentMonth && "opacity-70"
              )}
            >
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt=""
                  loading="lazy"
                  className="h-8 w-[22px] flex-shrink-0 rounded-[3px] object-cover"
                />
              ) : (
                <div className="h-8 w-[22px] flex-shrink-0 rounded-[3px] bg-muted" />
              )}
              <span className="line-clamp-2 min-w-0 flex-1 break-words">{movie.title}</span>
              {isTracked && <Bookmark className="h-3 w-3 flex-shrink-0 fill-primary text-primary" />}
            </div>
          );
        })}
        {overflow > 0 && (
          <span className="px-1 text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
            +{overflow} more
          </span>
        )}
      </div>
    </button>
  );
}
