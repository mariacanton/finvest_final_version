import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import {
  Ionicons,
  AntDesign,
} from "@expo/vector-icons";
import { useAuth } from "../../contexts/authContext";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";

export default function UserScreen() {
  const { user } = useAuth();
  const router = useRouter();

  // Debug: Log user image data
  React.useEffect(() => {
    console.log('Profile screen - User data:', {
      name: user?.name,
      email: user?.email,
      hasImage: !!user?.image,
      imageLength: user?.image?.length
    });
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/auth/welcome");
  };

  const showLogoutAlert = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: handleLogout,
        style: "destructive",
      },
    ]);
  };

  const options = [
    {
      label: "Edit Profile",
      icon: <Ionicons name="person-circle" size={24} color="white" />,
      bg: "#4F46E5",
      onPress: () => router.push("/profile/profile_edit")
    },
    {
      label: "Logout",
      icon: <AntDesign name="poweroff" size={24} color="white" />,
      bg: "#DC2626",
      onPress: showLogoutAlert,
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#A3C9A8" }}
      contentContainerStyle={{ alignItems: "center", paddingVertical: 40 }}
    >
      <Image
        source={
          user?.image 
            ? { uri: user.image }
            : require("../../../assets/images/avatar-placeholder.png")
        }
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          marginBottom: 20,
        }}
      />
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        {user?.name || "User"}
      </Text>
      <Text style={{ fontSize: 16, color: "#666", marginBottom: 30 }}>
        {user?.email}
      </Text>

      {options.map((opt, index) => (
        <Pressable
          key={index}
          onPress={opt.onPress}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#c3dcc6",
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            width: "90%",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                backgroundColor: opt.bg,
                padding: 10,
                borderRadius: 999,
              }}
            >
              {opt.icon}
            </View>
            <Text style={{ fontSize: 16, fontWeight: "500", color: "#1a1a1a" }}>
              {opt.label}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#1a1a1a" />
        </Pressable>
      ))}
    </ScrollView>
  );
}
