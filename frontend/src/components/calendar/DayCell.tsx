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
        "group flex min-h-[132px] xl:min-h-[150px] flex-col gap-1.5 border-b border-r border-border p-2 text-left align-top transition-colors hover:bg-gradient-to-br hover:from-primary/10 hover:to-transparent focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        !isCurrentMonth && "bg-muted/30 text-muted-foreground/70",
        isToday && "bg-gradient-to-br from-primary/15 via-transparent to-transparent"
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
          isToday && "bg-brand-gradient text-white shadow-glow"
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
                "relative flex min-w-0 items-center gap-1.5 rounded-lg p-0.5 pr-1.5 text-[11px] font-medium leading-tight transition-transform duration-200 group-hover:translate-x-0.5",
                isTracked
                  ? "gradient-border bg-gradient-to-r from-primary/25 to-brand-to/15 text-foreground"
                  : "bg-secondary text-secondary-foreground",
                !isCurrentMonth && "opacity-70"
              )}
            >
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt=""
                  loading="lazy"
                  className="h-8 w-[22px] flex-shrink-0 rounded-md object-cover shadow-sm"
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
