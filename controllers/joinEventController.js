import db from "../database/database.js"; // mysql2/promise pool

// POST /api/events/join/:eventId
export const joinEvent = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT middleware
    const { eventId } = req.params;

    // Check if event exists
    const [event] = await db.query("SELECT * FROM event WHERE event_id = ?", [eventId]);
    if (event.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user already joined
    const [alreadyJoined] = await db.query(
      "SELECT * FROM event_attendees WHERE user_id = ? AND event_id = ?",
      [userId, eventId]
    );
    if (alreadyJoined.length > 0) {
      return res.status(400).json({ message: "You have already joined this event" });
    }

    // Insert into event_attendees
    await db.query("INSERT INTO event_attendees (user_id, event_id) VALUES (?, ?)", [
      userId,
      eventId,
    ]);

    res.status(200).json({ message: "Successfully joined the event" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/events/attendees/:eventId
export const getEventAttendees = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [attendees] = await db.query(
      `SELECT u.user_id, u.firstname, u.lastname, u.email, u.phone
       FROM event_attendees ea
       JOIN user u ON ea.user_id = u.user_id
       WHERE ea.event_id = ?`,
      [eventId]
    );

    res.status(200).json(attendees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
