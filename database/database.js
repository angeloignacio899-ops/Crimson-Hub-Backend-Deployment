import mysql from "mysql2/promise";
import "dotenv/config";

// Use createPool for better performance and connection handling
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crimson_event_hub',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection immediately (optional, but good practice)
try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL Pool connected successfully!");
    connection.release();
} catch (err) {
    console.error("❌ DATABASE CONNECTION FAILED:", err.code, err.message);
    // If this fails, stop the app or log a critical error
}

// Export the pool for use in controllers
export default pool;