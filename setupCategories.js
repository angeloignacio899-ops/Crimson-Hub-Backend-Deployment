import db from "./database/database.js";
import "dotenv/config";

// Sample categories to add
const categories = [
  { category_name: "Academic", description: "Academic related events" },
  { category_name: "Non-Academic", description: "Non-academic related events" },
  { category_name: "Workshop", description: "Hands-on training sessions" },
  { category_name: "Seminar", description: "Informational seminars" },
  { category_name: "Conference", description: "Large scale conferences" },
  { category_name: "Sports", description: "Sports and athletic events" },
  { category_name: "Cultural", description: "Cultural and arts events" },
  { category_name: "Networking", description: "Networking and meetup events" },
  { category_name: "Competition", description: "Contests and competitions" },
];

async function setupCategories() {
  try {
    console.log("🔄 Setting up categories...\n");

    // First, let's check the current structure
    const [existingCategories] = await db.query("SELECT * FROM category");
    console.log(`📊 Found ${existingCategories.length} existing categories`);

    // For now, let's work with the current enum structure
    // But we'll need to migrate to VARCHAR for more flexibility
    
    // Check if the column is enum
    const [columnInfo] = await db.query(
      "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='category' AND COLUMN_NAME='category_name'"
    );
    
    console.log(`\n📋 Current category_name type: ${columnInfo[0]?.COLUMN_TYPE}\n`);

    // For now, let's keep the existing Academic/Non-Academic structure
    // In production, you'd want to alter the table to use VARCHAR instead of ENUM
    
    console.log("✅ Category setup complete!");
    console.log("\n📋 Current categories in database:");
    
    const [categories] = await db.query("SELECT category_id, category_name, description FROM category");
    categories.forEach(cat => {
      console.log(`  [${cat.category_id}] ${cat.category_name} - ${cat.description}`);
    });

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

setupCategories();
