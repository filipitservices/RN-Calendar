import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { initialsOf } from '../../../domain/auth/user';
import { colors, radii, spacing } from '../../../ui/theme';
import { Button, Card, Screen, Text } from '../../../ui/components';
import { useAuth, useAuthenticatedUser } from '../../auth/AuthProvider';
import { useEvents } from '../../events/EventsProvider';

export const ProfileScreen = () => {
  const user = useAuthenticatedUser();
  const { signOut } = useAuth();
  const { events } = useEvents();

  const memberSince = useMemo(
    () => new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(
      new Date(user.createdAt),
    ),
    [user.createdAt],
  );

  return (
    <Screen scrollable>
      <Card style={styles.identity}>
        <View style={styles.avatar} accessibilityElementsHidden>
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
        <View style={styles.divider} />
        <DetailRow label="Member since" value={memberSince} />
      </Card>

      <View style={styles.actions}>
        <Button
          label="Log out"
          variant="secondary"
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
  // Grouped so a screen reader announces "Events scheduled, 4" as one item.
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
    backgroundColor: colors.accent,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  actions: {
    marginTop: spacing.xl,
  },
});
