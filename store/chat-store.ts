import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const THREAD_META_KEY = 'beaut_chat_threads';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  thread_id?: string;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

interface ThreadMeta {
  id: string;
  title: string;
  messageIds: string[];
  createdAt: number;
}

interface ChatState {
  threads: ChatThread[];
  activeThreadId: string | null;
  isLoading: boolean;
  error: string | null;
  streamingMessage: string;
  isStreaming: boolean;
  pendingQuestion: string | null;

  // Derived helpers
  getActiveThread: () => ChatThread | undefined;
  getActiveMessages: () => ChatMessage[];

  // Actions
  loadMessages: (userId: string) => Promise<void>;
  createThread: (initialTitle?: string) => string;
  switchToThread: (threadId: string | null) => void;
  addMessage: (userId: string, role: 'user' | 'assistant', content: string) => Promise<void>;
  setStreamingMessage: (content: string) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  clearStreamingMessage: () => void;
  clearMessages: () => void;
  setError: (error: string | null) => void;
  setPendingQuestion: (question: string | null) => void;
}

function generateThreadId(): string {
  return `thread-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function deriveThreadTitle(messages: ChatMessage[]): string {
  const firstUserMsg = messages.find((m) => m.role === 'user');
  if (firstUserMsg) {
    const title = firstUserMsg.content;
    return title.length > 50 ? title.substring(0, 47) + '...' : title;
  }
  return 'New Chat';
}

async function loadThreadMeta(): Promise<ThreadMeta[]> {
  try {
    const raw = await AsyncStorage.getItem(THREAD_META_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

async function saveThreadMeta(threads: ChatThread[]): Promise<void> {
  try {
    const meta: ThreadMeta[] = threads.map((t) => ({
      id: t.id,
      title: t.title,
      messageIds: t.messages.map((m) => m.id),
      createdAt: t.createdAt,
    }));
    await AsyncStorage.setItem(THREAD_META_KEY, JSON.stringify(meta));
  } catch {
    // ignore
  }
}

export const useChatStore = create<ChatState>((set, get) => ({
  threads: [],
  activeThreadId: null,
  isLoading: false,
  error: null,
  streamingMessage: '',
  isStreaming: false,
  pendingQuestion: null,

  getActiveThread: () => {
    const { threads, activeThreadId } = get();
    if (!activeThreadId) return undefined;
    return threads.find((t) => t.id === activeThreadId);
  },

  getActiveMessages: () => {
    const thread = get().getActiveThread();
    return thread?.messages ?? [];
  },

  loadMessages: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        set({ threads: [], isLoading: false });
        return;
      }

      const allMessages: ChatMessage[] = data.map((msg) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        created_at: msg.created_at,
      }));

      // Load persisted thread metadata from AsyncStorage
      const savedMeta = await loadThreadMeta();

      // Build a map of messageId -> threadMeta for fast lookup
      const msgToThread = new Map<string, ThreadMeta>();
      for (const meta of savedMeta) {
        for (const msgId of meta.messageIds) {
          msgToThread.set(msgId, meta);
        }
      }

      // Group messages using saved thread metadata
      const threadMap = new Map<string, ChatThread>();
      const unassigned: ChatMessage[] = [];

      for (const msg of allMessages) {
        const meta = msgToThread.get(msg.id);
        if (meta) {
          if (!threadMap.has(meta.id)) {
            threadMap.set(meta.id, {
              id: meta.id,
              title: meta.title,
              messages: [],
              createdAt: meta.createdAt,
            });
          }
          threadMap.get(meta.id)!.messages.push({ ...msg, thread_id: meta.id });
        } else {
          unassigned.push(msg);
        }
      }

      // Group unassigned messages (legacy) by time gaps (> 5 min = new thread)
      let currentThread: ChatThread | null = null;
      for (const msg of unassigned) {
        const msgTime = new Date(msg.created_at).getTime();
        if (
          !currentThread ||
          msgTime - new Date(currentThread.messages[currentThread.messages.length - 1].created_at).getTime() > 5 * 60 * 1000
        ) {
          currentThread = {
            id: generateThreadId(),
            title: 'New Chat',
            messages: [],
            createdAt: msgTime,
          };
          threadMap.set(currentThread.id, currentThread);
        }
        currentThread.messages.push(msg);
      }

      const threads = Array.from(threadMap.values());

      // Derive titles for any thread that still has 'New Chat'
      for (const thread of threads) {
        if (thread.title === 'New Chat') {
          thread.title = deriveThreadTitle(thread.messages);
        }
      }

      set({ threads, isLoading: false });

      // Re-save thread metadata so unassigned messages now have thread assignments
      saveThreadMeta(threads);
    } catch (error) {
      console.error('Error loading messages:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to load messages',
        isLoading: false,
      });
    }
  },

  createThread: (initialTitle?: string) => {
    const threadId = generateThreadId();
    const newThread: ChatThread = {
      id: threadId,
      title: initialTitle || 'New Chat',
      messages: [],
      createdAt: Date.now(),
    };

    set((state) => {
      const updated = [newThread, ...state.threads];
      saveThreadMeta(updated);
      return {
        threads: updated,
        activeThreadId: threadId,
      };
    });

    return threadId;
  },

  switchToThread: (threadId: string | null) => {
    set({ activeThreadId: threadId });
  },

  addMessage: async (userId: string, role: 'user' | 'assistant', content: string) => {
    const { activeThreadId, threads } = get();
    if (!activeThreadId) return;

    const tempId = `temp-${Date.now()}`;
    const newMessage: ChatMessage = {
      id: tempId,
      role,
      content,
      created_at: new Date().toISOString(),
      thread_id: activeThreadId,
    };

    // Optimistically add message to the active thread
    set((state) => {
      const updated = state.threads.map((t) => {
        if (t.id !== state.activeThreadId) return t;
        const updatedMessages = [...t.messages, newMessage];
        return {
          ...t,
          messages: updatedMessages,
          title: t.messages.length === 0 && role === 'user'
            ? (content.length > 50 ? content.substring(0, 47) + '...' : content)
            : t.title,
        };
      });
      return { threads: updated };
    });

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          user_id: userId,
          role,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      // Update with real ID from database and persist thread metadata
      set((state) => {
        const updated = state.threads.map((t) => {
          if (t.id !== state.activeThreadId) return t;
          return {
            ...t,
            messages: t.messages.map((msg) =>
              msg.id === tempId
                ? {
                    id: data.id,
                    role: data.role as 'user' | 'assistant',
                    content: data.content,
                    created_at: data.created_at,
                    thread_id: t.id,
                  }
                : msg
            ),
          };
        });
        saveThreadMeta(updated);
        return { threads: updated };
      });
    } catch (error) {
      console.error('Error saving message:', error);
      // Remove the failed message
      set((state) => ({
        threads: state.threads.map((t) => {
          if (t.id !== state.activeThreadId) return t;
          return {
            ...t,
            messages: t.messages.filter((msg) => msg.id !== tempId),
          };
        }),
        error: error instanceof Error ? error.message : 'Failed to save message',
      }));
    }
  },

  setStreamingMessage: (content: string) => {
    set({ streamingMessage: content });
  },

  setIsStreaming: (isStreaming: boolean) => {
    set({ isStreaming });
  },

  clearStreamingMessage: () => {
    set({ streamingMessage: '', isStreaming: false });
  },

  clearMessages: () => {
    set((state) => {
      if (state.activeThreadId) {
        const updated = state.threads.filter((t) => t.id !== state.activeThreadId);
        saveThreadMeta(updated);
        return {
          threads: updated,
          activeThreadId: null,
          streamingMessage: '',
          isStreaming: false,
          error: null,
        };
      }
      return { streamingMessage: '', isStreaming: false, error: null };
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setPendingQuestion: (question: string | null) => {
    set({ pendingQuestion: question });
  },
}));
