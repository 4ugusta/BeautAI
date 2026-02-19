import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingStore } from '../../store/onboarding-store';

const leftArrowIcon = require('../../assets/icons/onboarding/screen3/Left.png');
const rightArrowIcon = require('../../assets/icons/onboarding/screen3/Right.png');
import ProgressBar from '../../components/onboarding/ProgressBar';
import XPBadge from '../../components/onboarding/XPBadge';
import CircularDial from '../../components/onboarding/CircularDial';
import BottomNav from '../../components/onboarding/BottomNav';
import { COLORS, FONTS, TYPOGRAPHY } from '../../constants/theme';

const scale = Dimensions.get('window').width / 393;

const TIME_RANGES = [
  {
    min: 0,
    max: 5,
    range: '0-5',
    label: 'Speed Demon',
    description: "You're in and out before anyone notices!",
  },
  {
    min: 5,
    max: 15,
    range: '5-15',
    label: 'Quick & Easy',
    description: 'Efficient beauty at its finest.',
  },
  {
    min: 15,
    max: 30,
    range: '15-30',
    label: 'Midday Muse',
    description: "Between 15-30 mins. You're perfecting the art of looking effortlessly fabulous.",
  },
  {
    min: 30,
    max: 60,
    range: '30-60',
    label: 'Devoted Diva',
    description: 'Your routine is a ritual, and you love every second.',
  },
  {
    min: 60,
    max: 90,
    range: '60+',
    label: 'Glam Queen',
    description: "Go big or go home \u2014 you're all in!",
  },
];

function getTimeRangeInfo(value: number) {
  const range = TIME_RANGES.find((r) => value >= r.min && value < r.max) || TIME_RANGES[TIME_RANGES.length - 1];
  return {
    label: value <= 5 ? 'Wow!' : value <= 15 ? 'Nice!' : value <= 30 ? 'Woah!' : value <= 60 ? 'Amazing!' : 'Fabulous!',
    sublabel: range.label,
    description: range.description,
    range: range.range,
  };
}

export default function RoutineScreen() {
  const { routineTime, setRoutineTime, addXP } = useOnboardingStore();
  const [minutes, setMinutes] = useState(18);

  const timeInfo = getTimeRangeInfo(minutes);

  const handleNext = () => {
    const wasEmpty = !routineTime;
    setRoutineTime(timeInfo.range);
    if (wasEmpty) {
      addXP(30);
    }
    router.push('/(onboarding)/vibe');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ProgressBar totalSteps={6} currentStep={3} />

        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.navArrow}>
            <Image source={leftArrowIcon} style={{ width: 12 * scale, height: 12 * scale }} resizeMode="contain" />
          </TouchableOpacity>
          <Text style={styles.title}>Time I spend on a routine</Text>
          <TouchableOpacity onPress={handleNext} style={styles.navArrow}>
            <Image source={rightArrowIcon} style={{ width: 12 * scale, height: 12 * scale }} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        <XPBadge xp={30} />

        <View style={styles.dialContainer}>
          <CircularDial
            value={minutes}
            onChange={setMinutes}
            label={timeInfo.label}
            sublabel={timeInfo.sublabel}
            description={timeInfo.description}
          />
        </View>

        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>Slide to save</Text>
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
  dialContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  hintText: {
    fontSize: TYPOGRAPHY.xpBadge,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
});
