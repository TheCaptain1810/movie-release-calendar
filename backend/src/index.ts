import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { authRouter } from "./routes/auth.routes";
import { moviesRouter } from "./routes/movies.routes";
import { trackedRouter } from "./routes/tracked.routes";
import { feedRouter } from "./routes/feed.routes";

const app = express();

app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/movies", moviesRouter);
app.use("/api/tracked", trackedRouter);
app.use("/api/feed", feedRouter);

// Centralized error handler — every controller above can just throw/reject
// and it lands here instead of crashing the process.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(env.port, () => {
  console.log(`Movie calendar API listening on http://localhost:${env.port}`);
});
