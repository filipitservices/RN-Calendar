import { StyleSheet, View } from 'react-native';

import { colors, radii } from '../ui/theme';

export type TabIconName = 'calendar' | 'profile';

export type TabBarIconProps = {
  name: TabIconName;
  focused: boolean;
};

/**
 * Tab glyphs drawn from primitives rather than pulling in an icon font package
 * for two shapes. Decorative only — the tab bar supplies the accessible label.
 */
export const TabBarIcon = ({ name, focused }: TabBarIconProps) => {
  const tint = focused ? colors.accent : colors.textTertiary;

  if (name === 'calendar') {
    return (
      <View style={[styles.calendar, { borderColor: tint }]} accessibilityElementsHidden>
        <View style={[styles.calendarBar, { backgroundColor: tint }]} />
        <View style={styles.calendarDots}>
          {[0, 1, 2, 3].map(index => (
            <View key={index} style={[styles.calendarDot, { backgroundColor: tint }]} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.profile} accessibilityElementsHidden>
      <View style={[styles.profileHead, { backgroundColor: tint }]} />
      <View style={[styles.profileBody, { backgroundColor: tint }]} />
    </View>
  );
};

const SIZE = 24;

const styles = StyleSheet.create({
  calendar: {
    width: SIZE,
    height: SIZE,
    borderWidth: 2,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  calendarBar: {
    height: 5,
  },
  calendarDots: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    gap: 2,
  },
  calendarDot: {
    width: 3,
    height: 3,
    borderRadius: radii.pill,
  },
  profile: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  profileHead: {
    width: 9,
    height: 9,
    borderRadius: radii.pill,
    marginBottom: 2,
  },
  profileBody: {
    width: 18,
    height: 11,
    borderTopLeftRadius: radii.pill,
    borderTopRightRadius: radii.pill,
  },
});
