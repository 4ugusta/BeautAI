import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgProps } from 'react-native-svg';
import { useAuthStore } from '../../store/auth-store';
import { COLORS, FONTS } from '../../constants/theme';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

// SVG icon imports
import LeftIcon from '../../assets/icons/settingsScreen/Left.svg';
import NotificationIcon from '../../assets/icons/settingsScreen/Notification.svg';
import RightIcon from '../../assets/icons/settingsScreen/Right.svg';
import SearchIcon from '../../assets/icons/settingsScreen/Search.svg';
import HeartIcon from '../../assets/icons/settingsScreen/Heart.svg';
import StarIcon from '../../assets/icons/settingsScreen/Star.svg';
import AccountAddIcon from '../../assets/icons/settingsScreen/AccountAdd.svg';
import GraphIcon from '../../assets/icons/settingsScreen/Graph.svg';
import SettingsIcon from '../../assets/icons/settingsScreen/Settings.svg';
import TimeIcon from '../../assets/icons/settingsScreen/Time.svg';
import SendIcon from '../../assets/icons/settingsScreen/Send.svg';
import AccountIcon from '../../assets/icons/settingsScreen/Account.svg';
import AccountAdd1Icon from '../../assets/icons/settingsScreen/AccountAdd1.svg';
import DiscountIcon from '../../assets/icons/settingsScreen/Discount.svg';
import LoginIcon from '../../assets/icons/settingsScreen/Login.svg';
import LockIcon from '../../assets/icons/settingsScreen/Lock.svg';

// Avatar SVG imports
import Avatar from '../../assets/icons/settingsScreen/Avatar.svg';
import Avatar1 from '../../assets/icons/settingsScreen/Avatar-1.svg';
import Avatar2 from '../../assets/icons/settingsScreen/Avatar-2.svg';
import Avatar3 from '../../assets/icons/settingsScreen/Avatar-3.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 393;

interface UserProfile {
  email: string;
  favorite_brands: string[];
  routine_time: string;
  beauty_vibe: string;
  xp_points: number;
}

interface MenuItemData {
  icon: React.FC<SvgProps>;
  label: string;
  onPress?: () => void;
}

const AVATAR_SVGS: React.FC<SvgProps>[] = [Avatar, Avatar1, Avatar2, Avatar3];

function MenuRow({ icon: Icon, label, onPress }: MenuItemData) {
  return (
    <TouchableOpacity
      style={styles.menuRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon width={16 * scale} height={16 * scale} />
      <Text style={styles.menuLabel}>{label}</Text>
      <RightIcon width={16 * scale} height={16 * scale} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const signOut = useAuthStore((state) => state.signOut);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select(
            'email, favorite_brands, routine_time, beauty_vibe, xp_points'
          )
          .eq('id', user.id)
          .single();
        if (data) setProfile(data as UserProfile);
      }
    } catch (e) {
      console.error('Failed to load profile:', e);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const menuGroup1: MenuItemData[] = [
    { icon: HeartIcon, label: 'Wishlist' },
    { icon: StarIcon, label: 'Exclusive Content' },
    { icon: AccountAddIcon, label: 'Refer a friend' },
  ];

  const menuGroup2: MenuItemData[] = [
    { icon: GraphIcon, label: 'Skin Profile' },
    { icon: SettingsIcon, label: 'Product Preferences' },
    { icon: TimeIcon, label: 'Interaction History' },
    { icon: SendIcon, label: 'Feedback' },
  ];

  const menuGroup3: MenuItemData[] = [
    { icon: AccountIcon, label: 'Family Sharing' },
    { icon: AccountAdd1Icon, label: 'Shared Bookings' },
    { icon: DiscountIcon, label: 'Gift Preferences' },
  ];

  const menuGroup4: MenuItemData[] = [
    { icon: LoginIcon, label: 'Login Activity' },
    { icon: LockIcon, label: 'App Lock' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <LeftIcon width={16 * scale} height={16 * scale} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Settings</Text>

        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => router.push('/notifications')}
          activeOpacity={0.7}
        >
          <NotificationIcon width={16 * scale} height={16 * scale} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>8</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <SearchIcon width={16 * scale} height={16 * scale} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#bdbdbd"
            editable={false}
          />
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarCircle}>
              <AccountIcon width={24 * scale} height={24 * scale} color="#ffffff" />
            </View>

            <View style={styles.profileTextContainer}>
              <View style={styles.profileTextInner}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {profile?.email
                    ? profile.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                    : 'Ruby Thompson'}
                </Text>
                <Text style={styles.profileSubtitle} numberOfLines={1}>
                  Beaut.ai account, skin profile, and more
                </Text>
              </View>

              <TouchableOpacity
                style={styles.profileArrowButton}
                activeOpacity={0.7}
              >
                <RightIcon width={16 * scale} height={16 * scale} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.beautyCircleRow}>
            <View style={styles.avatarsContainer}>
              {AVATAR_SVGS.map((AvatarSvg, index) => (
                <View
                  key={index}
                  style={[
                    styles.miniAvatar,
                    {
                      marginLeft: index === 0 ? 0 : -6 * scale,
                      zIndex: 4 - index,
                    },
                  ]}
                >
                  <AvatarSvg width={16 * scale} height={16 * scale} />
                </View>
              ))}
            </View>
            <Text style={styles.beautyCircleLabel}>Beauty Circle</Text>
          </View>
        </View>

        {/* Menu Group 1 */}
        <View style={styles.menuGroup}>
          {menuGroup1.map((item, index) => (
            <MenuRow key={`g1-${index}`} {...item} />
          ))}
        </View>

        {/* Menu Group 2 */}
        <View style={styles.menuGroup}>
          {menuGroup2.map((item, index) => (
            <MenuRow key={`g2-${index}`} {...item} />
          ))}
        </View>

        {/* Menu Group 3 */}
        <View style={styles.menuGroup}>
          {menuGroup3.map((item, index) => (
            <MenuRow key={`g3-${index}`} {...item} />
          ))}
        </View>

        {/* Menu Group 4 */}
        <View style={styles.menuGroup}>
          {menuGroup4.map((item, index) => (
            <MenuRow key={`g4-${index}`} {...item} />
          ))}
        </View>

        {/* Log Out Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LoginIcon width={20 * scale} height={20 * scale} color="#a20021" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16 * scale,
    height: 48 * scale,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f5f5f5',
  },
  headerIconButton: {
    width: 32 * scale,
    height: 32 * scale,
    borderRadius: 16 * scale,
    borderWidth: 1,
    borderColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 12 * scale,
    fontFamily: FONTS.semiBold,
    color: '#000000',
    letterSpacing: -0.3 * scale,
    textAlign: 'center',
  },

  /* Notification Badge */
  notificationBadge: {
    position: 'absolute',
    top: -4 * scale,
    right: -4 * scale,
    width: 16 * scale,
    height: 16 * scale,
    borderRadius: 8 * scale,
    backgroundColor: '#b5334d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    fontSize: 10 * scale,
    fontFamily: FONTS.semiBold,
    color: '#ffffff',
    lineHeight: 12 * scale,
  },

  /* ScrollView */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16 * scale,
    paddingTop: 16 * scale,
    paddingBottom: 32 * scale,
    gap: 16 * scale,
  },

  /* Search Bar */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42 * scale,
    borderRadius: 8 * scale,
    borderWidth: 1,
    borderColor: '#eeeeee',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12 * scale,
    gap: 4 * scale,
  },
  searchInput: {
    flex: 1,
    fontSize: 14 * scale,
    fontFamily: FONTS.regular,
    color: '#000000',
    letterSpacing: -0.35 * scale,
    paddingVertical: 0,
  },

  /* Profile Card */
  profileCard: {
    backgroundColor: '#fafafa',
    borderRadius: 16 * scale,
    borderWidth: 1,
    borderColor: '#f5f5f5',
    padding: 12 * scale,
    gap: 12 * scale,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12 * scale,
  },
  avatarCircle: {
    width: 48 * scale,
    height: 48 * scale,
    borderRadius: 24 * scale,
    backgroundColor: '#8B7355',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4 * scale,
  },
  profileTextInner: {
    flex: 1,
    justifyContent: 'center',
    gap: 4 * scale,
  },
  profileName: {
    fontSize: 14 * scale,
    fontFamily: FONTS.semiBold,
    color: '#000000',
    letterSpacing: -0.35 * scale,
    lineHeight: 18.2 * scale,
  },
  profileSubtitle: {
    fontSize: 12 * scale,
    fontFamily: FONTS.regular,
    color: '#000000',
    letterSpacing: -0.3 * scale,
    lineHeight: 15.6 * scale,
  },
  profileArrowButton: {
    width: 32 * scale,
    height: 32 * scale,
    borderRadius: 16 * scale,
    borderWidth: 1,
    borderColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Beauty Circle */
  beautyCircleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12 * scale,
    height: 16 * scale,
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 48 * scale,
  },
  miniAvatar: {
    width: 16 * scale,
    height: 16 * scale,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#ffffff',
    overflow: 'hidden',
  },
  beautyCircleLabel: {
    fontSize: 12 * scale,
    fontFamily: FONTS.regular,
    color: '#000000',
    letterSpacing: -0.3 * scale,
    lineHeight: 15.6 * scale,
  },

  /* Menu Groups */
  menuGroup: {
    gap: 2 * scale,
  },

  /* Menu Row */
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40 * scale,
    paddingHorizontal: 12 * scale,
    paddingVertical: 12 * scale,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#f5f5f5',
    borderRadius: 8 * scale,
    gap: 8 * scale,
  },
  menuLabel: {
    flex: 1,
    fontSize: 12 * scale,
    fontFamily: FONTS.semiBold,
    color: '#000000',
    letterSpacing: -0.3 * scale,
    lineHeight: 15.6 * scale,
  },

  /* Log Out Button */
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48 * scale,
    borderRadius: 16 * scale,
    borderWidth: 1.5,
    borderColor: '#a20021',
    backgroundColor: 'transparent',
    gap: 8 * scale,
    marginTop: 8 * scale,
  },
  logoutText: {
    fontSize: 16 * scale,
    fontFamily: FONTS.semiBold,
    color: '#a20021',
  },
});
