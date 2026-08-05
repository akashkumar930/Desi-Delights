import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL;
const isDev = import.meta.env.DEV;

// In dev: use proxy (/api) so vite.config.js forwards to localhost:5000
// In production: use VITE_API_URL (set in Vercel), fallback to Render URL
const RENDER_BACKEND_URL = 'https://inet-mart-6.onrender.com/api';

// Normalize: if env var was set without /api suffix, add it
const normalizeUrl = (url) => {
    if (!url) return RENDER_BACKEND_URL;
    const trimmed = url.replace(/\/$/, ''); // remove trailing slash
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const API_BASE_URL = isDev
    ? '/api'
    : normalizeUrl(configuredApiUrl);

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const { token } = JSON.parse(userInfo);
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Helper function to get full image URL
export const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';

    // Convert legacy localhost absolute URLs to the current API host.
    if (/^https?:\/\//i.test(imageUrl)) {
        try {
            const url = new URL(imageUrl);
            if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
                return `${API_ORIGIN}${url.pathname}${url.search}`;
            }
            return imageUrl;
        } catch {
            return imageUrl;
        }
    }

    const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${API_ORIGIN}${normalizedPath}`;
};

export default api;
