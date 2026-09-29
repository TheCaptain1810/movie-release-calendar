import { Button } from "@/components/ui/button";
import type { Movie } from "@/types";
import { Bookmark, BookmarkCheck, CheckCircle2 } from "lucide-react";

interface TrackButtonProps {
  movie: Movie;
  isTracked: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * Track / Tracked / Released button.
 * An already-released film can't be tracked (nothing to be reminded of) until
 * a re-release is scheduled (`nextReleaseDate`). Untracking stays possible.
 */
export function TrackButton({ movie, isTracked, onToggle, className }: TrackButtonProps) {
  const locked = movie.isReleased && !movie.nextReleaseDate && !isTracked;

  if (locked) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled
        className={className}
        title="Already released — tracking opens if a re-release is scheduled"
      >
        <CheckCircle2 className="h-3.5 w-3.5" /> Released
      </Button>
    );
  }

  return (
    <Button size="sm" variant={isTracked ? "secondary" : "default"} className={className} onClick={onToggle}>
      {isTracked ? (
        <>
          <BookmarkCheck className="h-3.5 w-3.5" /> Tracked
        </>
      ) : (
        <>
          <Bookmark className="h-3.5 w-3.5" /> {movie.isReleased ? "Track re-release" : "Track"}
        </>
      )}
    </Button>
  );
}

/** Small status line under a title: release state or upcoming re-release date. */
export function ReleaseStatus({ movie }: { movie: Movie }) {
  if (!movie.isReleased) {
    return <span className="text-[11px] text-muted-foreground">{movie.releaseDate ?? "TBA"}</span>;
  }
  if (movie.nextReleaseDate) {
    return (
      <span className="text-[11px] font-medium text-primary">Re-release {movie.nextReleaseDate}</span>
    );
  }
  return <span className="text-[11px] text-muted-foreground">Released {movie.releaseDate}</span>;
}
