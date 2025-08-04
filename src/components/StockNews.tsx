import { StyleSheet, FlatList } from 'react-native';
import { View, Text } from '../components/Themed';
import { useQuery } from '@apollo/client';
import { GET_STOCK_NEWS } from '@/graphql/queries';

interface StockNewsProps {
  symbol: string;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  url: string;
}

export default function StockNews({ symbol }: StockNewsProps) {
  const { loading, error, data } = useQuery(GET_STOCK_NEWS, {
    variables: { symbol },
  });

  if (loading) return <View style={styles.container} />;
  if (error) return <View style={styles.container} />;

  const renderItem = ({ item }: { item: NewsItem }) => (
    <View style={styles.newsItem}>
      <Text style={styles.title}>{item.title}</Text>
      <View style={styles.metaInfo}>
        <Text style={styles.source}>{item.source}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Latest News</Text>
      <FlatList
        data={data?.stockNews || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  newsItem: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  source: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
}); 