import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Create meetings table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS meetings (
    id TEXT PRIMARY KEY,
    case_id TEXT REFERENCES cases(id),
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP NOT NULL,
    duration INTEGER NOT NULL,
    meeting_url TEXT,
    judge_id TEXT REFERENCES users(id),
    lawyer_id TEXT REFERENCES users(id),
    citizen_id TEXT REFERENCES users(id),
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    room_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).then(() => {
  console.log('Meetings table initialized');
}).catch(err => {
  console.error('Error creating meetings table:', err);
});

// Add missing columns to meetings table (for existing tables)
pool.query(`
  ALTER TABLE meetings 
  ADD COLUMN IF NOT EXISTS room_name TEXT
`).then(() => {
  console.log('Room name column added to meetings table');
}).catch(err => {
  console.log('Room name column may already exist or error adding it:', err.message);
});

pool.query(`
  ALTER TABLE meetings 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
`).then(() => {
  console.log('Updated at column added to meetings table');
}).catch(err => {
  console.log('Updated at column may already exist or error adding it:', err.message);
});

// Create notifications table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).then(() => {
  console.log('Notifications table initialized');
}).catch(err => {
  console.error('Error creating notifications table:', err);
});

import userRoutes from './routes/users';
import caseRoutes from './routes/cases';
import documentRoutes from './routes/documents';
import hearingRoutes from './routes/hearings';
import lawyerRequestRoutes from './routes/lawyer-requests';
import notificationRoutes from './routes/notifications';
import systemLogRoutes from './routes/system-logs';
import aiRoutes from './routes/ai';
import authRoutes from './routes/auth';
import meetingRoutes from './routes/meetings';

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/hearings', hearingRoutes);
app.use('/api/lawyer-requests', lawyerRequestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/system-logs', systemLogRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/meetings', meetingRoutes);

app.get('/', (req, res) => {
    res.send('e-Justice Smart Court API is running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
