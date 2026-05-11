import db from "../database/database.js"; // Connection pool
import fs from "fs";
import { createNotificationForStudents } from "./notificationController.js";

// -----------------------------------------------------
// CREATE EVENT
// -----------------------------------------------------
export const createEvent = async (req, res) => { 
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    // ✅ Use user from JWT (no fallback)
    const userId = req.user.id;

    // ----------------------------
    // ROLE CHECK
    // ----------------------------
    let isAdmin = false;
    try {
        const [userResult] = await db.execute(
            "SELECT role_id FROM user WHERE user_id = ?",
            [userId]
        );

        if (userResult.length > 0) {
            const roleId = userResult[0].role_id;
            isAdmin = roleId === 3; // 3 = Admin
        }
    } catch (error) {
        console.error("Error fetching user role:", error);
        isAdmin = false;
    }

    // Set approval status: admin events auto-approved, others pending
    const approvalStatus = isAdmin ? "approved" : "pending";

    const {
        title,
        description,
        category_id,
        organizer,
        startDate,
        endDate,
        startTime,
        endTime,
        location,
        eventLink,
        targetAudience,
        number_of_registration,
        allow_joining
    } = req.body;

    // ----------------------------
    // Convert time to 24h format
    // ----------------------------
    function convertTo24Hour(timeStr) {
        if (!timeStr) return null;
        if (timeStr.match(/^\d{1,2}:\d{2}$/)) return `${timeStr}:00`;
        const [time, modifier] = timeStr.split(" ");
        let [hours, minutes] = time ? time.split(":") : ["00", "00"];
        if (modifier?.toLowerCase() === "pm" && hours !== "12") hours = String(Number(hours) + 12);
        if (modifier?.toLowerCase() === "am" && hours === "12") hours = "00";
        hours = hours.padStart(2, "0");
        minutes = minutes?.padStart(2, "0") || "00";
        return `${hours}:${minutes}:00`;
    }

    const formattedStartTime = convertTo24Hour(startTime);
    const formattedEndTime = convertTo24Hour(endTime);

    // ----------------------------
    // Handle files
    // ----------------------------
    const eventImageFile = req.files?.event_image?.[0]?.filename || null;
    const eventImagePath = req.files?.event_image?.[0]?.path || null;
    const attachmentFile = req.files?.attachment?.[0]?.filename || null;
    const attachmentPath = req.files?.attachment?.[0]?.path || null;

    // ----------------------------
    // Validate required fields
    // ----------------------------
    if (!title || !description || !category_id || !organizer || !startDate || !endDate || !startTime || !endTime || !location || !targetAudience) {
        return res.status(400).json({ message: "Please fill in all required fields." });
    }

    let regCount = null;
    if (number_of_registration !== undefined && number_of_registration !== "") {
        regCount = Number(number_of_registration);
        if (isNaN(regCount)) {
            return res.status(400).json({ message: "Number of registration must be numeric." });
        }
    }

    const sqlEvent = `
        INSERT INTO event
        (user_id, title, description, category_id, organizer_name, event_date, event_time, end_date, end_time, location, event_link, audience, number_of_registration, file_name, file_path, event_image, event_image_path, approval_status, allow_joining, start_date, start_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const eventValues = [
        userId,
        title,
        description,
        category_id,
        organizer,
        startDate,
        formattedStartTime,
        endDate,
        formattedEndTime,
        location,
        eventLink || null,
        targetAudience,
        regCount,
        attachmentFile,
        attachmentPath,
        eventImageFile,
        eventImagePath,
        approvalStatus,
        allow_joining !== undefined ? (allow_joining === 'true' || allow_joining === true ? 1 : 0) : 1,
        startDate,
        formattedStartTime
    ];

    try {
        console.log("Before SQL insert. Values:", eventValues);
        const [result] = await db.execute(sqlEvent, eventValues);
        console.log("After successful SQL insert. Status:", approvalStatus);

        return res.status(201).json({
            message: `Event saved successfully. Approval status: ${approvalStatus}.`,
            eventId: result.insertId
        });
    } catch (err) {
        console.error("DB ERROR:", err);

        // Clean up uploaded files if DB insertion fails
        if (eventImagePath && fs.existsSync(eventImagePath)) {
            fs.unlink(eventImagePath, err => { if (err) console.error("Failed to delete event image:", err); });
        }
        if (attachmentPath && fs.existsSync(attachmentPath)) {
            fs.unlink(attachmentPath, err => { if (err) console.error("Failed to delete attachment:", err); });
        }

        return res.status(500).json({
            message: "Event submission failed due to a database error.",
            error: err.message
        });
    }
};

// -----------------------------------------------------
// GET ALL EVENTS
// -----------------------------------------------------
export const getAllEvents = async (req, res) => {
    const userId = req.user.id; // comes from verifyToken

    try {
        // Get user role
        const [userResult] = await db.execute(
            "SELECT role_id FROM user WHERE user_id = ?",
            [userId]
        );

        if (userResult.length === 0) return res.status(404).json({ message: "User not found" });

        const roleId = userResult[0].role_id;
        let query, params;

        if (roleId === 3) {
            // Admin: see all events that are approved
            query = `
                SELECT e.event_id, e.title, e.description, e.event_date, e.event_time, e.start_date, e.start_time, e.end_date, e.end_time,
                       e.category_id, c.category_name, e.organizer_name, e.approval_status AS status, e.created_at 
                FROM event e
                LEFT JOIN category c ON e.category_id = c.category_id
                WHERE e.approval_status = 'approved' AND e.status != 'archived'
                ORDER BY e.created_at DESC
            `;
            params = [];
        } else if (roleId === 1) {
            // Role 1: also see all approved events
            query = `
                SELECT e.event_id, e.title, e.description, e.location, e.event_date, e.event_time, e.start_date, e.start_time, e.end_date, e.end_time,
                       e.category_id, c.category_name, e.organizer_name, e.approval_status, e.status, e.created_at 
                FROM event e
                LEFT JOIN category c ON e.category_id = c.category_id
                WHERE e.approval_status = 'approved' AND e.status != 'archived'
                ORDER BY e.created_at DESC
            `;
            params = [];
        } else if (roleId === 2) {
            // Organizer: only their own events, approved/rejected
            query = `
                SELECT e.event_id, e.title, e.description, e.event_date, e.event_time, e.start_date, e.start_time, e.end_date, e.end_time,
                       e.category_id, c.category_name, e.organizer_name, e.approval_status AS status, e.created_at 
                FROM event e
                LEFT JOIN category c ON e.category_id = c.category_id
                WHERE e.user_id = ? AND e.approval_status IN ('approved', 'rejected') AND e.status != 'archived'
                ORDER BY e.created_at DESC
            `;
            params = [userId];
        }

        const [rows] = await db.execute(query, params);
        res.status(200).json(rows);

    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Failed to fetch events", error: error.message });
    }
};



// -----------------------------------------------------
// DELETE EVENT
// -----------------------------------------------------
export const deleteEvent = async (req, res) => {
    const eventId = req.params.id;

    try {
        const [rows] = await db.execute(
            "SELECT file_path FROM event WHERE event_id = ?",
            [eventId]
        );

        if (rows.length === 0) return res.status(404).json({ message: "Event not found." });

        const attachmentPath = rows[0].file_path;

        await db.execute("DELETE FROM event WHERE event_id = ?", [eventId]);

        if (attachmentPath && fs.existsSync(attachmentPath)) {
            fs.unlink(attachmentPath, err => { if (err) console.error("Failed to delete attachment:", err); });
        }

        return res.status(200).json({ message: "Event deleted successfully." });
    } catch (error) {
        console.error("Error deleting event:", error);
        return res.status(500).json({ message: "Server error while deleting event.", error: error.message });
    }
};

// -----------------------------------------------------
// GET EVENT BY ID
// -----------------------------------------------------
export const getEventById = async (req, res) => {
    const { id } = req.params;
    console.log('Requested eventId:', id);

    try {
        const query = `
            SELECT e.*, c.category_name 
            FROM event e
            LEFT JOIN category c ON e.category_id = c.category_id
            WHERE e.event_id = ?
        `;
        const [results] = await db.execute(query, [id]);
        console.log('Query results:', results);

        if (results.length === 0) return res.status(404).json({ message: 'Event not found' });

        return res.json(results[0]);
    } catch (error) {
        console.error('Error fetching event details:', error);
        return res.status(500).json({ message: 'Failed to fetch event details', error: error.message });
    }
};

// When updating status
export const approveEvent = async (req, res) => {
  try {
    const { event_id } = req.params;
    const io = req.app.get("io"); // get the socket instance

    const sql = `UPDATE event SET status = 'approve' WHERE event_id = ? AND status != 'archive'`;
    await db.query(sql, [event_id]);

    // Create notifications and emit
    await createNotificationForStudents("Event", event_id, io);

    res.status(200).json({ message: "Event approved and notifications sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
