import express from "express";
import { adminGuard, limiter } from "./utils/middleware";
import {
    getAllUsers,
    getAllEvents,
    deleteUsers,
    deleteEvents,
    restrictUsers,
    unrestrictUsers,
    getPendingReports,
    getResolvedReports,
} from "../controllers/admin";
import { RateLimiterMemory } from "rate-limiter-flexible";

const router = express.Router();

const getLimit = new RateLimiterMemory({
    points: 60,
    duration: 60
});

const patchLimit = new RateLimiterMemory({
    points: 10,
    duration: 60,
});

router.get("/get-all-users", limiter(getLimit), adminGuard, getAllUsers);
router.get("/get-all-events", limiter(getLimit), adminGuard, getAllEvents);
router.get("/get-pending-reports/:page", limiter(getLimit), adminGuard, getPendingReports);
router.get("/get-resolved-reports/:page", limiter(getLimit), adminGuard, getResolvedReports);

router.patch("/unrestrict-users", limiter(patchLimit), adminGuard, unrestrictUsers);
router.patch("/restrict-users", limiter(patchLimit), adminGuard, restrictUsers);

router.patch("/delete-users", limiter(patchLimit), adminGuard, deleteUsers);
router.patch("/delete-events", limiter(patchLimit), adminGuard, deleteEvents);

export default router;
