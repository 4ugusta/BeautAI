import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { TapGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { SPACING, COLORS, FONTS, TYPOGRAPHY } from '../../constants/theme';
import type { Post } from '../../store/feed-store';

interface ContentCardProps {
  post: Post;
  onPress?: () => void;
  onDoubleTap?: () => void;
}

export function ContentCard({ post, onPress, onDoubleTap }: ContentCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleDoubleTap = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });

    if (onDoubleTap) {
      runOnJS(onDoubleTap)();
    }
    runOnJS(setIsLiked)(true);

    setTimeout(() => {
      setIsLiked(false);
    }, 1000);
  };

  return (
    <TapGestureHandler numberOfTaps={2} onActivated={handleDoubleTap}>
      <Animated.View style={animatedStyle}>
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

            {isLiked && (
              <View style={styles.likeOverlay}>
                <View style={styles.likeCircle}>
                  <Text style={styles.likeIcon}>♥</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {post.title}
            </Text>

            <View style={styles.metaContainer}>
              {post.author_name && (
                <Text style={styles.author}>{post.author_name}</Text>
              )}

              {post.like_count > 0 && (
                <Text style={styles.likeCount}>{post.like_count} likes</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </TapGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    overflow: 'hidden',
    borderRadius: SPACING.cardImageRadius,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: SPACING.cardImageRadius,
  },
  likeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeIcon: {
    color: '#FFFFFF',
    fontSize: 36,
  },
  infoContainer: {
    marginTop: 8,
  },
  title: {
    fontSize: TYPOGRAPHY.cardTitle,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  author: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  likeCount: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
});
