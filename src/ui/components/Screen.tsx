import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme';

export type ScreenProps = {
  children: ReactNode;
  /**
   * Safe-area edges to pad. The app is edge-to-edge (RN 0.87 enables it by
   * default on Android), so every screen must claim its own edges. Screens
   * inside the tab navigator omit `bottom`, which the tab bar already owns.
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
  edges = ['top', 'left', 'right'],
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
