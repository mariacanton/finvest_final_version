import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Link } from 'expo-router';

interface NewsArticle {
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    source: {
        name: string;
    };
}

interface TopHeadlineSliderProps {
    newsList: NewsArticle[];
}

export default function TopHeadlineSlider({ newsList }: TopHeadlineSliderProps) {
    return (
        <View style={styles.container}>
            <FlatList
                data={newsList}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <Link href={`/news/${encodeURIComponent(item.title)}`} asChild>
                        <TouchableOpacity style={styles.card}>
                            <Image source={{ uri: item.urlToImage }} style={styles.image} />
                            <View style={styles.content}>
                                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                            </View>
                        </TouchableOpacity>
                    </Link>
                )}
                keyExtractor={(item) => item.url}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    card: {
        width: 160,
        marginRight: 12,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    image: {
        width: '100%',
        height: 90,
        resizeMode: 'cover',
    },
    content: {
        padding: 8,
    },
    title: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    description: {
        fontSize: 10,
        color: '#666',
    },
});