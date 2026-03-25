import useAuth from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const { error, isAuthenticated, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focused, setFocused] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/gallery");
    }
  }, []);

  const handleLogin = async () => {
    if (loading) return;

    if (email.trim() === "" || password.trim() === "") {
      alert("Please enter both email and password.");
      return;
    }

    await login(email, password);
    setEmail("");
    setPassword("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>Welcome back to PhotoHub</Text>
        </View>

        {/* Grouped fields — Apple HIG style */}
        <View style={styles.fieldGroup}>
          <TextInput
            style={[
              styles.input,
              styles.inputTop,
              focused === "email" && styles.inputFocused,
            ]}
            placeholder="Email"
            placeholderTextColor="#3A3A3C"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
          />

          {/* Inset divider between fields */}
          <View style={styles.separator} />

          <TextInput
            style={[
              styles.input,
              styles.inputBottom,
              focused === "password" && styles.inputFocused,
            ]}
            placeholder="Password"
            placeholderTextColor="#3A3A3C"
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            secureTextEntry
            returnKeyType="done"
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Sign In button */}
        <TouchableOpacity
          disabled={loading}
          style={styles.button}
          activeOpacity={0.8}
          onPress={handleLogin}
        >
          {loading && (
            <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
          )}
          <Text
            style={[styles.buttonText, loading && styles.buttonTextLoading]}
          >
            Sign In
          </Text>
        </TouchableOpacity>

        {/* Forgot password */}
        <TouchableOpacity style={styles.forgotWrap}>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Register */}
        <TouchableOpacity style={styles.registerWrap}>
          <Text style={styles.registerText}>
            Don't have an account?{" "}
            <Text style={styles.registerLink}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 48,
  },

  // Header
  header: {
    marginBottom: 36,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: "#8E8E93",
    marginTop: 6,
  },

  // Grouped field card
  fieldGroup: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    color: "#fff",
    backgroundColor: "transparent",
  },
  inputTop: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  inputBottom: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  inputFocused: {
    backgroundColor: "#2C2C2E",
  },
  separator: {
    height: 0.5,
    backgroundColor: "#2C2C2E",
    marginLeft: 16, // inset — Apple standard
  },

  // Button
  button: {
    backgroundColor: "#0A84FF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 4,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  buttonTextLoading: {
    opacity: 0.8,
  },

  // Forgot
  forgotWrap: {
    alignItems: "center",
    paddingVertical: 16,
  },
  forgot: {
    fontSize: 15,
    color: "#0A84FF",
  },

  // Register
  registerWrap: {
    alignItems: "center",
    marginTop: 16,
  },
  registerText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  registerLink: {
    color: "#0A84FF",
    fontWeight: "500",
  },

  // error
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginBottom: 8,
  },
});
