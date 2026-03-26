import client from "@/client/client";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";

export default function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<{access: string; refresh: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.post("api/users/login/", {
        email,
        password,
      });

      // console.log(JSON.stringify(response.data, null, 2));

      const { access, refresh } = response.data;
      await SecureStore.setItemAsync("token_access", access);
      await SecureStore.setItemAsync("token_refresh", refresh);
      setToken({ access, refresh });
      setIsAuthenticated(true);
      router.replace("/gallery");
    } catch (e) {
      setError("Login failed. Please check your credentials and try again.");
      console.log("login error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync("token_access");
    await SecureStore.deleteItemAsync("token_refresh");
    setIsAuthenticated(false);
    setToken(null);
    router.replace("/");
  }, []);

  const verifyAuth = useCallback(async () => {
    setLoading(true);
    try {
      const token = await Promise.all([
        await SecureStore.getItemAsync("token_access"),
        await SecureStore.getItemAsync("token_refresh"),
      ]);
      setToken({ access: token[0], refresh: token[1] });
      if (!token[0] || !token[1]) {
        logout();
        return;
      }
      const response = await client.post("api/users/token/verify/", {
        token: token[0],
      });
      setIsAuthenticated(true);
      router.replace("/gallery");

      /*
        console.log(response.data);
        {
          "detail": "Token is invalid",
          "code": "token_not_valid"
        }

        {
          "token": [
            "This field may not be blank."
          ]
        }
      */
      if (response.data?.detail === "Token is invalid" && response.data?.code === "token_not_valid") {
        await SecureStore.deleteItemAsync("token_access");
        await SecureStore.deleteItemAsync("token_refresh");
        Alert.alert("invalid token => Authentication Error", "Failed to verify authentication. Please log in again.");
        logout();
      }

      if (response.data?.token?.[0] === "This field may not be blank.") {
        await SecureStore.deleteItemAsync("token_access");
        await SecureStore.deleteItemAsync("token_refresh");
        Alert.alert("blank token => Authentication Error", "Failed to verify authentication. Please log in again.");
        logout();
      }

    } catch(e) {
      console.log("verify auth error:", e);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  return { token, isAuthenticated, loading, login, logout, verifyAuth, error, };
}
