import useAuth from "@/hooks/useAuth";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  const { verifyAuth } = useAuth();

  useEffect(() => {
    let isMounted = true;
    
    if (isMounted) {
      verifyAuth();
    }

    return () => {
      isMounted = false;
    };
  }, [verifyAuth]);
  
  return <Stack
    screenOptions={{
      headerShown: false
    }}
  >
    <Stack.Screen name="index" />
    <Stack.Screen name="gallery" />
    <Stack.Screen name="camera" />
  </Stack>;
}
