import { TouchableOpacity, Text, View, StyleSheet, Dimensions } from 'react-native';
import React from 'react';
import RightIcon from '../../assets/icons/chatScreen/Right.svg';
import { COLORS, FONTS, TYPOGRAPHY } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 393;

interface SuggestedQuestionProps {
  question: string;
  onPress: () => void;
}

export default function SuggestedQuestion({ question, onPress }: SuggestedQuestionProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.questionText} numberOfLines={1}>{question}</Text>
        <RightIcon width={16 * scale} height={16 * scale} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 2 * scale,
  },
  content: {
    backgroundColor: '#610014',
    borderRadius: 8 * scale,
    paddingHorizontal: 12 * scale,
    paddingVertical: 0,
    height: 40 * scale,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8 * scale,
  },
  questionText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.bodySmall * scale,
    fontFamily: FONTS.semiBold,
    flex: 1,
    letterSpacing: -0.3,
  },
});
