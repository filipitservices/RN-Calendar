import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';

import { CalendarScreen } from '../features/calendar/screens/CalendarScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { colors, MIN_TOUCH_TARGET, spacing, typography } from '../ui/theme';
import { TabBarIcon } from './TabBarIcon';
import { sharedHeaderOptions } from './navigationTheme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Authenticated primary destinations. The tab navigator owns the screen
 * header (top inset) and the tab bar (bottom inset).
 */
export const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      ...sharedHeaderOptions,
      headerShown: true,
      animation: 'none',
      tabBarHideOnKeyboard: true,
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
        title: 'Calendar',
        tabBarLabel: 'Calendar',
        tabBarAccessibilityLabel: 'Calendar tab',
        tabBarIcon: ({ focused }) => <TabBarIcon name="calendar" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: 'Profile',
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
    paddingTop: spacing.sm,
  },
  tabItem: {
    minHeight: MIN_TOUCH_TARGET,
    paddingVertical: spacing.xxs,
  },
  tabLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
});
