import axios from 'axios';
import { User, Case, Document, Hearing, Notification, LawyerRequest, SystemLog } from '@/types';

const API_URL = 'https://ejustice-smart-court.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getUsers = async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
};

export const getCase = async (caseId: string): Promise<Case> => {
    const response = await api.get(`/cases/${caseId}`);
    return response.data;
};

export const updateCase = async (caseId: string, updates: Partial<Case>): Promise<Case> => {
    const response = await api.patch(`/cases/${caseId}`, updates);
    return response.data;
};

export const getCases = async (): Promise<Case[]> => {
    const response = await api.get('/cases');
    return response.data;
};

export const getDocuments = async (userId?: string, caseId?: string): Promise<Document[]> => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (caseId) params.append('caseId', caseId);

    const response = await api.get(`/documents?${params.toString()}`);
    return response.data;
};

export const uploadDocument = async (formData: FormData): Promise<Document> => {
    const response = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const deleteDocument = async (docId: string): Promise<void> => {
    await api.delete(`/documents/${docId}`);
};

export const getHearings = async (): Promise<Hearing[]> => {
    const response = await api.get('/hearings');
    return response.data;
};

export const getNotifications = async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    return response.data;
};

export const getLawyerRequests = async (): Promise<LawyerRequest[]> => {
    const response = await api.get('/lawyer-requests');
    return response.data;
};

export const createLawyerRequest = async (requestData: { caseId: string; lawyerId: string; status?: string; message: string }): Promise<LawyerRequest> => {
    const response = await api.post('/lawyer-requests', requestData);
    return response.data;
};

export const updateLawyerRequest = async (requestId: string, status: string): Promise<LawyerRequest> => {
    const response = await api.patch(`/lawyer-requests/${requestId}`, { status });
    return response.data;
};

export const getSystemLogs = async (): Promise<SystemLog[]> => {
    const response = await api.get('/system-logs');
    return response.data;
};

export interface CaseSummary {
    facts: string;
    legalIssue: string;
    reliefSought: string;
    urgency: 'low' | 'medium' | 'high';
    urgencyReason: string;
}

export const createCase = async (formData: FormData): Promise<Case> => {
    const response = await api.post('/cases', formData);
    return response.data;
};

export const generateCaseSummary = async (caseDetails: { title: string; type: string; description: string }): Promise<CaseSummary> => {
    const response = await api.post('/ai/summary', caseDetails);
    return response.data;
};

export const chatWithLegalAssistant = async (message: string, history: any[] = []): Promise<string> => {
    const response = await api.post('/ai/chat', { message, history });
    return response.data.response;
};

// Meetings API
export const getMeetings = async (userId: string): Promise<any[]> => {
    const response = await api.get(`/meetings/user/${userId}`);
    return response.data;
};

export const getMeeting = async (meetingId: string): Promise<any> => {
    const response = await api.get(`/meetings/${meetingId}`);
    return response.data;
};

export const createMeeting = async (meetingData: any): Promise<any> => {
    const response = await api.post('/meetings', meetingData);
    return response.data;
};

export const updateMeeting = async (meetingId: string, updates: any): Promise<any> => {
    const response = await api.patch(`/meetings/${meetingId}`, updates);
    return response.data;
};

export const updateMeetingStatus = async (meetingId: string, status: string): Promise<any> => {
    const response = await api.patch(`/meetings/${meetingId}/status`, { status });
    return response.data;
};

export const deleteMeeting = async (meetingId: string): Promise<void> => {
    await api.delete(`/meetings/${meetingId}`);
};

// Auth
export const login = async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const registerCitizen = async (data: any) => {
    const response = await api.post('/auth/register/citizen', data);
    return response.data;
};

export const registerLawyer = async (formData: FormData) => {
    const response = await api.post('/auth/register/lawyer', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const adminVerifyUser = async (userId: string) => {
    const response = await api.post(`/users/${userId}/verify`);
    return response.data;
};

export const adminCreateJudge = async (data: any) => {
    const response = await api.post('/users/judge', data);
    return response.data;
};

export const uploadDocuments = async (caseId: string, files: FileList, uploadedBy: string): Promise<Document[]> => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
        formData.append('files', file);
    });
    formData.append('uploadedBy', uploadedBy);

    const response = await api.post(`/cases/${caseId}/documents`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getAvailableLawyers = async (caseId: string): Promise<{ caseType: string; lawyers: any[]; isSpecializedMatch: boolean }> => {
    const response = await api.get(`/cases/${caseId}/lawyers`);
    return response.data;
};

export default api;
