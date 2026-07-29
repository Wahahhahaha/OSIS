import axios from 'axios';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
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
};

export default api;

