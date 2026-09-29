import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { getMyFeedUrl, regenerateFeedToken, serveIcsFeed } from "../controllers/feed.controller";

export const feedRouter = Router();

feedRouter.get("/:token.ics", serveIcsFeed);
feedRouter.get("/me", requireAuth, getMyFeedUrl);
feedRouter.post("/regenerate", requireAuth, regenerateFeedToken);
