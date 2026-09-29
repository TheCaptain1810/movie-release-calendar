import { Router } from "express";
import { getById, getCalendarMonth, search } from "../controllers/movies.controller";

export const moviesRouter = Router();

moviesRouter.get("/calendar", getCalendarMonth);
moviesRouter.get("/search", search);
moviesRouter.get("/:id", getById);
