import axios from 'axios';

const API_KEY = '42b57b039c544ec48d4c59be0717c419';
const symbols = 'AAPL,TSLA,GOOG,META,IBM,NVDA,AMD';

export async function fetchStockQuotes() {
  try {
    const url = `https://api.twelvedata.com/quote?symbol=${symbols}&apikey=${API_KEY}`;
    const response = await axios.get(url);
    // If multiple symbols, response.data will be an object with each symbol as a key
    return response.data;
  } catch (error) {
    console.error('Error fetching stock quotes:', error);
    return null;
  }
}
