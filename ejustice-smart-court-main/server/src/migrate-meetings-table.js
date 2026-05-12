const pool = require('./db.ts').default;

async function migrateMeetingsTable() {
  try {
    // Add room_name column if it doesn't exist
    await pool.query(`
      ALTER TABLE meetings 
      ADD COLUMN IF NOT EXISTS room_name TEXT
    `);
    
    // Add updated_at column if it doesn't exist
    await pool.query(`
      ALTER TABLE meetings 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
    
    console.log('Meetings table migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error migrating meetings table:', error);
    process.exit(1);
  }
}

migrateMeetingsTable();
