import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Edge } from 'react-native-safe-area-context';

import { spacing, useTheme } from '../theme';

export type ScreenProps = {
  children: ReactNode;
  /**
   * Safe-area edges to pad. Navigator chrome owns the rest:
   * headers pad `top`; the main nav bar pads `bottom` on Calendar and Profile.
   * Default is left/right only so screens under a header do not double-inset.
   */
  edges?: readonly Edge[];
  scrollable?: boolean;
  padded?: boolean;
  background?: 'default' | 'surface';
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

export const Screen = ({
  children,
  edges = ['left', 'right'],
  scrollable = false,
  padded = true,
  background = 'default',
  contentContainerStyle,
  style,
}: ScreenProps) => {
  const { colors } = useTheme();
  const bodyStyle = [padded && styles.padded, style];

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.root,
        { backgroundColor: background === 'surface' ? colors.surface : colors.background },
      ]}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scrollable ? (
          <ScrollView
            style={styles.fill}
            contentContainerStyle={[styles.scrollContent, bodyStyle, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.fill, bodyStyle, contentContainerStyle]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
});
