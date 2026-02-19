import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

interface ProgressBarProps {
  totalSteps: number;
  currentStep: number;
}

export default function ProgressBar({ totalSteps, currentStep }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.segment,
            {
              backgroundColor: index < currentStep ? COLORS.teal : COLORS.lightGray,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 8,
  },
});
