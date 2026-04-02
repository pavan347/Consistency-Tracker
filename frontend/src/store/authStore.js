import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('ct_user')) || null,
    token: localStorage.getItem('ct_token') || null,
    isLoading: false,
    isAuthenticated: !!localStorage.getItem('ct_token'),

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const { data } = await authAPI.login({ email, password });
            localStorage.setItem('ct_token', data.token);
            localStorage.setItem('ct_user', JSON.stringify(data.user));
            set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    },

    register: async (email, password) => {
        set({ isLoading: true });
        try {
            const { data } = await authAPI.register({ email, password });
            localStorage.setItem('ct_token', data.token);
            localStorage.setItem('ct_user', JSON.stringify(data.user));
            set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    },

    checkAuth: async () => {
        const token = localStorage.getItem('ct_token');
        if (!token) {
            set({ isAuthenticated: false, user: null });
            return;
        }
        try {
            const { data } = await authAPI.getMe();
            set({ user: data.user, isAuthenticated: true });
        } catch {
            localStorage.removeItem('ct_token');
            localStorage.removeItem('ct_user');
            set({ user: null, token: null, isAuthenticated: false });
        }
    },

    logout: () => {
        localStorage.removeItem('ct_token');
        localStorage.removeItem('ct_user');
        set({ user: null, token: null, isAuthenticated: false });
    },
}));

export default useAuthStore;
