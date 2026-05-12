import pool from './db';
import bcrypt from 'bcryptjs';

const seedPasswords = async () => {
    try {
        console.log('Seeding passwords for existing users...');
        const hashedPassword = await bcrypt.hash('password123', 10);

        const result = await pool.query('UPDATE users SET password = $1 WHERE password IS NULL', [hashedPassword]);

        console.log(`Updated ${result.rowCount} users with default password 'password123'.`);
    } catch (err) {
        console.error('Error seeding passwords:', err);
    } finally {
        await pool.end();
    }
};

seedPasswords();
