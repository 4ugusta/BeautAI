import React, { useEffect } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  withSequence,
  cancelAnimation,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiPieceProps {
  color: string;
  delay: number;
  startX: number;
  duration: number;
  wobbleAmplitude: number;
  size: { width: number; height: number };
}

function ConfettiPiece({ color, delay, startX, duration, wobbleAmplitude, size }: ConfettiPieceProps) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    // Continuous falling: start above screen, fall past bottom, repeat forever
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-50, { duration: 0 }),
          withTiming(SCREEN_HEIGHT + 100, {
            duration,
            easing: Easing.linear,
          })
        ),
        -1,
        false
      )
    );

    // Side-to-side wobble, continuous
    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(wobbleAmplitude, {
          duration: 800 + Math.random() * 600,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      )
    );

    // Continuous rotation
    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, {
          duration: 1200 + Math.random() * 1200,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );

    // Cleanup: cancel animations on unmount to prevent memory leaks
    return () => {
      cancelAnimation(translateY);
      cancelAnimation(translateX);
      cancelAnimation(rotate);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          backgroundColor: color,
          left: startX,
          width: size.width,
          height: size.height,
          borderRadius: size.width < 6 ? size.width / 2 : 2,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function Confetti() {
  const confettiColors = ['#008080', '#da99a6', '#fff1d0'];

  const pieces = React.useMemo(
    () =>
      Array.from({ length: 60 }).map((_, index) => {
        const shapeRandom = Math.random();
        let pieceSize: { width: number; height: number };
        if (shapeRandom < 0.33) {
          // Small square
          pieceSize = { width: 6, height: 6 };
        } else if (shapeRandom < 0.66) {
          // Rectangle
          pieceSize = { width: 8, height: 14 };
        } else {
          // Elongated strip
          pieceSize = { width: 4, height: 18 };
        }

        return {
          id: index,
          color: confettiColors[index % confettiColors.length],
          delay: Math.random() * 3000,
          startX: Math.random() * SCREEN_WIDTH,
          duration: 3000 + Math.random() * 3000,
          wobbleAmplitude: (Math.random() - 0.5) * 80,
          size: pieceSize,
        };
      }),
    []
  );

  return (
    <View style={styles.container} pointerEvents="none">
      {pieces.map((piece) => (
        <ConfettiPiece
          key={piece.id}
          color={piece.color}
          delay={piece.delay}
          startX={piece.startX}
          duration={piece.duration}
          wobbleAmplitude={piece.wobbleAmplitude}
          size={piece.size}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  confettiPiece: {
    position: 'absolute',
  },
});
