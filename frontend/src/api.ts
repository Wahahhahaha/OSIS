import axios from 'axios';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach JWT token and geolocation coordinates
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const lat = sessionStorage.getItem('user_latitude');
    const lng = sessionStorage.getItem('user_longitude');
    if (lat && lng && config.headers) {
      config.headers['x-latitude'] = lat;
      config.headers['x-longitude'] = lng;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to intercept HTTP errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status && [403, 419, 500].includes(status)) {
      window.location.href = `/error?code=${status}`;
    }
    return Promise.reject(error);
  }
);

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    level: 'student' | 'school' | 'employer';
    email: string;
    role: string;
    details?: {
      class: string;
      grade: string;
      major: string;
    } | null;
  };
}

export interface SystemResponse {
  id: string;
  systemname: string;
  systemlogo: string | null;
  systemfavicon: string | null;
  systemaddress: string | null;
  systemcontact: string | null;
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { username, password });
    return response.data;
  },
  getProfile: async (): Promise<any> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  updateProfile: async (data: { email?: string; password?: string }): Promise<any> => {
    const response = await api.post('/auth/update-profile', data);
    return response.data;
  },
  getSystemSettings: async (): Promise<SystemResponse> => {
    const response = await api.get<SystemResponse>('/system');
    return response.data;
  },
  getPublicCandidates: async (): Promise<{ activePeriod: any; candidates: any[] }> => {
    const response = await api.get('/public/candidates');
    return response.data;
  },
  updateSystemSettings: async (data: any): Promise<SystemResponse> => {
    const response = await api.post<SystemResponse>('/admin/system', data);
    return response.data;
  },
  
  // Classes
  getClasses: async (): Promise<any[]> => {
    const response = await api.get('/admin/classes');
    return response.data;
  },
  createClass: async (data: { classname: string; gradeid: string; majorid: string }): Promise<any> => {
    const response = await api.post('/admin/classes', data);
    return response.data;
  },
  updateClass: async (id: string, data: { classname: string; gradeid: string; majorid: string }): Promise<any> => {
    const response = await api.put(`/admin/classes/${id}`, data);
    return response.data;
  },
  deleteClass: async (id: string): Promise<any> => {
    const response = await api.delete(`/admin/classes/${id}`);
    return response.data;
  },

  // Grades
  getGrades: async (): Promise<any[]> => {
    const response = await api.get('/admin/grades');
    return response.data;
  },
  createGrade: async (data: { gradename: string }): Promise<any> => {
    const response = await api.post('/admin/grades', data);
    return response.data;
  },
  updateGrade: async (id: string, data: { gradename: string }): Promise<any> => {
    const response = await api.put(`/admin/grades/${id}`, data);
    return response.data;
  },
  deleteGrade: async (id: string): Promise<any> => {
    const response = await api.delete(`/admin/grades/${id}`);
    return response.data;
  },

  // Majors
  getMajors: async (): Promise<any[]> => {
    const response = await api.get('/admin/majors');
    return response.data;
  },
  createMajor: async (data: { majorname: string; majorcode: string }): Promise<any> => {
    const response = await api.post('/admin/majors', data);
    return response.data;
  },
  updateMajor: async (id: string, data: { majorname: string; majorcode: string }): Promise<any> => {
    const response = await api.put(`/admin/majors/${id}`, data);
    return response.data;
  },
  deleteMajor: async (id: string): Promise<any> => {
    const response = await api.delete(`/admin/majors/${id}`);
    return response.data;
  },

  // Users
  getUsers: async (): Promise<any[]> => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  createUser: async (data: any): Promise<any> => {
    const response = await api.post('/admin/users', data);
    return response.data;
  },
  updateUser: async (id: string, data: any): Promise<any> => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id: string): Promise<any> => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  resetUserPassword: async (id: string, data: { password: string }): Promise<any> => {
    const response = await api.post(`/admin/users/${id}/reset-password`, data);
    return response.data;
  },

  // Periods
  getPeriods: async (): Promise<any[]> => {
    const response = await api.get('/admin/periods');
    return response.data;
  },
  createPeriod: async (data: any): Promise<any> => {
    const response = await api.post('/admin/periods', data);
    return response.data;
  },
  updatePeriod: async (id: string, data: any): Promise<any> => {
    const response = await api.put(`/admin/periods/${id}`, data);
    return response.data;
  },

  // Candidates
  getCandidates: async (): Promise<any[]> => {
    const response = await api.get('/admin/candidates');
    return response.data;
  },
  createCandidate: async (data: any): Promise<any> => {
    const response = await api.post('/admin/candidates', data);
    return response.data;
  },
  updateCandidate: async (id: string, data: any): Promise<any> => {
    const response = await api.put(`/admin/candidates/${id}`, data);
    return response.data;
  },
  deleteCandidate: async (id: string): Promise<any> => {
    const response = await api.delete(`/admin/candidates/${id}`);
    return response.data;
  },

  // Votes
  getVotes: async (): Promise<any[]> => {
    const response = await api.get('/admin/votes');
    return response.data;
  },
  castVote: async (data: { periodId: string; candidateId: string }): Promise<any> => {
    const response = await api.post('/admin/votes', data);
    return response.data;
  },

  // Proker
  getProkers: async (): Promise<any[]> => {
    const response = await api.get('/admin/prokers');
    return response.data;
  },
  createProker: async (data: any): Promise<any> => {
    const response = await api.post('/admin/prokers', data);
    return response.data;
  },
  updateProker: async (id: string, data: any): Promise<any> => {
    const response = await api.put(`/admin/prokers/${id}`, data);
    return response.data;
  },
  deleteProker: async (id: string): Promise<any> => {
    const response = await api.delete(`/admin/prokers/${id}`);
    return response.data;
  },
  setElectedPair: async (periodId: string, candidateId: string | null): Promise<any> => {
    const response = await api.post(`/admin/periods/${periodId}/elected-pair`, { candidateId });
    return response.data;
  },
  getProkerDetails: async (id: string): Promise<any> => {
    const response = await api.get(`/admin/prokers/${id}/details`);
    return response.data;
  },
  updateProkerDetails: async (id: string, data: any): Promise<any> => {
    const response = await api.put(`/admin/prokers/${id}/details`, data);
    return response.data;
  },
  scanAttendance: async (meetingId: string, memberId: string): Promise<any> => {
    const response = await api.post('/admin/prokers/attendance/scan', { meetingId, memberId });
    return response.data;
  },

  // Roles
  getRoles: async (): Promise<any[]> => {
    const response = await api.get('/admin/roles');
    return response.data;
  },
  createRole: async (data: { rolename: string }): Promise<any> => {
    const response = await api.post('/admin/roles', data);
    return response.data;
  },
  updateRole: async (id: string, data: { rolename: string }): Promise<any> => {
    const response = await api.put(`/admin/roles/${id}`, data);
    return response.data;
  },
  deleteRole: async (id: string): Promise<any> => {
    const response = await api.delete(`/admin/roles/${id}`);
    return response.data;
  },

  // Sections
  getSections: async (): Promise<any[]> => {
    const response = await api.get('/admin/sections');
    return response.data;
  },
  createSection: async (data: { sectionname: string }): Promise<any> => {
    const response = await api.post('/admin/sections', data);
    return response.data;
  },
  updateSection: async (id: string, data: { sectionname: string }): Promise<any> => {
    const response = await api.put(`/admin/sections/${id}`, data);
    return response.data;
  },
  deleteSection: async (id: string): Promise<any> => {
    const response = await api.delete(`/admin/sections/${id}`);
    return response.data;
  },

  // Organization Members
  getOrgMembers: async (): Promise<any[]> => {
    const response = await api.get('/admin/org-members');
    return response.data;
  },
  createOrgMember: async (data: { studentid: string; roleid: string; periodid: string; sectionid?: string }): Promise<any> => {
    const response = await api.post('/admin/org-members', data);
    return response.data;
  },
  updateOrgMember: async (id: string, data: { studentid: string; roleid: string; periodid: string; sectionid?: string }): Promise<any> => {
    const response = await api.put(`/admin/org-members/${id}`, data);
    return response.data;
  },
  deleteOrgMember: async (id: string): Promise<any> => {
    const response = await api.delete(`/admin/org-members/${id}`);
    return response.data;
  },

  // Students (for dropdown)
  getStudents: async (): Promise<any[]> => {
    const response = await api.get('/admin/students');
    return response.data;
  },

  // Kas OSIS
  getKasData: async (month?: number, year?: number): Promise<{ activePeriod: any; selectedMonth: number; selectedYear: number; accumulatedTotal: number; classes: any[] }> => {
    const response = await api.get('/admin/kas', {
      params: { month, year }
    });
    return response.data;
  },
  recordKasPayment: async (classId: string, month: number, year: number): Promise<any> => {
    const response = await api.post('/admin/kas/pay', { classId, month, year });
    return response.data;
  },
  getActivityLogs: async (): Promise<any[]> => {
    const response = await api.get('/admin/activity-logs');
    return response.data;
  },
  getRecycleBin: async (): Promise<any> => {
    const response = await api.get('/admin/recycle-bin');
    return response.data;
  },
  restoreRecycleBinItem: async (type: string, id: string): Promise<any> => {
    const response = await api.post('/admin/recycle-bin/restore', { type, id });
    return response.data;
  },
  getPermissions: async (): Promise<any[]> => {
    const response = await api.get('/admin/permissions');
    return response.data;
  },
  updatePermission: async (roleName: string, menuKey: string, allowed: boolean): Promise<any> => {
    const response = await api.post('/admin/permissions/update', { roleName, menuKey, allowed });
    return response.data;
  },
  getMyPermissions: async (): Promise<string[]> => {
    const response = await api.get('/permissions/my');
    return response.data;
  },
};

export default api;

