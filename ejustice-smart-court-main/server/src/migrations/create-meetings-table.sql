-- Create meetings table for Jitsi video conferences
CREATE TABLE IF NOT EXISTS meetings (
    id VARCHAR(255) PRIMARY KEY,
    case_id VARCHAR(255) NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60, -- duration in minutes
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    judge_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    citizen_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_name VARCHAR(255) NOT NULL UNIQUE,
    meeting_url VARCHAR(500) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meetings_case_id ON meetings(case_id);
CREATE INDEX IF NOT EXISTS idx_meetings_judge_id ON meetings(judge_id);
CREATE INDEX IF NOT EXISTS idx_meetings_lawyer_id ON meetings(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_meetings_citizen_id ON meetings(citizen_id);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_at ON meetings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_meetings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER meetings_updated_at_trigger
    BEFORE UPDATE ON meetings
    FOR EACH ROW
    EXECUTE FUNCTION update_meetings_updated_at();
