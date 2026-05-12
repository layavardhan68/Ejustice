-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('citizen', 'lawyer', 'judge', 'admin')),
    avatar TEXT,
    phone TEXT,
    verified BOOLEAN DEFAULT FALSE,
    password TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Lawyer specific fields
    bar_number TEXT,
    specialization TEXT[],
    experience INTEGER,
    -- Judge specific fields
    court_name TEXT,
    designation TEXT
);

-- Cases Table
CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    urgency TEXT NOT NULL,
    description TEXT,
    citizen_id TEXT REFERENCES users(id),
    lawyer_id TEXT REFERENCES users(id),
    judge_id TEXT REFERENCES users(id),
    filed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    next_hearing TIMESTAMP,
    closed_at TIMESTAMP,
    verdict TEXT,
    ai_summary JSONB
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    case_id TEXT REFERENCES cases(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size TEXT NOT NULL,
    uploaded_by TEXT REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hash TEXT,
    verified BOOLEAN DEFAULT FALSE,
    url TEXT
);

-- Hearings Table
CREATE TABLE IF NOT EXISTS hearings (
    id TEXT PRIMARY KEY,
    case_id TEXT REFERENCES cases(id),
    date DATE NOT NULL,
    time TIME NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    judge_id TEXT REFERENCES users(id),
    court_room TEXT,
    notes TEXT,
    transcript TEXT,
    participants TEXT[],
    room_name TEXT
);

-- Lawyer Requests Table
CREATE TABLE IF NOT EXISTS lawyer_requests (
    id TEXT PRIMARY KEY,
    case_id TEXT REFERENCES cases(id),
    lawyer_id TEXT REFERENCES users(id),
    status TEXT NOT NULL,
    message TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meetings Table (for video conferences)
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Logs Table
CREATE TABLE IF NOT EXISTS system_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type TEXT NOT NULL
);
