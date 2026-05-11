import express from "express";
import { approveOrganizer } from "../controllers/adminController.js";

const router = express.Router();

// Route to approve organizer
router.post("/approve-organizer", approveOrganizer);

export default router;
