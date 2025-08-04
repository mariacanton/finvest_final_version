import { View } from '../../components/Themed';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import topics from '../../../assets/data/topics.json';
import { EducationService, EducationalTopic } from '../../services/educationService';
import { FinancialEducationAPI, APIEducationalTopic } from '../../services/financialEducationAPI';
import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import Colors from '../../constants/Colors';

interface Topic {
  id: string;
  title: string;
  description: string;
  image: string;
  content: string;
  tags: string[];
  keyPoints?: string[];
}

export default function TopicScreen() {
  const { title } = useLocalSearchParams();
  const decodedTitle = decodeURIComponent(title as string);
  const [topic, setTopic] = useState<Topic | EducationalTopic | APIEducationalTopic | null>(null);
  const [loading, setLoading] = useState(true);
  
  const topicsImage = require('../../../assets/images/topics-image.png');
  const dcfImage = require('../../../assets/images/dcf.png');

  useEffect(() => {
    loadTopic();
  }, [decodedTitle]);

  const loadTopic = async () => {
    setLoading(true);
    
    // Try to find topic using the new API service first
    try {
      const apiTopic = await FinancialEducationAPI.getTopicByTitle(decodedTitle);
      if (apiTopic) {
        setTopic(apiTopic);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error loading topic from API:', error);
    }
    
    // Fallback to EducationService
    try {
      const educationTopic = await EducationService.getTopicByTitle(decodedTitle);
      if (educationTopic) {
        setTopic(educationTopic);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error loading topic from EducationService:', error);
    }
    
    // Final fallback to hardcoded topics
    const hardcodedTopic = topics.find((t: Topic) => t.title === decodedTitle) as Topic;
    setTopic(hardcodedTopic);
    setLoading(false);
  };

  // Helper function to get appropriate image source
  const getImageSource = (imageUrl?: string) => {
    if (!imageUrl) {
      return topicsImage;
    }
    if (imageUrl.startsWith('http')) {
      return { uri: imageUrl };
    } else if (imageUrl.includes('dcf.png')) {
      return dcfImage;
    } else {
      return topicsImage;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: decodedTitle,
            headerBackTitle: 'Learn'
          }}
        />
        <Text style={styles.loadingText}>Loading topic...</Text>
      </View>
    );
  }

  if (!topic) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: decodedTitle,
            headerBackTitle: 'Learn'
          }}
        />
        <Text style={styles.errorText}>Topic not found</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: decodedTitle,
          headerBackTitle: 'Learn'
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Image 
            source={getImageSource(topic.image)}
            style={styles.image}
            resizeMode="cover"
          />
          <Text style={styles.title}>{topic.title}</Text>
          <Text style={styles.description}>{topic.description}</Text>
          
          {/* Tags section */}
          <View style={styles.tagsContainer}>
            {topic.tags.map((tag: string, index: number) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Content sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content</Text>
            <Text style={styles.sectionText}>
              {topic.content || 'Detailed content for this topic will be available soon.'}
            </Text>
          </View>

          {/* Key Points section - only for hardcoded topics */}
          {'keyPoints' in topic && topic.keyPoints && topic.keyPoints.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Points</Text>
              {topic.keyPoints.map((point: string, index: number) => (
                <View key={index} style={styles.keyPoint}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.keyPointText}>{point}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Source section - for API topics */}
          {'source' in topic && topic.source && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Source</Text>
              <Text style={styles.sectionText}>{topic.source}</Text>
              {'url' in topic && topic.url && (
                <TouchableOpacity 
                  onPress={() => topic.url && WebBrowser.openBrowserAsync(topic.url)}
                  style={styles.linkButton}
                >
                  <Text style={styles.linkText}>Read More on {topic.source}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A3C9A8',
  },
  content: {
    padding: 16,
    backgroundColor: '#A3C9A8',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#c3dcc6',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1a1a1a',
    backgroundColor: '#c3dcc6',
  },
  sectionText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    backgroundColor: '#c3dcc6',
  },
  keyPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 16,
    backgroundColor: '#c3dcc6',
  },
  bulletPoint: {
    fontSize: 16,
    marginRight: 8,
    color: '#666',
  },
  keyPointText: {
    flex: 1,
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
    padding: 16,
    backgroundColor: '#c3dcc6',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tag: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  linkButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});