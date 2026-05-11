import express from "express";
import { getPendingItems, updateApprovalStatus, getUserPendingItems } from "../controllers/pendingController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // your JWT middleware

const router = express.Router();

// Get all pending items
router.get("/", verifyToken, getPendingItems);

// Approve or reject item
router.post("/update", verifyToken, updateApprovalStatus);

router.get("/user", verifyToken, getUserPendingItems);

export default router;
