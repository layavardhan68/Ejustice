import { Router } from 'express';
import pool from '../db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        case_id AS "caseId", 
        date, 
        time, 
        type, 
        status, 
        judge_id AS "judgeId", 
        court_room AS "courtRoom", 
        notes, 
        transcript, 
        participants,
        room_name AS "roomName"
      FROM hearings
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
        case_id AS "caseId", 
        date, 
        time, 
        type, 
        status, 
        judge_id AS "judgeId", 
        court_room AS "courtRoom", 
        notes, 
        transcript, 
        participants,
        room_name AS "roomName"
      FROM hearings WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hearing not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/:id/start', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    // Check if hearing exists
    const checkResult = await client.query('SELECT * FROM hearings WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Hearing not found' });
    }

    const hearing = checkResult.rows[0];

    // If room_name already exists, return it
    if (hearing.room_name) {
      return res.json({ roomName: hearing.room_name });
    }

    // Generate new room name: court-[CASE_ID]-[HEARING_ID]-[RANDOM]
    const roomName = `court-${hearing.case_id}-${id.replace('hearing-', '')}-${Math.random().toString(36).substring(7)}`;

    // Update hearing with new room name
    await client.query('UPDATE hearings SET room_name = $1, status = $2 WHERE id = $3', [roomName, 'in_progress', id]);

    res.json({ roomName });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

export default router;
