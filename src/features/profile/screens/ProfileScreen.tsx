import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { initialsOf } from '../../../domain/auth/user';
import { radii, spacing, useTheme } from '../../../ui/theme';
import { Banner, Button, Card, Screen, Text } from '../../../ui/components';
import { biometricFailureMessage, useAuth, useAuthenticatedUser } from '../../auth/AuthProvider';
import { useEvents } from '../../events/EventsProvider';
import type { SecureCredentialFailure } from '../../../services/storage/secureCredentialStore';

export const ProfileScreen = () => {
  const { colors } = useTheme();
  const user = useAuthenticatedUser();
  const {
    signOut,
    biometricCapability,
    biometricsEnabled,
    biometricBusy,
    enableBiometrics,
    disableBiometrics,
  } = useAuth();
  const { events } = useEvents();
  const [setupFailure, setSetupFailure] = useState<SecureCredentialFailure | null>(null);

  const memberSince = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(user.createdAt));

  const statusLabel = (() => {
    if (biometricCapability.status === 'unavailable') {
      return 'Not available on this device';
    }
    if (biometricCapability.status === 'notEnrolled') {
      return 'No fingerprint or face enrolled';
    }
    return biometricsEnabled ? 'On for this device' : 'Off';
  })();

  const canToggle = biometricCapability.status === 'ready';

  return (
    <Screen scrollable>
      <Card style={styles.identity}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]} accessibilityElementsHidden>
          <Text variant="title" color="inverse">
            {initialsOf(user)}
          </Text>
        </View>
        <View style={styles.identityText}>
          <Text variant="heading" numberOfLines={1}>
            {user.displayName}
          </Text>
          <Text variant="body" color="secondary" numberOfLines={1}>
            {user.email}
          </Text>
        </View>
      </Card>

      <Card style={styles.details}>
        <DetailRow label="Events scheduled" value={String(events.length)} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <DetailRow label="Member since" value={memberSince} />
      </Card>

      <Card style={styles.security}>
        <Text variant="bodyStrong">Sign in with biometrics</Text>
        <Text variant="caption" color="secondary" style={styles.securityCopy}>
          Unlock the app on this device with fingerprint or face ID instead of typing your
          password.
        </Text>
        <DetailRow label="Status" value={statusLabel} />
        {setupFailure !== null ? (
          <Banner tone="danger" message={biometricFailureMessage(setupFailure)} />
        ) : null}
        {canToggle ? (
          <Button
            label={biometricsEnabled ? 'Turn off' : 'Turn on'}
            variant={biometricsEnabled ? 'danger' : 'primary'}
            size="md"
            loading={biometricBusy}
            onPress={() => {
              void (async () => {
                setSetupFailure(null);
                if (biometricsEnabled) {
                  await disableBiometrics();
                  return;
                }
                const failure = await enableBiometrics();
                setSetupFailure(failure);
              })();
            }}
            accessibilityHint={
              biometricsEnabled
                ? 'Turns off biometric unlock on this device'
                : 'Asks you to confirm with biometrics, then enables unlock on this device'
            }
          />
        ) : null}
      </Card>

      <View style={styles.actions}>
        <Button
          label="Log out"
          variant="danger"
          onPress={() => {
            void signOut();
          }}
          accessibilityHint="Signs you out and returns to the sign-in screen"
        />
      </View>
    </Screen>
  );
};

type DetailRowProps = {
  label: string;
  value: string;
};

const DetailRow = ({ label, value }: DetailRowProps) => (
  <View style={styles.row} accessible accessibilityLabel={`${label}, ${value}`}>
    <Text variant="body" color="secondary">
      {label}
    </Text>
    <Text variant="bodyStrong">{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityText: {
    flex: 1,
    gap: spacing.xxs,
  },
  details: {
    marginTop: spacing.lg,
    paddingVertical: spacing.xs,
  },
  security: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  securityCopy: {
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  actions: {
    marginTop: spacing.xl,
  },
});
