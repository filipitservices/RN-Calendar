import { useId, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import type { StyleProp, TextInputProps, TextInputInstance, ViewStyle } from 'react-native';

import { radii, spacing, typography, useTheme } from '../theme';
import { Text } from './Text';

export type TextFieldProps = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  label: string;
  error?: string;
  hint?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputRef?: React.Ref<TextInputInstance>;
};

export const TextField = ({
  label,
  error,
  hint,
  containerStyle,
  inputRef,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const messageId = useId();
  const message = error ?? hint;
  const hasError = error !== undefined;

  return (
    <View style={containerStyle}>
      <Text variant="caption" color="secondary" style={styles.label} nativeID={`${messageId}-label`}>
        {label}
      </Text>
      <TextInput
        ref={inputRef}
        accessibilityLabel={label}
        accessibilityHint={message}
        aria-invalid={hasError}
        aria-labelledby={`${messageId}-label`}
        placeholderTextColor={colors.textTertiary}
        onFocus={event => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={event => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          {
            borderColor: hasError ? colors.danger : isFocused ? colors.accent : colors.border,
            backgroundColor: hasError ? colors.dangerSubtle : colors.surface,
            color: colors.textPrimary,
          },
          inputProps.multiline && styles.inputMultiline,
        ]}
        {...inputProps}
      />
      {message !== undefined ? (
        <Text
          variant="caption"
          color={hasError ? 'danger' : 'tertiary'}
          style={styles.message}
          accessibilityLiveRegion={hasError ? 'polite' : 'none'}>
          {message}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  message: {
    marginTop: spacing.xs,
  },
});
