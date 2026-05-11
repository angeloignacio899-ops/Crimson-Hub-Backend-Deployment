// controllers/rejectedController.js
import pool from "../database/database.js"; // your MySQL pool

// Get all rejected events/announcements
export const getRejectedItems = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         event_id AS id,
         title,
         'Event' AS type,
         created_at AS date,
         remarks AS reason
       FROM event
       WHERE LOWER(status) = 'rejected'
       UNION
       SELECT 
         announcement_id AS id,
         title,
         'Announcement' AS type,
         created_at AS date,
         remarks AS reason
       FROM announcement
       WHERE LOWER(status) = 'rejected'
       ORDER BY date DESC`
    );

    res.json({ success: true, items: rows });
  } catch (err) {
    console.error("Error fetching rejected items:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
