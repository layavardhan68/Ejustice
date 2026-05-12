import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, Case, Document, Hearing, Notification, LawyerRequest, SystemLog, Meeting } from '@/types';
import { 
  login as apiLogin,
  registerCitizen, 
  registerLawyer, 
  adminVerifyUser, 
  adminCreateJudge,
  getUsers, 
  getCases, 
  getDocuments, 
  getHearings, 
  getNotifications, 
  getLawyerRequests,
  getSystemLogs,
  getMeetings,
  createMeeting as apiCreateMeeting,
  updateCase as updateCaseAPI,
  createCase as apiCreateCase,
  updateMeeting as apiUpdateMeeting,
  deleteMeeting as apiDeleteMeeting
} from '@/services/api';
import { useEffect } from 'react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void | User>;
  logout: () => void;
  // Data
  users: User[];
  cases: Case[];
  documents: Document[];
  hearings: Hearing[];
  notifications: Notification[];
  lawyerRequests: LawyerRequest[];
  systemLogs: SystemLog[];
  meetings: Meeting[];
  // Actions
  addCase: (formData: FormData) => Promise<Case>;
  updateCase: (caseId: string, updates: Partial<Case>) => Promise<void>;
  addDocument: (doc: Omit<Document, 'id' | 'uploadedAt'>) => Document;
  addHearing: (hearing: Omit<Hearing, 'id'>) => Hearing;
  updateHearing: (hearingId: string, updates: Partial<Hearing>) => void;
  addLawyerRequest: (request: Omit<LawyerRequest, 'id' | 'requestedAt'>) => void;
  updateLawyerRequest: (requestId: string, status: 'accepted' | 'rejected') => Promise<void>;
  markNotificationRead: (notificationId: string) => void;
  verifyUser: (userId: string) => void;
  suspendUser: (userId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  addSystemLog: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void;
  getUserById: (userId: string) => User | undefined;
  getCaseById: (caseId: string) => Case | undefined;
  // Meeting actions
  createMeeting: (meetingData: any) => Promise<Meeting>;
  updateMeeting: (meetingId: string, updates: any) => Promise<Meeting>;
  deleteMeeting: (meetingId: string) => Promise<void>;
  refreshMeetings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('ejustice_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [users, setUsers] = useState<User[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lawyerRequests, setLawyerRequests] = useState<LawyerRequest[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          usersData,
          casesData,
          docsData,
          hearingsData,
          notifsData,
          reqsData,
          logsData
        ] = await Promise.all([
          getUsers(),
          getCases(),
          getDocuments(),
          getHearings(),
          getNotifications(),
          getLawyerRequests(),
          getSystemLogs()
        ]);

        setUsers(usersData);
        setCases(casesData);
        setDocuments(docsData);
        setHearings(hearingsData);
        setNotifications(notifsData);
        setLawyerRequests(reqsData);
        setSystemLogs(logsData);

        // Fetch meetings for current user if authenticated
        if (user) {
          console.log('Fetching meetings for user:', user.id, user.name);
          const meetingsData = await getMeetings(user.id);
          console.log('Meetings data received:', meetingsData);
          setMeetings(meetingsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user]); // Reload data on mount. Could optimize to load only after login.

  const login = async (credentials: any) => {
    // credentials can be { email, password, role }
    try {
      // If we are passing just a role (dev/demo mode), try to find a seeded user
      // BUT since we are moving to real auth, we should deprecate this or handle it temporarily
      if (typeof credentials === 'string') {
        console.warn("Using deprecated role-based login. Please use email/password.");
        const roleUsers = users.filter(u => u.role === credentials && u.verified);
        if (roleUsers.length > 0) {
          const userToLogin = roleUsers[0];
          setUser(userToLogin);
          localStorage.setItem('ejustice_user', JSON.stringify(userToLogin));
        }
        return;
      }

      // Real API Login
      const userData = await apiLogin(credentials);
      setUser(userData);
      localStorage.setItem('ejustice_user', JSON.stringify(userData));
      return userData;

    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ejustice_user');
  };

  const addCase = async (formData: FormData): Promise<Case> => {
    try {
      const newCase = await apiCreateCase(formData);
      setCases(prev => [...prev, newCase]);
      return newCase;
    } catch (error) {
      console.error("Failed to create case:", error);
      throw error;
    }
  };

  const updateCase = async (caseId: string, updates: Partial<Case>) => {
    try {
      const updatedCase = await updateCaseAPI(caseId, updates);
      setCases(prev => prev.map(c => c.id === caseId ? updatedCase : c));
    } catch (error) {
      console.error("Failed to update case:", error);
      throw error;
    }
  };

  const addDocument = (doc: Omit<Document, 'id' | 'uploadedAt'>): Document => {
    const newDoc: Document = {
      ...doc,
      id: `doc-${documents.length + 1}`,
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    setDocuments(prev => [...prev, newDoc]);
    return newDoc;
  };

  const addHearing = (hearing: Omit<Hearing, 'id'>): Hearing => {
    const newHearing: Hearing = {
      ...hearing,
      id: `hearing-${hearings.length + 1}`,
    };
    setHearings(prev => [...prev, newHearing]);
    return newHearing;
  };

  const updateHearing = (hearingId: string, updates: Partial<Hearing>) => {
    setHearings(prev => prev.map(h => h.id === hearingId ? { ...h, ...updates } : h));
  };

  const addLawyerRequest = (request: Omit<LawyerRequest, 'id' | 'requestedAt'>) => {
    const newRequest: LawyerRequest = {
      ...request,
      id: `req-${lawyerRequests.length + 1}`,
      requestedAt: new Date().toISOString().split('T')[0],
    };
    setLawyerRequests(prev => [...prev, newRequest]);
  };

  const updateLawyerRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    const request = lawyerRequests.find(r => r.id === requestId);
    if (request && status === 'accepted') {
      await updateCase(request.caseId, { lawyerId: request.lawyerId });
    }
    setLawyerRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  };

  const verifyUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: true } : u));
  };

  const suspendUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: false } : u));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${notifications.length + 1}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const addSystemLog = (log: Omit<SystemLog, 'id' | 'timestamp'>) => {
    const newLog: SystemLog = {
      ...log,
      id: `log-${systemLogs.length + 1}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setSystemLogs(prev => [newLog, ...prev]);
  };

  const getUserById = (userId: string) => users.find(u => u.id === userId);
  const getCaseById = (caseId: string) => cases.find(c => c.id === caseId);

  // Meeting functions
  const createMeeting = async (meetingData: any): Promise<Meeting> => {
    try {
      const newMeeting = await apiCreateMeeting(meetingData);
      setMeetings(prev => [...prev, newMeeting]);
      return newMeeting;
    } catch (error) {
      console.error("Failed to create meeting:", error);
      throw error;
    }
  };

  const updateMeeting = async (meetingId: string, updates: any): Promise<Meeting> => {
    try {
      const updatedMeeting = await apiUpdateMeeting(meetingId, updates);
      setMeetings(prev => prev.map(m => m.id === meetingId ? updatedMeeting : m));
      return updatedMeeting;
    } catch (error) {
      console.error("Failed to update meeting:", error);
      throw error;
    }
  };

  const deleteMeeting = async (meetingId: string): Promise<void> => {
    try {
      await apiDeleteMeeting(meetingId);
      setMeetings(prev => prev.filter(m => m.id !== meetingId));
    } catch (error) {
      console.error("Failed to delete meeting:", error);
      throw error;
    }
  };

  const refreshMeetings = async (): Promise<void> => {
    if (user) {
      try {
        const meetingsData = await getMeetings(user.id);
        setMeetings(meetingsData);
      } catch (error) {
        console.error("Failed to refresh meetings:", error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        users,
        cases,
        documents,
        hearings,
        notifications,
        lawyerRequests,
        systemLogs,
        meetings,
        addCase,
        updateCase,
        addDocument,
        addHearing,
        updateHearing,
        addLawyerRequest,
        updateLawyerRequest,
        markNotificationRead,
        verifyUser,
        suspendUser,
        addNotification,
        addSystemLog,
        getUserById,
        getCaseById,
        createMeeting,
        updateMeeting,
        deleteMeeting,
        refreshMeetings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
