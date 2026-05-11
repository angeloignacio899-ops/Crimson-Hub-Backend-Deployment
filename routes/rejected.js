// routes/rejectedRoutes.js
import express from "express";
import { getRejectedItems } from "../controllers/rejectedController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // your JWT middleware


const router = express.Router();

router.get("/", verifyToken, getRejectedItems);

export default router;
