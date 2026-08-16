import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { formatTimeInput } from '../../../domain/date/format';
import { addMinutes } from '../../../domain/date/timeOfDay';
import type { TimeOfDay } from '../../../domain/date/timeOfDay';
import { Card, Text } from '../../../ui/components';
import { radii, spacing, useTheme } from '../../../ui/theme';

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
  const { colors } = useTheme();
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
      <Card
        tone="flat"
        padded={false}
        style={[
          styles.panel,
          {
            backgroundColor: hasError ? colors.dangerSubtle : colors.surfaceSunken,
            borderColor: hasError ? colors.danger : colors.border,
          },
        ]}>
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
}: StepperClusterProps) => {
  const { colors } = useTheme();
  return (
  <View
    style={[
      styles.cluster,
      {
        borderColor: selected ? colors.accent : colors.border,
        backgroundColor: colors.surface,
      },
    ]}>
    <Text variant="overline" color="tertiary" style={styles.clusterLabel}>
      {groupLabel}
    </Text>
    <StepButton label={increaseLabel} glyph="+" onPress={onIncrease} disabled={disabled} />
    <StepButton label={decreaseLabel} glyph="−" onPress={onDecrease} disabled={disabled} />
  </View>
  );
};

type StepButtonProps = {
  label: string;
  glyph: string;
  onPress: () => void;
  disabled: boolean;
};

const StepButton = ({ label, glyph, onPress, disabled }: StepButtonProps) => {
  const { colors } = useTheme();
  return (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={({ pressed }) => [
      styles.step,
      {
        backgroundColor: pressed ? colors.accent : colors.accentSubtle,
        opacity: disabled ? 0.5 : 1,
      },
    ]}>
    {({ pressed }) => (
      <Text variant="title" color={disabled ? 'tertiary' : pressed ? 'inverse' : 'accent'}>
        {glyph}
      </Text>
    )}
  </Pressable>
  );
};

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  panel: {
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
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
    borderRadius: radii.md,
    padding: spacing.xs,
    gap: spacing.xs,
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
  },
  message: {
    marginTop: spacing.xs,
  },
});
