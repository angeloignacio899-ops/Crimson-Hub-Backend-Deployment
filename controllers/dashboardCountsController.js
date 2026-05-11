import db from "../database/database.js";

// --- Approved Events Count ---
export const getApprovedEventsCount = (req, res) => {
    const query = `SELECT COUNT(*) AS count FROM events WHERE status = 'Approved'`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        res.json({ count: results[0].count });
    });
};

// --- Approved Announcements Count ---
export const getApprovedAnnouncementsCount = (req, res) => {
    const query = `SELECT COUNT(*) AS count FROM announcements WHERE status = 'Approved'`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        res.json({ count: results[0].count });
    });
};

// --- Pending Events Count ---
export const getPendingEventsCount = (req, res) => {
    const query = `SELECT COUNT(*) AS count FROM events WHERE status = 'Pending'`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        res.json({ count: results[0].count });
    });
};

// --- Pending Announcements Count ---
export const getPendingAnnouncementsCount = (req, res) => {
    const query = `SELECT COUNT(*) AS count FROM announcements WHERE status = 'Pending'`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        res.json({ count: results[0].count });
    });
};
