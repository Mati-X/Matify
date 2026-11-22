import axios from 'axios';
import {useAuthStore} from "../store/useAuthStore.ts";

export const api = axios.create({
    baseURL: '/api',
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && useAuthStore.getState().token) {
            useAuthStore.getState().logout();
            useAuthStore.getState().openAuthModal();
        }
        return Promise.reject(error);
    }
);