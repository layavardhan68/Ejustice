import { Router } from 'express';
import pool from '../db';
import { upload } from '../middleware/upload';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const router = Router();

// GET Documents (optionally filter by user or case)
router.get('/', async (req, res) => {
  const { userId, caseId } = req.query;

  try {
    let query = `
      SELECT 
        id, 
        case_id AS "caseId", 
        name, 
        type, 
        size, 
        uploaded_by AS "uploadedBy", 
        uploaded_at AS "uploadedAt", 
        hash, 
        verified,
        url,
        1 as version -- Mock version for now
      FROM documents
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (userId) {
      query += ` AND uploaded_by = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (caseId) {
      if (caseId === 'null') {
        query += ` AND case_id IS NULL`;
      } else {
        query += ` AND case_id = $${paramIndex}`;
        params.push(caseId);
        paramIndex++;
      }
    }

    query += ` ORDER BY uploaded_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// UPLOAD Document
router.post('/upload', upload.single('file'), async (req, res) => {
  const { caseId, userId } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Calculate Hash
    const fileBuffer = fs.readFileSync(file.path);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const hexHash = hashSum.digest('hex');

    const docId = `doc-${Date.now()}`;
    const fileUrl = `/uploads/${file.filename}`;

    // Handle caseId: if 'personal' or empty, store as NULL
    const dbCaseId = (caseId === 'personal' || !caseId || caseId === 'undefined') ? null : caseId;

    const docQuery = `
            INSERT INTO documents (
                id, case_id, name, type, size, uploaded_by, uploaded_at, hash, verified, url
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, true, $8) 
            RETURNING id, case_id AS "caseId", name, type, size, uploaded_at AS "uploadedAt", hash, verified, url
        `;

    const newDoc = await pool.query(docQuery, [
      docId,
      dbCaseId,
      file.originalname,
      path.extname(file.originalname).substring(1).toUpperCase() || 'FILE', // e.g. PDF
      `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      userId,
      `0x${hexHash}`, // Mocking blockchain hash format
      fileUrl
    ]);

    res.status(201).json(newDoc.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE Document
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM documents WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Optionally delete physical file here using fs.unlink

    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
