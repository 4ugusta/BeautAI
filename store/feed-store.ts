import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Post {
  id: string;
  title: string;
  image_url: string;
  author_name: string;
  category: string;
  tags: string[];
  like_count: number;
  created_at: string;
  price?: string;
  brand?: string;
}

export interface Profile {
  id: string;
  email: string;
  favorite_brands: string[];
  routine_time: string;
  beauty_vibe: string;
  xp_points: number;
  onboarding_complete: boolean;
}

interface FeedState {
  posts: Post[];
  rankedPosts: Post[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  userProfile: Profile | null;

  // Actions
  fetchPosts: () => Promise<void>;
  refreshPosts: () => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  setUserProfile: (profile: Profile) => void;
  rankPostsForUser: () => void;
}

// "For You" Algorithm implementation
const calculatePostScore = (post: Post, profile: Profile | null, maxLikes: number): number => {
  if (!profile) return 0.5; // Default score for users without profile

  // Relevance: Does post match user's vibe or brands? (50% weight)
  let relevance = 0.3; // Default base relevance

  const postTagsLower = post.tags.map(t => t.toLowerCase());
  const userVibeLower = profile.beauty_vibe?.toLowerCase() || '';
  const userBrandsLower = profile.favorite_brands?.map(b => b.toLowerCase()) || [];

  // Check if post matches user's beauty vibe
  const matchesVibe = postTagsLower.includes(userVibeLower);

  // Check if post mentions any of user's favorite brands
  const matchesBrands = userBrandsLower.some(brand =>
    postTagsLower.some(tag => tag.includes(brand) || brand.includes(tag))
  );

  if (matchesVibe || matchesBrands) {
    relevance = 1.0;
  }

  // Recency: Newer posts get higher scores (30% weight)
  const now = Date.now();
  const postTime = new Date(post.created_at).getTime();
  const hoursOld = (now - postTime) / (1000 * 60 * 60);
  const recency = Math.max(0, 1 - hoursOld / 168); // Decay over 1 week

  // Popularity: Normalized likes (20% weight)
  const popularity = maxLikes > 0 ? post.like_count / maxLikes : 0;

  // Calculate final score
  const score = (relevance * 0.5) + (recency * 0.3) + (popularity * 0.2);

  return score;
};

// Tracks in-flight like operations to prevent race conditions from rapid taps
const likingPosts = new Set<string>();

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  rankedPosts: [],
  loading: false,
  refreshing: false,
  error: null,
  userProfile: null,

  setUserProfile: (profile: Profile) => {
    set({ userProfile: profile });
    // Re-rank posts when profile is set
    get().rankPostsForUser();
  },

  rankPostsForUser: () => {
    const { posts, userProfile } = get();

    if (posts.length === 0) {
      set({ rankedPosts: [] });
      return;
    }

    // Find max likes for normalization
    const maxLikes = Math.max(...posts.map(p => p.like_count), 1);

    // Calculate scores and sort
    const postsWithScores = posts.map(post => ({
      post,
      score: calculatePostScore(post, userProfile, maxLikes)
    }));

    // Sort by score descending
    postsWithScores.sort((a, b) => b.score - a.score);

    const rankedPosts = postsWithScores.map(item => item.post);

    set({ rankedPosts });
  },

  fetchPosts: async () => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ posts: data || [], loading: false });

      // Rank posts after fetching
      get().rankPostsForUser();

    } catch (error) {
      console.error('[FeedStore] Error fetching posts:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch posts',
        loading: false
      });
    }
  },

  refreshPosts: async () => {
    set({ refreshing: true, error: null });

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ posts: data || [], refreshing: false });

      // Rank posts after refreshing
      get().rankPostsForUser();

    } catch (error) {
      console.error('Error refreshing posts:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to refresh posts',
        refreshing: false
      });
    }
  },

  toggleLike: async (postId: string) => {
    // Debounce guard: prevent rapid-fire likes on the same post
    if (likingPosts.has(postId)) return;
    likingPosts.add(postId);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('user_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

      if (existingLike) {
        // Optimistically update local state first
        set(state => ({
          posts: state.posts.map(p =>
            p.id === postId
              ? { ...p, like_count: Math.max(0, p.like_count - 1) }
              : p
          ),
          rankedPosts: state.rankedPosts.map(p =>
            p.id === postId
              ? { ...p, like_count: Math.max(0, p.like_count - 1) }
              : p
          )
        }));

        // Then persist to DB
        await supabase
          .from('user_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        const { data: post } = await supabase
          .from('posts')
          .select('like_count')
          .eq('id', postId)
          .single();

        if (post) {
          await supabase
            .from('posts')
            .update({ like_count: Math.max(0, post.like_count - 1) })
            .eq('id', postId);
        }
      } else {
        // Optimistically update local state first
        set(state => ({
          posts: state.posts.map(p =>
            p.id === postId
              ? { ...p, like_count: p.like_count + 1 }
              : p
          ),
          rankedPosts: state.rankedPosts.map(p =>
            p.id === postId
              ? { ...p, like_count: p.like_count + 1 }
              : p
          )
        }));

        // Then persist to DB
        await supabase
          .from('user_likes')
          .insert({ user_id: user.id, post_id: postId });

        const { data: post } = await supabase
          .from('posts')
          .select('like_count')
          .eq('id', postId)
          .single();

        if (post) {
          await supabase
            .from('posts')
            .update({ like_count: post.like_count + 1 })
            .eq('id', postId);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error by re-fetching
      get().refreshPosts();
    } finally {
      likingPosts.delete(postId);
    }
  }
}));
