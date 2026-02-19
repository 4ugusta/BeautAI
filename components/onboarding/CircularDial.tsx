import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, FONTS, TYPOGRAPHY } from '../../constants/theme';

const timeIcon = require('../../assets/icons/onboarding/screen3/Time.png');

const scale = Dimensions.get('window').width / 393;

interface CircularDialProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  sublabel: string;
  description: string;
}

const DIAL_SIZE = Math.round(267 * scale);
const DIAL_RADIUS = DIAL_SIZE / 2;
const STROKE_WIDTH = Math.round(8 * scale);
const THUMB_SIZE = Math.round(64 * scale);
const TRACK_RADIUS = DIAL_RADIUS - STROKE_WIDTH / 2;

export default function CircularDial({
  value,
  onChange,
  label,
  sublabel,
  description,
}: CircularDialProps) {
  const angle = useSharedValue((value / 90) * 360);

  React.useEffect(() => {
    angle.value = withSpring((value / 90) * 360, { damping: 15, stiffness: 100 });
  }, [value, angle]);

  const updateValue = useCallback(
    (newValue: number) => {
      onChange(Math.max(0, Math.min(90, newValue)));
    },
    [onChange]
  );

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      'worklet';
      const centerX = DIAL_SIZE / 2;
      const centerY = DIAL_SIZE / 2;
      const x = event.x - centerX;
      const y = event.y - centerY;
      const rad = Math.atan2(y, x);
      let degrees = rad * (180 / Math.PI);
      // Convert from standard angle to clock-wise from top
      let normalizedAngle = (degrees + 90 + 360) % 360;
      angle.value = normalizedAngle;
      const newValue = Math.round((normalizedAngle / 360) * 90);
      runOnJS(updateValue)(newValue);
    });

  const thumbStyle = useAnimatedStyle(() => {
    const rad = ((angle.value - 90) * Math.PI) / 180;
    const x = DIAL_RADIUS + TRACK_RADIUS * Math.cos(rad);
    const y = DIAL_RADIUS + TRACK_RADIUS * Math.sin(rad);

    return {
      position: 'absolute' as const,
      left: x - THUMB_SIZE / 2,
      top: y - THUMB_SIZE / 2,
      width: THUMB_SIZE,
      height: THUMB_SIZE,
      borderRadius: THUMB_SIZE / 2,
      backgroundColor: COLORS.white,
      borderWidth: 8 * scale,
      borderColor: COLORS.teal,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    };
  });

  const circumference = 2 * Math.PI * TRACK_RADIUS;
  const strokeDashoffset = circumference - (value / 90) * circumference;

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <View style={styles.dialWrapper}>
          <Svg width={DIAL_SIZE} height={DIAL_SIZE}>
            {/* Track background */}
            <Circle
              cx={DIAL_RADIUS}
              cy={DIAL_RADIUS}
              r={TRACK_RADIUS}
              stroke="#eeeeee"
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            {/* Filled arc */}
            <Circle
              cx={DIAL_RADIUS}
              cy={DIAL_RADIUS}
              r={TRACK_RADIUS}
              stroke={COLORS.teal}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${DIAL_RADIUS}, ${DIAL_RADIUS}`}
            />
          </Svg>

          {/* Center content */}
          <View style={styles.centerContent}>
            <Image source={timeIcon} style={{ width: 24 * scale, height: 24 * scale }} resizeMode="contain" />
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.sublabel}>{sublabel}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          {/* Draggable thumb */}
          <Animated.View style={thumbStyle}>
            <Text style={styles.thumbText}>{value}</Text>
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  dialWrapper: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
  },
  centerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 46 * scale,
  },
  label: {
    fontSize: 40 * scale,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    lineHeight: 44 * scale,
    letterSpacing: -1.6,
    marginTop: 4,
  },
  sublabel: {
    fontSize: 12 * scale,
    fontFamily: FONTS.semiBold,
    lineHeight: 15.6 * scale,
    letterSpacing: -0.3,
    color: COLORS.textPrimary,
  },
  description: {
    fontSize: 12 * scale,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 15.6 * scale,
    letterSpacing: -0.3,
    color: COLORS.textPrimary,
  },
  thumbText: {
    color: COLORS.textPrimary,
    fontSize: 21 * scale,
    fontFamily: FONTS.semiBold,
    lineHeight: 27.3 * scale,
    letterSpacing: -0.63,
  },
});
