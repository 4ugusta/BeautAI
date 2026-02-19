import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, StyleSheet, Dimensions, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import LeftIcon from '../../assets/icons/chatScreen/Left.svg';
import EditIcon from '../../assets/icons/chatScreen/Edit.svg';
import PlusIcon from '../../assets/icons/chatScreen/Plus.svg';
import RightIcon from '../../assets/icons/chatScreen/Right.svg';
import FolderIcon from '../../assets/icons/chatScreen/Folder.svg';
import { useChatStore, ChatThread } from '../../store/chat-store';
import { supabase } from '../../lib/supabase';
import { sendChatMessage, Message, Profile } from '../../lib/groq';
import MessageBubble from '../../components/chat/MessageBubble';
import SuggestedQuestion from '../../components/chat/SuggestedQuestion';
import ChatInput from '../../components/chat/ChatInput';
import TypingIndicator from '../../components/chat/TypingIndicator';
import { COLORS, FONTS, TYPOGRAPHY } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 393;

const SUGGESTED_QUESTIONS = [
  "What's the best skincare routine for oily skin?",
  "Can you recommend a moisturiser for sensitive skin?",
  "How do I treat dark circles under my eyes?",
  "What's the difference between AHA and BHA exfoliants?",
  "How often should I exfoliate my face?",
  "What SPF should I use for daily sun protection?",
  "How can I reduce the appearance of pores?",
  "How do I know if a product is non-comedogenic?",
  "How can I treat hyperpigmentation effectively?",
  "Can you suggest a gentle cleanser for daily use?",
  "What are the benefits of using a toner?",
  "How can I prevent breakouts caused by wearing masks?",
  "What's the best way to layer products with active ingredients?",
];

function formatTimestamp(date: Date): string {
  const now = new Date();
  const messageDate = new Date(date);

  const isToday = now.toDateString() === messageDate.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = yesterday.toDateString() === messageDate.toDateString();

  const hours = messageDate.getHours().toString().padStart(2, '0');
  const minutes = messageDate.getMinutes().toString().padStart(2, '0');
  const time = `${hours}:${minutes}`;

  if (isToday) {
    return `Today ${time}`;
  } else if (isYesterday) {
    return `Yesterday ${time}`;
  } else {
    const day = messageDate.getDate().toString().padStart(2, '0');
    const month = messageDate.toLocaleString('default', { month: 'short' });
    return `${day} ${month} ${time}`;
  }
}

function shouldShowTimestamp(prevDate: string | null, currentDate: string): boolean {
  if (!prevDate) return true;

  const prev = new Date(prevDate);
  const curr = new Date(currentDate);

  // Show if different day
  if (prev.toDateString() !== curr.toDateString()) return true;

  // Show if more than 5 minutes apart
  const diffMinutes = (curr.getTime() - prev.getTime()) / (1000 * 60);
  return diffMinutes > 5;
}

export default function ChatScreen() {
  const router = useRouter();
  const {
    threads,
    activeThreadId,
    isLoading,
    isStreaming,
    pendingQuestion,
    loadMessages,
    createThread,
    switchToThread,
    getActiveThread,
    getActiveMessages,
    addMessage,
    setIsStreaming,
    clearMessages,
    setPendingQuestion,
  } = useChatStore();

  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<Profile>({});
  const [localStreamText, setLocalStreamText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fullResponseRef = useRef<string>('');

  const activeThread = getActiveThread();
  const messages = getActiveMessages();

  // Cleanup stream timer on unmount
  useEffect(() => {
    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, []);

  const startSimulatedStream = (text: string) => {
    const words = text.split(' ');
    let idx = 0;
    fullResponseRef.current = text;
    setLocalStreamText('');

    streamTimerRef.current = setInterval(() => {
      idx += 1;
      if (idx <= words.length) {
        setLocalStreamText(words.slice(0, idx).join(' '));
      }
      if (idx >= words.length) {
        if (streamTimerRef.current) clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
        setIsStreaming(false);
        setLocalStreamText('');
        if (fullResponseRef.current && userId) {
          addMessage(userId, 'assistant', fullResponseRef.current);
        }
      }
    }, 40);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // Handle pending question from store (e.g. Ask Away on home screen)
  useEffect(() => {
    if (pendingQuestion && userId) {
      const q = pendingQuestion;
      setPendingQuestion(null);
      handleSuggestedQuestion(q);
    }
  }, [pendingQuestion, userId]);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        await loadMessages(user.id);

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('favorite_brands, routine_time, beauty_vibe, xp_points')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
        } else if (profile) {
          setUserProfile(profile);
        }
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  useEffect(() => {
    if (activeThreadId) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, localStreamText, isStreaming, activeThreadId]);

  const handleSendMessage = async (messageText: string, threadIdOverride?: string) => {
    if (!userId || useChatStore.getState().isStreaming) return;

    // Use override if provided (from routine/suggested question), otherwise read from store
    let currentThreadId = threadIdOverride || useChatStore.getState().activeThreadId;
    if (!currentThreadId) {
      const title = messageText.length > 50 ? messageText.substring(0, 47) + '...' : messageText;
      currentThreadId = createThread(title);
    }

    // Get messages from the current active thread for API context
    const currentMessages = useChatStore.getState().getActiveMessages();
    const apiMessages: Message[] = currentMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
    apiMessages.push({ role: 'user', content: messageText });

    await addMessage(userId, 'user', messageText);

    setIsStreaming(true);
    setLocalStreamText('');

    try {
      const fullResponse = await sendChatMessage(apiMessages, userProfile);
      startSimulatedStream(fullResponse);
    } catch (error) {
      console.error('Error in chat:', error);
      if (streamTimerRef.current) {
        clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
      }
      setIsStreaming(false);
      setLocalStreamText('');
      await addMessage(
        userId,
        'assistant',
        "I'm sorry, I'm having trouble responding right now. Please try again."
      );
    }
  };

  const handleRoutinePress = (routineType: 'morning' | 'night') => {
    const message = routineType === 'morning'
      ? 'Tell me about my morning routine'
      : 'Help me build a night time routine';
    const title = message.length > 50 ? message.substring(0, 47) + '...' : message;
    // createThread returns the new threadId synchronously, pass it directly
    const newThreadId = createThread(title);
    handleSendMessage(message, newThreadId);
  };

  const handleNewChat = () => {
    createThread('New Chat');
  };

  const handleSuggestedQuestion = (questionText: string) => {
    const title = questionText.length > 50 ? questionText.substring(0, 47) + '...' : questionText;
    const newThreadId = createThread(title);
    handleSendMessage(questionText, newThreadId);
  };

  const handleBackPress = () => {
    if (activeThreadId) {
      // In conversation view -> go back to list view
      const thread = getActiveThread();
      if (thread && thread.messages.length === 0) {
        clearMessages(); // Removes empty active thread and sets activeThreadId to null
      } else {
        switchToThread(null);
      }
    } else {
      // In list view -> navigate back
      router.back();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    );
  }

  // List view (no active thread)
  if (!activeThreadId) {
    // Only show threads that have messages
    const sortedThreads = [...threads]
      .filter((t) => t.messages.length > 0)
      .sort((a, b) => b.createdAt - a.createdAt);

    // Group threads by date
    const todayThreads: ChatThread[] = [];
    const yesterdayThreads: ChatThread[] = [];
    const olderThreads: ChatThread[] = [];

    const now = new Date();
    const todayStr = now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    for (const thread of sortedThreads) {
      const threadDate = new Date(thread.createdAt).toDateString();
      if (threadDate === todayStr) {
        todayThreads.push(thread);
      } else if (threadDate === yesterdayStr) {
        yesterdayThreads.push(thread);
      } else {
        olderThreads.push(thread);
      }
    }

    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <LeftIcon width={16 * scale} height={16 * scale} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chats</Text>
            <View style={{ width: 32 * scale, height: 32 * scale }} />
          </View>
        </SafeAreaView>

        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Routines Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Routines</Text>
              <TouchableOpacity
                style={styles.plusIconContainer}
                activeOpacity={0.7}
                onPress={() => Alert.alert('Coming Soon', 'Custom routines coming soon.')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <PlusIcon width={12 * scale} height={12 * scale} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => handleRoutinePress('morning')}
              activeOpacity={0.7}
            >
              <FolderIcon width={16 * scale} height={16 * scale} />
              <Text style={styles.optionText}>Morning Routine</Text>
              <RightIcon width={16 * scale} height={16 * scale} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => handleRoutinePress('night')}
              activeOpacity={0.7}
            >
              <FolderIcon width={16 * scale} height={16 * scale} />
              <Text style={styles.optionText}>Night Time Routine</Text>
              <RightIcon width={16 * scale} height={16 * scale} />
            </TouchableOpacity>
          </View>

          {/* Chats Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Chats</Text>
              <TouchableOpacity
                style={styles.plusIconContainer}
                activeOpacity={0.7}
                onPress={handleNewChat}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <PlusIcon width={12 * scale} height={12 * scale} />
              </TouchableOpacity>
            </View>

            {/* Existing threads grouped by date */}
            {todayThreads.length > 0 && (
              <View style={styles.threadDateGroup}>
                <Text style={styles.threadDateLabel}>Today</Text>
                {todayThreads.map((thread) => (
                  <TouchableOpacity
                    key={thread.id}
                    style={styles.optionRow}
                    onPress={() => switchToThread(thread.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chatbubble-outline" size={16 * scale} color={COLORS.white} />
                    <Text style={styles.optionText} numberOfLines={1}>{thread.title}</Text>
                    <RightIcon width={16 * scale} height={16 * scale} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {yesterdayThreads.length > 0 && (
              <View style={styles.threadDateGroup}>
                <Text style={styles.threadDateLabel}>Yesterday</Text>
                {yesterdayThreads.map((thread) => (
                  <TouchableOpacity
                    key={thread.id}
                    style={styles.optionRow}
                    onPress={() => switchToThread(thread.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chatbubble-outline" size={16 * scale} color={COLORS.white} />
                    <Text style={styles.optionText} numberOfLines={1}>{thread.title}</Text>
                    <RightIcon width={16 * scale} height={16 * scale} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {olderThreads.length > 0 && (
              <View style={styles.threadDateGroup}>
                <Text style={styles.threadDateLabel}>Earlier</Text>
                {olderThreads.map((thread) => (
                  <TouchableOpacity
                    key={thread.id}
                    style={styles.optionRow}
                    onPress={() => switchToThread(thread.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chatbubble-outline" size={16 * scale} color={COLORS.white} />
                    <Text style={styles.optionText} numberOfLines={1}>{thread.title}</Text>
                    <RightIcon width={16 * scale} height={16 * scale} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Suggested Questions (always shown below threads) */}
            <View style={styles.suggestedSection}>
              <Text style={styles.threadDateLabel}>Suggested</Text>
              {SUGGESTED_QUESTIONS.map((q, index) => (
                <SuggestedQuestion
                  key={index}
                  question={q}
                  onPress={() => handleSuggestedQuestion(q)}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Conversation view (active thread)
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <LeftIcon width={16 * scale} height={16 * scale} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat with Beaut.ai</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              switchToThread(null);
              handleNewChat();
            }}
            activeOpacity={0.7}
          >
            <EditIcon width={16 * scale} height={16 * scale} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message, index) => {
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const showTimestampHeader = shouldShowTimestamp(
              prevMessage ? prevMessage.created_at : null,
              message.created_at
            );

            return (
              <React.Fragment key={message.id}>
                {showTimestampHeader && (
                  <View style={styles.timestampContainer}>
                    <Text style={styles.timestampText}>
                      {formatTimestamp(new Date(message.created_at))}
                    </Text>
                  </View>
                )}
                <MessageBubble
                  role={message.role}
                  content={message.content}
                />
              </React.Fragment>
            );
          })}

          {isStreaming && localStreamText ? (
            <MessageBubble
              role="assistant"
              content={localStreamText}
              isStreaming
            />
          ) : isStreaming ? (
            <TypingIndicator />
          ) : null}
        </ScrollView>

        <ChatInput
          onSend={handleSendMessage}
          disabled={isStreaming}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.chatBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.chatBg,
  },
  headerSafeArea: {
    backgroundColor: COLORS.chatBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12 * scale,
    paddingHorizontal: 16 * scale,
  },
  headerButton: {
    width: 32 * scale,
    height: 32 * scale,
    borderRadius: 16 * scale,
    borderWidth: 1,
    borderColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sectionHeader * scale,
    fontFamily: FONTS.semiBold,
    letterSpacing: -0.3,
  },
  // List view styles
  listContainer: {
    flex: 1,
    paddingHorizontal: 16 * scale,
  },
  listContent: {
    paddingTop: 16 * scale,
    paddingBottom: 40 * scale,
  },
  section: {
    marginBottom: 16 * scale,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8 * scale,
    paddingHorizontal: 12 * scale,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.bodySmall * scale,
    fontFamily: FONTS.regular,
    letterSpacing: -0.3,
  },
  plusIconContainer: {
    width: 20 * scale,
    height: 20 * scale,
    borderRadius: 10 * scale,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRow: {
    height: 40 * scale,
    backgroundColor: '#610014',
    borderRadius: 8 * scale,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12 * scale,
    marginBottom: 2 * scale,
    gap: 8 * scale,
  },
  optionText: {
    flex: 1,
    color: COLORS.white,
    fontSize: TYPOGRAPHY.bodySmall * scale,
    fontFamily: FONTS.semiBold,
    letterSpacing: -0.3,
  },
  threadDateGroup: {
    marginBottom: 8 * scale,
  },
  threadDateLabel: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.label * scale,
    fontFamily: FONTS.regular,
    opacity: 0.5,
    marginBottom: 4 * scale,
    paddingHorizontal: 12 * scale,
    letterSpacing: -0.3,
  },
  suggestedSection: {
    marginTop: 8 * scale,
  },
  // Conversation styles
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16 * scale,
  },
  messagesContent: {
    paddingTop: 20 * scale,
    paddingBottom: 20 * scale,
  },
  timestampContainer: {
    alignItems: 'center',
    marginVertical: 16 * scale,
  },
  timestampText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.bodySmall * scale,
    fontFamily: FONTS.regular,
    opacity: 0.5,
    letterSpacing: -0.3,
  },
});
