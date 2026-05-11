// archiveRoute.js
import express from "express";
import { archiveController, deleteArchivedItem, archiveControllerByUser } from "../controllers/archiveController.js";
import { verifyAdmin, verifyToken } from "../middleware/authMiddleware.js"; // optional: only admin can fetch

const router = express.Router();

// Admin fetch archived events/announcements
router.get("/", verifyAdmin, archiveController);

router.delete("/delete", verifyAdmin, deleteArchivedItem);

router.get("/user", verifyToken, archiveControllerByUser);

router.post("/user/delete", verifyToken, deleteArchivedItem);

export default router;
