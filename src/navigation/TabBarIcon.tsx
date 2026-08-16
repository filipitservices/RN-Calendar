import { View } from 'react-native';
import { Calendar, User } from 'lucide-react-native';

import { useTheme } from '../ui/theme';

export type TabIconName = 'calendar' | 'profile';

export type TabBarIconProps = {
  name: TabIconName;
  focused: boolean;
};

export const TabBarIcon = ({ name, focused }: TabBarIconProps) => {
  const { colors } = useTheme();
  const tint = focused ? colors.accent : colors.textTertiary;
  const Icon = name === 'calendar' ? Calendar : User;
  return (
    <View accessibilityElementsHidden>
      <Icon size={22} color={tint} />
    </View>
  );
};
