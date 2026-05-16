import mysql from "mysql2/promise";
import "dotenv/config";

// Use createPool for better performance and connection handling
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crimson_event_hub',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: process.env.DB_CONNECT_TIMEOUT ? parseInt(process.env.DB_CONNECT_TIMEOUT, 10) : 10000
});

// Non-blocking test the connection (logs result but doesn't prevent app start)
pool.getConnection()
    .then((connection) => {
        console.log("✅ MySQL Pool connected successfully!");
        connection.release();
    })
    .catch((err) => {
        console.error("❌ DATABASE CONNECTION FAILED:", err.code || err.code === 0 ? err.code : '', err.message || err);
    });

// Export the pool for use in controllers
export default pool;