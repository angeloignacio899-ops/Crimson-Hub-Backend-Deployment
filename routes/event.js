import express from "express";
import { 
  createEvent, 
  getAllEvents, 
  deleteEvent, 
  getEventById,
  approveEvent // 👈 import the new controller
} from "../controllers/eventController.js";
import { joinEvent, getEventAttendees } from "../controllers/joinEventController.js";
import { getUserJoinedEvents, getOrganizerEvents } from "../controllers/getUserJoinedEventsController.js";
import upload from "../config/multerEvents.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /events — create new event
router.post(
  "/", 
  verifyToken,
  upload.fields([
    { name: "event_image", maxCount: 1 },
    { name: "attachment", maxCount: 1 }
  ]),
  createEvent
);

// GET /events — list events
router.get("/", verifyToken, getAllEvents);

// Additional user/organizer endpoints
router.get("/joined", verifyToken, getUserJoinedEvents);
router.get("/organizer", verifyToken, getOrganizerEvents);
router.get("/attendees/:eventId", verifyToken, getEventAttendees);
router.post("/join/:eventId", verifyToken, joinEvent);

// ✅ Approve Event (Admin / Organizer)
router.put("/approve/:event_id", verifyToken, approveEvent);

// Dynamic routes for ID must come last
router.get("/:id", verifyToken, getEventById);
router.delete("/:id", verifyToken, deleteEvent);

export default router;
