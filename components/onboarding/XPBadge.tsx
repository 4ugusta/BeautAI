import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, TYPOGRAPHY } from '../../constants/theme';
import DiscountIcon from '../../assets/icons/onboarding/screen2/Discount.svg';

interface XPBadgeProps {
  xp: number;
}

export default function XPBadge({ xp }: XPBadgeProps) {
  return (
    <View style={styles.container}>
      <DiscountIcon width={16} height={16} />
      <Text style={styles.text}>+{xp}XP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 12,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  text: {
    fontSize: TYPOGRAPHY.xpBadge,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
    textTransform: 'uppercase',
  },
});
