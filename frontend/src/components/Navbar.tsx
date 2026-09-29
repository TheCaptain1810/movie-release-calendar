import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { CalendarDays, Film, Moon, Search, Settings, Sun } from "lucide-react";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
  );

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-2.5 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Film className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">Release Calendar</span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={navLinkClass} aria-label="Calendar">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </NavLink>
          <NavLink to="/search" className={navLinkClass} aria-label="Search">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </NavLink>
          {user ? (
            <>
              <NavLink to="/settings" className={navLinkClass} aria-label="Settings">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </NavLink>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </nav>
      </div>
    </header>
  );
}
