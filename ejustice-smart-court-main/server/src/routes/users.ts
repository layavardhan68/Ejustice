import { Router } from 'express';
import pool from '../db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        name, 
        email, 
        role, 
        avatar, 
        phone, 
        verified, 
        created_at AS "createdAt", 
        bar_number AS "barNumber", 
        specialization, 
        experience, 
        court_name AS "courtName", 
        designation 
      FROM users
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        name, 
        email, 
        role, 
        avatar, 
        phone, 
        verified, 
        created_at AS "createdAt", 
        bar_number AS "barNumber", 
        specialization, 
        experience, 
        court_name AS "courtName", 
        designation 
      FROM users WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/:id/verify', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE users SET verified = true WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

import bcrypt from 'bcryptjs';

router.post('/judge', async (req, res) => {
  const { name, email, password, courtName, designation } = req.body;
  try {
    // Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = `judge-${Date.now()}`;

    const newUser = await pool.query(
      `INSERT INTO users (id, name, email, password, role, court_name, designation, verified, created_at)
             VALUES ($1, $2, $3, $4, 'judge', $5, $6, true, NOW())
             RETURNING id, name, email, role, court_name, designation`,
      [id, name, email, hashedPassword, courtName, designation]
    );

    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
