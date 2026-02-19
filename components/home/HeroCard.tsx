import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, FONTS, TYPOGRAPHY } from '../../constants/theme';
import type { Post } from '../../store/feed-store';

interface HeroCardProps {
  post: Post;
  onPress?: () => void;
}

export function HeroCard({ post, onPress }: HeroCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.container}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: post.image_url }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)']}
          style={styles.gradient}
        />

        <View style={styles.textContainer}>
          <Text style={styles.title}>{post.title}</Text>
          {post.author_name && (
            <Text style={styles.author}>by {post.author_name}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.screenPadding,
    marginBottom: 16,
    overflow: 'hidden',
    borderRadius: SPACING.heroCardRadius,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 240,
    borderRadius: SPACING.heroCardRadius,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    borderBottomLeftRadius: SPACING.heroCardRadius,
    borderBottomRightRadius: SPACING.heroCardRadius,
  },
  textContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.headlineLarge,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  author: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.regular,
    opacity: 0.9,
  },
});
