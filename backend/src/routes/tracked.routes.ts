import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { addTracked, listTracked, removeTracked } from "../controllers/tracked.controller";

export const trackedRouter = Router();

trackedRouter.use(requireAuth);
trackedRouter.get("/", listTracked);
trackedRouter.post("/", addTracked);
trackedRouter.delete("/:movieId", removeTracked);
