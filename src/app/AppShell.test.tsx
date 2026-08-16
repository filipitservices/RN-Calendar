import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { todayCalendarDate } from '../domain/date/calendarDate';
import { formatFullDate } from '../domain/date/format';
import type { User } from '../domain/auth/user';
import type { AuthService } from '../services/auth/authService';
import { createTestAuthService, createTestBiometricUnlockService, createTestEventService } from '../testing/fakes';
import { AppShell } from './AppShell';
import { err } from '../lib/result';

const sessionOf = (service: AuthService): Promise<User | null> =>
  new Promise(resolve => {
    const stop = service.subscribe(user => {
      stop();
      resolve(user);
    });
  });

/**
 * These exercise the real navigator, providers, and screens against in-memory
 * services, so they cover auth gating and navigation as well as the screens
 * themselves.
 */
const renderApp = async (
  biometricUnlock = createTestBiometricUnlockService(),
) => {
  const authService = createTestAuthService();
  const eventService = createTestEventService();
  await render(
    <AppShell
      authService={authService}
      eventService={eventService}
      biometricUnlock={biometricUnlock}
    />,
  );
  return { authService, eventService, biometricUnlock };
};

const registerNewUser = async () => {
  await fireEvent.press(await screen.findByLabelText('Create one'));

  await fireEvent.changeText(screen.getByLabelText('Name'), 'Alex Morgan');
  await fireEvent.changeText(screen.getByLabelText('Email'), 'alex@example.com');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'calendar1');
  await fireEvent.press(screen.getByRole('button', { name: 'Create account' }));

  await screen.findByLabelText('Calendar tab');
};

describe('unauthenticated area', () => {
  it('opens on the sign-in screen once the session check completes', async () => {
    await renderApp();
    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Sign in with biometrics' })).toBeNull();
  });

  it('blocks sign-in with an invalid email and explains why', async () => {
    await renderApp();
    await screen.findByRole('button', { name: 'Sign in' });

    await fireEvent.changeText(screen.getByLabelText('Email'), 'not-an-email');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'calendar1');
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Enter a valid email address.')).toBeOnTheScreen();
    // Still on the sign-in screen, not in the app.
    expect(screen.queryByLabelText('Calendar tab')).toBeNull();
  });

  it('reports invalid credentials for an account that does not exist', async () => {
    await renderApp();
    await screen.findByRole('button', { name: 'Sign in' });

    await fireEvent.changeText(screen.getByLabelText('Email'), 'nobody@example.com');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'calendar1');
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText('That email and password combination does not match an account.'),
    ).toBeOnTheScreen();
  });

  it('rejects a weak password at registration', async () => {
    await renderApp();
    await fireEvent.press(await screen.findByLabelText('Create one'));

    await fireEvent.changeText(screen.getByLabelText('Name'), 'Alex Morgan');
    await fireEvent.changeText(screen.getByLabelText('Email'), 'alex@example.com');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'short');
    await fireEvent.press(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Use at least 8 characters.')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Calendar tab')).toBeNull();
  });
});

describe('authentication gating', () => {
  it('replaces the auth screens with the app after registering', async () => {
    await renderApp();
    await registerNewUser();

    expect(screen.getByLabelText('Calendar tab')).toBeOnTheScreen();
    // The sign-in screen is not merely covered, it is no longer in the tree,
    // so there is no way to navigate back to it.
    expect(screen.queryByRole('button', { name: 'Sign in' })).toBeNull();
  });

  it('returns to the unauthenticated flow on log out', async () => {
    await renderApp();
    await registerNewUser();

    await fireEvent.press(screen.getByLabelText('Profile tab'));
    await fireEvent.press(await screen.findByLabelText('Log out'));

    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeOnTheScreen();
    expect(screen.queryByLabelText('Calendar tab')).toBeNull();
  });

  it('lets a registered user sign back in after logging out', async () => {
    await renderApp();
    await registerNewUser();

    await fireEvent.press(screen.getByLabelText('Profile tab'));
    await fireEvent.press(await screen.findByLabelText('Log out'));
    await screen.findByRole('button', { name: 'Sign in' });

    await fireEvent.changeText(screen.getByLabelText('Email'), 'alex@example.com');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'calendar1');
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByLabelText('Calendar tab')).toBeOnTheScreen();
  });

  it('restores an existing session without showing the sign-in screen', async () => {
    const authService = createTestAuthService();
    const eventService = createTestEventService();
    await authService.register({
      displayName: 'Alex Morgan',
      email: 'alex@example.com',
      password: 'calendar1',
    });

    await render(
      <AppShell
        authService={authService}
        eventService={eventService}
        biometricUnlock={createTestBiometricUnlockService()}
      />,
    );

    expect(await screen.findByLabelText('Calendar tab')).toBeOnTheScreen();
  });
});

describe('profile', () => {
  it('shows the signed-in user and is only reachable inside the app', async () => {
    await renderApp();
    await registerNewUser();

    await fireEvent.press(screen.getByLabelText('Profile tab'));

    expect(await screen.findByText('Alex Morgan')).toBeOnTheScreen();
    expect(screen.getByText('alex@example.com')).toBeOnTheScreen();
  });
});

describe('creating and editing events', () => {
  const today = todayCalendarDate();

  it('creates an event on the selected day and shows it in the agenda', async () => {
    await renderApp();
    await registerNewUser();

    await fireEvent.press(await screen.findByLabelText('New event'));

    await fireEvent.changeText(await screen.findByLabelText('Title'), 'Design review');
    await fireEvent.changeText(screen.getByLabelText('Starts'), '11:00');
    await fireEvent.changeText(screen.getByLabelText('Ends'), '12:00');
    await fireEvent.press(screen.getByLabelText('Create event'));

    expect(await screen.findByText('Design review')).toBeOnTheScreen();
    expect(screen.getByText('1 event')).toBeOnTheScreen();
  });

  it('persists the created event through the service', async () => {
    const { eventService, authService } = await renderApp();
    await registerNewUser();

    await fireEvent.press(await screen.findByLabelText('New event'));
    await fireEvent.changeText(await screen.findByLabelText('Title'), 'Design review');
    await fireEvent.press(screen.getByLabelText('Create event'));

    await screen.findByText('Design review');

    const user = await sessionOf(authService);
    expect(user).not.toBeNull();
    const stored = await eventService.listForUser(user?.id ?? '');
    expect(stored).toHaveLength(1);
    expect(stored[0]?.date).toBe(today);
  });

  it('does not create an event when the title is missing', async () => {
    const { eventService, authService } = await renderApp();
    await registerNewUser();

    await fireEvent.press(await screen.findByLabelText('New event'));
    await fireEvent.press(await screen.findByLabelText('Create event'));

    expect(
      await screen.findByText('Add a title so you can recognise this event.'),
    ).toBeOnTheScreen();

    const user = await sessionOf(authService);
    await expect(eventService.listForUser(user?.id ?? '')).resolves.toHaveLength(0);
  });

  it('does not save an event whose end time precedes its start', async () => {
    const { eventService, authService } = await renderApp();
    await registerNewUser();

    await fireEvent.press(await screen.findByLabelText('New event'));
    await fireEvent.changeText(await screen.findByLabelText('Title'), 'Backwards');
    await fireEvent.changeText(screen.getByLabelText('Starts'), '15:00');
    await fireEvent.changeText(screen.getByLabelText('Ends'), '14:00');
    await fireEvent.press(screen.getByLabelText('Create event'));

    expect(await screen.findByText('The end time must be after the start time.')).toBeOnTheScreen();

    const user = await sessionOf(authService);
    await expect(eventService.listForUser(user?.id ?? '')).resolves.toHaveLength(0);
  });

  it('edits an existing event through the same form', async () => {
    await renderApp();
    await registerNewUser();

    await fireEvent.press(await screen.findByLabelText('New event'));
    await fireEvent.changeText(await screen.findByLabelText('Title'), 'Design review');
    await fireEvent.changeText(screen.getByLabelText('Starts'), '11:00');
    await fireEvent.changeText(screen.getByLabelText('Ends'), '12:00');
    await fireEvent.press(screen.getByLabelText('Create event'));

    const item = await screen.findByLabelText(/^Design review,/);
    await fireEvent.press(item);

    // The form opens pre-filled, which is what makes it an edit rather than a create.
    const title = await screen.findByLabelText('Title');
    expect(title).toHaveProp('value', 'Design review');

    await fireEvent.changeText(title, 'Design review (rescheduled)');
    await fireEvent.press(screen.getByLabelText('Save changes'));

    expect(await screen.findByText('Design review (rescheduled)')).toBeOnTheScreen();
    expect(screen.queryByText('Design review')).toBeNull();
  });

  it('keeps the event on the day it was created for', async () => {
    await renderApp();
    await registerNewUser();

    await fireEvent.press(await screen.findByLabelText('New event'));
    await fireEvent.changeText(await screen.findByLabelText('Title'), 'Design review');
    await fireEvent.press(screen.getByLabelText('Create event'));
    await screen.findByText('Design review');

    // Move a day forward: the event must not follow the selection.
    await fireEvent.press(screen.getByLabelText('Next day'));
    await waitFor(() => {
      expect(screen.queryByText('Design review')).toBeNull();
    });

    await fireEvent.press(screen.getByLabelText('Previous day'));
    expect(await screen.findByText('Design review')).toBeOnTheScreen();
  });
});

describe('calendar navigation', () => {
  it('changes the visible month without changing the selected day', async () => {
    await renderApp();
    await registerNewUser();

    const today = todayCalendarDate();
    const todayCell = await screen.findByLabelText(formatFullDate(today));
    expect(todayCell).toBeSelected();

    await fireEvent.press(screen.getByLabelText('Next month'));
    await fireEvent.press(screen.getByLabelText('Previous month'));

    expect(screen.getByLabelText(formatFullDate(today))).toBeSelected();
  });

  it('offers a shortcut back to today once another day is selected', async () => {
    await renderApp();
    await registerNewUser();

    const today = todayCalendarDate();
    expect(screen.queryByLabelText('Go to today')).toBeNull();

    await fireEvent.press(screen.getByLabelText('Next day'));
    await fireEvent.press(await screen.findByLabelText('Go to today'));

    expect(screen.getByLabelText(formatFullDate(today))).toBeSelected();
  });
});

describe('biometric gate', () => {
  it('does not enter the calendar when a configured unlock is cancelled', async () => {
    const authService = createTestAuthService();
    const eventService = createTestEventService();
    const biometricUnlock = createTestBiometricUnlockService({
      biometry: 'fingerprint',
      onGet: () => err({ kind: 'cancelled' }),
    });
    await authService.register({
      displayName: 'Alex Morgan',
      email: 'alex@example.com',
      password: 'calendar1',
    });
    const user = await sessionOf(authService);
    expect(user).not.toBeNull();
    if (user !== null) {
      await biometricUnlock.enable(user.id);
    }

    await render(
      <AppShell
        authService={authService}
        eventService={eventService}
        biometricUnlock={biometricUnlock}
      />,
    );

    expect(await screen.findByRole('button', { name: 'Sign in with biometrics' })).toBeOnTheScreen();
    expect(screen.queryByLabelText('Calendar tab')).toBeNull();
  });

  it('does not open the biometric prompt until Sign in with biometrics is pressed', async () => {
    const authService = createTestAuthService();
    const eventService = createTestEventService();
    let getCalls = 0;
    const biometricUnlock = createTestBiometricUnlockService({
      biometry: 'fingerprint',
      onGet: () => {
        getCalls += 1;
        return err({ kind: 'cancelled' });
      },
    });
    await authService.register({
      displayName: 'Alex Morgan',
      email: 'alex@example.com',
      password: 'calendar1',
    });
    const user = await sessionOf(authService);
    if (user !== null) {
      await biometricUnlock.enable(user.id);
    }

    await render(
      <AppShell
        authService={authService}
        eventService={eventService}
        biometricUnlock={biometricUnlock}
      />,
    );

    expect(await screen.findByRole('button', { name: 'Sign in with biometrics' })).toBeOnTheScreen();
    expect(getCalls).toBe(0);

    await fireEvent.press(screen.getByRole('button', { name: 'Sign in with biometrics' }));
    expect(await screen.findByText('Biometric sign-in was cancelled. You can use your password instead.')).toBeOnTheScreen();
    expect(getCalls).toBe(1);
    expect(screen.queryByLabelText('Calendar tab')).toBeNull();
  });

  it('lets password sign-in continue while the Firebase session is still present', async () => {
    const authService = createTestAuthService();
    const eventService = createTestEventService();
    const biometricUnlock = createTestBiometricUnlockService({
      biometry: 'fingerprint',
      onGet: () => err({ kind: 'cancelled' }),
    });
    await authService.register({
      displayName: 'Alex Morgan',
      email: 'alex@example.com',
      password: 'calendar1',
    });
    const user = await sessionOf(authService);
    if (user !== null) {
      await biometricUnlock.enable(user.id);
    }

    await render(
      <AppShell
        authService={authService}
        eventService={eventService}
        biometricUnlock={biometricUnlock}
      />,
    );
    await screen.findByRole('button', { name: 'Sign in with biometrics' });

    await fireEvent.changeText(screen.getByLabelText('Email'), 'alex@example.com');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'calendar1');
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByLabelText('Calendar tab')).toBeOnTheScreen();
  });

  it('clears biometric configuration on log out', async () => {
    const biometricUnlock = createTestBiometricUnlockService({ biometry: 'fingerprint' });
    await renderApp(biometricUnlock);
    await registerNewUser();

    await fireEvent.press(screen.getByLabelText('Profile tab'));
    await fireEvent.press(await screen.findByLabelText('Turn on'));
    expect(await screen.findByText('On for this device')).toBeOnTheScreen();

    await fireEvent.press(screen.getByLabelText('Log out'));
    await screen.findByRole('button', { name: 'Sign in' });
    expect(screen.queryByRole('button', { name: 'Sign in with biometrics' })).toBeNull();
  });
});
