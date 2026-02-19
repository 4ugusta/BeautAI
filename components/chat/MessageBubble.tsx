import { View, Text, StyleSheet, Dimensions } from 'react-native';
import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, FONTS, TYPOGRAPHY } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 393;

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

function BlinkingCursor() {
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0, { duration: 600 }),
      -1,
      true
    );
    return () => {
      opacity.value = 0.6;
    };
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.cursor, animatedStyle]}>
      {'|'}
    </Animated.Text>
  );
}

export default function MessageBubble({ role, content, isStreaming = false }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.containerUser : styles.containerAI]}>
      <View style={[styles.bubble, { backgroundColor: isUser ? COLORS.chatUser : COLORS.chatAI }]}>
        <Text style={styles.text}>
          {content}
          {isStreaming && <BlinkingCursor />}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12 * scale,
    maxWidth: '80%',
  },
  containerUser: {
    alignSelf: 'flex-end',
  },
  containerAI: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 16 * scale,
    padding: 12 * scale,
  },
  text: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.bodySmall * scale,
    fontFamily: FONTS.regular,
    lineHeight: 15.6 * scale,
    letterSpacing: -0.3,
  },
  cursor: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: TYPOGRAPHY.bodySmall * scale,
    fontFamily: FONTS.regular,
  },
});
