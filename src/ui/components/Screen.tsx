import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme';

export type ScreenProps = {
  children: ReactNode;
  /**
   * Safe-area edges to pad. Navigator chrome owns the rest:
   * headers pad `top`; the tab bar pads `bottom` on tab screens.
   * Default is left/right only so screens under a header do not double-inset.
   */
  edges?: readonly Edge[];
  /** Wraps children in a ScrollView. Use for forms and any content that can overflow. */
  scrollable?: boolean;
  /** Adds horizontal gutters. Disable for full-bleed content such as lists. */
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
  const bodyStyle = [padded && styles.padded, style];

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.root, background === 'surface' && styles.rootSurface]}>
      <KeyboardAvoidingView
        style={styles.fill}
        // Android resizes the window itself via `adjustResize` in the manifest;
        // adding padding on top of that double-counts the keyboard.
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scrollable ? (
          <ScrollView
            style={styles.fill}
            contentContainerStyle={[styles.scrollContent, bodyStyle, contentContainerStyle]}
            // RN 0.87 removed boolean support for this prop.
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
    backgroundColor: colors.background,
  },
  rootSurface: {
    backgroundColor: colors.surface,
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
