// Financial Education API Service
// Fetches educational content from multiple APIs

const ALPHA_VANTAGE_API_KEY = process.env.EXPO_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo';
const UNSPLASH_ACCESS_KEY = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY || 'gUwfa4GSLjdTHNOW9MFMkWbW5gnr6DUsiqXHjie-Yrs';

export interface APIEducationalTopic {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  source: string;
  image?: string;
  url?: string;
}

export interface APIResponse {
  success: boolean;
  data: APIEducationalTopic[];
  error?: string;
}

// Financial topics to search for via APIs
const FINANCIAL_TOPICS_TO_FETCH = [
  { term: 'Stock Market', category: 'Stocks', keywords: ['stock', 'market', 'trading'] },
  { term: 'Portfolio Diversification', category: 'Investment Strategies', keywords: ['portfolio', 'diversification'] },
  { term: 'ETF Exchange Traded Fund', category: 'ETFs', keywords: ['etf', 'fund', 'investment'] },
  { term: 'Bond Investment', category: 'Bonds', keywords: ['bond', 'fixed income', 'investment'] },
  { term: 'Options Trading', category: 'Options', keywords: ['options', 'derivatives', 'trading'] },
  { term: 'Dollar Cost Averaging', category: 'Investment Strategies', keywords: ['investment', 'strategy'] },
  { term: 'Market Volatility', category: 'Stocks', keywords: ['volatility', 'market', 'risk'] },
  { term: 'Price Earnings Ratio', category: 'Stocks', keywords: ['valuation', 'analysis', 'stocks'] },
  { term: 'Compound Interest', category: 'Investment Strategies', keywords: ['finance', 'interest', 'growth'] },
  { term: 'Risk Management', category: 'Investment Strategies', keywords: ['risk', 'management', 'investment'] },
];

class FinancialEducationAPI {
  private static cache: Map<string, { data: APIEducationalTopic[]; timestamp: number }> = new Map();
  private static CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Get educational content from Wikipedia API
  private static async getWikipediaContent(searchTerm: string): Promise<{ title: string; content: string; url: string } | null> {
    try {
      console.log('Fetching Wikipedia content for:', searchTerm);
      
      // Search for the page
      const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`;
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.type === 'disambiguation' || !data.extract) {
        return null;
      }
      
      return {
        title: data.title,
        content: data.extract,
        url: data.content_urls?.desktop?.page || ''
      };
    } catch (error) {
      console.warn('Failed to fetch from Wikipedia:', error);
      return null;
    }
  }

  // Get image for topic from Unsplash
  private static async getTopicImage(keywords: string[]): Promise<string> {
    try {
      const query = keywords.join(',');
      const response = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_ACCESS_KEY}&w=400&h=300&orientation=landscape`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.urls?.regular) {
          return data.urls.regular;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch image from Unsplash:', error);
    }
    
    // Fallback to local image
    return '../../../assets/images/topics-image.png';
  }

  // Enhanced content with financial context
  private static enhanceContent(content: string, category: string): string {
    const enhancements: Record<string, string> = {
      'Stocks': '\n\nKey Stock Market Concepts:\n• Market capitalization\n• Dividends and yield\n• Bull and bear markets\n• Stock valuation methods',
      'ETFs': '\n\nETF Benefits:\n• Instant diversification\n• Lower fees than mutual funds\n• Liquidity and flexibility\n• Tax efficiency',
      'Bonds': '\n\nBond Fundamentals:\n• Fixed income security\n• Interest rate risk\n• Credit rating importance\n• Duration and maturity',
      'Options': '\n\nOptions Basics:\n• Call and put options\n• Strike price and expiration\n• Risk and reward profiles\n• Options strategies',
      'Investment Strategies': '\n\nSmart Investing Tips:\n• Start early and invest regularly\n• Diversify across asset classes\n• Understand your risk tolerance\n• Think long-term'
    };

    return content + (enhancements[category] || '');
  }

  // Get all educational topics from APIs
  static async getEducationalTopics(category?: string): Promise<APIResponse> {
    try {
      const cacheKey = `api_education_${category || 'all'}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return { success: true, data: cached.data };
      }

      console.log('Fetching educational topics from APIs...');
      
      // Filter topics by category if specified
      let topicsToFetch = FINANCIAL_TOPICS_TO_FETCH;
      if (category && category !== 'All') {
        topicsToFetch = FINANCIAL_TOPICS_TO_FETCH.filter(topic => topic.category === category);
      }

      // Fetch content for each topic
      const topics: APIEducationalTopic[] = [];
      
      for (let i = 0; i < topicsToFetch.length; i++) {
        const topicInfo = topicsToFetch[i];
        
        try {
          // Get Wikipedia content
          const wikiContent = await this.getWikipediaContent(topicInfo.term);
          
          if (wikiContent) {
            // Get image
            const image = await this.getTopicImage(topicInfo.keywords);
            
            // Create topic
            const topic: APIEducationalTopic = {
              id: `api_${i + 1}`,
              title: wikiContent.title,
              description: wikiContent.content.substring(0, 150) + '...',
              content: this.enhanceContent(wikiContent.content, topicInfo.category),
              tags: [topicInfo.category],
              source: 'Wikipedia',
              image: image,
              url: wikiContent.url
            };
            
            topics.push(topic);
          }
          
          // Rate limiting - wait between requests
          if (i < topicsToFetch.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.warn(`Failed to fetch topic ${topicInfo.term}:`, error);
        }
      }

      // Cache results
      this.cache.set(cacheKey, { data: topics, timestamp: Date.now() });
      
      return { success: true, data: topics };
    } catch (error: any) {
      console.error('Error fetching educational topics from APIs:', error);
      return { 
        success: false, 
        data: [], 
        error: error.message || 'Failed to fetch educational content' 
      };
    }
  }

  // Search topics
  static async searchTopics(query: string): Promise<APIResponse> {
    try {
      const allTopics = await this.getEducationalTopics();
      
      if (!allTopics.success) {
        return allTopics;
      }

      const searchResults = allTopics.data.filter(topic =>
        topic.title.toLowerCase().includes(query.toLowerCase()) ||
        topic.description.toLowerCase().includes(query.toLowerCase()) ||
        topic.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );

      return { success: true, data: searchResults };
    } catch (error: any) {
      console.error('Error searching API topics:', error);
      return { 
        success: false, 
        data: [], 
        error: error.message || 'Failed to search topics' 
      };
    }
  }

  // Get topic by title
  static async getTopicByTitle(title: string): Promise<APIEducationalTopic | null> {
    try {
      const allTopics = await this.getEducationalTopics();
      
      if (allTopics.success) {
        return allTopics.data.find(t => t.title === title) || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching topic by title:', error);
      return null;
    }
  }
}

export { FinancialEducationAPI };
