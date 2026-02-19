import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';
import CloseSquareIcon from '../../assets/icons/onboarding/screen2/CloseSquare.svg';
import Voice2Icon from '../../assets/icons/onboarding/screen2/Voice2.svg';
import CheckIcon from '../../assets/icons/onboarding/screen2/Check.svg';

interface BottomNavProps {
  onBack?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
  showBack?: boolean;
  showNext?: boolean;
  showSkip?: boolean;
}

export default function BottomNav({
  onBack,
  onNext,
  onSkip,
  showBack = true,
  showNext = true,
  showSkip = false,
}: BottomNavProps) {
  return (
    <View style={styles.container}>
      {/* Back/Close button */}
      {showBack ? (
        <TouchableOpacity onPress={onBack} style={styles.sideButton}>
          <CloseSquareIcon width={16} height={16} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}

      {/* Center teal circle with mic icon */}
      <View style={styles.centerOuter}>
        <View style={styles.centerInner}>
          <Voice2Icon width={24} height={24} />
        </View>
      </View>

      {/* Next/Check button */}
      {showNext ? (
        <TouchableOpacity onPress={onNext} style={styles.sideButton}>
          <CheckIcon width={16} height={16} />
        </TouchableOpacity>
      ) : showSkip ? (
        <TouchableOpacity onPress={onSkip} style={styles.sideButton}>
          <CloseSquareIcon width={16} height={16} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  sideButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    width: 32,
  },
});
