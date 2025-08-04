import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Colors from "../constants/Colors";

interface CategoryTextSliderProps {
  onCategorySelect: (category: string) => void;
}

function CategoryTextSlider({ onCategorySelect }: CategoryTextSliderProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>("Latest");

    const CategoryList = [
        { id: 1, name: "Latest", icon: "🆕" },
        { id: 2, name: "World", icon: "🌍" },
        { id: 3, name: "Business", icon: "💼" },
        { id: 4, name: "Technology", icon: "💻" },
        { id: 5, name: "USA", icon: "🇺🇸" },
    ];

    const handleCategoryPress = (category: string) => {
        setSelectedCategory(category);
        onCategorySelect(category);
    };

    return (
        <View style={styles.container}>
            {CategoryList.map((item) => (
                <TouchableOpacity 
                    key={item.id}
                    onPress={() => handleCategoryPress(item.name)}
                    style={[
                        styles.categoryButton,
                        selectedCategory === item.name && styles.selectedButton
                    ]}
                >
                    <View style={styles.buttonContent}>
                        <Text style={styles.icon}>{item.icon}</Text>
                        <Text
                            style={[
                                styles.categoryText,
                                selectedCategory === item.name && styles.selectedText
                            ]}
                        >
                            {item.name}
                        </Text>
                    </View>
                    {selectedCategory === item.name && (
                        <View style={styles.indicator} />
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 8,
        borderRadius: 8,
        backgroundColor: '#f8f8f8',
    },
    selectedButton: {
        backgroundColor: Colors.light.tint,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        fontSize: 20,
        marginRight: 12,
    },
    categoryText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
    },
    selectedText: {
        color: "#fff",
        fontWeight: "bold",
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
});

export default CategoryTextSlider;