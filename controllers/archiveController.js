// archiveController.js
import { updateArchivedStatus } from "../service/archiveService.js";
import db from "../database/database.js";

export const archiveController = async (req, res) => {
  try {
    // 1️⃣ Update statuses first
    await updateArchivedStatus();

    // 2️⃣ Fetch archived events
    const [events] = await db.execute(`
      SELECT 
        event_id AS id,
        title,
        'Event' AS type,
        DATE_FORMAT(event_date, '%b %d, %Y') AS date
      FROM event
      WHERE status = 'archived'
      ORDER BY event_date DESC
    `);

    // 3️⃣ Fetch archived announcements
    const [announcements] = await db.execute(`
      SELECT 
        announcement_id AS id,
        title,
        'Announcement' AS type,
        DATE_FORMAT(created_at, '%b %d, %Y') AS date
      FROM announcement
      WHERE status = 'archived'
      ORDER BY created_at DESC
    `);

    // 4️⃣ Merge both arrays
    const merged = [...events, ...announcements];

    // 5️⃣ Return combined archived items
    res.json({
      success: true,
      items: merged,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch archived items",
    });
  }
};

export const deleteArchivedItem = async (req, res) => {
  const { id, type } = req.body;
  const user_id = req.user?.id;
  const isAdmin = req.user?.role === 'admin'; // assuming you have role stored in JWT

  if (!user_id) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    if (type === 'Event') {
      // Admin can delete any, user can delete only their own
      const [rows] = await db.execute(
        "SELECT user_id FROM event WHERE event_id = ?",
        [id]
      );
      if (rows.length === 0) return res.status(404).json({ success: false, message: "Event not found" });
      if (!isAdmin && rows[0].user_id !== user_id) {
        return res.status(403).json({ success: false, message: "Forbidden: Cannot delete this event" });
      }

      await db.execute("DELETE FROM event WHERE event_id = ?", [id]);

    } else if (type === 'Announcement') {
      const [rows] = await db.execute(
        "SELECT user_id FROM announcement WHERE announcement_id = ?",
        [id]
      );
      if (rows.length === 0) return res.status(404).json({ success: false, message: "Announcement not found" });
      if (!isAdmin && rows[0].user_id !== user_id) {
        return res.status(403).json({ success: false, message: "Forbidden: Cannot delete this announcement" });
      }

      await db.execute("DELETE FROM announcement WHERE announcement_id = ?", [id]);
    }

    res.json({ success: true, message: "Deleted successfully." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete item" });
  }
};


export const archiveControllerByUser = async (req, res) => {
  try {
    const user_id = req.user?.id; // get logged-in user's ID
    if (!user_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 1️⃣ Update statuses first
    await updateArchivedStatus();

    // 2️⃣ Fetch archived events created by this user
    const [events] = await db.execute(`
      SELECT 
        event_id AS id,
        title,
        'Event' AS type,
        DATE_FORMAT(event_date, '%b %d, %Y') AS date
      FROM event
      WHERE status = 'archived' AND user_id = ?
      ORDER BY event_date DESC
    `, [user_id]);

    // 3️⃣ Fetch archived announcements created by this user
    const [announcements] = await db.execute(`
      SELECT 
        announcement_id AS id,
        title,
        'Announcement' AS type,
        DATE_FORMAT(created_at, '%b %d, %Y') AS date
      FROM announcement
      WHERE status = 'archived' AND user_id = ?
      ORDER BY created_at DESC
    `, [user_id]);

    // 4️⃣ Merge both arrays
    const merged = [...events, ...announcements];

    // 5️⃣ Return combined archived items
    res.json({
      success: true,
      items: merged,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch archived items",
    });
  }
};

