import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with defaults
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
    try {
        const user = auth.currentUser;
        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.error('Failed to get auth token:', error);
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired, redirect to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// API methods
export const apiService = {
    // Auth
    getUser: () => api.get('/auth/me'),
    verifyToken: (token) => api.post('/auth/verify', { token }),

    // Predictions
    predict: async (formData) => {
        const form = new FormData();

        if (formData.file) {
            form.append('media', formData.file);
        }

        form.append('caption', formData.caption || '');
        form.append('hashtags', formData.hashtags || '');
        form.append('platform', formData.platform || 'instagram');
        form.append('postingTime', formData.postingTime || '12:00');
        form.append('dayOfWeek', formData.dayOfWeek || '');
        form.append('location', formData.location || '');
        form.append('targetAudience', formData.targetAudience || '');

        if (formData.mediaInfo) {
            form.append('mediaInfo', JSON.stringify(formData.mediaInfo));
        }

        return api.post('/predict', form, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // History
    getHistory: () => api.get('/history'),
    deletePrediction: (id) => api.delete(`/history/${id}`),
};

export default api;
