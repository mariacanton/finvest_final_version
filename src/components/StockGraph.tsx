import { StyleSheet, Dimensions } from 'react-native';
import { View } from '../components/Themed';
import { LineChart } from 'react-native-chart-kit';
import { useQuery } from '@apollo/client';
import { GET_STOCK_HISTORY } from '@/graphql/queries';

interface StockGraphProps {
  symbol: string;
}

export default function StockGraph({ symbol }: StockGraphProps) {
  const { loading, error, data } = useQuery(GET_STOCK_HISTORY, {
    variables: { symbol },
  });

  if (loading) return <View style={styles.container} />;
  if (error) return <View style={styles.container} />;

  const chartData = {
    labels: data?.stockHistory?.map((item: any) => item.date) || [],
    datasets: [
      {
        data: data?.stockHistory?.map((item: any) => Number(item.close)) || [],
      },
    ],
  };

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 32}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#c3dcc6',
    borderRadius: 20,
    marginHorizontal: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: '#c3dcc6',
  },
});