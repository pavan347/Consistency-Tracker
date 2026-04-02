import axios from 'axios';

const API_BASE_URL = 'https://consistency-tracker-kd8c.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('ct_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle 401 (token expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('ct_token');
            localStorage.removeItem('ct_user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

// Habits API
export const habitsAPI = {
    create: (data) => api.post('/habits', data),
    getAll: () => api.get('/habits'),
    update: (id, data) => api.put(`/habits/${id}`, data),
    delete: (id) => api.delete(`/habits/${id}`),
};

// Logs API
export const logsAPI = {
    create: (data) => api.post('/logs', data),
    getByDate: (date) => api.get(`/logs/date/${date}`),
    update: (id, data) => api.put(`/logs/${id}`, data),
};

// Analytics API
export const analyticsAPI = {
    getWeekly: () => api.get('/analytics/weekly'),
    getOverall: () => api.get('/analytics/overall'),
    getHeatmap: () => api.get('/analytics/heatmap'),
};

export default api;
