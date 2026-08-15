import { useId, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import type { StyleProp, TextInputProps, TextInputInstance, ViewStyle } from 'react-native';

import { colors, radii, spacing, typography } from '../theme';
import { Text } from './Text';

export type TextFieldProps = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  label: string;
  /** Validation message. Presence of this switches the field into its error state. */
  error?: string;
  /** Persistent guidance shown when there is no error. */
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
        // Announces the validation message together with the field rather than
        // relying on the red tint alone.
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
          isFocused && styles.inputFocused,
          hasError && styles.inputError,
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
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    ...typography.body,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  inputFocused: {
    borderColor: colors.accent,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSubtle,
  },
  message: {
    marginTop: spacing.xs,
  },
});
