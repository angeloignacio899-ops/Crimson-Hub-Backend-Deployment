import express from "express";
import {
    getApprovedEventsCount,
    getApprovedAnnouncementsCount,
    getPendingEventsCount,
    getPendingAnnouncementsCount
} from "../controllers/dashboardCountsController.js";

const router = express.Router();

router.get("/events/approved/count", getApprovedEventsCount);
router.get("/announcements/approved/count", getApprovedAnnouncementsCount);
router.get("/events/pending/count", getPendingEventsCount);
router.get("/announcements/pending/count", getPendingAnnouncementsCount);

export default router;
