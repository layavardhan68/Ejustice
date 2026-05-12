import { Router } from 'express';
import pool from '../db';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        id, 
        user_id AS "userId", 
        title, 
        message, 
        type, 
        read, 
        created_at AS "createdAt" 
      FROM notifications
    `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
