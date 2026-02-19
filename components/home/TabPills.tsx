import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 393;

interface TabPillsProps {
  tabs: string[];
  selectedTab: string;
  onSelectTab: (tab: string) => void;
}

export function TabPills({ tabs, selectedTab, onSelectTab }: TabPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {tabs.map((tab) => {
        const isSelected = tab === selectedTab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onSelectTab(tab)}
            style={[
              styles.pill,
              isSelected ? styles.pillSelected : styles.pillUnselected,
            ]}
          >
            <Text
              style={[
                styles.pillText,
                isSelected ? styles.pillTextSelected : styles.pillTextUnselected,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    gap: 8 * scale,
    alignItems: 'center',
  },
  pill: {
    height: 32 * scale,
    paddingHorizontal: 12 * scale,
    paddingVertical: 8 * scale,
    borderRadius: 8 * scale,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillSelected: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#a20021',
  },
  pillUnselected: {
    backgroundColor: '#f5f5f5',
  },
  pillText: {
    fontSize: 12 * scale,
    fontFamily: FONTS.semiBold,
    lineHeight: 15.6 * scale,
    letterSpacing: -0.3,
    textTransform: 'capitalize',
  },
  pillTextSelected: {
    color: '#000000',
  },
  pillTextUnselected: {
    color: '#000000',
  },
});
