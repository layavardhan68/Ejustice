import { Router } from 'express';
import pool from '../db';

const router = Router();

// Retry helper function
const retryQuery = async (query: string, params: any[], maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const result = await pool.query(query, params);
            return result;
        } catch (error: any) {
            console.error(`Query attempt ${i + 1} failed:`, error.message);
            if (i === maxRetries - 1) throw error;
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
    }
    throw new Error('Max retries exceeded');
};

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        title, 
        type, 
        status, 
        urgency, 
        description, 
        citizen_id AS "citizenId", 
        lawyer_id AS "lawyerId", 
        judge_id AS "judgeId", 
        filed_at AS "filedAt", 
        next_hearing AS "nextHearing", 
        closed_at AS "closedAt", 
        verdict, 
        ai_summary AS "aiSummary"
      FROM cases
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
        title, 
        type, 
        status, 
        urgency, 
        description, 
        citizen_id AS "citizenId", 
        lawyer_id AS "lawyerId", 
        judge_id AS "judgeId", 
        filed_at AS "filedAt", 
        next_hearing AS "nextHearing", 
        closed_at AS "closedAt", 
        verdict, 
        ai_summary AS "aiSummary"
      FROM cases WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Function to calculate file hash
const calculateFileHash = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => {
      hash.update(data);
    });
    
    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });
    
    stream.on('error', (error) => {
      reject(error);
    });
  });
};

router.post('/', upload.array('files'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { title, type, description, citizenId, aiSummary } = req.body;
    const files = req.files as Express.Multer.File[];

    // 1. Insert Case
    const caseQuery = `
            INSERT INTO cases (
                id, title, type, status, urgency, description, citizen_id, filed_at, ai_summary
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, NOW(), $8
            ) RETURNING *;
        `;

    // Generate a case ID (e.g., CASE-YYYY-00X)
    // ideally we should use a sequence or UUID, but sticking to the requested format logic
    const countResult = await client.query('SELECT COUNT(*) FROM cases');
    const count = parseInt(countResult.rows[0].count) + 1;
    const caseId = `CASE-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

    // Parse AI summary if it's a string
    let parsedSummary = aiSummary;
    if (typeof aiSummary === 'string') {
      try {
        parsedSummary = JSON.parse(aiSummary);
      } catch (e) {
        // ignore
      }
    }

    // Determine urgency from AI summary or default
    const urgency = parsedSummary?.urgency || 'medium';

    const caseResult = await client.query(caseQuery, [
      caseId, title, type, 'Open', urgency, description, citizenId, parsedSummary
    ]);
    const newCase = caseResult.rows[0];

    // 2. Insert Documents
    if (files && files.length > 0) {
      const docQuery = `
                INSERT INTO documents (
                    id, case_id, name, type, size, url, uploaded_at, hash, verified
                ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8) RETURNING *;
            `;

      for (const file of files) {
        const docId = `doc-${Date.now()}-${Math.round(Math.random() * 1000)}`;
        const fileUrl = `/uploads/${file.filename}`;
        const filePath = path.join(__dirname, '../../uploads', file.filename);
        
        // Calculate file hash
        const fileHash = await calculateFileHash(filePath);
        
        await client.query(docQuery, [
          docId, caseId, file.originalname, file.mimetype || 'unknown', String(file.size), fileUrl, fileHash, true
        ]);
      }
    }

    await client.query('COMMIT');

    // Return the full case 
    res.status(201).json(newCase);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// Document upload endpoint for existing cases
router.post('/:id/documents', upload.array('files'), async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    // Verify case exists
    const caseCheck = await client.query('SELECT id FROM cases WHERE id = $1', [id]);
    if (caseCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    const docQuery = `
      INSERT INTO documents (
        id, case_id, name, type, size, url, uploaded_at, hash, verified, uploaded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9) RETURNING *;
    `;
    
    const uploadedDocs = [];
    
    for (const file of files) {
      const docId = `doc-${Date.now()}-${Math.round(Math.random() * 1000)}`;
      const fileUrl = `/uploads/${file.filename}`;
      const filePath = path.join(__dirname, '../../uploads', file.filename);
      
      // Calculate file hash
      const fileHash = await calculateFileHash(filePath);
      
      const result = await client.query(docQuery, [
        docId, id, file.originalname, file.mimetype || 'unknown', 
        String(file.size), fileUrl, fileHash, true, req.body.uploadedBy || 'unknown'
      ]);
      
      uploadedDocs.push(result.rows[0]);
    }
    
    await client.query('COMMIT');
    res.status(201).json(uploadedDocs);
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// Get available lawyers for a case type
router.get('/:id/lawyers', async (req, res) => {
  const { id } = req.params;
  
  try {
    // First get the case details to determine the case type
    const caseResult = await pool.query('SELECT type FROM cases WHERE id = $1', [id]);
    
    if (caseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    const caseType = caseResult.rows[0].type;
    console.log('Case type:', caseType);
    
    // Try to find lawyers with matching specialization
    const specializedLawyersQuery = `
      SELECT 
        id, 
        name, 
        email, 
        avatar, 
        phone, 
        verified, 
        bar_number AS "barNumber", 
        specialization, 
        experience,
        created_at AS "createdAt"
      FROM users 
      WHERE role = 'lawyer' 
        AND verified = true 
        AND (
          $1 = ANY(specialization) OR
          EXISTS (
            SELECT 1 FROM unnest(specialization) spec 
            WHERE spec ILIKE '%' || $1 || '%' OR $1 ILIKE '%' || spec || '%'
          )
        )
      ORDER BY experience DESC
    `;
    
    const specializedLawyers = await pool.query(specializedLawyersQuery, [caseType]);
    console.log('Specialized lawyers found:', specializedLawyers.rows.length);
    console.log('Specialized lawyers:', specializedLawyers.rows);
    
    let lawyers = specializedLawyers.rows;
    
    // If no specialized lawyers found, return all verified lawyers
    if (lawyers.length === 0) {
      console.log('No specialized lawyers found, fetching all verified lawyers');
      const allLawyersQuery = `
        SELECT 
          id, 
          name, 
          email, 
          avatar, 
          phone, 
          verified, 
          bar_number AS "barNumber", 
          specialization, 
          experience,
          created_at AS "createdAt"
        FROM users 
        WHERE role = 'lawyer' 
          AND verified = true
        ORDER BY experience DESC
      `;
      
      const allLawyersResult = await pool.query(allLawyersQuery);
      console.log('All verified lawyers found:', allLawyersResult.rows.length);
      console.log('All verified lawyers:', allLawyersResult.rows);
      lawyers = allLawyersResult.rows;
    }
    
    res.json({
      caseType,
      lawyers,
      isSpecializedMatch: specializedLawyers.rows.length > 0
    });
    
  } catch (err) {
    console.error('Error fetching lawyers:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update case details
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  try {
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;
    
    // Add fields to update dynamically
    if (updates.judgeId !== undefined) {
      updateFields.push(`judge_id = $${paramIndex++}`);
      updateValues.push(updates.judgeId);
    }
    
    if (updates.lawyerId !== undefined) {
      updateFields.push(`lawyer_id = $${paramIndex++}`);
      updateValues.push(updates.lawyerId);
    }
    
    if (updates.status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push(updates.status);
    }
    
    if (updates.nextHearing !== undefined) {
      updateFields.push(`next_hearing = $${paramIndex++}`);
      updateValues.push(updates.nextHearing);
    }
    
    if (updates.verdict !== undefined) {
      updateFields.push(`verdict = $${paramIndex++}`);
      updateValues.push(updates.verdict);
    }
    
    if (updates.closedAt !== undefined) {
      updateFields.push(`closed_at = $${paramIndex++}`);
      updateValues.push(updates.closedAt);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    const updateQuery = `
      UPDATE cases 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    updateValues.push(id);
    
    const result = await retryQuery(updateQuery, updateValues);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    res.json(result.rows[0]);
    
  } catch (err) {
    console.error('Error updating case:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
