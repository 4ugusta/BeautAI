import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingStore } from '../../store/onboarding-store';
import { supabase } from '../../lib/supabase';
import Confetti from '../../components/onboarding/Confetti';
import { COLORS, SPACING, FONTS, TYPOGRAPHY } from '../../constants/theme';

const scale = Dimensions.get('window').width / 393;

export default function CompleteScreen() {
  const { favoriteBrands, routineTime, beautyVibe, xpPoints } = useOnboardingStore();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Onboarding complete screen mounted
  }, []);

  const handleComplete = async () => {
    setIsSaving(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert('Error', 'Failed to get user information');
        setIsSaving(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          favorite_brands: favoriteBrands,
          routine_time: routineTime,
          beauty_vibe: beautyVibe.toLowerCase(),
          xp_points: xpPoints,
          onboarding_complete: true,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Update error:', updateError);
        Alert.alert('Error', 'Failed to save your profile. Please try again.');
        setIsSaving(false);
        return;
      }

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <Confetti />

        <View style={styles.mainContent}>
          <Text style={styles.headline}>Looking Good Already</Text>
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.subtext}>
            Welcome to your personalised beauty journey.
          </Text>

          <TouchableOpacity
            onPress={handleComplete}
            disabled={isSaving}
            style={[styles.button, { opacity: isSaving ? 0.6 : 1 }]}
          >
            <Text style={styles.buttonText}>
              {isSaving ? 'Loading...' : 'Load My Dashboard'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: SPACING.screenPadding,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontSize: 40 * scale,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    lineHeight: 44 * scale,
    letterSpacing: -1.6,
    color: COLORS.textPrimary,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 32,
    gap: 16,
  },
  subtext: {
    fontSize: 12 * scale,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 15.6 * scale,
    letterSpacing: -0.3,
    color: COLORS.textPrimary,
  },
  button: {
    width: '100%',
    height: SPACING.buttonHeight,
    borderRadius: SPACING.buttonRadius,
    borderWidth: 1.5,
    borderColor: '#da99a6',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16 * scale,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
});
