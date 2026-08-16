import { StyleSheet, Text as RNText } from 'react-native';
import type { TextProps as RNTextProps, StyleProp, TextStyle } from 'react-native';

import { typography, useTheme } from '../theme';
import type { TypographyToken } from '../theme/typography';
import type { ColorPalette } from '../theme';

type TextColor = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'accent' | 'danger';

export type TextProps = RNTextProps & {
  variant?: TypographyToken;
  color?: TextColor;
  style?: StyleProp<TextStyle>;
};

const colorFor = (colors: ColorPalette, color: TextColor): string => {
  switch (color) {
    case 'primary':
      return colors.textPrimary;
    case 'secondary':
      return colors.textSecondary;
    case 'tertiary':
      return colors.textTertiary;
    case 'inverse':
      return colors.textInverse;
    case 'accent':
      return colors.accent;
    case 'danger':
      return colors.danger;
  }
};

export const Text = ({ variant = 'body', color = 'primary', style, ...rest }: TextProps) => {
  const { colors } = useTheme();
  return <RNText style={[styles[variant], { color: colorFor(colors, color) }, style]} {...rest} />;
};

const styles = StyleSheet.create({
  display: typography.display,
  title: typography.title,
  heading: typography.heading,
  body: typography.body,
  bodyStrong: typography.bodyStrong,
  caption: typography.caption,
  overline: typography.overline,
});
