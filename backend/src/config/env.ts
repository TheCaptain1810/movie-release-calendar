import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT ?? "4000", 10),
  jwtSecret: required("JWT_SECRET", "dev-secret-change-me"),
  tmdbApiKey: required("TMDB_API_KEY", ""),
  tmdbBaseUrl: "https://api.themoviedb.org/3",
  tmdbImageBaseUrl: "https://image.tmdb.org/t/p/w342",
  appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:4000",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
};

if (!env.tmdbApiKey) {
  // Not throwing here so the server can still boot for setup/testing,
  // but every TMDB-backed route will fail until this is set.
  console.warn(
    "[config] TMDB_API_KEY is not set. Add it to backend/.env — see .env.example."
  );
}
