import { Router } from 'express';
import pool from '../db';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        id, 
        user_id AS "userId", 
        user_name AS "userName", 
        action, 
        details, 
        timestamp, 
        type 
      FROM system_logs
    `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
