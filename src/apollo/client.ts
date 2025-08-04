import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
} from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://margemdotega.eu-central-a.ibm.stepzen.net/api/binging-rottweiler/__graphql',
  cache: new InMemoryCache(),
  headers: {
    Authorization:
      'Apikey margemdotega::local.net+1000::e5fa18b6092b619dbc0f818d1ef5039f7d2cf876c1cbd3fe0b85df125de6c5b2',
  },
});

export default client;

