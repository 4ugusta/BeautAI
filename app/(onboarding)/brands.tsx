import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { useOnboardingStore } from '../../store/onboarding-store';
import UnionIcon from '../../assets/icons/onboarding/screen2/Union.svg';
import RightIcon from '../../assets/icons/onboarding/screen2/Right.svg';
import ProgressBar from '../../components/onboarding/ProgressBar';
import XPBadge from '../../components/onboarding/XPBadge';
import BrandBubble from '../../components/onboarding/BrandBubble';
import BottomNav from '../../components/onboarding/BottomNav';
import { COLORS, FONTS, TYPOGRAPHY } from '../../constants/theme';

const scale = Dimensions.get('window').width / 393;
const CONTAINER_WIDTH = 377 * scale; // bubblesContainer width (393 - 16 margin)
const CONTAINER_HEIGHT = 420 * scale;

const ORIGINAL_POSITIONS = [
  { name: 'Charlotte Tilbury', diameter: 188, top: 0, left: 91 },
  { name: 'Fenty', diameter: 100, top: 102, left: 0 },
  { name: 'Chanel', diameter: 106, top: 95, left: 272 },
  { name: 'Estée Lauder', diameter: 122, top: 180, left: 61 },
  { name: 'Clinique', diameter: 122, top: 178, left: 189 },
  { name: 'Bare Minerals', diameter: 122, top: 297, left: 16 },
  { name: 'Dior', diameter: 100, top: 285, left: 138 },
  { name: 'MAC', diameter: 122, top: 297, left: 239 },
];

interface BrandPosition {
  name: string;
  diameter: number;
  top: number;
  left: number;
}

/**
 * Physics-based shuffle: scatter bubbles randomly, then iteratively
 * push overlapping pairs apart until no overlaps remain.
 */
function shufflePositions(brands: BrandPosition[]): BrandPosition[] {
  const maxX = CONTAINER_WIDTH / scale;
  const maxY = CONTAINER_HEIGHT / scale;
  const GAP = 2;

  // Initialize with random center positions
  const circles = brands.map((b) => {
    const r = b.diameter / 2;
    return {
      name: b.name,
      diameter: b.diameter,
      r,
      cx: r + Math.random() * (maxX - b.diameter),
      cy: r + Math.random() * (maxY - b.diameter),
    };
  });

  // Iteratively separate overlapping circles
  for (let iter = 0; iter < 150; iter++) {
    let moved = false;

    for (let i = 0; i < circles.length; i++) {
      for (let j = i + 1; j < circles.length; j++) {
        const a = circles[i];
        const b = circles[j];
        const dx = a.cx - b.cx;
        const dy = a.cy - b.cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
        const minDist = a.r + b.r + GAP;

        if (dist < minDist) {
          moved = true;
          const overlap = (minDist - dist) / 2;
          const nx = (dx / dist) * overlap;
          const ny = (dy / dist) * overlap;
          a.cx += nx;
          a.cy += ny;
          b.cx -= nx;
          b.cy -= ny;
        }
      }
    }

    // Clamp all circles inside bounds
    for (const c of circles) {
      c.cx = Math.max(c.r, Math.min(maxX - c.r, c.cx));
      c.cy = Math.max(c.r, Math.min(maxY - c.r, c.cy));
    }

    if (!moved) break;
  }

  return brands.map((b) => {
    const c = circles.find((ci) => ci.name === b.name)!;
    return { ...b, top: c.cy - c.r, left: c.cx - c.r };
  });
}

const SHAKE_THRESHOLD = 1.8;
const SHAKE_COOLDOWN_MS = 800;

const BRAND_NAMES = ORIGINAL_POSITIONS.map((b) => b.name);

/** Ask Groq to pick 3 random beauty brands from the list */
async function fetchGroqBrandPicks(): Promise<string[]> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a beauty brand recommender. Respond ONLY with a JSON array of brand names, nothing else.',
          },
          {
            role: 'user',
            content: `Pick exactly 3 brands from this list that make a great beauty combo. Return ONLY a JSON array like ["Brand1","Brand2","Brand3"]. Brands: ${BRAND_NAMES.join(', ')}`,
          },
        ],
        temperature: 1.2,
        max_tokens: 100,
      }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content ?? '';
    // Extract JSON array from response
    const match = content.match(/\[.*\]/s);
    if (!match) return [];

    const parsed: unknown = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return [];

    // Filter to only valid brand names
    return parsed.filter((b): b is string =>
      typeof b === 'string' && BRAND_NAMES.some((name) => name.toLowerCase() === b.toLowerCase())
    ).map((b) =>
      BRAND_NAMES.find((name) => name.toLowerCase() === b.toLowerCase()) ?? b
    );
  } catch {
    return [];
  }
}

export default function BrandsScreen() {
  const { favoriteBrands, setFavoriteBrands, addXP } = useOnboardingStore();
  const [selectedBrands, setSelectedBrands] = useState<string[]>(favoriteBrands);
  const [brandPositions, setBrandPositions] = useState<BrandPosition[]>(ORIGINAL_POSITIONS);
  const lastShakeRef = useRef(0);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => {
      if (prev.includes(brand)) {
        return prev.filter((b) => b !== brand);
      } else {
        return [...prev, brand];
      }
    });
  };

  const handleShuffle = useCallback(() => {
    const now = Date.now();
    if (now - lastShakeRef.current < SHAKE_COOLDOWN_MS) return;
    lastShakeRef.current = now;
    setBrandPositions(shufflePositions(ORIGINAL_POSITIONS));

    // Ask Groq to pick brands (fire-and-forget, non-blocking)
    fetchGroqBrandPicks().then((picks) => {
      if (picks.length > 0) {
        setSelectedBrands(picks);
      }
    });
  }, []);

  // Accelerometer shake detection
  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      if (magnitude > SHAKE_THRESHOLD) {
        handleShuffle();
      }
    });
    return () => subscription.remove();
  }, [handleShuffle]);

  const handleNext = () => {
    if (selectedBrands.length > 0) {
      setFavoriteBrands(selectedBrands);
      if (favoriteBrands.length === 0) {
        addXP(10);
      }
      router.push('/(onboarding)/routine');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ProgressBar totalSteps={6} currentStep={1} />

        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.navArrow}>
            <UnionIcon width={12 * scale} height={12 * scale} />
          </TouchableOpacity>
          <Text style={styles.title}>Brands I love</Text>
          <TouchableOpacity onPress={handleNext} style={styles.navArrow}>
            <RightIcon width={12 * scale} height={12 * scale} />
          </TouchableOpacity>
        </View>

        <XPBadge xp={10} />

        <View style={{ flex: 1 }} />

        <View style={styles.bubblesContainer}>
          {brandPositions.map((brand) => (
            <AnimatedBubble
              key={brand.name}
              brand={brand.name}
              diameter={brand.diameter}
              top={brand.top}
              left={brand.left}
              selected={selectedBrands.includes(brand.name)}
              onPress={() => toggleBrand(brand.name)}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.hintContainer} onPress={handleShuffle}>
          <Text style={styles.hintText}>Shake to shuffle</Text>
        </TouchableOpacity>

        <BottomNav
          onBack={handleBack}
          onNext={handleNext}
          showBack={true}
          showNext={selectedBrands.length > 0}
        />
      </View>
    </SafeAreaView>
  );
}

/** Wrapper that animates position changes with spring physics */
function AnimatedBubble({
  brand,
  diameter,
  top,
  left,
  selected,
  onPress,
}: {
  brand: string;
  diameter: number;
  top: number;
  left: number;
  selected: boolean;
  onPress: () => void;
}) {
  const animTop = useSharedValue(top * scale);
  const animLeft = useSharedValue(left * scale);

  useEffect(() => {
    animTop.value = withSpring(top * scale, { damping: 12, stiffness: 90 });
    animLeft.value = withSpring(left * scale, { damping: 12, stiffness: 90 });
  }, [top, left, animTop, animLeft]);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    top: animTop.value,
    left: animLeft.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <BrandBubble
        brand={brand}
        diameter={diameter}
        selected={selected}
        onPress={onPress}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  navArrow: {
    width: 20 * scale,
    height: 20 * scale,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.onboardingTitle,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  bubblesContainer: {
    height: 420 * scale,
    transform: [{ translateY: -15 * scale }],
    position: 'relative',
    marginHorizontal: 8,
  },
  hintContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  hintText: {
    fontSize: TYPOGRAPHY.xpBadge,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
});
