import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../../constants/theme';
import Avatar1 from '../../assets/icons/onboarding/screen4/Avatar.svg';
import Avatar2 from '../../assets/icons/onboarding/screen4/Avatar-1.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 393;
const CARD_WIDTH = Math.round(314 * scale);
const CARD_HEIGHT = Math.round(CARD_WIDTH * (527 / 314));
const SWIPE_THRESHOLD = 100 * scale;

interface SwipeCardProps {
  vibe: string;
  index: number;
  currentIndex: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export default function SwipeCard({
  vibe,
  index,
  currentIndex,
  onSwipeLeft,
  onSwipeRight,
}: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Reset position when this card is no longer the active card
  // (e.g., after it was swiped away and currentIndex advanced)
  useEffect(() => {
    if (index !== currentIndex) {
      translateX.value = 0;
      translateY.value = 0;
    }
  }, [currentIndex, index, translateX, translateY]);

  const doSwipeRight = React.useCallback(() => {
    onSwipeRight();
  }, [onSwipeRight]);

  const doSwipeLeft = React.useCallback(() => {
    onSwipeLeft();
  }, [onSwipeLeft]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      'worklet';
      if (index === currentIndex) {
        translateX.value = event.translationX;
        translateY.value = event.translationY * 0.2;
      }
    })
    .onEnd((event) => {
      'worklet';
      if (index === currentIndex) {
        if (event.translationX > SWIPE_THRESHOLD) {
          // Swipe right - select this vibe
          translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 }, () => {
            runOnJS(doSwipeRight)();
          });
          translateY.value = withTiming(translateY.value, { duration: 300 });
        } else if (event.translationX < -SWIPE_THRESHOLD) {
          // Swipe left - skip this vibe, card flies off to the left
          translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 }, () => {
            runOnJS(doSwipeLeft)();
          });
          translateY.value = withTiming(translateY.value, { duration: 300 });
        } else {
          // Snap back
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
        }
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const relativeIndex = index - currentIndex;

    // Only show cards that are at or after the current index (up to 3 deep)
    if (relativeIndex < 0 || relativeIndex > 3) {
      return {
        opacity: 0,
        zIndex: -1,
        transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 0.9 }, { rotate: '0deg' }],
      };
    }

    const cardScale = interpolate(
      relativeIndex,
      [0, 1, 2],
      [1, 0.95, 0.9],
      Extrapolation.CLAMP
    );

    const cardTranslateY = interpolate(
      relativeIndex,
      [0, 1, 2],
      [0, 12, 24],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      relativeIndex,
      [0, 1, 2, 3],
      [1, 0.85, 0.7, 0],
      Extrapolation.CLAMP
    );

    const rotation = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-12, 0, 12]
    );

    const isActive = relativeIndex === 0;

    return {
      transform: [
        { translateX: isActive ? translateX.value : 0 },
        { translateY: isActive ? translateY.value : cardTranslateY },
        { scale: cardScale },
        { rotate: isActive ? `${rotation}deg` : '0deg' },
      ],
      opacity,
      zIndex: 100 - index,
    };
  });

  const vibeImages: Record<string, ReturnType<typeof require>> = {
    Natural: require('../../assets/images/vibes/natural.png'),
    Glam: require('../../assets/images/vibes/glam.png'),
    Minimal: require('../../assets/images/vibes/minimal.png'),
    Bold: require('../../assets/images/vibes/bold.png'),
    Classic: require('../../assets/images/vibes/classic.png'),
    Edgy: require('../../assets/images/vibes/edgy.png'),
  };

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.cardOuter, animatedStyle]}>
        <View style={styles.cardInner}>
          <Image
            source={vibeImages[vibe]}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.gradient}
          />

          {/* Avatar stack */}
          <View style={styles.avatarStack}>
            <View style={[styles.avatar, styles.avatarBack]}>
              <Avatar1 width={24 * scale} height={24 * scale} />
            </View>
            <View style={[styles.avatar, styles.avatarFront]}>
              <Avatar2 width={24 * scale} height={24 * scale} />
            </View>
          </View>

          <Text style={styles.labelText}>{vibe}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 32 * scale,
    backgroundColor: COLORS.white,
    // Shadows on the outer wrapper (no overflow hidden)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  cardInner: {
    width: '100%',
    height: '100%',
    borderRadius: 32 * scale,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180 * scale,
  },
  avatarStack: {
    position: 'absolute',
    top: 16 * scale,
    right: 16 * scale,
    flexDirection: 'row',
  },
  avatar: {
    width: 24 * scale,
    height: 24 * scale,
    borderRadius: 12 * scale,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarBack: {
    zIndex: 0,
  },
  avatarFront: {
    marginLeft: -6 * scale,
    zIndex: 1,
  },
  labelText: {
    position: 'absolute',
    bottom: 32 * scale,
    alignSelf: 'center',
    color: '#FFFFFF',
    fontSize: 40 * scale,
    fontFamily: FONTS.bold,
    lineHeight: 44 * scale,
    letterSpacing: -1.6,
    textAlign: 'center',
    width: '100%',
  },
});
