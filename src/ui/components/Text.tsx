import { StyleSheet, Text as RNText } from 'react-native';
import type { TextProps as RNTextProps, StyleProp, TextStyle } from 'react-native';

import { colors, typography } from '../theme';
import type { TypographyToken } from '../theme/typography';

type TextColor = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'accent' | 'danger';

export type TextProps = RNTextProps & {
  variant?: TypographyToken;
  color?: TextColor;
  style?: StyleProp<TextStyle>;
};

const colorFor: Record<TextColor, string> = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  tertiary: colors.textTertiary,
  inverse: colors.textInverse,
  accent: colors.accent,
  danger: colors.danger,
};

/**
 * Typographic primitive. Screens use this instead of raw `Text` so font sizes,
 * weights, and text colors can only come from the theme.
 */
export const Text = ({ variant = 'body', color = 'primary', style, ...rest }: TextProps) => (
  <RNText style={[styles[variant], { color: colorFor[color] }, style]} {...rest} />
);

const styles = StyleSheet.create({
  display: typography.display,
  title: typography.title,
  heading: typography.heading,
  body: typography.body,
  bodyStrong: typography.bodyStrong,
  caption: typography.caption,
  overline: typography.overline,
});
