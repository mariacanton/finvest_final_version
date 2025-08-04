import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { AntDesign } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { Pressable, View } from 'react-native';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';
import { useClientOnlyValue } from '../../components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={{ flex: 1, backgroundColor: '#A3C9A8' }}>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#A3C9A8',
            borderTopColor: '#fff',
            borderTopWidth: 0.5,
          },
          tabBarActiveBackgroundColor: '#c3dcc6',
          tabBarActiveTintColor: '#1A1A1A',
          tabBarInactiveTintColor: '#444',
          headerStyle: {
            backgroundColor: '#A3C9A8',
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '700',
            color: '#1A1A1A',
          },
          headerTintColor: '#1A1A1A',
        }}
        initialRouteName="four" // Set wallet as initial tab
      >
        <Tabs.Screen
          name="one"
          options={{
            title: 'Stocks',
            tabBarIcon: ({ color }) => <TabBarIcon name="dollar" color={color} />,
            headerRight: () => (
              <Link href="modal" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="info-circle"
                      size={25}
                      color={Colors[colorScheme ?? 'light'].text}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            ),
          }}
        />
        <Tabs.Screen
          name="two"
          options={{
            title: 'Learn',
            tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
            headerRight: () => (
              <Link href="modal" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="info-circle"
                      size={25}
                      color={Colors[colorScheme ?? 'light'].text}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            ),
          }}
        />
        <Tabs.Screen
          name="three"
          options={{
            title: 'News',
            tabBarIcon: ({ color }) => <TabBarIcon name="newspaper-o" color={color} />,
            headerRight: () => (
              <Link href="modal" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="info-circle"
                      size={25}
                      color={Colors[colorScheme ?? 'light'].text}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            ),
          }}
        />
        <Tabs.Screen
          name="four"
          options={{
            title: 'Wallet',
            tabBarIcon: ({ color }) => (
              <AntDesign name="wallet" size={24} color={color} />
            ),
            headerRight: () => (
              <Link href="modal" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="info-circle"
                      size={25}
                      color={Colors[colorScheme ?? 'light'].text}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            ),
          }}
        />
        <Tabs.Screen
          name="five"
          options={{
            title: 'User',
            tabBarIcon: ({ color }) => (
              <AntDesign name="user" size={24} color={color} />
            ),
            headerRight: () => (
              <Link href="modal" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="info-circle"
                      size={25}
                      color={Colors[colorScheme ?? 'light'].text}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
