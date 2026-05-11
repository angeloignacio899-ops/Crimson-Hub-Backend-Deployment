import db from './database/database.js';

const createCommentTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS comment (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        user_id INT NOT NULL,
        parent_id INT,
        content LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES event(event_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES comment(id) ON DELETE CASCADE,
        INDEX (event_id),
        INDEX (user_id),
        INDEX (parent_id)
      )
    `;
    
    await db.query(query);
    console.log('✅ Comment table created successfully!');
    
    // Verify the table
    const [columns] = await db.query('DESCRIBE comment');
    console.log('Table structure:', columns.map(c => `${c.Field} (${c.Type})`).join('\n'));
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating table:', err.message);
    process.exit(1);
  }
};

createCommentTable();
