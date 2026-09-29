import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Movie } from "@/types";
import { Bookmark, BookmarkCheck, Clapperboard } from "lucide-react";

interface DayDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateLabel: string;
  movies: Movie[];
  trackedIds: Set<number>;
  onToggleTrack: (movie: Movie) => void;
}

export function DayDetailDialog({
  open,
  onOpenChange,
  dateLabel,
  movies,
  trackedIds,
  onToggleTrack,
}: DayDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dateLabel}</DialogTitle>
          <p className="text-xs text-muted-foreground">
            {movies.length} {movies.length === 1 ? "release" : "releases"}
          </p>
        </DialogHeader>

        {movies.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-sm text-muted-foreground">
            <Clapperboard className="h-6 w-6" />
            No releases found for this day.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {movies
              .slice()
              .sort((a, b) => b.popularity - a.popularity)
              .map((movie) => {
                const isTracked = trackedIds.has(movie.id);
                return (
                  <li
                    key={movie.id}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-2.5 transition-colors",
                      isTracked ? "border-primary/40 bg-primary/10" : "border-border bg-background/50"
                    )}
                  >
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        loading="lazy"
                        className="h-28 w-[75px] flex-shrink-0 rounded-md object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex h-28 w-[75px] flex-shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <Clapperboard className="h-5 w-5" />
                      </div>
                    )}
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="text-sm font-semibold leading-snug">{movie.title}</span>
                      {movie.overview && (
                        <p className="line-clamp-3 text-xs text-muted-foreground">{movie.overview}</p>
                      )}
                      <Button
                        size="sm"
                        variant={isTracked ? "secondary" : "default"}
                        className="mt-1 w-fit"
                        onClick={() => onToggleTrack(movie)}
                      >
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
                    </div>
                  </li>
                );
              })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
