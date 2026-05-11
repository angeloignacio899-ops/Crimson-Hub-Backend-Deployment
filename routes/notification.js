import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";

import {
    getUserNotifications,
    getNotificationDetails,
    deleteNotification
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", verifyToken, getUserNotifications);
router.get("/:id", verifyToken, getNotificationDetails);
router.delete("/:id", verifyToken, deleteNotification);

export default router;
