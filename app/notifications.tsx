import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, TYPOGRAPHY } from '../constants/theme';

// SVG icon imports for notification screen
import LeftIcon from '../assets/icons/notificationScreen/Left.svg';
import CalendarIcon from '../assets/icons/notificationScreen/Calendar.svg';
import CalendarAltIcon from '../assets/icons/notificationScreen/Calendar-1.svg';
import HeartIcon from '../assets/icons/notificationScreen/Heart.svg';
import DiscountIcon from '../assets/icons/notificationScreen/Discount.svg';
import VideoIcon from '../assets/icons/notificationScreen/Video.svg';
import EmailIcon from '../assets/icons/notificationScreen/Email.svg';
import ActivityIcon from '../assets/icons/notificationScreen/Activity.svg';
import AccountAddIcon from '../assets/icons/notificationScreen/AccountAdd.svg';
import TicketIcon from '../assets/icons/notificationScreen/Ticket.svg';

const { width: screenWidth } = Dimensions.get('window');
const scale = screenWidth / 393;

type NotificationIconType =
  | 'calendar'
  | 'calendar-alt'
  | 'heart'
  | 'discount'
  | 'video'
  | 'email'
  | 'activity'
  | 'account-add'
  | 'ticket';

interface NotificationItem {
  title: string;
  description: string;
  timestamp: string;
  icon: NotificationIconType;
  isUnread: boolean;
}

interface NotificationSection {
  title: string;
  data: NotificationItem[];
}

/**
 * Maps notification icon types to their SVG components.
 *
 * Calendar.svg has white fills (for unread/red background).
 * Calendar-1.svg has black fills (for read/grey background).
 * Heart.svg has white fills (for unread/red background).
 * All other SVGs have black fills (used in read state).
 */
const NOTIFICATION_ICON_MAP: Record<NotificationIconType, React.FC<import('react-native-svg').SvgProps>> = {
  'calendar': CalendarIcon,
  'calendar-alt': CalendarAltIcon,
  'heart': HeartIcon,
  'discount': DiscountIcon,
  'video': VideoIcon,
  'email': EmailIcon,
  'activity': ActivityIcon,
  'account-add': AccountAddIcon,
  'ticket': TicketIcon,
};

const NOTIFICATION_SECTIONS: NotificationSection[] = [
  {
    title: 'Today',
    data: [
      {
        title: 'Appointment is confirmed',
        description: 'Your appointment with Beauty Bar is on Friday at 1pm.',
        timestamp: '1h',
        icon: 'calendar',
        isUnread: true,
      },
      {
        title: "Beaut.ai's Pick for You",
        description: 'Beaut.ai recommends the new Rhode balm. Check it out.',
        timestamp: '1h',
        icon: 'heart',
        isUnread: true,
      },
      {
        title: "You've earned 150 points",
        description: 'Redeem them for exclusive rewards.',
        timestamp: '2h',
        icon: 'discount',
        isUnread: false,
      },
    ],
  },
  {
    title: 'This week',
    data: [
      {
        title: 'Appointment Reminder',
        description: 'Just a reminder: Your beauty session is tomorrow at 3 PM.',
        timestamp: '1d',
        icon: 'calendar-alt',
        isUnread: false,
      },
      {
        title: 'New Tutorial Alert',
        description: 'Learn how to achieve the perfect winged eyeliner.',
        timestamp: '3d',
        icon: 'video',
        isUnread: false,
      },
      {
        title: 'Exclusive Invite',
        description: "You're invited to our VIP beauty event this weekend.",
        timestamp: '3d',
        icon: 'email',
        isUnread: false,
      },
      {
        title: 'Skin Analysis Update',
        description: 'Your recent scan shows improvement in hydration levels.',
        timestamp: '5d',
        icon: 'activity',
        isUnread: false,
      },
    ],
  },
  {
    title: 'Last week',
    data: [
      {
        title: 'Friend Joined Beaut.ai',
        description: 'Juliana Mejia just joined Beaut.ai. Connect now.',
        timestamp: '1w',
        icon: 'account-add',
        isUnread: false,
      },
      {
        title: 'Birthday Treat Just for You!',
        description: "It's your special day! Enjoy 20% off your next booking.",
        timestamp: '1w',
        icon: 'ticket',
        isUnread: false,
      },
      {
        title: 'Appointment Rescheduled',
        description: 'Your appointment with Beauty Bay is now next Monday.',
        timestamp: '1w',
        icon: 'calendar-alt',
        isUnread: false,
      },
    ],
  },
];

function renderNotificationIcon(iconType: NotificationIconType, size: number): React.ReactElement {
  const IconComponent = NOTIFICATION_ICON_MAP[iconType];
  return <IconComponent width={size} height={size} />;
}

function NotificationRow({ item }: { item: NotificationItem }) {
  const iconContainerSize = Math.round(32 * scale);
  const iconSize = Math.round(16 * scale);
  const rowHeight = Math.round(56 * scale);
  const horizontalPadding = Math.round(16 * scale);
  const verticalPadding = Math.round(12 * scale);
  const gap = Math.round(8 * scale);

  return (
    <View
      style={[
        styles.notificationRow,
        {
          height: rowHeight,
          paddingHorizontal: horizontalPadding,
          paddingVertical: verticalPadding,
          gap,
          backgroundColor: item.isUnread ? '#fafafa' : COLORS.white,
          borderColor: COLORS.lightGray,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            width: iconContainerSize,
            height: iconContainerSize,
            borderRadius: iconContainerSize / 2,
            backgroundColor: item.isUnread ? COLORS.primary : '#eeeeee',
            borderColor: COLORS.lightGray,
          },
        ]}
      >
        {renderNotificationIcon(item.icon, iconSize)}
      </View>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.notificationTitle,
            { fontSize: Math.round(TYPOGRAPHY.bodySmall * scale) },
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text
          style={[
            styles.notificationDescription,
            { fontSize: Math.round(TYPOGRAPHY.bodySmall * scale) },
          ]}
          numberOfLines={1}
        >
          {item.description}
        </Text>
      </View>
      <Text
        style={[
          styles.timestamp,
          { fontSize: Math.round(TYPOGRAPHY.bodySmall * scale) },
        ]}
      >
        {item.timestamp}
      </Text>
    </View>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const headerHeight = Math.round(48 * scale);
  const backButtonSize = Math.round(32 * scale);
  const backIconSize = Math.round(16 * scale);
  const sectionGap = Math.round(16 * scale);
  const sectionTitlePadding = Math.round(16 * scale);
  const sectionInternalGap = Math.round(8 * scale);

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[
          styles.header,
          {
            height: headerHeight,
            borderColor: COLORS.lightGray,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              width: backButtonSize,
              height: backButtonSize,
              borderRadius: backButtonSize / 2,
              borderColor: COLORS.lightGray,
            },
          ]}
        >
          <LeftIcon width={backIconSize} height={backIconSize} />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            { fontSize: Math.round(14 * scale) },
          ]}
        >
          Notifications
        </Text>
        <View style={{ width: backButtonSize }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ gap: sectionGap }}
        showsVerticalScrollIndicator={false}
      >
        {NOTIFICATION_SECTIONS.map((section) => (
          <View key={section.title} style={{ gap: sectionInternalGap }}>
            <View
              style={[
                styles.sectionTitleContainer,
                { paddingHorizontal: sectionTitlePadding },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { fontSize: Math.round(TYPOGRAPHY.bodySmall * scale) },
                ]}
              >
                {section.title}
              </Text>
            </View>
            <View>
              {section.data.map((item, index) => (
                <NotificationRow key={`${section.title}-${index}`} item={item} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Math.round(16 * scale),
    borderBottomWidth: 1,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  sectionTitleContainer: {
    justifyContent: 'center',
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  notificationDescription: {
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
});
