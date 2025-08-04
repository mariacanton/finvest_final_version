import {
  Alert,
  Pressable,
  Text,
  View,
  StyleSheet,
} from "react-native";
import React, { useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import BackButton from "../../components/BackButton";
import Input from "../../components/Input";
import * as Icons from "phosphor-react-native";
import { useAuth } from "../../contexts/authContext";

const SignUp = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const nameRef = useRef("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current || !nameRef.current) {
      Alert.alert("Register", "Please fill all the fields!");
      return;
    }

    setLoading(true);
    const res = await register(
      emailRef.current,
      passwordRef.current,
      nameRef.current
    );
    setLoading(false);
    if (!res.success) {
      Alert.alert("Register", res.msg);
    }
    else {
      router.replace('/(tabs)/four');}
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <BackButton iconSize={24} color="#000" />

      <View style={styles.content}>
        {/* Heading */}
        <Text style={styles.title}>Let's Get You Started!</Text>
  

        <Text style={styles.subtitle}>
          Create an account to start <Text style={styles.italic}>Finvest-ing</Text>
        </Text>

        {/* Form */}
        <View style={styles.inputGroup}>
          <Input
            icon={<Icons.User size={24} color="#1A1A1A" weight="fill" />}
            placeholder="Enter your name"
            onChangeText={(value) => (nameRef.current = value)}
            containerStyle={styles.input}
          />
          <Input
            icon={<Icons.At size={24} color="#1A1A1A" weight="fill" />}
            placeholder="Enter your email"
            onChangeText={(value) => (emailRef.current = value)}
            containerStyle={styles.input}
          />
          <Input
            icon={<Icons.Lock size={24} color="#1A1A1A" weight="fill" />}
            placeholder="Enter your password"
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
            containerStyle={styles.input}
          />
        </View>

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          style={({ pressed }) => [
            styles.button,
            { opacity: loading || pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={styles.buttonText}>
            {loading ? "Signing Up..." : "Sign Up"}
          </Text>
        </Pressable>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => router.push("/auth/signin")}>
            <Text style={styles.footerLink}>Login</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default SignUp;

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
    marginBottom: 28,
  },
  inputGroup: {
    gap: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    paddingHorizontal: 12,
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
