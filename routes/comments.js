import express from "express";
import {
  getCommentsByEventId,
  createComment,
  deleteComment,
  updateComment
} from "../controllers/commentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /comments/:eventId — get all comments for an event
router.get("/:eventId", getCommentsByEventId);

// POST /comments — create a new comment or reply
router.post("/", verifyToken, createComment);

// PUT /comments/:commentId — update a comment
router.put("/:commentId", verifyToken, updateComment);

// DELETE /comments/:commentId — delete a comment
router.delete("/:commentId", verifyToken, deleteComment);

export default router;
