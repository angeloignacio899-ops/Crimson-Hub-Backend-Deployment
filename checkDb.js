import db from "./database/database.js";

async function checkTables() {
  try {
    // Check all tables
    const [tables] = await db.query("SHOW TABLES");
    console.log("📋 Tables in database:");
    tables.forEach(t => {
      const tableName = Object.values(t)[0];
      console.log(`  - ${tableName}`);
    });

    // Check category table structure
    console.log("\n🔍 Checking category table...");
    try {
      const [categoryStructure] = await db.query("DESC category");
      if (categoryStructure.length > 0) {
        console.log("✅ Category table exists:");
        console.log(categoryStructure);
      }
    } catch (e) {
      console.log("❌ Category table does not exist");
    }

    // Check event table structure
    console.log("\n🔍 Checking event table...");
    try {
      const [eventStructure] = await db.query("DESC event");
      console.log("✅ Event table columns:");
      eventStructure.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type}`);
      });
    } catch (e) {
      console.log("❌ Error reading event table");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

checkTables();
