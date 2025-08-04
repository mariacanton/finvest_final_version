import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from '../components/useColorScheme';
import { ApolloProvider } from '@apollo/client';
import { AuthProvider } from '../contexts/authContext';
import client from '../apollo/client';
import { View } from 'react-native';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
  "(tabs)": {
    initialRouteName: "four"
  }
};
LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    const prepare = async () => {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Promise.all([]);
      } catch (e) {
        console.warn(e);
      } finally {
        // Only hide the splash screen once loading is complete
        if (loaded) {
          await SplashScreen.hideAsync();
        }
      }
    };

    prepare();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ApolloProvider client={client}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: '#A3C9A8', // Light green background
              },
              headerTitleAlign: 'center',
              headerTitleStyle: {
                fontSize: 22,
                fontWeight: '700',
                color: '#1A1A1A',            // Dark, readable text
              },
              headerTintColor: '#1A1A1A',     // Back button & icon color
              contentStyle: {
                backgroundColor: '#A3C9A8',   // Global background color
              },
              headerShadowVisible: false,     // Optional: remove bottom line shadow
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth/welcome" options={{ headerShown: false }} />
            <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
            <Stack.Screen name="auth/register" options={{ headerShown: false }} />
            <Stack.Screen name="stocks/[symbol]" options={{ title: 'Stock Details' }} />
            <Stack.Screen name="profile/profile_edit" options={{ title: 'Edit Profile' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </ApolloProvider>
    </GestureHandlerRootView>
  );
}

