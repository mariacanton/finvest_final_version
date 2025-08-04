// YouTube Service for fetching channel profile pictures
export interface YouTubeChannel {
  id: string;
  username: string;
  link: string;
  profileImage?: string;
}

export class YouTubeService {
  private static YOUTUBE_API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;
  private static UNSPLASH_ACCESS_KEY = 'gUwfa4GSLjdTHNOW9MFMkWbW5gnr6DUsiqXHjie-Yrs';
  private static cache: Map<string, { url: string; timestamp: number }> = new Map();
  private static CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Extract channel ID or username from YouTube URL
  private static extractChannelIdentifier(url: string): { type: string; id: string } | null {
    try {
      const patterns = [
        { regex: /youtube\.com\/@([^\/\?]+)/, type: 'handle' },
        { regex: /youtube\.com\/channel\/([^\/\?]+)/, type: 'channel' },
        { regex: /youtube\.com\/c\/([^\/\?]+)/, type: 'custom' },
        { regex: /youtube\.com\/user\/([^\/\?]+)/, type: 'user' },
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern.regex);
        if (match) {
          return { type: pattern.type, id: match[1] };
        }
      }
    } catch (error) {
      console.warn('Error extracting channel ID from URL:', url, error);
    }
    return null;
  }

  // Try to get channel info from YouTube Data API
  private static async getChannelFromAPI(identifier: { type: string; id: string }): Promise<string | null> {
    if (!this.YOUTUBE_API_KEY) return null;

    try {
      let apiUrl = '';
      
      if (identifier.type === 'channel') {
        apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${identifier.id}&key=${this.YOUTUBE_API_KEY}`;
      } else if (identifier.type === 'handle') {
        apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${identifier.id}&key=${this.YOUTUBE_API_KEY}`;
      } else {
        apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername=${identifier.id}&key=${this.YOUTUBE_API_KEY}`;
      }

      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          const thumbnails = data.items[0].snippet?.thumbnails;
          // Prefer higher quality images
          const imageUrl = thumbnails?.high?.url || 
                          thumbnails?.medium?.url || 
                          thumbnails?.default?.url;
          
          if (imageUrl) {
            return imageUrl;
          }
        }
      }
    } catch (error) {
      console.warn('YouTube API request failed:', error);
    }
    
    return null;
  }

  // Fallback to Unsplash for generic profile images
  private static async getFallbackImage(username: string): Promise<string | null> {
    try {
      const searchQuery = `${username.replace('@', '')} person portrait`;
      const response = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(searchQuery)}&client_id=${this.UNSPLASH_ACCESS_KEY}&w=200&h=200&orientation=squarish`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.urls?.small) {
          return data.urls.small;
        }
      }
    } catch (error) {
      console.warn('Unsplash fallback failed:', error);
    }
    return null;
  }

  // Main function to get channel profile image
  static async getChannelProfileImage(channel: YouTubeChannel): Promise<string | null> {
    const cacheKey = `${channel.id}-${channel.link}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.url;
    }

    try {
      const identifier = this.extractChannelIdentifier(channel.link);
      if (!identifier) {
        console.warn(`Could not extract channel identifier from: ${channel.link}`);
        return null;
      }

      // Try YouTube API first
      const apiImage = await this.getChannelFromAPI(identifier);
      if (apiImage) {
        this.cache.set(cacheKey, { url: apiImage, timestamp: Date.now() });
        return apiImage;
      }

      // Fallback to Unsplash
      const fallbackImage = await this.getFallbackImage(channel.username);
      if (fallbackImage) {
        this.cache.set(cacheKey, { url: fallbackImage, timestamp: Date.now() });
        return fallbackImage;
      }

    } catch (error) {
      console.warn(`Failed to get profile image for ${channel.username}:`, error);
    }

    return null;
  }

  // Batch load multiple channel images
  static async loadChannelImages(channels: YouTubeChannel[]): Promise<Record<string, string>> {
    console.log(`Loading profile images for ${channels.length} channels...`);
    
    const imagePromises = channels.map(async (channel) => {
      const imageUrl = await this.getChannelProfileImage(channel);
      return imageUrl ? { id: channel.id, url: imageUrl } : null;
    });

    try {
      const results = await Promise.all(imagePromises);
      const channelImages: Record<string, string> = {};
      
      results.forEach((result) => {
        if (result) {
          channelImages[result.id] = result.url;
        }
      });

      console.log(`Successfully loaded ${Object.keys(channelImages).length} channel images`);
      return channelImages;
    } catch (error) {
      console.warn('Error in batch loading channel images:', error);
      return {};
    }
  }
}
