import React from "react";
import { Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";

const WelcomeScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Image
          style={styles.logo}
          resizeMode="contain"
          source={require("../../../assets/images/finvesticon.png")}
        />
        <Text style={styles.title}>Welcome to Finvest</Text>
        <Text style={styles.subtitle}>where you learn, grow and invest</Text>

        {/* Moved button into content and added spacing */}
        <View style={styles.buttonWrapper}>
          <Link href="/auth/signin" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#A3C9A8",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#C8D6C1s",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: "Georgia",
    fontSize: 18,
    color: "#5E6D55",
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 40, // adds spacing below subtitle
  },
  buttonWrapper: {
    marginTop: 20, // distance from subtitle
    width: "100%",
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#3A7D63",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default WelcomeScreen;
