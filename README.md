# BeautAI

A personalised beauty profile app built with React Native / Expo. Features AI-powered chat, gamified onboarding with shake-to-shuffle, and a "For You" feed algorithm.

## Setup

### Prerequisites
- Node.js 18+
- iOS Simulator (Xcode) or Expo Go on a physical device
- npm

### Installation

```bash
cd app
npm install
```

### Environment Variables

Create a `.env` file in the `app/` directory:

```
EXPO_PUBLIC_SUPABASE_URL=<your_supabase_url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
EXPO_PUBLIC_GROQ_API_KEY=<your_groq_api_key>
```

### Running

```bash
npx expo start
```

Press `i` to open in iOS Simulator, or scan the QR code with Expo Go.

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 54, TypeScript |
| Styling | NativeWind v4 (Tailwind CSS) |
| Navigation | expo-router (file-based routing) |
| State | Zustand (4 stores) + TanStack Query |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| AI | Groq API (llama-3.1-8b-instant) |
| Images | expo-image |
| Lists | @shopify/flash-list |
| Gestures | react-native-gesture-handler |
| Animations | react-native-reanimated |
| Sensors | expo-sensors (accelerometer) |

### Project Structure

```
app/                          # Expo project root
├── app/                      # expo-router file-based routes
│   ├── _layout.tsx           # Root layout (auth check, fonts, ErrorBoundary)
│   ├── index.tsx             # Entry redirect
│   ├── notifications.tsx     # Notifications screen
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── login.tsx         # Email/password auth with domain selector
│   ├── (onboarding)/
│   │   ├── _layout.tsx
│   │   ├── brands.tsx        # Step 1: Brand selection (bubbles + shake-to-shuffle)
│   │   ├── routine.tsx       # Step 2: Routine time (circular dial)
│   │   ├── vibe.tsx          # Step 3: Beauty vibe (swipe cards)
│   │   └── complete.tsx      # Step 4: Confetti + dashboard redirect
│   └── (tabs)/
│       ├── _layout.tsx       # Bottom tab navigator (5 tabs)
│       ├── index.tsx         # Home Feed with "For You" algorithm
│       ├── search.tsx        # Placeholder
│       ├── chat.tsx          # AI Chat (list + conversation views)
│       ├── saved.tsx         # Placeholder
│       └── settings.tsx      # Profile & settings
├── components/
│   ├── ErrorBoundary.tsx     # Global crash recovery
│   ├── onboarding/           # BrandBubble, CircularDial, SwipeCard, Confetti, etc.
│   ├── home/                 # TabPills, ContentCard, HeroSection, etc.
│   └── chat/                 # ChatInput, MessageBubble, SuggestedQuestion
├── store/
│   ├── auth-store.ts         # Auth state + session management
│   ├── onboarding-store.ts   # Onboarding progress + XP tracking
│   ├── feed-store.ts         # Posts, ranking algorithm, likes
│   └── chat-store.ts         # Threads, messages, Supabase persistence
├── lib/
│   ├── supabase.ts           # Supabase client init
│   └── groq.ts               # Groq API (XHR streaming + fallbacks)
├── constants/
│   └── theme.ts              # Colors, fonts, typography, spacing
└── assets/                   # Icons (SVG), images
```

### Key Decisions

**Zustand over Redux/Context** — Four lightweight stores (auth, onboarding, feed, chat) with no boilerplate. Each store owns its Supabase interactions, keeping data logic colocated.

**XHR streaming for AI chat** — React Native doesn't support `ReadableStream`, so Groq integration uses `XMLHttpRequest` with `onreadystatechange` (readyState 3) to parse SSE chunks incrementally. A fallback parses the full response if streaming fails.

**Chat thread persistence via AsyncStorage** — The Supabase `messages` table has no `thread_id` column. Thread-to-message mapping is stored locally in AsyncStorage, allowing threads to survive app restarts without schema changes.

**Physics-based bubble layout** — The shake-to-shuffle feature uses iterative circle separation (push overlapping pairs apart) rather than random placement, guaranteeing zero overlap regardless of bubble sizes.

**Optimistic UI with rollback** — Likes update the UI immediately, then persist to Supabase. On failure, the feed refreshes to revert. A `Set`-based guard prevents race conditions from rapid taps.

**Proportional sizing** — All UI dimensions use `scale = screenWidth / 393` (Figma frame width) so layouts adapt to different devices without hardcoded pixels.

---

## Features

### Login
- Email + password authentication via Supabase
- Form validation (email format, 8-char minimum password)
- Domain selector dropdown (@gmail.com, @outlook.com, @yahoo.com, @icloud.com)
- Auto-routes to onboarding or home based on profile state

### Onboarding (4 steps, gamified with XP)
- **Brands I Love** (+10 XP) — Organic bubble cluster, multi-select, shake-to-shuffle with physics-based repositioning and Groq-powered brand recommendations
- **Routine Time** (+30 XP) — Draggable circular dial with 5 personality labels
- **Beauty Vibe** (+40 XP) — Swipeable card stack (6 vibes) with gesture-driven selection
- **Completion** — Continuous confetti animation, saves all data to Supabase

### Home Feed
- "For You" algorithm: `score = relevance(0.5) + recency(0.3) + popularity(0.2)`
- Relevance matches user's beauty vibe and favorite brands against post tags
- 2-column masonry grid + hero section + horizontal "Beauty Circle Favs"
- Pull-to-refresh, double-tap to like, scroll-hide header
- Tab pills (For You active, others show "Coming soon")

### AI Chat
- Powered by Groq (llama-3.1-8b-instant)
- Profile-aware system prompt (knows user's brands, vibe, routine time, XP)
- XHR-based streaming with blinking cursor
- 13 suggested questions + routine shortcuts (Morning / Night Time)
- Thread management (create, switch, persist across sessions)
- Messages saved to Supabase
- Animated color-cycling input border (gold / pink / teal) on focus
- Dark maroon theme (#3D0C11)

### Settings & Notifications
- Settings screen with profile card, grouped menu items, search bar, log out
- Notifications screen grouped by time (Today / This week / Last week) with read/unread states

---

## Time Breakdown

**Total: ~17 focused hours** (built with Claude AI assistance using multi-agent workflows for parallel development)

| Phase | Hours | Details |
|-------|-------|---------|
| Scaffolding & setup | ~1.5 | Expo init, dependencies, Supabase client, theme tokens, routing, env config |
| Auth & login | ~1.5 | Supabase auth, form validation, domain selector, session management, auto-routing |
| Onboarding (4 screens) | ~4 | Bubble cluster, circular dial, swipe cards, confetti, XP system, Supabase persistence |
| Home Feed | ~3 | Feed algorithm, masonry grid, hero section, tab pills, likes, scroll-hide header |
| AI Chat | ~4 | Groq XHR streaming, thread system, AsyncStorage persistence, suggested questions, dark theme |
| Settings & Notifications | ~1 | Settings rewrite to match Figma, notifications with mock data |
| Polish & bug fixes | ~2 | Figma fidelity pass, race condition fixes, memory leak fixes, ErrorBoundary, shake-to-shuffle with Groq brand picks |

---

## Known Limitations

1. **Streaming depends on RN environment** — If `XMLHttpRequest.readyState === 3` throws (some React Native builds restrict partial response access), the full response is parsed at completion and revealed word-by-word as a fallback
2. **"Continue With Apple" is a placeholder** — Apple Sign-In requires App Store provisioning; the button shows an alert
3. **Shake gesture needs a physical device** — The accelerometer doesn't fire in iOS Simulator; tapping "Shake to shuffle" text is the fallback
4. **Thread IDs are local-only** — Thread grouping lives in AsyncStorage, not synced across devices (Supabase messages table has no `thread_id` column)
5. **Search & Saved tabs are placeholders** — Show "Coming Soon" per the spec
6. **No image upload in chat** — Camera button shows "Coming Soon" alert
7. **No offline support** — Requires network for auth, feed, and chat
8. **No haptic feedback** — Not implemented
