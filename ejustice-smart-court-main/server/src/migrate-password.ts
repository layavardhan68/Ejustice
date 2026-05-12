import pool from './db';

const migrate = async () => {
    try {
        console.log('Migrating database...');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;');
        console.log('Migration successful: Added password column to users table.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
};

migrate();
