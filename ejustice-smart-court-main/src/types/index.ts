export type UserRole = 'citizen' | 'lawyer' | 'judge' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  verified: boolean;
  createdAt: string;
  // Lawyer specific
  barNumber?: string;
  specialization?: string[];
  experience?: number;
  // Judge specific
  courtName?: string;
  designation?: string;
}

export type CaseStatus = 'pending' | 'pending_lawyer' | 'in_hearing' | 'closed';
export type CaseUrgency = 'low' | 'medium' | 'high';
export type CaseType = 'Property' | 'Civil' | 'Family' | 'Consumer' | 'Labor' | 'Criminal' | 'Other';

export interface CaseAISummary {
  facts: string;
  legalIssue: string;
  reliefSought: string;
}

export interface Case {
  id: string;
  title: string;
  type: CaseType;
  status: CaseStatus;
  urgency: CaseUrgency;
  description: string;
  citizenId: string;
  lawyerId: string | null;
  judgeId: string | null;
  filedAt: string;
  nextHearing: string | null;
  closedAt?: string;
  verdict?: string;
  aiSummary: CaseAISummary;
}

export interface Document {
  id: string;
  caseId: string;
  name: string;
  type: 'pdf' | 'image' | 'doc' | 'other';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  hash: string;
  verified: boolean;
}

export type HearingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type HearingType = 'Arguments' | 'Evidence Review' | 'Mediation' | 'Final Verdict' | 'Preliminary';

export interface Hearing {
  id: string;
  caseId: string;
  date: string;
  time: string;
  type: HearingType;
  status: HearingStatus;
  judgeId: string;
  courtRoom: string;
  notes?: string;
  transcript?: string;
  participants: string[];
  roomName?: string;
}

export type LawyerRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface LawyerRequest {
  id: string;
  caseId: string;
  lawyerId: string;
  status: LawyerRequestStatus;
  message: string;
  requestedAt: string;
}

export type NotificationType = 'hearing' | 'case' | 'document' | 'lawyer_request' | 'meeting' | 'system';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Meeting {
  id: string;
  caseId: string;
  title: string;
  description: string;
  scheduledAt: string;
  duration: number; // in minutes
  status: MeetingStatus;
  judgeId: string;
  lawyerId: string;
  citizenId: string;
  roomName: string; // Jitsi room name
  meetingUrl: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SystemLogType = 'case' | 'document' | 'user' | 'hearing' | 'auth' | 'system';

export interface SystemLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  type: SystemLogType;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
