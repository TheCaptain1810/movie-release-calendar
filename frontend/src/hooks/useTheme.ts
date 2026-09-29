import * as React from "react";

type Theme = "light" | "dark";

function readTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function useTheme() {
  const [theme, setThemeState] = React.useState<Theme>(readTheme);

  const setTheme = React.useCallback((next: Theme) => {
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage unavailable: theme just won't persist */
    }
    setThemeState(next);
  }, []);

  const toggle = React.useCallback(() => setTheme(readTheme() === "dark" ? "light" : "dark"), [setTheme]);

  return { theme, toggle };
}
