import express from "express";
import { getAllCategories, getCategoryById, addCategory } from "../controllers/categoryController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all categories (public)
router.get("/", getAllCategories);

// Get single category (public)
router.get("/:id", getCategoryById);

// Add new category (admin only)
router.post("/", verifyToken, addCategory);

export default router;
