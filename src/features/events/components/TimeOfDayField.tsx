import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { formatTimeInput } from '../../../domain/date/format';
import { addMinutes } from '../../../domain/date/timeOfDay';
import type { TimeOfDay } from '../../../domain/date/timeOfDay';
import { Card, Text } from '../../../ui/components';
import { colors, radii, spacing } from '../../../ui/theme';

type StepperGroup = 'hour' | 'minute';

export type TimeOfDayFieldProps = {
  label: string;
  value: TimeOfDay;
  onChange: (value: TimeOfDay) => void;
  error?: string;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export const TimeOfDayField = ({
  label,
  value,
  onChange,
  error,
  disabled = false,
  containerStyle,
}: TimeOfDayFieldProps) => {
  const [selected, setSelected] = useState<StepperGroup | null>(null);
  const display = formatTimeInput(value);
  const hasError = error !== undefined;

  const adjust = (group: StepperGroup, amount: number) => {
    if (disabled) {
      return;
    }
    setSelected(group);
    onChange(addMinutes(value, amount));
  };

  return (
    <View style={containerStyle}>
      <Text variant="caption" color="secondary" style={styles.label}>
        {label}
      </Text>
      <Card tone="flat" padded={false} style={[styles.panel, hasError && styles.panelError]}>
        <Text
          variant="display"
          accessibilityLabel={`${label}, ${display}`}
          style={styles.clock}>
          {display}
        </Text>
        <View style={styles.groups}>
          <StepperCluster
            groupLabel="Hour"
            selected={selected === 'hour'}
            decreaseLabel={`${label} hour earlier`}
            increaseLabel={`${label} hour later`}
            onDecrease={() => adjust('hour', -60)}
            onIncrease={() => adjust('hour', 60)}
            disabled={disabled}
          />
          <StepperCluster
            groupLabel="Minute"
            selected={selected === 'minute'}
            decreaseLabel={`${label} 5 minutes earlier`}
            increaseLabel={`${label} 5 minutes later`}
            onDecrease={() => adjust('minute', -5)}
            onIncrease={() => adjust('minute', 5)}
            disabled={disabled}
          />
        </View>
      </Card>
      {error !== undefined ? (
        <Text variant="caption" color="danger" style={styles.message} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
};

type StepperClusterProps = {
  groupLabel: string;
  selected: boolean;
  decreaseLabel: string;
  increaseLabel: string;
  onDecrease: () => void;
  onIncrease: () => void;
  disabled: boolean;
};

const StepperCluster = ({
  groupLabel,
  selected,
  decreaseLabel,
  increaseLabel,
  onDecrease,
  onIncrease,
  disabled,
}: StepperClusterProps) => (
  <View style={[styles.cluster, selected && styles.clusterSelected]}>
    <Text variant="overline" color="tertiary" style={styles.clusterLabel}>
      {groupLabel}
    </Text>
    <StepButton label={increaseLabel} glyph="+" onPress={onIncrease} disabled={disabled} />
    <StepButton label={decreaseLabel} glyph="−" onPress={onDecrease} disabled={disabled} />
  </View>
);

type StepButtonProps = {
  label: string;
  glyph: string;
  onPress: () => void;
  disabled: boolean;
};

const StepButton = ({ label, glyph, onPress, disabled }: StepButtonProps) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={({ pressed }) => [styles.step, pressed && styles.stepPressed, disabled && styles.stepDisabled]}>
    {({ pressed }) => (
      <Text variant="title" color={disabled ? 'tertiary' : pressed ? 'inverse' : 'accent'}>
        {glyph}
      </Text>
    )}
  </Pressable>
);

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  panel: {
    padding: spacing.md,
    backgroundColor: colors.surfaceSunken,
    gap: spacing.md,
  },
  panelError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSubtle,
  },
  clock: {
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  groups: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cluster: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  clusterSelected: {
    borderColor: colors.accent,
  },
  clusterLabel: {
    textAlign: 'center',
    letterSpacing: 0.6,
    paddingVertical: spacing.xxs,
  },
  step: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.accentSubtle,
  },
  stepPressed: {
    backgroundColor: colors.accent,
  },
  stepDisabled: {
    opacity: 0.5,
  },
  message: {
    marginTop: spacing.xs,
  },
});
