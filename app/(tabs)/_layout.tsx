import { View, Image, StyleSheet, Dimensions, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { COLORS } from '../../constants/theme';

// Active (dark) SVG icons
import HomeActive from '../../assets/icons/bottomMenu/darkAndgreyToneIcons/Home.svg';
import ScanActive from '../../assets/icons/bottomMenu/darkAndgreyToneIcons/Scan.svg';
import DiscountActive from '../../assets/icons/bottomMenu/darkAndgreyToneIcons/Discount.svg';

// Inactive (light) SVG icons
import HomeInactive from '../../assets/icons/bottomMenu/light/Home.svg';
import ScanInactive from '../../assets/icons/bottomMenu/light/Scan.svg';
import VoiceInactive from '../../assets/icons/bottomMenu/light/Voice.svg';
import DiscountInactive from '../../assets/icons/bottomMenu/light/Discount.svg';

// Calendar tab icons
import CalendarActive from '../../assets/icons/bottomMenu/darkAndgreyToneIcons/Calendar.svg';
import CalendarInactive from '../../assets/icons/bottomMenu/light/Calendar.svg';

// Active center button icon (PNG)
const speakActiveIcon = require('../../assets/icons/bottomMenu/darkAndgreyToneIcons/Speak.png');

const { width: screenWidth } = Dimensions.get('window');
const scale = screenWidth / 393;

export default function TabsLayout() {
  const tabBarHeight = Math.round(80 * scale);
  const iconSize = Math.round(24 * scale);
  const centerIconSize = Math.round(20 * scale);
  const centerEllipseSize = Math.round(48 * scale);
  const centerStrokeWidth = Math.round(4 * scale);
  const centerContainerWidth = Math.round(72 * scale);
  const centerContainerHeight = Math.round(64 * scale);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          height: tabBarHeight + Math.round(16 * scale),
          paddingTop: Math.round(16 * scale),
          paddingBottom: Platform.OS === 'ios' ? Math.round(20 * scale) : Math.round(8 * scale),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? (
              <HomeActive width={iconSize} height={iconSize} />
            ) : (
              <HomeInactive width={iconSize} height={iconSize} />
            ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? (
              <ScanActive width={iconSize} height={iconSize} />
            ) : (
              <ScanInactive width={iconSize} height={iconSize} />
            ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarStyle: { display: 'none' },
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.centerButtonContainer,
                {
                  width: centerContainerWidth,
                  height: centerContainerHeight,
                },
              ]}
            >
              <View
                style={[
                  styles.centerButton,
                  {
                    width: centerEllipseSize,
                    height: centerEllipseSize,
                    borderRadius: centerEllipseSize / 2,
                    borderWidth: centerStrokeWidth,
                  },
                ]}
              >
                {focused ? (
                  <Image
                    source={speakActiveIcon}
                    style={{ width: centerIconSize, height: centerIconSize }}
                    resizeMode="contain"
                  />
                ) : (
                  <VoiceInactive width={centerIconSize} height={centerIconSize} />
                )}
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? (
              <DiscountActive width={iconSize} height={iconSize} />
            ) : (
              <DiscountInactive width={iconSize} height={iconSize} />
            ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? (
              <CalendarActive width={iconSize} height={iconSize} />
            ) : (
              <CalendarInactive width={iconSize} height={iconSize} />
            ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Math.round(-12 * (screenWidth / 393)),
  },
  centerButton: {
    borderColor: '#008080',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
