import express from "express";
import { limiter, sessionGuard } from "./utils/middleware";
import { doSearch } from "../controllers/search";
import { RateLimiterMemory } from "rate-limiter-flexible";

const router = express.Router();

const getLimit = new RateLimiterMemory({
    points: 10,
    duration: 20,
});

router.get("/", limiter(getLimit), sessionGuard, doSearch);

export default router;
