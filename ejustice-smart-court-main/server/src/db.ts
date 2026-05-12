import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 10, // Reduced max connections
    min: 2, // Minimum connections to maintain
    idleTimeoutMillis: 10000, // Reduced idle timeout
    connectionTimeoutMillis: 10000, // Increased connection timeout
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
});

// Handle pool errors
pool.on('error', (err, client) => {
    console.error('Database pool error:', err.message);
});

// Test connection with timeout
const testConnection = async () => {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('Database connected successfully');
        return true;
    } catch (error: any) {
        console.error('Database connection failed:', error.message);
        return false;
    }
};

// Test connection on startup
testConnection();

export default pool;
