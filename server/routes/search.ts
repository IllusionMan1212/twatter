import express from "express";
import { sessionGuard } from "../controllers/utils/middleware";
import { doSearch } from "../controllers/search";
const router = express.Router();

router.get("/", sessionGuard, doSearch);

export default router;
