import { Router } from 'express';
import pool from '../db';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        lr.id, 
        lr.case_id AS "caseId", 
        lr.lawyer_id AS "lawyerId", 
        lr.status, 
        lr.message, 
        lr.requested_at AS "requestedAt",
        c.id AS "case_id",
        c.title AS "case_title",
        c.type AS "case_type",
        c.description AS "case_description",
        c.urgency AS "case_urgency",
        c.filed_at AS "case_filedAt",
        c.ai_summary AS "case_aiSummary",
        citizen.id AS "citizen_id",
        citizen.name AS "citizen_name",
        citizen.email AS "citizen_email",
        citizen.phone AS "citizen_phone",
        citizen.avatar AS "citizen_avatar"
      FROM lawyer_requests lr
      JOIN cases c ON lr.case_id = c.id
      JOIN users citizen ON c.citizen_id = citizen.id
      ORDER BY lr.requested_at DESC
    `);
        
        // Transform the data to match the expected structure
        const transformed = result.rows.map(row => ({
            id: row.id,
            caseId: row.caseId,
            lawyerId: row.lawyerId,
            status: row.status,
            message: row.message,
            requestedAt: row.requestedAt,
            case: {
                id: row.case_id,
                title: row.case_title,
                type: row.case_type,
                description: row.case_description,
                urgency: row.case_urgency,
                filedAt: row.case_filedAt,
                aiSummary: row.case_aiSummary
            },
            citizen: {
                id: row.citizen_id,
                name: row.citizen_name,
                email: row.citizen_email,
                phone: row.citizen_phone,
                avatar: row.citizen_avatar
            }
        }));
        
        res.json(transformed);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/', async (req, res) => {
    const { caseId, lawyerId, status, message } = req.body;
    
    try {
        const requestId = `req-${Date.now()}-${Math.round(Math.random() * 1000)}`;
        
        const result = await pool.query(`
            INSERT INTO lawyer_requests (
                id, case_id, lawyer_id, status, message, requested_at
            ) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *
        `, [requestId, caseId, lawyerId, status || 'pending', message]);
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    try {
        // Update the request status
        const result = await pool.query(`
            UPDATE lawyer_requests 
            SET status = $1 
            WHERE id = $2 
            RETURNING *
        `, [status, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }
        
        const updatedRequest = result.rows[0];
        
        // If accepted, update the case to assign the lawyer and change status
        if (status === 'accepted') {
            await pool.query(`
                UPDATE cases 
                SET lawyer_id = $1, status = 'pending_lawyer' 
                WHERE id = $2
            `, [updatedRequest.lawyer_id, updatedRequest.case_id]);
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
