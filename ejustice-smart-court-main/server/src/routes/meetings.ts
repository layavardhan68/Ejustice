import { Router } from 'express';
import pool from '../db';

const router = Router();

// Debug endpoint to check all meetings
router.get('/debug/all', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM meetings ORDER BY created_at DESC');
        console.log('All meetings in database:', result.rows);
        res.json({
            count: result.rows.length,
            meetings: result.rows
        });
    } catch (err: any) {
        console.error('Debug query error:', err);
        res.status(500).json({ error: 'Debug query failed', details: err.message });
    }
});

// Get all meetings for a user
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log('Fetching meetings for user:', userId);

    try {
        const result = await pool.query(
            `SELECT m.*, 
                    c.title as case_title,
                    u1.name as judge_name,
                    u2.name as lawyer_name,
                    u3.name as citizen_name
             FROM meetings m
             JOIN cases c ON m.case_id = c.id
             JOIN users u1 ON m.judge_id = u1.id
             JOIN users u2 ON m.lawyer_id = u2.id
             JOIN users u3 ON m.citizen_id = u3.id
             WHERE m.judge_id = $1 OR m.lawyer_id = $1 OR m.citizen_id = $1
             ORDER BY m.scheduled_at ASC`,
            [userId]
        );

        console.log('Raw query result:', result.rows);
        console.log('Number of meetings found:', result.rows.length);

        // Transform column names to camelCase for frontend
        const transformedRows = result.rows.map(row => ({
            id: row.id,
            caseId: row.case_id,
            title: row.title,
            description: row.description,
            scheduledAt: row.scheduled_at,
            duration: row.duration,
            meetingUrl: row.meeting_url,
            judgeId: row.judge_id,
            lawyerId: row.lawyer_id,
            citizenId: row.citizen_id,
            status: row.status,
            notes: row.notes,
            roomName: row.room_name,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            case_title: row.case_title,
            judge_name: row.judge_name,
            lawyer_name: row.lawyer_name,
            citizen_name: row.citizen_name
        }));

        res.json(transformedRows);
    } catch (err) {
        console.error('Error fetching meetings:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get meeting by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT m.*, 
                    c.title as case_title,
                    u1.name as judge_name,
                    u2.name as lawyer_name,
                    u3.name as citizen_name
             FROM meetings m
             JOIN cases c ON m.case_id = c.id
             JOIN users u1 ON m.judge_id = u1.id
             JOIN users u2 ON m.lawyer_id = u2.id
             JOIN users u3 ON m.citizen_id = u3.id
             WHERE m.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        const row = result.rows[0];
        const transformedRow = {
            id: row.id,
            caseId: row.case_id,
            title: row.title,
            description: row.description,
            scheduledAt: row.scheduled_at,
            duration: row.duration,
            meetingUrl: row.meeting_url,
            judgeId: row.judge_id,
            lawyerId: row.lawyer_id,
            citizenId: row.citizen_id,
            status: row.status,
            notes: row.notes,
            roomName: row.room_name,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            case_title: row.case_title,
            judge_name: row.judge_name,
            lawyer_name: row.lawyer_name,
            citizen_name: row.citizen_name
        };

        res.json(transformedRow);
    } catch (err) {
        console.error('Error fetching meeting:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new meeting (Judge only)
router.post('/', async (req, res) => {
    const { caseId, title, description, scheduledAt, duration, judgeId, lawyerId, citizenId, notes } = req.body;

    try {
        // Generate unique room name
        const roomName = `ejustice-${caseId}-${Date.now()}`;
        const meetingUrl = `https://meet.jit.si/${roomName}`;

        const result = await pool.query(
            `INSERT INTO meetings (id, case_id, title, description, scheduled_at, duration, 
                                 judge_id, lawyer_id, citizen_id, room_name, meeting_url, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING *`,
            [
                `meeting-${Date.now()}`,
                caseId,
                title,
                description,
                scheduledAt,
                duration || 60,
                judgeId,
                lawyerId,
                citizenId,
                roomName,
                meetingUrl,
                notes
            ]
        );

        // Transform the returned row to camelCase
        const row = result.rows[0];
        const transformedRow = {
            id: row.id,
            caseId: row.case_id,
            title: row.title,
            description: row.description,
            scheduledAt: row.scheduled_at,
            duration: row.duration,
            meetingUrl: row.meeting_url,
            judgeId: row.judge_id,
            lawyerId: row.lawyer_id,
            citizenId: row.citizen_id,
            status: row.status,
            notes: row.notes,
            roomName: row.room_name,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };

        res.status(201).json(transformedRow);
    } catch (err) {
        console.error('Error creating meeting:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update meeting status
router.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const result = await pool.query(
            'UPDATE meetings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating meeting status:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update meeting
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, scheduledAt, duration, notes } = req.body;

    try {
        const result = await pool.query(
            `UPDATE meetings 
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 scheduled_at = COALESCE($3, scheduled_at),
                 duration = COALESCE($4, duration),
                 notes = COALESCE($5, notes),
                 updated_at = NOW()
             WHERE id = $6
             RETURNING *`,
            [title, description, scheduledAt, duration, notes, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating meeting:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete meeting
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM meetings WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        res.json({ message: 'Meeting deleted successfully' });
    } catch (err) {
        console.error('Error deleting meeting:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
