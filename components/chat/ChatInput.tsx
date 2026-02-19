import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, Dimensions, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import VoiceIcon from '../../assets/icons/chatScreen/Voice.svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { COLORS, FONTS, TYPOGRAPHY } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 393;

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const colorProgress = useSharedValue(0);

  // Start the color animation immediately and loop forever
  useEffect(() => {
    colorProgress.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
  }, []);

  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      colorProgress.value,
      [0, 0.33, 0.66, 1],
      ['#fff1d0', '#da99a6', '#008080', '#fff1d0']
    );

    return {
      borderColor,
      borderWidth: 1.5,
    };
  });

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleMicPress = () => {
    if (message.trim() && !disabled) {
      // If there is text, send the message
      handleSend();
    } else {
      // If no text, show coming soon alert for voice input
      Alert.alert('Coming Soon', 'Voice input is coming soon.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.inputContainer, animatedBorderStyle]}>
          <TouchableOpacity
            onPress={() => Alert.alert('Coming Soon', 'Image upload is coming soon.')}
            style={styles.imageButton}
          >
            <Ionicons name="image-outline" size={20 * scale} color={COLORS.white} />
          </TouchableOpacity>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type message"
            placeholderTextColor="#e0e0e0"
            style={styles.input}
            maxLength={500}
            editable={!disabled}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          {message.trim() ? (
            <TouchableOpacity
              onPress={handleSend}
              disabled={disabled}
              style={styles.iconButton}
            >
              <Ionicons
                name="send"
                size={16 * scale}
                color={COLORS.white}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleMicPress}
              style={styles.iconButton}
            >
              <VoiceIcon width={20 * scale} height={20 * scale} />
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16 * scale,
    paddingBottom: 16 * scale,
    paddingTop: 8 * scale,
    backgroundColor: COLORS.chatBg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.chatBg,
    borderRadius: 8 * scale,
    paddingHorizontal: 12 * scale,
    height: 42 * scale,
  },
  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: TYPOGRAPHY.body * scale,
    fontFamily: FONTS.regular,
    letterSpacing: -0.35,
  },
  imageButton: {
    paddingRight: 8 * scale,
  },
  iconButton: {
    paddingLeft: 8 * scale,
  },
});
