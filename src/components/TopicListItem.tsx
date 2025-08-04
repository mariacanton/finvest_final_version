import { Text, View } from './Themed';
import { MonoText } from './StyledText';
import { StyleSheet, Pressable } from 'react-native';
import Colors from '../constants/Colors';
import { AntDesign } from '@expo/vector-icons';
import { Link } from 'expo-router';

type Topic = {
  title: string;
  description: string;
  image: string;
  percent_change: string;
};

type TopicListItem = {
  topic: Topic;
};
