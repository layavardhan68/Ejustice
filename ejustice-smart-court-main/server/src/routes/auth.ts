import { Router } from 'express';
import pool from '../db';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure Multer for Lawyer Verification Docs
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// Login Endpoint
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check password if it exists (for migrated users)
        if (user.password) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            // For development, allow login if no password exists
            console.log('No password set for user, allowing login for development');
        }

        // Skip role verification for development
        // TODO: Re-enable role verification in production

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Citizen Registration
router.post('/register/citizen', async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        // Check if user exists
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const storedPassword = password;
        const id = `citizen-${Date.now()}`;

        const newUser = await pool.query(
            `INSERT INTO users (id, name, email, password, role, phone, verified, created_at)
             VALUES ($1, $2, $3, $4, 'citizen', $5, true, NOW())
             RETURNING id, name, email, role, phone, verified, created_at`,
            [id, name, email, storedPassword, phone]
        );

        res.json(newUser.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Lawyer Registration
router.post('/register/lawyer', upload.single('document'), async (req, res) => {
    const { name, email, password, phone, barNumber, specialization, experience } = req.body;
    let specializationArray: string[] = [];

    if (specialization) {
        try {
            specializationArray = JSON.parse(specialization);
        } catch (e) {
            specializationArray = [specialization];
        }
    }

    try {
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const storedPassword = password;
        const id = `lawyer-${Date.now()}`;

        // Create User
        const newUser = await pool.query(
            `INSERT INTO users (id, name, email, password, role, phone, bar_number, specialization, experience, verified, created_at)
             VALUES ($1, $2, $3, $4, 'lawyer', $5, $6, $7, $8, false, NOW())
             RETURNING id, name, email, role`,
            [id, name, email, storedPassword, phone, barNumber, specializationArray, experience]
        );

        // Attempt to store the uploaded document link if exists
        if (req.file) {
            // In a real app we'd verify this document. For now, we store a system log or just keep it in uploads.
            // We can insert into documents table for Admin review
            const docId = `verif-${Math.random().toString(36).substr(2, 9)}`;
            await pool.query(
                `INSERT INTO documents (id, name, type, size, uploaded_by, uploaded_at, url, verified)
                  VALUES ($1, $2, 'Verification Doc', $3, $4, NOW(), $5, false)`,
                [docId, req.file.originalname, String(req.file.size), id, `/uploads/${req.file.filename}`]
            );
        }

        res.json({ ...newUser.rows[0], message: 'Registration successful. Waiting for admin approval.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
