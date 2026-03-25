import client from "@/client/client";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";

export default function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.post("api/users/login/", {
        email,
        password,
      });

      console.log(JSON.stringify(response.data, null, 2));

      const { access, refresh } = response.data;
      await SecureStore.setItemAsync("token_access", access);
      await SecureStore.setItemAsync("token_refresh", refresh);
      setIsAuthenticated(true);
      router.replace("/gallery");
    } catch (e) {
      setError("Login failed. Please check your credentials and try again.");
      console.log("login error:", e);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    SecureStore.deleteItemAsync("token_access");
    SecureStore.deleteItemAsync("token_refresh");
    setIsAuthenticated(false);
    router.replace("/");
  };

  return { isAuthenticated, loading, login, logout, error };
}
