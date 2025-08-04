import axios from 'axios';

const API_KEY = '42b57b039c544ec48d4c59be0717c419';

export async function fetchEtfs() {
  try {
    const url = `https://api.twelvedata.com/etf?apikey=${API_KEY}`;
    const response = await axios.get(url);
    // response.data.data is an array of ETF objects
    return response.data.data;
  } catch (error) {
    console.error('Error fetching ETF data:', error);
    return [];
  }
}
