
import pool from './db';

async function checkPasswords() {
    try {
        const res = await pool.query('SELECT id, email, role, password FROM users WHERE password IS NULL OR password = \'\'');
        console.log('Users with missing passwords:', res.rows.length);
        if (res.rows.length > 0) {
            console.table(res.rows);
        } else {
            console.log('All users have passwords.');
        }
    } catch (e) {
        console.error(e);
    }
}

checkPasswords();
