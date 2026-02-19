import React from 'react';
import { View, Text, SafeAreaView, StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONTS, TYPOGRAPHY } from '../../constants/theme';

const scale = Dimensions.get('window').width / 393;

export default function CalendarScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.comingSoon}>Coming Soon</Text>
        <Text style={styles.subtitle}>Your beauty appointments and reminders will appear here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: 16 * scale,
    paddingVertical: 12 * scale,
    alignItems: 'center',
  },
  title: {
    fontSize: 14 * scale,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32 * scale,
  },
  comingSoon: {
    fontSize: TYPOGRAPHY.headlineLarge * scale,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: -1,
    marginBottom: 8 * scale,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.body * scale,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    letterSpacing: -0.35,
  },
});
