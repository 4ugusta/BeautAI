import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';

const scale = Dimensions.get('window').width / 393;

interface BrandBubbleProps {
  brand: string;
  diameter: number;
  selected: boolean;
  onPress: () => void;
  style?: { top: number; left: number };
}

export default function BrandBubble({
  brand,
  diameter,
  selected,
  onPress,
  style,
}: BrandBubbleProps) {
  const scaledDiameter = diameter * scale;
  // Scale font size relative to bubble diameter: larger bubbles get slightly larger text
  const fontSize = Math.max(12, Math.min(16, diameter * 0.09)) * scale;
  const lineHeight = fontSize * 1.3;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.bubble,
        {
          width: scaledDiameter,
          height: scaledDiameter,
          borderRadius: scaledDiameter / 2,
          backgroundColor: selected ? COLORS.teal : COLORS.lightGray,
        },
        style ? {
          position: 'absolute',
          top: style.top * scale,
          left: style.left * scale,
        } : undefined,
      ]}
    >
      <Text
        style={[
          styles.brandText,
          {
            color: selected ? COLORS.white : COLORS.textPrimary,
            fontSize,
            lineHeight,
          },
        ]}
      >
        {brand}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontFamily: FONTS.semiBold,
    textAlign: 'center',
    letterSpacing: -0.4,
    paddingHorizontal: 6 * scale,
  },
});
