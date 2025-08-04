import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, AppState, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import topics from '../../../assets/data/topics.json';
import { FlatList } from 'react-native';
import courses from '../../../assets/data/courses.json';
import youtubers from '../../../assets/data/youtubers.json';
import { Link } from 'expo-router';
import { useColorScheme } from '../../components/useColorScheme';
import * as WebBrowser from 'expo-web-browser';
import { FinancialEducationAPI, APIEducationalTopic } from '../../services/financialEducationAPI';
import { Course } from '../../types';
import { YouTubeService } from '../../services/youtubeService';

// Dummy data for topics
const TOPICS = [
  {
    id: '1',
    title: 'DCF',
    description: 'Understanding Discounted Cash Flow Valuation',
    image: require('../../../assets/images/dcf.png')
  },
  {
    id: '2',
    title: 'Options Greeks',
    description: 'Delta, Gamma, Theta & Vega',
    image: require('../../../assets/images/options.png')
  }
];

// Category buttons data
const CATEGORIES = [
  'Stocks',
  'ETFs',
  'Investment Strategies',
  'Bonds',
  'Options'
];

// Add the image imports at the top
const topicsImage = require('../../../assets/images/topics-image.png');
const courseImage = require('../../../assets/images/course-image.png');
const channelImage = require('../../../assets/images/channel-image.png');
const dcfImage = require('../../../assets/images/dcf.png');

export default function TabTwoScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [appState, setAppState] = useState(AppState.currentState);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [educationalTopics, setEducationalTopics] = useState<APIEducationalTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [courseImages, setCourseImages] = useState<Record<string, string>>({});
  const [channelImages, setChannelImages] = useState<Record<string, string>>({});
  const [loadingChannelImages, setLoadingChannelImages] = useState(false);

  // Debug logging for state changes
  useEffect(() => {
    console.log('AppState changed:', appState);
  }, [appState]);
  useEffect(() => {
    console.log('Selected category:', selectedCategory);
  }, [selectedCategory]);
  useEffect(() => {
    console.log('Educational topics:', educationalTopics);
  }, [educationalTopics]);
  useEffect(() => {
    console.log('Course images:', courseImages);
  }, [courseImages]);
  useEffect(() => {
    console.log('Channel images:', channelImages);
  }, [channelImages]);
  useEffect(() => {
    console.log('Loading channel images:', loadingChannelImages);
  }, [loadingChannelImages]);
  // Helper function to get channel image
  const getChannelImageSource = (channelId: string) => {
    if (channelImages[channelId]) {
      return { uri: channelImages[channelId] };
    } else {
      // Return default channel image as fallback
      return channelImage;
    }
  };

  // Function to load YouTube channel profile pictures
  const loadChannelImages = async () => {
    setLoadingChannelImages(true);
    try {
      console.log('Loading YouTube channel profile pictures...');
      const channelImages = await YouTubeService.loadChannelImages(youtubers);
      setChannelImages(channelImages);
    } catch (error) {
      console.warn('Error loading channel images:', error);
    } finally {
      setLoadingChannelImages(false);
    }
  };

  // Helper function to get course image
  const getCourseImageSource = (imageIdentifier: string) => {
    if (courseImages[imageIdentifier]) {
      return { uri: courseImages[imageIdentifier] };
    } else {
      // Return course image as fallback while loading or if failed
      return courseImage;
    }
  };

  // Function to fetch course images from Unsplash
  const loadCourseImages = async () => {
    const UNSPLASH_ACCESS_KEY = 'gUwfa4GSLjdTHNOW9MFMkWbW5gnr6DUsiqXHjie-Yrs';
    const imagePromises = courses.map(async (course) => {
      try {
        // Create search query from course title and tags
        const searchQuery = `${course.title.replace(/[^a-zA-Z\s]/g, '')} finance education`;
        const response = await fetch(
          `https://api.unsplash.com/photos/random?query=${encodeURIComponent(searchQuery)}&client_id=${UNSPLASH_ACCESS_KEY}&w=400&h=300&orientation=landscape`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.urls?.regular) {
            return { id: course.image, url: data.urls.regular };
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch image for course ${course.title}:`, error);
      }
      return null;
    });

    try {
      const results = await Promise.all(imagePromises);
      const newCourseImages: Record<string, string> = {};
      
      results.forEach((result) => {
        if (result) {
          newCourseImages[result.id] = result.url;
        }
      });

      setCourseImages(newCourseImages);
    } catch (error) {
      console.warn('Error loading course images:', error);
    }
  };

  // Helper function to get appropriate image source
  const getImageSource = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) {
      return { uri: imageUrl };
    } else if (imageUrl.includes('dcf.png')) {
      return dcfImage;
    } else {
      return topicsImage;
    }
  };

  // Load educational topics on component mount
  useEffect(() => {
    loadEducationalTopics();
    loadCourseImages(); // Load course images on mount
    loadChannelImages(); // Load channel images on mount
  }, []);

  // Load topics when category changes
  useEffect(() => {
    loadEducationalTopics(selectedCategory);
  }, [selectedCategory]);

  const loadEducationalTopics = async (category?: string | null) => {
    setLoading(true);
    try {
      // First try to get topics from the new API service
      console.log('Loading topics from Financial Education API...');
      const apiResult = await FinancialEducationAPI.getEducationalTopics(category || undefined);
      
      if (apiResult.success && apiResult.data.length > 0) {
        console.log('Successfully loaded', apiResult.data.length, 'topics from API');
        setEducationalTopics(apiResult.data);
        setLoading(false);
        return;
      }
      
      // Fallback to hardcoded topics
      console.log('API failed, falling back to hardcoded topics...');
      const fallbackTopics: APIEducationalTopic[] = topics.map((topic, index) => ({
        id: `fallback-${index}`,
        title: topic.title,
        description: topic.description,
        content: topic.description,
        tags: [topic.title.split(' ')[0]], // Simple tag from title
        source: 'local',
        image: topicsImage
      }));
      
      console.log('Successfully loaded', fallbackTopics.length, 'topics from fallback');
      setEducationalTopics(fallbackTopics);
    } catch (error) {
      console.error('Error loading educational topics:', error);
      // Final fallback to empty array
      setEducationalTopics([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        setAppState(nextAppState);
      } else {
        setAppState(nextAppState);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);

  const handleCategoryPress = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const searchItems = (items: any[], searchText: string) => {
    if (!searchText) return items;
    
    const searchLower = searchText.toLowerCase();
    return items.filter(item => {
      const titleMatch = item.title?.toLowerCase().includes(searchLower) || 
                        item.username?.toLowerCase().includes(searchLower);
      const tagsMatch = item.tags?.some((tag: string) => 
        tag.toLowerCase().includes(searchLower)
      );
      const descriptionMatch = item.description?.toLowerCase().includes(searchLower);
      const providerMatch = item.provider?.toLowerCase().includes(searchLower);
      
      return titleMatch || tagsMatch || descriptionMatch || providerMatch;
    });
  };

  const handleSeeAllPress = () => {
    Alert.alert('See All', 'View all topics coming soon!');
  };

  const handleTopicPress = (topicId: string) => {
    // Navigate to topic detail page (you can implement this later)
    Alert.alert('Topic Selected', `You selected topic ${topicId}`);
  };

  const handleOpenLink = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'Could not open the link');
    }
  };

  const filteredTopics = searchItems(educationalTopics, searchQuery);

  const filteredCourses = searchItems(
    selectedCategory
      ? courses.filter(course => course.tags.includes(selectedCategory))
      : courses,
    searchQuery
  );

  const filteredChannels = searchItems(
    selectedCategory
      ? youtubers.filter(channel => channel.tags.includes(selectedCategory))
      : youtubers,
    searchQuery
  );

  return (
    <View style={styles.container}>
      <ScrollView style={{ marginTop: 10 }}>

      <Text style={[styles.sectionTitle, { paddingTop: 20,paddingBottom: 10}]}>    What do you want to learn about?</Text>


        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>

        {/* Category Buttons */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonSelected
              ]}
              onPress={() => handleCategoryPress(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextSelected
              ]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Topics Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Topics</Text>
          <TouchableOpacity onPress={handleSeeAllPress}>
            <Text style={styles.seeAllButton}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 250 }}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading educational content...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredTopics}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Link href={`/learn/${encodeURIComponent(item.title)}`} asChild>
                  <TouchableOpacity style={styles.topicCard}>
                    <View style={styles.topicContent}>
                      <Text style={styles.topicTitle} numberOfLines={2}>{item.title}</Text>
                      <Text style={styles.topicDescription} numberOfLines={2}>{item.description}</Text>
                    </View>
                    <Image 
                      source={getImageSource(item.image)}
                      style={styles.topicImage}
                      resizeMode="cover"
                      onError={(error) => {
                        console.log('Failed to load image for topic:', item.title, error.nativeEvent?.error);
                      }}
                      onLoad={() => {
                        console.log('Successfully loaded image for topic:', item.title);
                      }}
                    />
                  </TouchableOpacity>
                </Link>
              )}
              style={{ backgroundColor: '#A3C9A8' }}
              contentContainerStyle={{ paddingHorizontal: 0 }}
              ItemSeparatorComponent={() => (
                <View style={{ height: 1, backgroundColor: '#A3C9A8', marginHorizontal: 20 }} />
              )}
            />
          )}
        </View>

        {/* Courses Section */}
        <View style={[styles.sectionHeader, { marginTop: 30 }]}>
          <Text style={styles.sectionTitle}>Courses</Text>
          <TouchableOpacity onPress={handleSeeAllPress}>
            <Text style={styles.seeAllButton}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 180 }}>
          <FlatList
            data={filteredCourses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.topicCard, { padding: 12 }]}
                onPress={() => handleOpenLink(item.link)}
              >
                <Image 
                  source={getCourseImageSource(item.image)}
                  style={[styles.topicImage, { width: 80, height: 80, marginRight: 12 }]} 
                  resizeMode="cover"
                  onError={() => {
                    // Fallback to default course image on error
                    console.warn(`Failed to load image for course: ${item.title}`);
                  }}
                />
                <View style={styles.topicContent}>
                  <Text style={[styles.topicTitle, { fontSize: 16 }]}>{item.title}</Text>
                  <Text style={[styles.topicDescription, { fontSize: 13 }]}>{item.provider}</Text>
                  {item.description && (
                    <Text style={[styles.topicDescription, { fontSize: 11, opacity: 0.8 }]} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingHorizontal: 0 }}
            ItemSeparatorComponent={() => (
              <View style={{ height: 1, backgroundColor: '#A3C9A8', marginHorizontal: 20 }} />
            )}
          />
        </View>

        {/* Channels Section */}
        <View style={[styles.sectionHeader, { marginTop: 30 }]}>
          <Text style={styles.sectionTitle}>Channels</Text>
          <TouchableOpacity onPress={handleSeeAllPress}>
            <Text style={styles.seeAllButton}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filteredChannels}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.channelItem}
              onPress={() => handleOpenLink(item.link)}
            >
              <Image 
                source={getChannelImageSource(item.id)}
                style={[styles.channelImage, { width: 80, height: 80 }]} 
                resizeMode="cover"
                onError={() => {
                  console.warn(`Failed to load image for channel: ${item.username}`);
                }}
                onLoad={() => {
                  console.log(`Successfully loaded image for channel: ${item.username}`);
                }}
              />
              {loadingChannelImages && !channelImages[item.id] && (
                <View style={styles.imageLoadingOverlay}>
                  <Text style={styles.imageLoadingText}>📸</Text>
                </View>
              )}
              <Text style={styles.channelUsername}>{item.username}</Text>
            </TouchableOpacity>
          )}
        />

       
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A3C9A8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 16,
    paddingHorizontal: 16,
    height: 44,
    backgroundColor: '#c3dcc6',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  categoriesContainer: {
    marginBottom: 24,
    backgroundColor: '#A3C9A8',
  },
  categoriesContent: {
    paddingHorizontal: 12,
  },
  categoryButton: {
    backgroundColor: '#c3dcc6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryButtonSelected: {
    backgroundColor: Colors.light.tint,
  },
  categoryText: {
    fontSize: 14,
    color: '#000',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#A3C9A8',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 12,
  },
  seeAllButton: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c3dcc6',
    marginHorizontal: 12,
    borderRadius: 20,
    padding: 16,
    height: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topicContent: {
    flex: 1,
    marginRight: 12,
    backgroundColor: '#c3dcc6',
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    paddingRight: 8,
  },
  topicDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A3C9A8',
  },
  loadingText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  topicImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  channelItem: {
    alignItems: 'center',
    width: 100,
    backgroundColor: '#c3dcc6',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  channelUsername: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  channelImage: {
    borderRadius: 40, // Make it circular for profile pictures
    borderWidth: 2,
    borderColor: '#fff',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLoadingText: {
    fontSize: 24,
  },
});