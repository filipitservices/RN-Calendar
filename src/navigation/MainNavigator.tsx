import { useNavigationState, type NavigationState } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarScreen } from '../features/calendar/screens/CalendarScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { Text } from '../ui/components';
import { MIN_TOUCH_TARGET, spacing, typography, useTheme } from '../ui/theme';
import { stackScreenOptionsFor } from './navigationTheme';
import { TabBarIcon } from './TabBarIcon';
import type { MainStackParamList } from './types';

const MainStack = createNativeStackNavigator<MainStackParamList>();

type MainStackNav = Pick<NativeStackNavigationProp<MainStackParamList>, 'navigate'>;

/**
 * Authenticated primary destinations as stack pages. The nested native stack
 * owns headers; Profile slides in from the right, Calendar from the left.
 * The bar below is chrome, not a tab navigator.
 */
export const MainNavigator = () => {
  const nestedNavRef = useRef<MainStackNav | null>(null);
  const { colors, scheme } = useTheme();

  return (
    <View style={styles.shell}>
      <View style={styles.scenes}>
        <MainStack.Navigator
          screenOptions={stackScreenOptionsFor(colors, scheme)}
          screenListeners={({ navigation }) => {
            nestedNavRef.current = navigation;
            return {};
          }}>
          <MainStack.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{
              title: 'Calendar',
              headerBackVisible: false,
              animation: 'slide_from_left',
            }}
          />
          <MainStack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              title: 'Profile',
              headerBackVisible: false,
              animation: 'slide_from_right',
            }}
          />
        </MainStack.Navigator>
      </View>
      <MainNavBar nestedNavRef={nestedNavRef} />
    </View>
  );
};

const currentMainRoute = (state: NavigationState): keyof MainStackParamList => {
  const focused = state.routes[state.index];
  const nested = focused?.state;
  if (focused?.name !== 'Main' || nested === undefined || typeof nested.index !== 'number') {
    return 'Calendar';
  }
  const nestedRoute = nested.routes[nested.index];
  return nestedRoute?.name === 'Profile' ? 'Profile' : 'Calendar';
};

const MainNavBar = ({
  nestedNavRef,
}: {
  nestedNavRef: { current: MainStackNav | null };
}) => {
  const current = useNavigationState(currentMainRoute);
  const { colors } = useTheme();

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.bar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <View style={styles.barInner}>
        <NavItem
          name="calendar"
          label="Calendar"
          accessibilityLabel="Calendar tab"
          focused={current === 'Calendar'}
          onPress={() => {
            if (current !== 'Calendar') {
              nestedNavRef.current?.navigate('Calendar');
            }
          }}
        />
        <NavItem
          name="profile"
          label="Profile"
          accessibilityLabel="Profile tab"
          focused={current === 'Profile'}
          onPress={() => {
            if (current !== 'Profile') {
              nestedNavRef.current?.navigate('Profile');
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
};

type NavItemProps = {
  name: 'calendar' | 'profile';
  label: string;
  accessibilityLabel: string;
  focused: boolean;
  onPress: () => void;
};

const NavItem = ({ name, label, accessibilityLabel, focused, onPress }: NavItemProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    accessibilityState={{ selected: focused }}
    onPress={onPress}
    style={styles.item}>
    <TabBarIcon name={name} focused={focused} />
    <Text
      variant="caption"
      color={focused ? 'accent' : 'tertiary'}
      style={styles.itemLabel}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  scenes: {
    flex: 1,
  },
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  barInner: {
    flexDirection: 'row',
  },
  item: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxs,
    gap: spacing.xxs,
  },
  itemLabel: {
    fontWeight: typography.bodyStrong.fontWeight,
  },
});
