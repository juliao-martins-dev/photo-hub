import { useState } from "react";
import * as SecureStore from "expo-secure-store";
import client from "@/client/client";
import { useRouter } from "expo-router";

export default function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const response = await client.post("api/users/login/", {
                email,
                password,
            });

            const { access, refresh } = response.data;
            await SecureStore.setItemAsync("token_access", access);
            await SecureStore.setItemAsync("token_refresh", refresh);
            setIsAuthenticated(true);
            router.replace("/gallery");
            
        } catch(e) {
            console.log("login error:", e);
        } finally {
            setLoading(false);
        }
    }

    const logout = async () => {
        SecureStore.deleteItemAsync("token_access");
        SecureStore.deleteItemAsync("token_refresh");
        setIsAuthenticated(false);
        router.replace("/");
    }

    return { isAuthenticated, loading, login, logout };
}