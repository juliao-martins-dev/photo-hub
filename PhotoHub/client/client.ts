import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import { router, useRouter } from "expo-router";


const client = axios.create({
    baseURL: process.env.EXPO_PUBLIC_BASE_URL,
    timeout: 10000,
});

client.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync("token_access");
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    } 
    return config;
});

client.interceptors.response.use(response => response, async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401) {
        router.replace("/");
    }
    return Promise.reject(error);
});

export default client;