import React, { useRef, useState } from "react";
import {
  Alert,
  Pressable,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Input from "../../components/Input";
import BackButton from "../../components/BackButton";
import * as Icons from "phosphor-react-native";
import { useAuth } from "../../contexts/authContext";

const Login = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert("Login", "Please fill all the fields!");
      return;
    }

    setLoading(true);
    const res = await login(emailRef.current, passwordRef.current);
    setLoading(false);
    if (!res.success) {
      Alert.alert("Login", res.msg);
    } else {
      router.replace('/(tabs)/four');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <BackButton iconSize={24} />

      <View style={styles.content}>
        {/* Headings */}
        <Text style={styles.title}>Hey, Welcome Back! </Text>

        <Text style={styles.subtitle}>
          Login now to start <Text style={styles.italic}>Finvest-ing</Text>
        </Text>


        {/* Form Inputs */}
        <View style={{ gap: 20 }}>
  <Input
    icon={<Icons.At size={24} color="#1A1A1A" weight="fill" />}
    placeholder="Enter your email"
    onChangeText={(value) => (emailRef.current = value)}
    containerStyle={{
      borderWidth: 1,
      borderColor: "#000",
      borderRadius: 12,
      paddingHorizontal: 12,
    }}
  />
  <Input
    icon={<Icons.Lock size={24} color="#1A1A1A" weight="fill" />}
    placeholder="Enter your password"
    secureTextEntry
    onChangeText={(value) => (passwordRef.current = value)}
    containerStyle={{
      borderWidth: 1,
      borderColor: "#000",
      borderRadius: 12,
      paddingHorizontal: 12,
    }}
  />
</View>


        {/* Forgot Password */}
        <Text style={styles.forgotPassword}>Forgot Password?</Text>

        {/* Button */}
        <Pressable
          onPress={onSubmit}
          disabled={loading}
          style={({ pressed }) => [
            styles.button,
            { opacity: loading || pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={styles.buttonText}>
            {loading ? "Logging In..." : "Login"}
          </Text>
        </Pressable>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Pressable onPress={() => router.navigate("/auth/register")}>
            <Text style={styles.footerLink}>Sign up</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#A3C9A8",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontFamily: "Georgia",
    fontSize: 32,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  subtitle: {
    fontFamily: "Georgia",
    fontSize: 16,
    color: "#5E6D55",
    marginTop: 12,
    fontWeight: "700",
    marginBottom: 28,
  },
  forgotPassword: {
    textAlign: "right",
    fontSize: 14,
    fontWeight: "500",
    color: "#444",
    marginTop: 8,
  },
  button: {
    backgroundColor: "#3A7D63",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 15,
    color: "#1A1A1A",
  },
  footerLink: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2F4858",
  },
  italic: {
    fontStyle: "italic",
    fontFamily: "Georgia", // optional for consistent elegance
  },
  
});
