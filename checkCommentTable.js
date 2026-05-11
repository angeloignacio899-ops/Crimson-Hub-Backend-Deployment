import db from './database/database.js';

const checkTable = async () => {
  try {
    const [tables] = await db.query("SHOW TABLES LIKE 'comment'");
    console.log('Comment table exists:', tables.length > 0);
    if (tables.length > 0) {
      const [columns] = await db.query("DESCRIBE comment");
      console.log('Columns:', columns.map(c => c.Field).join(', '));
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
};

checkTable();
