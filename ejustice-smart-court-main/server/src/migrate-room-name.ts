import pool from './db';

const migrate = async () => {
    try {
        console.log('Migrating database...');
        await pool.query('ALTER TABLE hearings ADD COLUMN IF NOT EXISTS room_name TEXT;');
        console.log('Migration successful: Added room_name column to hearings table.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
};

migrate();
