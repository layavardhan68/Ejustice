import pool from './db';

const migrate = async () => {
    try {
        console.log('Migrating database...');
        await pool.query('ALTER TABLE documents ADD COLUMN IF NOT EXISTS url TEXT;');
        console.log('Migration successful: Added url column to documents table.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
};

migrate();
