import { NewsArticle } from '../types';
import fallbackNewsData from '../../assets/data/news.json';

const NEWS_API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY || 'c05fc8517c5140a0aaa86806a85f6886';
const BASE_URL = 'https://newsapi.org/v2';

export interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsApiArticle[];
}

interface NewsApiArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    id: string;
    name: string;
  };
  content: string;
}

// Category mapping for NewsAPI
const CATEGORY_MAPPING: { [key: string]: string } = {
  'All': '',
  'Business': 'business',
  'Technology': 'technology',
  'World': 'general',
  'USA': 'general'
};

export class NewsService {
  // Simple cache to avoid redundant API calls
  private static cache: Map<string, { data: NewsArticle[]; timestamp: number }> = new Map();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static BREAKING_NEWS_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for breaking news

  private static getCacheKey(method: string, params: any): string {
    return `${method}_${JSON.stringify(params)}`;
  }

  private static getCachedData(cacheKey: string, customDuration?: number): NewsArticle[] | null {
    const cached = this.cache.get(cacheKey);
    const duration = customDuration || this.CACHE_DURATION;
    if (cached && Date.now() - cached.timestamp < duration) {
      return cached.data;
    }
    return null;
  }

  private static setCachedData(cacheKey: string, data: NewsArticle[]): void {
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
  }

  private static async makeRequest(endpoint: string): Promise<NewsApiResponse> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}&apiKey=${NEWS_API_KEY}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('NewsAPI request failed:', error);
      throw error;
    }
  }

  private static transformArticle(article: NewsApiArticle): NewsArticle {
    return {
      title: article.title || 'No title',
      description: article.description || 'No description available',
      url: article.url,
      urlToImage: article.urlToImage || 'https://via.placeholder.com/400x200?text=No+Image',
      publishedAt: article.publishedAt,
      source: {
        name: article.source.name || 'Unknown Source'
      },
      content: article.content || article.description || 'No content available',
      tags: ['Latest'] // We'll add more sophisticated tagging later
    };
  }

  private static getFallbackNews(category: string, count: number = 10): NewsArticle[] {
    const fallbackArticles = fallbackNewsData.articles as NewsArticle[];
    
    if (category === 'All') {
      return fallbackArticles.slice(0, count);
    }
    
    return fallbackArticles
      .filter(article => 
        article.tags && article.tags.some(tag => 
          tag.toLowerCase() === category.toLowerCase()
        )
      )
      .slice(0, count);
  }

  // Test API connectivity
  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/everything?q=test&pageSize=1&apiKey=${NEWS_API_KEY}`);
      return response.ok;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }

  // Get top headlines for breaking news section
  static async getTopHeadlines(country: string = 'us', pageSize: number = 10): Promise<NewsArticle[]> {
    const cacheKey = this.getCacheKey('getTopHeadlines', { country, pageSize });
    const cachedData = this.getCachedData(cacheKey, this.BREAKING_NEWS_CACHE_DURATION);
    if (cachedData) {
      console.log('Using cached breaking news data');
      return cachedData;
    }

    try {
      const endpoint = `/top-headlines?country=${country}&pageSize=${pageSize}`;
      const response = await this.makeRequest(endpoint);
      
      const articles = response.articles
        .filter(article => article.title && article.urlToImage)
        .map(this.transformArticle);

      this.setCachedData(cacheKey, articles);

      return articles;
    } catch (error) {
      console.error('Error fetching top headlines, using fallback:', error);
      return this.getFallbackNews('All', pageSize);
    }
  }

  // Get business news for main news feed
  static async getBusinessNews(pageSize: number = 20): Promise<NewsArticle[]> {
    const cacheKey = this.getCacheKey('getBusinessNews', { pageSize });
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const endpoint = `/top-headlines?category=business&country=us&pageSize=${pageSize}`;
      const response = await this.makeRequest(endpoint);
      
      const articles = response.articles
        .filter(article => article.title && article.urlToImage)
        .map(article => ({
          ...this.transformArticle(article),
          tags: ['Latest', 'Business']
        }));

      this.setCachedData(cacheKey, articles);

      return articles;
    } catch (error) {
      console.error('Error fetching business news, using fallback:', error);
      return this.getFallbackNews('Business', pageSize);
    }
  }

  // Get news by category
  static async getNewsByCategory(category: string, pageSize: number = 20): Promise<NewsArticle[]> {
    const cacheKey = this.getCacheKey('getNewsByCategory', { category, pageSize });
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const apiCategory = CATEGORY_MAPPING[category];
      
      if (!apiCategory && category !== 'All') {
        // If category is not mapped, search for it as a keyword
        return this.searchNews(category, pageSize);
      }

      let endpoint: string;
      if (category === 'All') {
        // Get mix of business and technology news for "All"
        endpoint = `/everything?q=finance OR stock OR market OR business&sortBy=publishedAt&pageSize=${pageSize}`;
      } else if (category === 'USA') {
        endpoint = `/top-headlines?country=us&pageSize=${pageSize}`;
      } else {
        endpoint = `/top-headlines?category=${apiCategory}&country=us&pageSize=${pageSize}`;
      }
      
      const response = await this.makeRequest(endpoint);
      
      const articles = response.articles
        .filter(article => article.title && article.urlToImage)
        .map(article => ({
          ...this.transformArticle(article),
          tags: ['Latest', category]
        }));

      this.setCachedData(cacheKey, articles);

      return articles;
    } catch (error) {
      console.error(`Error fetching ${category} news:`, error);
      return [];
    }
  }

  // Search news by keyword
  static async searchNews(query: string, pageSize: number = 20): Promise<NewsArticle[]> {
    const cacheKey = this.getCacheKey('searchNews', { query, pageSize });
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const endpoint = `/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=${pageSize}`;
      const response = await this.makeRequest(endpoint);
      
      const articles = response.articles
        .filter(article => article.title && article.urlToImage)
        .map(article => ({
          ...this.transformArticle(article),
          tags: ['Latest', 'Search']
        }));

      this.setCachedData(cacheKey, articles);

      return articles;
    } catch (error) {
      console.error('Error searching news:', error);
      return [];
    }
  }

  // Get financial/stock market specific news
  static async getFinancialNews(pageSize: number = 20): Promise<NewsArticle[]> {
    const cacheKey = this.getCacheKey('getFinancialNews', { pageSize });
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const financialKeywords = 'stocks OR "stock market" OR trading OR investment OR "financial market" OR economy';
      const endpoint = `/everything?q=${encodeURIComponent(financialKeywords)}&sortBy=publishedAt&pageSize=${pageSize}`;
      const response = await this.makeRequest(endpoint);
      
      const articles = response.articles
        .filter(article => article.title && article.urlToImage)
        .map(article => ({
          ...this.transformArticle(article),
          tags: ['Latest', 'Business', 'Finance']
        }));

      this.setCachedData(cacheKey, articles);

      return articles;
    } catch (error) {
      console.error('Error fetching financial news:', error);
      return [];
    }
  }

  // Fallback to local news data
  static getLocalNewsData(): NewsArticle[] {
    try {
      return fallbackNewsData.articles as NewsArticle[];
    } catch (error) {
      console.error('Error processing local news data:', error);
      return [];
    }
  }

  // Get article details by URL (for news detail page)
  static async getArticleByUrl(url: string): Promise<NewsArticle | null> {
    try {
      // First, check all cached data for the article
      for (const [cacheKey, cachedData] of this.cache) {
        const article = cachedData.data.find(a => a.url === url);
        if (article) {
          console.log('Found article in cache');
          return article;
        }
      }

      // If not found in cache, search for it
      const searchResult = await this.searchNews(url, 1);
      return searchResult.length > 0 ? searchResult[0] : null;
    } catch (error) {
      console.error('Error fetching article details:', error);
      return null;
    }
  }

  // Get article details by title (fallback method)
  static getArticleByTitle(title: string): NewsArticle | null {
    try {
      // Check all cached data for the article
      for (const [cacheKey, cachedData] of this.cache) {
        const article = cachedData.data.find(a => a.title === title);
        if (article) {
          console.log('Found article by title in cache');
          return article;
        }
      }

      // Fallback to local data
      const fallbackArticles = fallbackNewsData.articles as NewsArticle[];
      return fallbackArticles.find(a => a.title === title) || null;
    } catch (error) {
      console.error('Error finding article by title:', error);
      return null;
    }
  }
}
