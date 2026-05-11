import db from "../database/database.js";

export const updateArchivedStatus = async () => {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // --- Update Events Properly ---
    await db.execute(
      `UPDATE event 
       SET status = CASE 
         WHEN event_date < CURDATE() THEN 'past'
         WHEN event_date = CURDATE() THEN 'ongoing'
         ELSE 'upcoming'
       END`
    );

    // Move old events to archived
    await db.execute(
      `UPDATE event 
       SET status = 'archived'
       WHERE status = 'past'`
    );

    // --- Update Announcements ---
    await db.execute(
      `UPDATE announcement
       SET status = 'expired'
       WHERE DATE_ADD(created_at, INTERVAL expiration_days DAY) < CURDATE()`
    );

    // Move expired announcements to archived
    await db.execute(
      `UPDATE announcement
       SET status = 'archived'
       WHERE status = 'expired'`
    );

    console.log("Archive update complete.");
  } catch (err) {
    console.error("Error updating archive:", err);
    throw err;
  }
};
