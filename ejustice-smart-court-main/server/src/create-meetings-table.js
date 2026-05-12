const pool = require('./db.ts').default;

async function createMeetingsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY,
        case_id TEXT REFERENCES cases(id),
        title TEXT NOT NULL,
        description TEXT,
        scheduled_at TIMESTAMP NOT NULL,
        duration INTEGER NOT NULL,
        meeting_url TEXT,
        judge_id TEXT REFERENCES users(id),
        lawyer_id TEXT REFERENCES users(id),
        citizen_id TEXT REFERENCES users(id),
        status TEXT DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Meetings table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating meetings table:', error);
    process.exit(1);
  }
}

createMeetingsTable();
