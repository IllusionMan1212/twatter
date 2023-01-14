import express from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { addEvent, getEvents, getSidebarEvents, toggleInterest } from "../controllers/events";
import { sessionGuard, adminGuard, limiter } from "./utils/middleware";
const router = express.Router();

const getLimit = new RateLimiterMemory({
    points: 60,
    duration: 60,
});

const postLimit = new RateLimiterMemory({
    points: 1,
    duration: 1
});

router.get("/get-events", limiter(getLimit), sessionGuard, getEvents);
router.get("/get-sidebar-events", limiter(getLimit), sessionGuard, getSidebarEvents);

router.post("/add-event", limiter(postLimit), adminGuard, addEvent);

router.patch("/toggle-interest/:id", limiter(postLimit), sessionGuard, toggleInterest);

export default router;
