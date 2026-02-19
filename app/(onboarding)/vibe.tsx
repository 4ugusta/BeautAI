import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingStore } from '../../store/onboarding-store';

const leftArrowIcon = require('../../assets/icons/onboarding/screen4/Left.png');
const rightArrowIcon = require('../../assets/icons/onboarding/screen4/Right.png');
import ProgressBar from '../../components/onboarding/ProgressBar';
import XPBadge from '../../components/onboarding/XPBadge';
import SwipeCard from '../../components/onboarding/SwipeCard';
import BottomNav from '../../components/onboarding/BottomNav';
import { COLORS, FONTS, TYPOGRAPHY } from '../../constants/theme';

const scale = Dimensions.get('window').width / 393;

const VIBES = ['Natural', 'Glam', 'Minimal', 'Bold', 'Classic', 'Edgy'];

export default function VibeScreen() {
  const { beautyVibe, setBeautyVibe, addXP } = useOnboardingStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipeRight = () => {
    const selectedVibe = VIBES[currentIndex];
    const wasEmpty = !beautyVibe;
    setBeautyVibe(selectedVibe);
    if (wasEmpty) {
      addXP(40);
    }
    router.push('/(onboarding)/complete');
  };

  const handleSwipeLeft = () => {
    if (currentIndex < VIBES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    handleSwipeRight();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ProgressBar totalSteps={6} currentStep={4} />

        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.navArrow}>
            <Image source={leftArrowIcon} style={{ width: 12 * scale, height: 12 * scale }} resizeMode="contain" />
          </TouchableOpacity>
          <Text style={styles.title}>My current beauty vibe</Text>
          <TouchableOpacity onPress={handleNext} style={styles.navArrow}>
            <Image source={rightArrowIcon} style={{ width: 12 * scale, height: 12 * scale }} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        <XPBadge xp={40} />

        <View style={styles.cardsContainer}>
          {VIBES.map((vibe, index) => (
            <SwipeCard
              key={vibe}
              vibe={vibe}
              index={index}
              currentIndex={currentIndex}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
            />
          ))}
        </View>

        <BottomNav
          onBack={handleBack}
          onNext={handleNext}
          showBack={true}
          showNext={true}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  navArrow: {
    width: 20 * scale,
    height: 20 * scale,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.onboardingTitle,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
