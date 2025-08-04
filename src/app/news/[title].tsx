import { View, Text } from '../../components/Themed';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { NewsArticle } from '../../types';
import { NewsService } from '../../services/newsService';
import * as WebBrowser from 'expo-web-browser';

export default function NewsArticleScreen() {
  const { title, url } = useLocalSearchParams();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const decodedTitle = decodeURIComponent(title as string);
  const articleUrl = url ? decodeURIComponent(url as string) : null;

  // Configure WebBrowser to warm up for better performance
  useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  // Ensure the screen state is maintained when returning from browser
  useFocusEffect(
    useCallback(() => {
      // This will be called when the screen comes into focus
      // Helps maintain the app state when returning from WebBrowser
      console.log('News detail screen focused');
    }, [])
  );

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        let foundArticle: NewsArticle | null = null;

        // First try to find by URL if available (more reliable)
        if (articleUrl) {
          foundArticle = await NewsService.getArticleByUrl(articleUrl);
        }

        // If not found by URL, try by title in cache
        if (!foundArticle) {
          foundArticle = NewsService.getArticleByTitle(decodedTitle);
        }

        // If still not found, try to search for it
        if (!foundArticle) {
          const searchResults = await NewsService.searchNews(decodedTitle.split(' ').slice(0, 3).join(' '), 5);
          foundArticle = searchResults.find(a => a.title === decodedTitle) || searchResults[0] || null;
        }

        setArticle(foundArticle);
        
        if (!foundArticle) {
          setError('Article not found');
        }
      } catch (err) {
        console.error('Error loading article:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [decodedTitle, articleUrl]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen
          options={{
            title: 'Loading...',
            headerBackTitle: 'News',
            headerStyle: {
              backgroundColor: '#A3C9A8',
            },
            headerShadowVisible: false,
          }}
        />
        <ActivityIndicator size="large" color="#1a1a1a" />
        <Text style={styles.loadingText}>Loading article...</Text>
      </View>
    );
  }

  if (error || !article) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen
          options={{
            title: 'Article Not Found',
            headerBackTitle: 'News',
            headerStyle: {
              backgroundColor: '#A3C9A8',
            },
            headerShadowVisible: false,
          }}
        />
        <Text style={styles.errorText}>{error || 'Article not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen
        options={{
          title: decodedTitle,
          headerBackTitle: 'News',
          headerStyle: {
            backgroundColor: '#A3C9A8',
          },
          headerShadowVisible: false,
        }}
      />
      
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: article.urlToImage }}
          style={styles.image}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{article.title}</Text>
        
        <View style={styles.sourceInfo}>
          <View style={styles.sourceContainer}>
            <Text style={styles.sourceLabel}>Source</Text>
            <Text style={styles.source}>{article.source.name}</Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Published</Text>
            <Text style={styles.date}>
              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </Text>
          </View>
        </View>

        <Text style={styles.description}>{article.description}</Text>
        
        {/* Show content if available, otherwise show description again */}
        <Text style={styles.articleContent}>
          {article.content && article.content !== article.description 
            ? article.content.replace(/\[\+\d+\s*chars\]$/, '') // Remove NewsAPI truncation indicator
            : article.description
          }
        </Text>

        {/* Read More Button */}
        <TouchableOpacity 
          style={styles.readMoreButton} 
          onPress={async () => {
            try {
              const result = await WebBrowser.openBrowserAsync(article.url, {
                presentationStyle: WebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
                controlsColor: '#A3C9A8',
                toolbarColor: '#A3C9A8',
                showTitle: true,
                enableBarCollapsing: true,
                showInRecents: false, // Don't show in recent apps to avoid confusion
              });
              
              // Log the result for debugging (optional)
              console.log('WebBrowser result:', result);
              
              // The browser was dismissed, the app should be back to normal state
              if (result.type === 'dismiss') {
                console.log('Browser was dismissed, app should be back to normal');
              }
            } catch (error) {
              console.error('Error opening article:', error);
              Alert.alert('Error', 'Could not open the article link');
            }
          }}
          onLongPress={async () => {
            try {
              await Clipboard.setStringAsync(article.url);
              Alert.alert('Copied', 'Article URL copied to clipboard');
            } catch (error) {
              console.error('Error copying to clipboard:', error);
              Alert.alert('Error', 'Could not copy URL to clipboard');
            }
          }}
        >
          <Text style={styles.readMoreText}>Read Full Article</Text>
        </TouchableOpacity>
        
        <Text style={styles.hintText}>💡 Long press to copy URL</Text>

        {/* Show tags if available */}
        {article.tags && article.tags.length > 0 && (
          <View style={styles.tags}>
            {article.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      
      {/* Add bottom padding for better scrolling */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A3C9A8',
  },
  imageContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#c3dcc6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#c3dcc6',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a1a1a',
    lineHeight: 32,
  },
  sourceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: '#A3C9A8',
    padding: 16,
    borderRadius: 20,
  },
  sourceContainer: {
    flex: 1,
    backgroundColor: '#A3C9A8',
  },
  dateContainer: {
    flex: 1,
    alignItems: 'flex-end',
    backgroundColor: '#A3C9A8',
  },
  sourceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  source: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  date: {
    fontSize: 15,
    color: '#1a1a1a',
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  articleContent: {
    fontSize: 16,
    lineHeight: 26,
    color: '#333',
    marginBottom: 24,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    backgroundColor: '#c3dcc6',
  },
  tag: {
    backgroundColor: '#A3C9A8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tagText: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginHorizontal: 20,
    lineHeight: 24,
  },
  readMoreButton: {
    backgroundColor: '#A3C9A8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 24,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  readMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
});