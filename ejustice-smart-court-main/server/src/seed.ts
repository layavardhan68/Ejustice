import pool from './db';
import {
    mockUsers,
    mockCases,
    mockDocuments,
    mockHearings,
    mockLawyerRequests,
    mockNotifications,
    mockSystemLogs,
} from './seed-data';

const seed = async () => {
    try {
        console.log('Seeding database...');

        // Users
        for (const user of mockUsers) {
            await pool.query(
                `INSERT INTO users (id, name, email, role, avatar, phone, verified, created_at, bar_number, specialization, experience, court_name, designation)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING`,
                [
                    user.id,
                    user.name,
                    user.email,
                    user.role,
                    user.avatar,
                    user.phone,
                    user.verified,
                    user.createdAt,
                    (user as any).barNumber,
                    (user as any).specialization,
                    (user as any).experience,
                    (user as any).courtName,
                    (user as any).designation,
                ]
            );
        }
        console.log('Users seeded.');

        // Cases
        for (const kase of mockCases) {
            await pool.query(
                `INSERT INTO cases (id, title, type, status, urgency, description, citizen_id, lawyer_id, judge_id, filed_at, next_hearing, closed_at, verdict, ai_summary)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO NOTHING`,
                [
                    kase.id,
                    kase.title,
                    kase.type,
                    kase.status,
                    kase.urgency,
                    kase.description,
                    kase.citizenId,
                    kase.lawyerId,
                    kase.judgeId,
                    kase.filedAt,
                    kase.nextHearing,
                    (kase as any).closedAt,
                    (kase as any).verdict,
                    kase.aiSummary,
                ]
            );
        }
        console.log('Cases seeded.');

        // Documents
        for (const doc of mockDocuments) {
            await pool.query(
                `INSERT INTO documents (id, case_id, name, type, size, uploaded_by, uploaded_at, hash, verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
                [
                    doc.id,
                    doc.caseId,
                    doc.name,
                    doc.type,
                    doc.size,
                    doc.uploadedBy,
                    doc.uploadedAt,
                    doc.hash,
                    doc.verified,
                ]
            );
        }
        console.log('Documents seeded.');

        // Hearings
        for (const hearing of mockHearings) {
            await pool.query(
                `INSERT INTO hearings (id, case_id, date, time, type, status, judge_id, court_room, notes, transcript, participants)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
                [
                    hearing.id,
                    hearing.caseId,
                    hearing.date,
                    hearing.time,
                    hearing.type,
                    hearing.status,
                    hearing.judgeId,
                    hearing.courtRoom,
                    hearing.notes,
                    (hearing as any).transcript,
                    hearing.participants,
                ]
            );
        }
        console.log('Hearings seeded.');

        // Lawyer Requests
        for (const req of mockLawyerRequests) {
            await pool.query(
                `INSERT INTO lawyer_requests (id, case_id, lawyer_id, status, message, requested_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
                [
                    req.id,
                    req.caseId,
                    req.lawyerId,
                    req.status,
                    req.message,
                    (req as any).requestedAt,
                ]
            );
        }
        console.log('Lawyer Requests seeded.');

        // Notifications
        for (const notif of mockNotifications) {
            await pool.query(
                `INSERT INTO notifications (id, user_id, title, message, type, read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
                [
                    notif.id,
                    notif.userId,
                    notif.title,
                    notif.message,
                    notif.type,
                    notif.read,
                    notif.createdAt,
                ]
            );
        }
        console.log('Notifications seeded.');

        // System Logs
        for (const log of mockSystemLogs) {
            await pool.query(
                `INSERT INTO system_logs (id, user_id, user_name, action, details, timestamp, type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
                [
                    log.id,
                    log.userId,
                    log.userName,
                    log.action,
                    log.details,
                    log.timestamp,
                    log.type,
                ]
            );
        }
        console.log('System Logs seeded.');

        console.log('Database seeded successfully.');
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        await pool.end();
    }
};

seed();
