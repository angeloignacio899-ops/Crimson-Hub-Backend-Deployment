import db from "../database/database.js";

// Get all pending events and announcements
export const getPendingItems = async (req, res) => {
  try {
    const eventsSql = `
      SELECT 
        e.event_id,
        e.title,
        c.category_name AS category,
        e.organizer_name,
        e.created_at,
        'Event' AS type,
        e.location,
        e.event_date,
        e.event_time,
        e.start_date,
        e.start_time,
        e.end_date,
        e.end_time,
        e.audience,
        e.number_of_registration,
        e.event_link,
        e.description,
        e.event_image,
        e.approval_status AS status
      FROM event e
      JOIN category c ON e.category_id = c.category_id
      WHERE e.approval_status = 'Pending'
    `;

    const announcementsSql = `
      SELECT announcement_id, title, category, author AS author, created_at, 'Announcement' AS type,
             description, approval_status AS status
      FROM announcement
      WHERE approval_status = 'Pending'
    `;

    const [events] = await db.query(eventsSql);
    const [announcements] = await db.query(announcementsSql);

    const items = [...events, ...announcements];

    res.status(200).json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch pending items", error: err.message });
  }
};

// Approve or Reject an event/announcement
export const updateApprovalStatus = async (req, res) => {
  try {
    const { id, type, action, remarks } = req.body;

    if (!id || !type || !action) {
      return res.status(400).json({ message: "ID, type, and action are required" });
    }

    if (!["Approved", "Rejected"].includes(action)) {
      return res.status(400).json({ message: "Action must be Approved or Rejected" });
    }

    let tableName = "";
    let idColumn = "";

    if (type === "Event") {
      tableName = "event";
      idColumn = "event_id";
    } else if (type === "Announcement") {
      tableName = "announcement";
      idColumn = "announcement_id";
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }

    // ----------------------------------
    // 🔍 1. Get owner of the item
    // ----------------------------------
    const [item] = await db.query(
      `SELECT user_id FROM ${tableName} WHERE ${idColumn} = ?`,
      [id]
    );

    if (item.length === 0) {
      return res.status(404).json({ message: `${type} not found` });
    }

    const ownerUserId = item[0].user_id;

    // ----------------------------------
    // ✏ 2. Update approval status & remarks
    // ----------------------------------
    await db.query(
      `
      UPDATE ${tableName}
      SET approval_status = ?, remarks = ?
      WHERE ${idColumn} = ?
    `,
      [action, remarks || null, id]
    );

    // ----------------------------------
    // 🛎 3. Insert notification
    // ----------------------------------
    await db.query(
      `
      INSERT INTO notification (user_id, item_id, type, status)
      VALUES (?, ?, ?, ?)
    `,
      [ownerUserId, id, type, action]
    );

    // ----------------------------------
    // ✅ 4. Response
    // ----------------------------------
    res.status(200).json({
      message: `${type} ${action.toLowerCase()} successfully`,
      notification: true,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update status", error: err.message });
  }
};


export const getUserPendingItems = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized: no user info found" });
    }

    // Fetch only pending events for this user
    const eventsSql = `
      SELECT event_id AS id, title, category_id, organizer_name AS organizer, created_at AS createdAt,
             'Event' AS type, location, event_date, event_time, audience, number_of_registration,
             event_link, description, event_image, approval_status AS status
      FROM event
      WHERE approval_status = 'pending' AND user_id = ? AND status != 'archived'
      ORDER BY created_at DESC
    `;

    // Fetch only pending announcements for this user
    const announcementsSql = `
      SELECT announcement_id AS id, title, category, author AS organizer, created_at AS createdAt,
             'Announcement' AS type, description, file_name, file_path, approval_status AS status
      FROM announcement
      WHERE approval_status = 'pending' AND user_id = ? AND status != 'archived'
      ORDER BY created_at DESC
    `;

    const [events] = await db.query(eventsSql, [user_id]);
    const [announcements] = await db.query(announcementsSql, [user_id]);

    const items = [...events, ...announcements];

    res.status(200).json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch pending items", error: err.message });
  }
};
