import db from './database/database.js';

const checkUserTable = async () => {
  try {
    const [columns] = await db.query('DESCRIBE user');
    console.log('User table columns:');
    columns.forEach(c => console.log(`  - ${c.Field} (${c.Type})`));
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
};

checkUserTable();
