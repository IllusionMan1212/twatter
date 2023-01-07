import express from "express";
import { adminGuard } from "../controllers/utils/middleware";
import {
    getAllUsers,
    getAllEvents,
    deleteUsers,
    deleteEvents,
    restrictUsers,
    unrestrictUsers,
} from "../controllers/admin";
const router = express.Router();

router.get("/get-all-users", adminGuard, getAllUsers);
router.get("/get-all-events", adminGuard, getAllEvents);

router.patch("/unrestrict-users", adminGuard, unrestrictUsers);
router.patch("/restrict-users", adminGuard, restrictUsers);

router.patch("/delete-users", adminGuard, deleteUsers);
router.patch("/delete-events", adminGuard, deleteEvents);

export default router;
