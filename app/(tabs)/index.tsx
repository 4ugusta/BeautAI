import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import ActivityIcon from '../../assets/icons/homescreen/Activity.svg';
import MoreCircleIcon from '../../assets/icons/homescreen/MoreCircle.svg';
import RightIcon from '../../assets/icons/homescreen/Right.svg';
import FilterIcon from '../../assets/icons/homescreen/Filter.svg';
import HomeAvatar1 from '../../assets/icons/homescreen/Avatar.svg';
import HomeAvatar2 from '../../assets/icons/homescreen/Avatar-1.svg';
import BagIcon from '../../assets/icons/homescreen/Bag.svg';
import InformationIcon from '../../assets/icons/homescreen/Information.svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSequence,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { TabPills } from '../../components/home/TabPills';
import { FONTS } from '../../constants/theme';
import { useFeedStore } from '../../store/feed-store';
import { useAuthStore } from '../../store/auth-store';
import { useChatStore } from '../../store/chat-store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 393;

const TABS = ['For you', 'Trending', 'Your Routine', 'Scans'];

const BLURHASH = 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH';

const HEADER_HEIGHT = 44 * scale;

// --- Image URLs ---
const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=900&fit=crop',
  wearing: [
    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=500&h=600&fit=crop',
    'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=500&h=600&fit=crop',
  ],
  routine: [
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=300&h=400&fit=crop',
  ],
  basedOn: [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&h=600&fit=crop',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&h=600&fit=crop',
  ],
  mostLoved: [
    'https://images.unsplash.com/photo-1583241800698-e8ab01830a07?w=150&h=150&fit=crop',
    'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=150&h=150&fit=crop',
    'https://images.unsplash.com/photo-1597225244660-1cd128c64284?w=150&h=150&fit=crop',
  ],
  reels: [
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&h=650&fit=crop',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=500&h=650&fit=crop',
  ],
  scanned: [
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=300&h=400&fit=crop',
  ],
  masonry: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=500&fit=crop',
  ],
};

// Fallback masonry data matching Figma spec
const MASONRY_FALLBACK = [
  {
    id: 'masonry-1',
    title: 'Glow Recipe Watermelon Drops',
    price: '\u00A332.00',
    subtitle: 'Perfect For Your Skin',
    img: IMAGES.masonry[0],
    imageHeight: 152 * scale,
  },
  {
    id: 'masonry-2',
    title: 'LOTD: Today\'s Look, Tomorrow\'s Screensaver',
    subtitle: 'Yvonne Victoria',
    img: IMAGES.masonry[1],
    imageHeight: 260 * scale,
  },
  {
    id: 'masonry-3',
    title: 'Kylie Pink Nude Tinted Butter Balm',
    price: '\u00A318.00',
    subtitle: 'Rated by Users Like You',
    img: IMAGES.masonry[2],
    imageHeight: 152 * scale,
  },
  {
    id: 'masonry-4',
    title: 'From Flat to Snatched: Contour 101',
    subtitle: 'Nina Ubhi',
    img: IMAGES.masonry[3],
    imageHeight: 260 * scale,
  },
  {
    id: 'masonry-5',
    title: 'Fenty Moisturizing Soft Cream',
    price: '\u00A3150.00',
    subtitle: 'Works With Your Serum',
    img: IMAGES.masonry[0],
    imageHeight: 152 * scale,
  },
  {
    id: 'masonry-6',
    title: 'Your Daily Drop, Styled by Mikayla Nogueira',
    subtitle: 'Mikayla Nogueira',
    img: IMAGES.masonry[1],
    imageHeight: 260 * scale,
  },
  {
    id: 'masonry-7',
    title: 'Lanc\u00F4me Absolute Soft Cream',
    price: '\u00A378.00',
    subtitle: 'Repeat Favourite',
    img: IMAGES.masonry[2],
    imageHeight: 152 * scale,
  },
];

// --- FIX 1: Home Header with interactive avatar + bell + badge ---
function HomeHeader({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <View style={s.header}>
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/settings' as never)}
        activeOpacity={0.7}
      >
        <View style={s.headerAvatar} />
      </TouchableOpacity>
      <Text style={s.headerTitle}>beaut.ai</Text>
      <TouchableOpacity
        onPress={() => router.push('/notifications' as never)}
        activeOpacity={0.7}
        style={s.bellContainer}
      >
        <ActivityIcon width={20 * scale} height={20 * scale} />
        <View style={s.bellBadge} />
      </TouchableOpacity>
    </View>
  );
}

// --- FIX 7: Section Header with correct text style ---
function SectionHeader({
  title,
  icon = 'arrow-forward',
}: {
  title: string;
  icon?: 'arrow-forward' | 'funnel-outline' | 'none';
}) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      {icon === 'arrow-forward' && (
        <RightIcon width={16 * scale} height={16 * scale} />
      )}
      {icon === 'funnel-outline' && (
        <FilterIcon width={16 * scale} height={16 * scale} />
      )}
    </View>
  );
}

// --- Double-Tap Like Wrapper ---
function DoubleTapLike({
  children,
  style,
  onDoubleTap,
}: {
  children: React.ReactNode;
  style?: object;
  onDoubleTap?: () => void;
}) {
  const heartOpacity = useSharedValue(0);
  const heartScale = useSharedValue(0.5);

  const animatedHeartStyle = useAnimatedStyle(() => ({
    opacity: heartOpacity.value,
    transform: [{ scale: heartScale.value }],
  }));

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      heartOpacity.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(1, { duration: 600 }),
        withTiming(0, { duration: 300 })
      );
      heartScale.value = withSequence(
        withTiming(1.2, { duration: 150 }),
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 400 }),
        withTiming(0.5, { duration: 300 })
      );
      if (onDoubleTap) {
        onDoubleTap();
      }
    });

  return (
    <GestureDetector gesture={doubleTap}>
      <Animated.View style={style}>
        {children}
        <Animated.View style={[s.heartOverlay, animatedHeartStyle]}>
          <View style={s.heartCircle}>
            <Ionicons name="heart" size={32 * scale} color="#ffffff" />
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

// =============================================
// SECTION COMPONENTS
// =============================================

// --- Hero card data ---
const HERO_CARDS = [
  {
    id: 'lookbook',
    img: IMAGES.hero,
    title: 'Lookbook',
    subtitle: 'Hot List',
    badge: 'activity' as const,
  },
  {
    id: 'rubys-rituals',
    img: IMAGES.wearing[0],
    title: "Ruby's Rituals",
    subtitle: 'The latest trends and tips',
    badge: 'avatars' as const,
  },
  {
    id: 'skinspiration',
    img: IMAGES.basedOn[0],
    title: 'Skinspiration',
    subtitle: 'Glow from within',
    badge: 'activity' as const,
  },
];

const HERO_SWIPE_THRESHOLD = 80 * scale;

// --- Swipeable Hero Card ---
function HeroSwipeCard({
  card,
  index,
  currentIndex,
  onSwipe,
}: {
  card: typeof HERO_CARDS[number];
  index: number;
  currentIndex: number;
  onSwipe: () => void;
}) {
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (index !== currentIndex) {
      translateX.value = 0;
    }
  }, [currentIndex, index, translateX]);

  const doSwipe = React.useCallback(() => {
    onSwipe();
  }, [onSwipe]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      'worklet';
      if (index === currentIndex) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      'worklet';
      if (index === currentIndex) {
        if (Math.abs(event.translationX) > HERO_SWIPE_THRESHOLD) {
          const direction = event.translationX > 0 ? 1 : -1;
          translateX.value = withTiming(direction * SCREEN_WIDTH * 1.5, { duration: 300 }, () => {
            runOnJS(doSwipe)();
          });
        } else {
          translateX.value = withSpring(0);
        }
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const total = HERO_CARDS.length;
    const relativeIndex = ((index - currentIndex) % total + total) % total;

    if (relativeIndex > 2) {
      return {
        opacity: 0,
        zIndex: -1,
        transform: [{ translateX: 0 }, { scale: 0.95 }],
      };
    }

    const cardScale = interpolate(
      relativeIndex,
      [0, 1, 2],
      [1, 0.92, 0.85],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      relativeIndex,
      [0, 1, 2],
      [1, 0.85, 0.5],
      Extrapolation.CLAMP
    );

    // Offset background cards to the right so they peek out
    const cardWidth = SCREEN_WIDTH - 32 * scale;
    const stackOffset = interpolate(
      relativeIndex,
      [0, 1, 2],
      [0, cardWidth * 0.06, cardWidth * 0.04],
      Extrapolation.CLAMP
    );

    const isActive = relativeIndex === 0;

    return {
      transform: [
        { translateX: isActive ? translateX.value : stackOffset },
        { scale: cardScale },
      ],
      opacity,
      zIndex: 100 - relativeIndex,
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[s.heroSwipeCardOuter, animatedStyle]}>
        <View style={s.heroSwipeCardInner}>
          <Image
            source={{ uri: card.img }}
            style={s.heroSwipeImage}
            contentFit="cover"
            placeholder={{ blurhash: BLURHASH }}
            transition={200}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={s.heroScrollGradient}
          >
            <Text style={s.heroScrollTitle}>{card.title}</Text>
            <Text style={s.heroScrollSubtitle}>{card.subtitle}</Text>
          </LinearGradient>
          <View style={s.heroActivityBtn}>
            <ActivityIcon width={16 * scale} height={16 * scale} />
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

// --- Stacked Hero Section ---
function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % HERO_CARDS.length);
  }, []);

  return (
    <View style={s.heroStackContainer}>
      {HERO_CARDS.map((card, index) => (
        <HeroSwipeCard
          key={card.id}
          card={card}
          index={index}
          currentIndex={currentIndex}
          onSwipe={handleSwipe}
        />
      ))}
    </View>
  );
}

// --- FIX 4: 2-Column Masonry Grid ---
interface MasonryItem {
  id: string;
  title: string;
  price?: string;
  subtitle: string;
  img: string;
  imageHeight: number;
}

function MasonryCard({ item, index }: { item: MasonryItem; index: number }) {
  const isProduct = !!item.price;
  const showAvatars = index % 2 === 0;
  return (
    <DoubleTapLike style={s.masonryCard}>
      <View>
        <Image
          source={{ uri: item.img }}
          style={[s.masonryImage, { height: item.imageHeight }]}
          contentFit="cover"
          placeholder={{ blurhash: BLURHASH }}
          transition={200}
        />
        {showAvatars ? (
          <View style={s.cardTopLeftBadge}>
            <View style={s.cardAvatarStack}>
              <View style={s.cardAvatar}>
                <HomeAvatar1 width={16 * scale} height={16 * scale} />
              </View>
              <View style={[s.cardAvatar, s.cardAvatarOverlap]}>
                <HomeAvatar2 width={16 * scale} height={16 * scale} />
              </View>
            </View>
          </View>
        ) : (
          <View style={s.cardTopRightBadge}>
            <View style={s.cardBagIcon}>
              <BagIcon width={12 * scale} height={12 * scale} />
            </View>
          </View>
        )}
      </View>
      <View style={s.masonryTextContainer}>
        <Text style={isProduct ? s.masonryProductTitle : s.masonryContentTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.price && (
          <Text style={s.masonryPrice}>{item.price}</Text>
        )}
        <Text style={s.masonrySubtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
    </DoubleTapLike>
  );
}

function MasonryGrid() {
  const { rankedPosts } = useFeedStore();

  // Use rankedPosts if available, otherwise fallback
  const items: MasonryItem[] = rankedPosts.length > 0
    ? rankedPosts.slice(0, 7).map((p, i) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        subtitle: p.author_name || p.category || '',
        img: p.image_url,
        imageHeight: (i % 2 === 0 ? 152 : 260) * scale,
      }))
    : MASONRY_FALLBACK;

  // Split into two columns
  const leftCol: MasonryItem[] = [];
  const rightCol: MasonryItem[] = [];
  items.forEach((item, i) => {
    if (i % 2 === 0) {
      leftCol.push(item);
    } else {
      rightCol.push(item);
    }
  });

  return (
    <View style={s.masonryContainer}>
      <View style={s.masonryColumn}>
        {leftCol.map((item, i) => (
          <MasonryCard key={item.id} item={item} index={i * 2} />
        ))}
      </View>
      <View style={s.masonryColumn}>
        {rightCol.map((item, i) => (
          <MasonryCard key={item.id} item={item} index={i * 2 + 1} />
        ))}
      </View>
    </View>
  );
}

// --- FIX 5: Beauty Circle Favs with correct padding ---
function BeautyCircleFavs() {
  const { rankedPosts, toggleLike } = useFeedStore();
  const fallback = [
    { id: '', title: "What Everyone's Wearing", subtitle: 'Bookmarked by Lana', img: IMAGES.wearing[0] },
    { id: '', title: "Beauty's It List", subtitle: 'Bookmarked by Sandy', img: IMAGES.wearing[1] },
  ];

  const cards = rankedPosts.length > 0
    ? rankedPosts.slice(0, 4).map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: p.author_name || p.category,
        img: p.image_url,
      }))
    : fallback;

  return (
    <View>
      <View style={s.padH}>
        <SectionHeader title="Beauty Circle Favs" icon="funnel-outline" />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.beautyCircleScrollContent}
      >
        {cards.map((c, i) => (
          <DoubleTapLike
            key={c.id || i}
            style={{ width: 221 * scale }}
            onDoubleTap={c.id ? () => toggleLike(c.id) : undefined}
          >
            <Image
              source={{ uri: c.img }}
              style={s.medCardImage}
              contentFit="cover"
              placeholder={{ blurhash: BLURHASH }}
              transition={200}
            />
            <Text style={s.medCardTitle} numberOfLines={1}>{c.title}</Text>
            <Text style={s.medCardSubtitle} numberOfLines={1}>{c.subtitle}</Text>
          </DoubleTapLike>
        ))}
      </ScrollView>
    </View>
  );
}

function AuraPointsTracker() {
  const profile = useAuthStore((state) => state.profile);
  const xp = profile?.xp_points ?? 0;
  const maxXp = 100;
  const fillPercent = Math.min(100, Math.round((xp / maxXp) * 100));
  const tier = xp >= 80 ? 'III' : xp >= 40 ? 'II' : 'I';

  return (
    <View>
      <SectionHeader title="Aura Points Tracker" icon="arrow-forward" />
      <View style={s.auraCard}>
        <View style={s.auraRow}>
          <Text style={s.auraLabel}>Aura Points</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 * scale }}>
            <Text style={s.auraLabel}>{xp}/{maxXp}</Text>
            <View style={s.auraGreenBtn}>
              <Ionicons name="arrow-up" size={12 * scale} color="#000000" />
            </View>
          </View>
        </View>
        <View style={s.auraBarBg}>
          <View style={[s.auraBarFill, { width: `${fillPercent}%` }]} />
        </View>
        <View style={s.auraRow}>
          <Text style={s.auraSmallText}>Tier {tier}</Text>
          <Text style={s.auraSmallText}>Top 5% in London Circle</Text>
        </View>
      </View>
    </View>
  );
}

function RoutineAdditions() {
  const products = [
    { title: 'Hollywood Contour Wand 12g', brand: 'Charlotte Tilbury', img: IMAGES.routine[0] },
    { title: 'Hydra Beauty Micro Serum', brand: 'Chanel', img: IMAGES.routine[1] },
    { title: 'Oud Wood Beard Oil 30g', brand: 'Tom Ford', img: IMAGES.routine[2] },
  ];
  return (
    <View>
      <View style={s.padH}>
        <SectionHeader title="Routine Additions" icon="funnel-outline" />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.hScrollContentPadded}
      >
        {products.map((p, i) => (
          <View key={i} style={{ width: 128 * scale }}>
            <View>
              <Image
                source={{ uri: p.img }}
                style={s.prodImage}
                contentFit="cover"
                placeholder={{ blurhash: BLURHASH }}
                transition={200}
              />
              <View style={s.bagIconOverlay}>
                <BagIcon width={12 * scale} height={12 * scale} />
              </View>
            </View>
            <Text style={s.prodTitle} numberOfLines={2}>{p.title}</Text>
            <Text style={s.prodBrand} numberOfLines={1}>{p.brand}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function ScanLikeAPro() {
  const items = [
    { icon: 'bag-outline' as const, title: 'Scan products', subtitle: "What's actually inside your products?" },
    { icon: 'shield-checkmark-outline' as const, title: 'Scan ingredients', subtitle: 'Get quick definitions and safety breakdowns' },
    { icon: 'bar-chart-outline' as const, title: 'Scan your face', subtitle: 'Track your skin over time' },
    { icon: 'star-outline' as const, title: 'Scan barcodes or QR codes', subtitle: 'Pull up reviews, routines, and match-ups' },
  ];
  return (
    <View>
      <SectionHeader title="Scan Like a Pro" icon="none" />
      <View style={{ gap: 4 * scale }}>
        {items.map((item, i) => (
          <View key={i} style={s.scanRow}>
            <View style={s.scanIconBox}>
              <Ionicons name={item.icon} size={20 * scale} color="#a20021" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.scanTitle}>{item.title}</Text>
              <Text style={s.scanSubtitle} numberOfLines={1}>{item.subtitle}</Text>
            </View>
            <View style={s.scanArrowBtn}>
              <RightIcon width={14 * scale} height={14 * scale} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function BasedOnRoutine() {
  const { rankedPosts, toggleLike } = useFeedStore();
  const fallback = [
    { id: '', title: 'Tailored Just for You', subtitle: 'Personalised by Beaut.ai', img: IMAGES.basedOn[0] },
    { id: '', title: 'Your Routine, Upgraded', subtitle: 'Personalised by Beaut.ai', img: IMAGES.basedOn[1] },
  ];

  const cards = rankedPosts.length > 4
    ? rankedPosts.slice(4, 8).map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: p.author_name || 'Personalised by Beaut.ai',
        img: p.image_url,
      }))
    : fallback;

  return (
    <View>
      <View style={s.padH}>
        <SectionHeader title="Based on Your Routine" icon="funnel-outline" />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.hScrollContentPadded}
      >
        {cards.map((c, i) => (
          <DoubleTapLike
            key={c.id || i}
            style={{ width: 221 * scale }}
            onDoubleTap={c.id ? () => toggleLike(c.id) : undefined}
          >
            <Image
              source={{ uri: c.img }}
              style={s.medCardImage}
              contentFit="cover"
              placeholder={{ blurhash: BLURHASH }}
              transition={200}
            />
            <Text style={s.medCardTitle} numberOfLines={1}>{c.title}</Text>
            <Text style={s.medCardSubtitle} numberOfLines={1}>{c.subtitle}</Text>
          </DoubleTapLike>
        ))}
      </ScrollView>
    </View>
  );
}

function MostLovedSection() {
  const items = [
    { tag: 'Most popular', title: 'Lash Lift & Tint', price: '\u00A350.00', img: IMAGES.mostLoved[0] },
    { tag: 'Trending this week', title: 'Hydrating Hair Mask', price: '\u00A335.00', img: IMAGES.mostLoved[1] },
    { tag: 'For skin like yours', title: 'Brow Sculpt & Tint', price: '\u00A325.00', img: IMAGES.mostLoved[2] },
  ];
  return (
    <View>
      <SectionHeader title="Most-Loved For Skin Like Yours" icon="funnel-outline" />
      <View style={{ gap: 4 * scale }}>
        {items.map((item, i) => (
          <View key={i} style={s.lovedRow}>
            <Image
              source={{ uri: item.img }}
              style={s.lovedImage}
              contentFit="cover"
              placeholder={{ blurhash: BLURHASH }}
              transition={200}
            />
            <View style={{ flex: 1, gap: 4 * scale }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 * scale }}>
                <Text style={[s.lovedTag, { flex: 1 }]}>{item.tag}</Text>
                <View style={s.lovedInfoBtn}>
                  <InformationIcon width={12 * scale} height={12 * scale} />
                </View>
              </View>
              <Text style={s.lovedTitle}>{item.title}</Text>
              <Text style={s.lovedPrice}>{item.price}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// --- FIX 6: Ask Away with flexible chip sizing ---
function AskAwaySection({ router }: { router: ReturnType<typeof useRouter> }) {
  const setPendingQuestion = useChatStore((s) => s.setPendingQuestion);
  const prompts = [
    'What should I do before bed?',
    "What's missing from my routine?",
    'Help me get the clean girl look',
  ];
  return (
    <View>
      <View style={s.padH}>
        <SectionHeader title="Ask Away" icon="funnel-outline" />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.hScrollContentPadded}
      >
        {prompts.map((p, i) => (
          <TouchableOpacity
            key={i}
            style={s.promptChip}
            onPress={() => {
              setPendingQuestion(p);
              router.push('/(tabs)/chat' as never);
            }}
            activeOpacity={0.7}
          >
            <View style={{ width: (148 - 24) * scale, height: 32 * scale }}>
              <Text style={s.promptText} numberOfLines={2}>{p}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function BeautyReels() {
  return (
    <View>
      <View style={s.padH}>
        <SectionHeader title="Your Beauty Reels" icon="funnel-outline" />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.hScrollContentPadded}
      >
        {IMAGES.reels.map((uri, i) => (
          <Image
            key={i}
            source={{ uri }}
            style={s.reelImage}
            contentFit="cover"
            placeholder={{ blurhash: BLURHASH }}
            transition={200}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function ScannedThisMonth() {
  const products = [
    { title: 'Glycolic Acid 7% Toning Solution', brand: 'The Ordinary', img: IMAGES.scanned[0] },
    { title: 'Lip Butter Balm \u2013 Vanilla Beige', brand: 'Summer Fridays', img: IMAGES.scanned[1] },
    { title: "Pro Filt'r Soft Matte Foundation", brand: 'Fenty Beauty', img: IMAGES.scanned[2] },
  ];
  return (
    <View>
      <View style={s.padH}>
        <SectionHeader title="Scanned This Month" icon="funnel-outline" />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.hScrollContentPadded}
      >
        {products.map((p, i) => (
          <View key={i} style={{ width: 128 * scale }}>
            <View>
              <Image
                source={{ uri: p.img }}
                style={s.prodImage}
                contentFit="cover"
                placeholder={{ blurhash: BLURHASH }}
                transition={200}
              />
              <View style={s.bagIconOverlay}>
                <BagIcon width={12 * scale} height={12 * scale} />
              </View>
            </View>
            <Text style={s.prodTitle} numberOfLines={2}>{p.title}</Text>
            <Text style={s.prodBrand} numberOfLines={1}>{p.brand}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// --- FIX 8: "Coming soon" placeholder for non-active tabs ---
function ComingSoonPlaceholder() {
  return (
    <View style={s.comingSoonContainer}>
      <Text style={s.comingSoonText}>Coming soon</Text>
    </View>
  );
}

// =============================================
// MAIN SCREEN
// =============================================

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function HomeScreen() {
  const [selectedTab, setSelectedTab] = useState('For you');
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const { refreshing, fetchPosts, refreshPosts, setUserProfile } = useFeedStore();

  // --- FIX 2: Scroll-hide header ---
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [0, -HEADER_HEIGHT],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateY }],
    };
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (profile && profile.id && profile.onboarding_complete) {
      setUserProfile(profile);
    }
  }, [profile, setUserProfile]);

  const onRefresh = useCallback(() => {
    refreshPosts();
  }, [refreshPosts]);

  const isForYou = selectedTab === 'For you';

  return (
    <SafeAreaView style={s.container}>
      <AnimatedScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#008080" />
        }
      >
        {/* More button + Tab Pills */}
        <View style={s.tabRow}>
          <TouchableOpacity
            style={s.moreCircle}
            onPress={() => router.push('/(tabs)/settings' as never)}
            activeOpacity={0.7}
          >
            <MoreCircleIcon width={16 * scale} height={16 * scale} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <TabPills
              tabs={TABS}
              selectedTab={selectedTab}
              onSelectTab={setSelectedTab}
            />
          </View>
        </View>

        {/* FIX 8: Show "Coming soon" for non-"For you" tabs */}
        {!isForYou ? (
          <ComingSoonPlaceholder />
        ) : (
          <>
            {/* 1. Hero */}
            <HeroSection />

            {/* FIX 4: 2-Column Masonry Grid */}
            <View style={s.padH}>
              <MasonryGrid />
            </View>

            {/* 2. Beauty Circle Favs (FIX 5: padding handled inside) */}
            <BeautyCircleFavs />

            {/* 3. Aura Points Tracker */}
            <View style={s.padH}>
              <AuraPointsTracker />
            </View>

            {/* 4. Routine Additions */}
            <RoutineAdditions />

            {/* 5. Scan Like a Pro */}
            <View style={s.padH}>
              <ScanLikeAPro />
            </View>

            {/* 6. Based on Your Routine */}
            <BasedOnRoutine />

            {/* 7. Most-Loved */}
            <View style={s.padH}>
              <MostLovedSection />
            </View>

            {/* 8. Ask Away (FIX 6: flexible chips) */}
            <AskAwaySection router={router} />

            {/* 9. Beauty Reels */}
            <BeautyReels />

            {/* 10. Scanned This Month */}
            <ScannedThisMonth />
          </>
        )}
      </AnimatedScrollView>
    </SafeAreaView>
  );
}

// =============================================
// STYLES
// =============================================

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 32 * scale,
    gap: 24 * scale,
  },
  padH: {
    paddingHorizontal: 16 * scale,
  },

  // --- FIX 2: Header wrapper for animation ---
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#ffffff',
  },

  // --- FIX 1: Header styles ---
  header: {
    height: HEADER_HEIGHT,
    paddingHorizontal: 16 * scale,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerAvatar: {
    width: 32 * scale,
    height: 32 * scale,
    borderRadius: 16 * scale,
    backgroundColor: '#f6e5e9',
  },
  headerTitle: {
    fontSize: 14 * scale,
    fontFamily: FONTS.semiBold,
    color: '#000000',
    letterSpacing: -0.35,
  },
  bellContainer: {
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: -2 * scale,
    right: -2 * scale,
    width: 8 * scale,
    height: 8 * scale,
    borderRadius: 4 * scale,
    backgroundColor: '#b5334d',
  },

  // Tab row with more button
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16 * scale,
    gap: 8 * scale,
  },
  moreCircle: {
    width: 32 * scale,
    height: 32 * scale,
    borderRadius: 16 * scale,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // --- FIX 7: Section header with correct text style ---
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8 * scale,
  },
  sectionTitle: {
    fontSize: 12 * scale,
    fontFamily: FONTS.regular,
    color: '#000000',
    letterSpacing: -0.3,
    lineHeight: 15.6 * scale,
  },

  // --- FIX 5: Horizontal scroll styles for edge-to-edge ---
  beautyCircleScrollContent: {
    gap: 12 * scale,
    paddingLeft: 16 * scale,
    paddingRight: 16 * scale,
  },
  hScrollContentPadded: {
    gap: 12 * scale,
    paddingLeft: 16 * scale,
    paddingRight: 16 * scale,
  },

  // Hero stacked swipeable cards
  heroStackContainer: {
    height: 164 * scale,
    marginHorizontal: 16 * scale,
    position: 'relative',
  },
  heroSwipeCardOuter: {
    position: 'absolute',
    width: '100%',
    height: 164 * scale,
    borderRadius: 32 * scale,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  heroSwipeCardInner: {
    width: '100%',
    height: '100%',
    borderRadius: 32 * scale,
    overflow: 'hidden',
  },
  heroSwipeImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroScrollGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100 * scale,
    padding: 16 * scale,
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 32 * scale,
    borderBottomRightRadius: 32 * scale,
  },
  heroScrollTitle: {
    fontSize: 24 * scale,
    fontFamily: FONTS.bold,
    color: '#ffffff',
    letterSpacing: -0.8,
  },
  heroScrollSubtitle: {
    fontSize: 12 * scale,
    fontFamily: FONTS.regular,
    color: '#ffffff',
    marginTop: 2 * scale,
    letterSpacing: -0.3,
  },
  heroActivityBtn: {
    position: 'absolute',
    top: 16 * scale,
    right: 16 * scale,
    width: 32 * scale,
    height: 32 * scale,
    borderRadius: 16 * scale,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  // Card badges
  cardTopLeftBadge: {
    position: 'absolute',
    top: 8 * scale,
    left: 8 * scale,
    zIndex: 2,
  },
  cardTopRightBadge: {
    position: 'absolute',
    top: 8 * scale,
    right: 8 * scale,
    zIndex: 2,
  },
  cardAvatarStack: {
    flexDirection: 'row',
  },
  cardAvatar: {
    width: 16 * scale,
    height: 16 * scale,
    borderRadius: 8 * scale,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  cardAvatarOverlap: {
    marginLeft: -6 * scale,
  },
  cardActivityBadge: {
    width: 24 * scale,
    height: 24 * scale,
    borderRadius: 12 * scale,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBagIcon: {
    width: 20 * scale,
    height: 20 * scale,
    borderRadius: 10 * scale,
    backgroundColor: '#fff1d0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // --- FIX 4: Masonry Grid ---
  masonryContainer: {
    flexDirection: 'row',
    gap: 12 * scale,
  },
  masonryColumn: {
    flex: 1,
    gap: 12 * scale,
  },
  masonryCard: {
    // Each card is a vertical stack
  },
  masonryImage: {
    width: '100%',
    borderRadius: 24 * scale,
  },
  masonryBagOverlay: {
    position: 'absolute',
    bottom: 8 * scale,
    right: 8 * scale,
    width: 20 * scale,
    height: 20 * scale,
    borderRadius: 10 * scale,
    backgroundColor: '#fff1d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  masonryTextContainer: {
    paddingTop: 12 * scale,
    paddingBottom: 12 * scale,
    gap: 4 * scale,
  },
  masonryProductTitle: {
    fontSize: 14 * scale,
    fontFamily: FONTS.semiBold,
    color: '#000000',
    letterSpacing: -0.35,
    lineHeight: 18.2 * scale,
  },
  masonryContentTitle: {
    fontSize: 16 * scale,
    fontFamily: FONTS.semiBold,
    color: '#000000',
    letterSpacing: -0.4,
    lineHeight: 20.8 * scale,
  },
  masonryPrice: {
    fontSize: 12 * scale,
    fontFamily: FONTS.regular,
    color: '#000000',
    letterSpacing: -0.3,
    lineHeight: 15.6 * scale,
  },
  masonrySubtitle: {
    fontSize: 12 * scale,
    fontFamily: FONTS.regular,
    color: '#757575',
    letterSpacing: -0.3,
    lineHeight: 15.6 * scale,
  },

  // Medium cards (221x260)
  medCardImage: {
    width: 221 * scale,
    height: 260 * scale,
    borderRadius: 24 * scale,
  },
  medCardTitle: {
    fontSize: 16 * scale,
    fontFamily: FONTS.semiBold,
    color: '#000000',
    marginTop: 12 * scale,
    letterSpacing: -0.4,
    lineHeight: 20.8 * scale,
  },
  medCardSubtitle: {
    fontSize: 12 * scale,
    fontFamily: FONTS.regular,
    color: '#757575',
    marginTop: 4 * scale,
    letterSpacing: -0.3,
    lineHeight: 15.6 * scale,
  },

  // Aura Points
  auraCard: {
    width: '100%',
    height: 86 * scale,
    borderRadius: 16 * scale,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#f5f5f5',
    padding: 12 * scale,
    gap: 8 * scale,
    justifyContent: 'center',
  },
  auraRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  auraLabel: {
    fontSize: 12 * scale,
    fontFamily: FONTS.semiBold,
    color: '#000000',
    letterSpacing: -0.3,
    lineHeight: 15.6 * scale,
  },
  auraGreenBtn: {
    width: 20 * scale,
    height: 20 * scale,
    borderRadius: 10 * scale,
    backgroundColor: '#53d86a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  auraBarBg: {
    height: 10 * scale,
    borderRadius: 8 * scale,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  auraBarFill: {
    width: '68%',
    height: '100%',
    borderRadius: 8 * scale,
    backgroundColor: '#008080',
  },
  auraSmallText: {
    fontSize: 12 * scale,
    fontFamily: FONTS.regular,
    color: '#000000',
    letterSpacing: -0.3,
    lineHeight: 15.6 * scale,
  },

  // Product cards (128x165)
  prodImage: {
    width: 128 * scale,
    height: 165 * scale,
    borderRadius: 24 * scale,
  },
  bagIconOverlay: {
    position: 'absolute',
    bottom: 8 * scale,
    right: 8 * scale,
    width: 20 * scale,
    height: 20 * scale,
    borderRadius: 16 * scale,
    backgroundColor: '#fff1d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prodTitle: {
    fontSize: 14 * scale,
    fontFamily: FONTS.semiBold,
    color: '#000000',
    marginTop: 12 * scale,
    letterSpacing: -0.35,
    lineHeight: 18.2 * scale,
  },
  prodBrand: {
    fontSize: 12 * scale,
    fontFamily: FONTS.regular,
    color: '#757575',
    marginTop: 4 * scale,
    letterSpacing: -0.3,
    lineHeight: 15.6 * scale,
  },

  // Scan Like a Pro
  scanRow: {
    width: '100%',
    height: 72 * scale,
    borderRadius: 16 * scale,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#f5f5f5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12 * scale,
    gap: 12 * scale,
  },
  scanIconBox: {
    width: 48 * scale,
    height: 48 * scale,
    borderRadius: 8 * scale,
    backgroundColor: '#f6e5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanTitle: {
    fontSize: 14 * scale,
    fontFamily: FONTS.semiBold,
    color: '#000000',
    letterSpacing: -0.35,
    lineHeight: 18.2 * scale,
  },
  scanSubtitle: {
    fontSize: 12 * scale,
    fontFamily: FONTS.regular,
    color: '#000000',
    marginTop: 4 * scale,
    letterSpacing: -0.3,
    lineHeight: 15.6 * scale,
  },
  scanArrowBtn: {
    width: 32 * scale,
    height: 32 * scale,
    borderRadius: 16 * scale,
    borderWidth: 1,
    borderColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Most-Loved
  lovedRow: {
    width: '100%',
    height: 86 * scale,
    borderRadius: 16 * scale,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#f5f5f5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12 * scale,
    gap: 12 * scale,
  },
  lovedImage: {
    width: 62 * scale,
    height: 62 * scale,
    borderRadius: 8 * scale,
  },
  lovedTag: {
    fontSize: 12 * scale,
    fontFamily: FONTS.semiBold,
    color: '#000000',
    textTransform: 'capitalize',
    letterSpacing: -0.3,
    lineHeight: 15.6 * scale,
  },
  lovedTitle: {
    fontSize: 14 * scale,
    fontFamily: FONTS.semiBold,
    color: '#000000',
    letterSpacing: -0.35,
    lineHeight: 18.2 * scale,
  },
  lovedPrice: {
    fontSize: 12 * scale,
    fontFamily: FONTS.regular,
    color: '#000000',
    letterSpacing: -0.3,
    lineHeight: 15.6 * scale,
  },
  lovedInfoBtn: {
    width: 20 * scale,
    height: 20 * scale,
    borderRadius: 16 * scale,
    borderWidth: 1,
    borderColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // --- FIX 6: Ask Away prompt chips - flexible sizing ---
  promptChip: {
    width: 148 * scale,
    height: 56 * scale,
    borderRadius: 8 * scale,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#f5f5f5',
    paddingHorizontal: 12 * scale,
    paddingVertical: 12 * scale,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  promptText: {
    fontSize: 12 * scale,
    fontFamily: FONTS.regular,
    color: '#000000',
    letterSpacing: -0.3,
    lineHeight: 15.6 * scale,
    width: (148 - 24) * scale,
  },

  // Beauty Reels (221x290)
  reelImage: {
    width: 221 * scale,
    height: 290 * scale,
    borderRadius: 24 * scale,
  },

  // --- FIX 8: Coming soon placeholder ---
  comingSoonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120 * scale,
  },
  comingSoonText: {
    fontSize: 16 * scale,
    fontFamily: FONTS.regular,
    color: '#757575',
    letterSpacing: -0.3,
  },

  // Double-tap like overlay
  heartOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: 10,
    pointerEvents: 'none' as const,
  },
  heartCircle: {
    width: 72 * scale,
    height: 72 * scale,
    borderRadius: 36 * scale,
    backgroundColor: 'rgba(162, 0, 33, 0.85)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});
