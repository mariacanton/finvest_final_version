import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const BackButton = ({
  iconSize = 24,
  label = "Back",
  color = "#00000", // Default color is black
  //color = "#007AFF",
}: {
  iconSize?: number;
  label?: string;
  color?: string;
}) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}
    >
      <Ionicons name="chevron-back" size={iconSize} color={color} />
      <Text style={{ fontSize: 16, color, marginLeft: 4 }}>{label}</Text>
    </TouchableOpacity>
  );
};

export default BackButton;


