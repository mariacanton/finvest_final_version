import { View, Text } from '../../components/Themed';
import { Stack, useLocalSearchParams } from 'expo-router';
import StockListItem from '../../components/StockListItem';
import Graph from '../../components/Graph';
import { ActivityIndicator, StyleSheet, ScrollView, Pressable, View as RNView } from 'react-native';
import { useState, useEffect } from 'react';
import React from 'react';
import PurchaseModal from '../../components/PurchaseModal';
import { useAuth } from '../../contexts/authContext';
import { AntDesign } from '@expo/vector-icons';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import Colors from '../../constants/Colors';
import { useQuery, gql } from '@apollo/client';

const query = gql`
  query MyQuery($symbol: String) {
    quote(symbol: $symbol) {
      name
      symbol
      exchange
      open
      high
      low
      close
      percent_change
    }
  }
`;

interface QueryResponse {
  quote: {
    name: string;
    symbol: string;
    exchange: string;
    open: string;
    high: string;
    low: string;
    close: string;
    percent_change: string;
  };
}

interface RedditData {
  mentions: number;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  trending: 'High' | 'Medium' | 'Low';
  recentComments: string[];
}

interface Stock {
  name: string;
  symbol: string;
  exchange: string;
  close: string;
  percent_change: string;
  open: string;
  high: string;
  low: string;
}

const StockDetails = () => {
  const { user } = useAuth();
  const { symbol } = useLocalSearchParams();
  const symbolString = Array.isArray(symbol) ? symbol[0] : symbol;
  const [redditData, setRedditData] = useState<RedditData>({
    mentions: 0,
    sentiment: 'Neutral',
    trending: 'Low',
    recentComments: []
  });
  const [loadingReddit, setLoadingReddit] = useState(true);
  const [isPurchaseModalVisible, setIsPurchaseModalVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data, loading: loadingStock, error } = useQuery<QueryResponse>(query, {
    variables: { symbol: symbolString },
  });

  useEffect(() => {
    fetchRedditSentiment();
    loadFavoriteStatus();
  }, [symbolString]);

  const loadFavoriteStatus = async () => {
    if (!user?.uid) return;
    const userDoc = await getDoc(doc(firestore, "users", user.uid));
    const userData = userDoc.data();
    setIsFavorite(userData?.favoriteStocks?.includes(symbolString) || false);
  };

  const fetchRedditSentiment = async () => {
    try {
      setLoadingReddit(true);
      const response = await fetch(
        `https://www.reddit.com/search.json?q=${symbolString}&restrict_sr=1&sort=new&t=day`
      );
      const data = await response.json();
      
      const posts = data.data.children;
      const mentions = posts.length;
      let positiveCount = 0;
      let negativeCount = 0;
      
      const positiveWords = ['buy', 'bull', 'up', 'growth', 'positive', 'good', 'great'];
      const negativeWords = ['sell', 'bear', 'down', 'drop', 'negative', 'bad', 'loss'];

      const recentComments = posts
        .slice(0, 3)
        .map((post: any) => post.data.title)
        .filter((title: string) => title.includes(symbolString));

      posts.forEach((post: any) => {
        const text = (post.data.title + ' ' + (post.data.selftext || '')).toLowerCase();
        positiveWords.forEach(word => {
          if (text.includes(word)) positiveCount++;
        });
        negativeWords.forEach(word => {
          if (text.includes(word)) negativeCount++;
        });
      });

      const sentiment = positiveCount > negativeCount ? 'Bullish' : 
                       negativeCount > positiveCount ? 'Bearish' : 'Neutral';
      const trending = mentions > 20 ? 'High' : mentions > 10 ? 'Medium' : 'Low';

      setRedditData({
        mentions,
        sentiment,
        trending,
        recentComments
      });
    } catch (err) {
      console.error('Error fetching Reddit data:', err);
    } finally {
      setLoadingReddit(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user?.uid) return;

    const userRef = doc(firestore, "users", user.uid);
    try {
      if (isFavorite) {
        await updateDoc(userRef, {
          favoriteStocks: arrayRemove(symbolString)
        });
      } else {
        await updateDoc(userRef, {
          favoriteStocks: arrayUnion(symbolString)
        });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  if (loadingStock) {
    return <ActivityIndicator />;
  }

  if (error) {
    return <Text>Error loading stock details</Text>;
  }

  if (!data?.quote) {
    return <Text>Stock with symbol {symbolString} could not be found</Text>;
  }

  const stock: Stock = {
    name: data.quote.name,
    symbol: data.quote.symbol,
    exchange: data.quote.exchange,
    close: data.quote.close,
    percent_change: data.quote.percent_change,
    open: data.quote.open,
    high: data.quote.high,
    low: data.quote.low,
  };

  const analyzePriceMovement = (stock: Stock) => {
    const close = Number.parseFloat(stock.close);
    const priceChange = Number.parseFloat(stock.percent_change);
    
    const priceMovement = Math.abs(priceChange) < 0.1 ? "Sideways" :
                         priceChange > 0 ? "Upward" : "Downward";
    const movementStrength = Math.abs(priceChange);
    const strength = movementStrength < 1 ? "Weak" :
                    movementStrength < 2 ? "Moderate" : "Strong";

    // Use actual high and low prices for range
    const high = Number.parseFloat(stock.high);
    const low = Number.parseFloat(stock.low);
    const volatility = ((high - low) / close) * 100;
    const volatilityLevel = volatility < 1 ? "Low" :
                           volatility < 2 ? "Medium" : "High";

    return {
      movement: `${strength} ${priceMovement}`,
      volatility: volatilityLevel,
      range: `$${low.toFixed(2)} - $${high.toFixed(2)}`,
      analysis: `Stock is showing ${strength.toLowerCase()} ${priceMovement.toLowerCase()} movement with ${volatilityLevel.toLowerCase()} volatility`
    };
  };

  const technicalAnalysis = analyzePriceMovement(stock);

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: stock.symbol,
          headerBackTitle: 'Stocks',
          headerRight: () => (
            <RNView style={styles.headerButtons}>
              <Pressable onPress={toggleFavorite} style={styles.favoriteButton}>
                <AntDesign 
                  name={isFavorite ? "star" : "staro"} 
                  size={24} 
                  color={isFavorite ? "#FFD700" : "gray"} 
                />
              </Pressable>
              <Pressable
                onPress={() => setIsPurchaseModalVisible(true)}
                style={({ pressed }) => [
                  styles.buyButton,
                  { opacity: pressed ? 0.7 : 1 }
                ]}
              >
                <Text style={styles.buyButtonText}>Buy</Text>
              </Pressable>
            </RNView>
          ),
        }}
      />
      
      {/* Purchase Modal */}
      <PurchaseModal
        isVisible={isPurchaseModalVisible}
        onClose={() => setIsPurchaseModalVisible(false)}
        stockPrice={Number.parseFloat(stock.close)}
        stockSymbol={symbolString}
      />

      <View style={{ padding: 20, backgroundColor: '#A3C9A8' }}>
      <View style={{ gap: 20, backgroundColor: '#A3C9A8' }}>
        <StockListItem stock={stock} hideStarIcon={true} />
        <Graph symbol={stock.symbol} />
      </View>
        
        {/* Price Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.label}>Open</Text>
              <Text style={styles.value}>${Number.parseFloat(stock.open).toFixed(2)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.label}>High</Text>
              <Text style={styles.value}>${Number.parseFloat(stock.high).toFixed(2)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.label}>Low</Text>
              <Text style={styles.value}>${Number.parseFloat(stock.low).toFixed(2)}</Text>
            </View>
          </View>
          <View style={[styles.detailRow, { marginTop: 16 }]}>
            <View style={styles.detailItem}>
              <Text style={styles.label}>Current</Text>
              <Text style={styles.value}>${Number.parseFloat(stock.close).toFixed(2)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.label}>Change</Text>
              <Text style={[styles.value, { 
                color: Number.parseFloat(stock.percent_change) > 0 ? 'green' : 'red' 
              }]}>
                {Number.parseFloat(stock.percent_change) > 0 ? '+' : ''}
                {stock.percent_change}%
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.label}>Exchange</Text>
              <Text style={styles.value}>{stock.exchange}</Text>
            </View>
          </View>
        </View>

        {/* Technical Analysis Section */}
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisTitle}>Technical Analysis</Text>
          <View style={styles.analysisContent}>
            <View style={styles.analysisRow}>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Price Movement</Text>
                <Text style={styles.analysisValue}>{technicalAnalysis.movement}</Text>
              </View>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Volatility</Text>
                <Text style={styles.analysisValue}>{technicalAnalysis.volatility}</Text>
              </View>
            </View>
            <View style={styles.analysisRow}>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Trading Range</Text>
                <Text style={styles.analysisValue}>{technicalAnalysis.range}</Text>
              </View>
            </View>
            <View style={styles.analysisInsight}>
              <Text style={styles.analysisLabel}>Analysis</Text>
              <Text style={styles.analysisText}>{technicalAnalysis.analysis}</Text>
            </View>
          </View>
        </View>

        {/* Reddit Sentiment Section */}
        <View style={styles.sentimentContainer}>
          <Text style={styles.sentimentTitle}>{symbolString} on Reddit (24h)</Text>
          {loadingReddit ? (
            <ActivityIndicator style={{ marginTop: 10 }} />
          ) : (
            <>
              <View style={styles.sentimentRow}>
                <View style={styles.sentimentItem}>
                  <Text style={styles.sentimentLabel}>Mentions</Text>
                  <Text style={styles.sentimentValue}>{redditData.mentions}</Text>
                </View>
                <View style={styles.sentimentItem}>
                  <Text style={styles.sentimentLabel}>Sentiment</Text>
                  <Text style={[
                    styles.sentimentValue,
                    { color: redditData.sentiment === 'Bullish' ? 'green' : 
                            redditData.sentiment === 'Bearish' ? 'red' : '#666' }
                  ]}>
                    {redditData.sentiment}
                  </Text>
                </View>
                <View style={styles.sentimentItem}>
                  <Text style={styles.sentimentLabel}>Trending</Text>
                  <Text style={styles.sentimentValue}>{redditData.trending}</Text>
                </View>
              </View>
              {redditData.recentComments.length > 0 && (
                <View style={styles.commentsContainer}>
                  <Text style={styles.commentsTitle}>Recent Mentions</Text>
                  {redditData.recentComments.map((comment, index) => (
                    <Text key={index} style={styles.commentText} numberOfLines={1}>
                      • {comment}
                    </Text>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A3C9A8',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    marginRight: 16,
  },
  detailsContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#c3dcc6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#c3dcc6',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#c3dcc6',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  analysisContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#c3dcc6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    backgroundColor: '#c3dcc6',
  },
  analysisContent: {
    gap: 16,
    backgroundColor: '#c3dcc6',
    width: '100%',
    alignItems: 'center',
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#c3dcc6',
    width: '100%',
  },
  analysisItem: {
    flex: 1,
    backgroundColor: '#c3dcc6',
    alignItems: 'center',
  },
  analysisLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  analysisValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  analysisInsight: {
    marginTop: 8,
    backgroundColor: '#c3dcc6',
    alignItems: 'center',
    width: '100%',
  },
  analysisText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  sentimentContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#c3dcc6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 12,
    marginBottom: 16,
  },
  sentimentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    backgroundColor: '#c3dcc6',
  },
  sentimentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#c3dcc6',
  },
  sentimentItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#c3dcc6',
  },
  sentimentLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  sentimentValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  commentsContainer: {
    marginTop: 16,
    backgroundColor: '#c3dcc6',
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  buyButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 16,
  },
  buyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default StockDetails;