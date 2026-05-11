import db from "../database/database.js";

export const getUserJoinedEvents = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not found in token" });
    }

    const userId = req.user.id;

    const [events] = await db.query(
      `SELECT e.event_id, e.title, e.event_date AS date, e.event_time, e.start_date, e.start_time, e.end_date, e.end_time, e.description
       FROM event_attendees ea
       JOIN event e ON ea.event_id = e.event_id
       WHERE ea.user_id = ?`,
      [userId]
    );

    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching user joined events:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/events/organizer
export const getOrganizerEvents = async (req, res) => {
  try {
    const organizerId = req.user.id; // from JWT
    const [events] = await db.query(
      `SELECT e.event_id, e.title, e.event_date AS date, e.event_time, e.start_date, e.start_time, e.end_date, e.end_time, e.category
       FROM event e
       WHERE e.user_id = ? AND e.approval_status = 'approved' AND e.status != 'archived'`,
      [organizerId]
    );
    res.status(200).json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


