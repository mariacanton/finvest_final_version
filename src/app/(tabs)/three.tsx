import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl } from "react-native";
import { Link } from 'expo-router';
import Colors from '../../constants/Colors';
import { NewsArticle } from '../../types';
import { NewsService } from '../../services/newsService';

const categories = [
  { id: "All", name: "All", icon: "🆕" },
  { id: "World", name: "World", icon: "🌍" },
  { id: "Business", name: "Business", icon: "💼" },
  { id: "Technology", name: "Technology", icon: "💻" },
  { id: "USA", name: "USA", icon: "🇺🇸" },
];

const { width: screenWidth } = Dimensions.get('window');

export default function TabThreeScreen() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [breakingNews, setBreakingNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load breaking news only once
  const loadBreakingNews = async () => {
    try {
      const topHeadlines = await NewsService.getTopHeadlines('us', 5);
      setBreakingNews(topHeadlines);
    } catch (err) {
      console.error('Error loading breaking news:', err);
    }
  };

  // Memoize breaking news section to prevent re-renders during category changes
  const BreakingNewsSection = React.memo(() => (
    <View style={[styles.breakingNewsSection, {
      backgroundColor: '#c3dcc6',
      marginHorizontal: 12,
      borderRadius: 20,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }]}>
      <Text style={[styles.sectionTitle, { marginLeft: 0, marginTop: 0 }]}>Breaking News</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.breakingNewsList, { paddingHorizontal: 0 }]}
      >
        {memoizedBreakingNews.map((article, index) => (
          <BreakingNewsCard key={`${article.url}-${index}`} article={article} />
        ))}
      </ScrollView>
    </View>
  ));

  // Memoize breaking news to prevent re-renders
  const memoizedBreakingNews = React.useMemo(() => breakingNews, [breakingNews]);

  // Load articles by category (separate function for optimization)
  const loadArticlesByCategory = async (category: string, showLoader = true) => {
    try {
      if (showLoader) {
        setArticlesLoading(true);
      }
      setError(null);

      let mainNews: NewsArticle[];
      if (category === "All") {
        mainNews = await NewsService.getFinancialNews(20);
      } else {
        mainNews = await NewsService.getNewsByCategory(category, 20);
      }
      setArticles(mainNews);

    } catch (err) {
      console.error('Error loading articles:', err);
      setError('Failed to load news. Please check your internet connection and try again.');
    } finally {
      setArticlesLoading(false);
    }
  };

  // Full refresh (for pull-to-refresh)
  const loadAllNews = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Load both breaking news and articles
      await Promise.all([
        loadBreakingNews(),
        loadArticlesByCategory(selectedCategory, false)
      ]);

    } catch (err) {
      console.error('Error loading all news:', err);
      setError('Failed to load news. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    loadArticlesByCategory(category, true);
  };

  // Initial load
  useEffect(() => {
    loadAllNews();
  }, []);

  const onRefresh = () => {
    loadAllNews(true);
  };

  const filteredArticles = React.useMemo(() => {
    return articles; // Articles are already filtered by category from the API
  }, [articles]);

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1a1a1a" />
        <Text style={styles.loadingText}>Loading news...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadAllNews()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const BreakingNewsCard = React.memo(({ article }: { article: NewsArticle }) => (
    <Link href={`/news/${encodeURIComponent(article.title)}?url=${encodeURIComponent(article.url)}`} asChild>
      <TouchableOpacity style={styles.breakingNewsCard}>
        <View style={styles.breakingNewsContent}>
          <Text style={styles.breakingNewsTitle} numberOfLines={2}>{article.title}</Text>
          <Text style={styles.breakingNewsSource}>{article.source.name}</Text>
        </View>
        <Image 
          source={{ uri: article.urlToImage }} 
          style={styles.breakingNewsImage}
          // Add these props to prevent image flickering
          resizeMode="cover"
          fadeDuration={0}
        />
      </TouchableOpacity>
    </Link>
  ));

  const ArticleCard = React.memo(({ article }: { article: NewsArticle }) => (
    <Link href={`/news/${encodeURIComponent(article.title)}?url=${encodeURIComponent(article.url)}`} asChild>
      <TouchableOpacity style={styles.articleCard}>
        <Image 
          source={{ uri: article.urlToImage }} 
          style={styles.articleImage}
          resizeMode="cover"
          fadeDuration={0}
        />
        <View style={styles.articleContent}>
          <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
          <Text style={styles.articleSource}>{article.source.name}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  ));

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1a1a1a"
          />
        }
      >
        <BreakingNewsSection />

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleCategoryChange(category.id)}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategory
              ]}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.selectedCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.articlesSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === "All" ? "All News" : `${selectedCategory} News`}
          </Text>
          {articlesLoading ? (
            <View style={styles.articleLoadingContainer}>
              <ActivityIndicator size="small" color="#1a1a1a" />
              <Text style={styles.articleLoadingText}>Loading {selectedCategory.toLowerCase()} news...</Text>
            </View>
          ) : (
            <ScrollView 
              style={styles.articlesList}
              showsVerticalScrollIndicator={false}
            >
              {filteredArticles.map((article, index) => (
                <ArticleCard key={`${article.url}-${index}`} article={article} />
              ))}
            </ScrollView>
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
    flex: 1,
    backgroundColor: '#A3C9A8',
  },
  breakingNewsSection: {
    marginTop: 16,
    backgroundColor: '#A3C9A8',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 12,
    color: '#1a1a1a',
  },
  breakingNewsList: {
    paddingHorizontal: 0,
    backgroundColor: '#c3dcc6',
    gap: 16,  // This will create consistent spacing between items
  },
  breakingNewsCard: {
    width: screenWidth * 0.7,  // Slightly smaller to show more gap
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#c3dcc6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  breakingNewsContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  breakingNewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  breakingNewsSource: {
    fontSize: 12,
    color: '#fff',
  },
  breakingNewsImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 20,
  },
  articlesSection: {
    marginTop: 24,
    paddingBottom: 16,
    backgroundColor: '#A3C9A8',
  },
  articlesList: {
    height: 360,
    backgroundColor: '#A3C9A8',
  },
  articleCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#c3dcc6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  articleImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  articleContent: {
    flex: 1,
    padding: 12,
    backgroundColor: '#c3dcc6',
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  articleSource: {
    fontSize: 12,
    color: '#666',
  },
  categoriesContainer: {
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#A3C9A8',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: '#A3C9A8',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#c3dcc6',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCategory: {
    backgroundColor: Colors.light.tint,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  centerContent: {
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
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#c3dcc6',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  articleLoadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A3C9A8',
  },
  articleLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#1a1a1a',
    textAlign: 'center',
  },
});