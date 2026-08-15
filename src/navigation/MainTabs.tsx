import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';

import { CalendarScreen } from '../features/calendar/screens/CalendarScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { colors, spacing, typography } from '../ui/theme';
import { TabBarIcon } from './TabBarIcon';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * The authenticated area. Screens render their own headers, so the tab
 * navigator's header is disabled to avoid stacking two title bars.
 */
export const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.textTertiary,
      tabBarStyle: styles.tabBar,
      tabBarLabelStyle: styles.tabLabel,
      tabBarItemStyle: styles.tabItem,
    }}>
    <Tab.Screen
      name="Calendar"
      component={CalendarScreen}
      options={{
        tabBarLabel: 'Calendar',
        tabBarAccessibilityLabel: 'Calendar tab',
        tabBarIcon: ({ focused }) => <TabBarIcon name="calendar" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarAccessibilityLabel: 'Profile tab',
        tabBarIcon: ({ focused }) => <TabBarIcon name="profile" focused={focused} />,
      }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    // The navigator adds the bottom safe-area inset on top of this height,
    // so no device-specific padding is hardcoded here.
    height: 60,
    paddingTop: spacing.sm,
  },
  tabItem: {
    paddingVertical: spacing.xxs,
  },
  tabLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
});
