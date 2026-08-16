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

const nudgeHours = async (field: 'Starts' | 'Ends', hours: number) => {
  const label = hours > 0 ? `${field} hour later` : `${field} hour earlier`;
  const button = screen.getByLabelText(label);
  for (let step = 0; step < Math.abs(hours); step += 1) {
    await fireEvent.press(button);
  }
};

const renderApp = async (biometricUnlock = createTestBiometricUnlockService()) => {
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

describe('authentication', () => {
  it('opens on the sign-in screen once the session check completes', async () => {
    await renderApp();
    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Sign in with biometrics' })).toBeNull();
    expect(screen.queryByLabelText('Use dark appearance')).toBeNull();
    expect(screen.queryByLabelText('Use light appearance')).toBeNull();
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

  it('replaces the auth screens with the app after registering', async () => {
    await renderApp();
    await registerNewUser();

    expect(screen.getByLabelText('Calendar tab')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Sign in' })).toBeNull();
    expect(screen.getByLabelText(/Use (dark|light) appearance/)).toBeOnTheScreen();
  });

  it('returns to sign-in on log out and lets the same account sign back in', async () => {
    await renderApp();
    await registerNewUser();

    await fireEvent.press(screen.getByLabelText('Profile tab'));
    await fireEvent.press(await screen.findByLabelText('Log out'));

    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeOnTheScreen();
    expect(screen.queryByLabelText('Calendar tab')).toBeNull();

    await fireEvent.changeText(screen.getByLabelText('Email'), 'alex@example.com');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'calendar1');
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByLabelText('Calendar tab')).toBeOnTheScreen();
  });

  it('restores an existing session without showing the sign-in screen', async () => {
    const authService = createTestAuthService();
    await authService.register({
      displayName: 'Alex Morgan',
      email: 'alex@example.com',
      password: 'calendar1',
    });

    await render(
      <AppShell
        authService={authService}
        eventService={createTestEventService()}
        biometricUnlock={createTestBiometricUnlockService()}
      />,
    );

    expect(await screen.findByLabelText('Calendar tab')).toBeOnTheScreen();
  });
});

describe('events and calendar', () => {
  const today = todayCalendarDate();

  it('creates an event on the selected day, shows it, and persists it', async () => {
    const { eventService, authService } = await renderApp();
    await registerNewUser();

    await fireEvent.press(await screen.findByLabelText('New event'));
    await fireEvent.changeText(await screen.findByLabelText('Title'), 'Design review');
    await nudgeHours('Starts', 2);
    await nudgeHours('Ends', 2);
    await fireEvent.press(screen.getByLabelText('Create event'));

    expect(await screen.findByText('Design review')).toBeOnTheScreen();
    expect(screen.getByText('1 event')).toBeOnTheScreen();

    const user = await sessionOf(authService);
    expect(user).not.toBeNull();
    const stored = await eventService.listForUser(user?.id ?? '');
    expect(stored).toHaveLength(1);
    expect(stored[0]?.date).toBe(today);
  });

  it('edits an existing event through the same form', async () => {
    await renderApp();
    await registerNewUser();

    await fireEvent.press(await screen.findByLabelText('New event'));
    await fireEvent.changeText(await screen.findByLabelText('Title'), 'Design review');
    await fireEvent.press(screen.getByLabelText('Create event'));

    const item = await screen.findByLabelText(/^Design review,/);
    await fireEvent.press(item);

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

    await fireEvent.press(screen.getByLabelText('Next day'));
    await waitFor(() => {
      expect(screen.queryByText('Design review')).toBeNull();
    });

    await fireEvent.press(screen.getByLabelText('Previous day'));
    expect(await screen.findByText('Design review')).toBeOnTheScreen();
  });

  it('changes the visible month without changing the selected day', async () => {
    await renderApp();
    await registerNewUser();

    const todayCell = await screen.findByLabelText(formatFullDate(today));
    expect(todayCell).toBeSelected();

    await fireEvent.press(screen.getByLabelText('Next month'));
    await fireEvent.press(screen.getByLabelText('Previous month'));

    expect(screen.getByLabelText(formatFullDate(today))).toBeSelected();
  });

  it('offers a shortcut back to today once another day is selected', async () => {
    await renderApp();
    await registerNewUser();

    expect(screen.queryByLabelText('Go to today')).toBeNull();

    await fireEvent.press(screen.getByLabelText('Next day'));
    await fireEvent.press(await screen.findByLabelText('Go to today'));

    expect(screen.getByLabelText(formatFullDate(today))).toBeSelected();
  });
});

describe('biometric gate', () => {
  const lockedSession = async () => {
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
    return { getCalls: () => getCalls };
  };

  it('stays off the calendar until Sign in with biometrics is pressed, then falls back on cancel', async () => {
    const { getCalls } = await lockedSession();

    expect(await screen.findByRole('button', { name: 'Sign in with biometrics' })).toBeOnTheScreen();
    expect(screen.queryByLabelText('Calendar tab')).toBeNull();
    expect(getCalls()).toBe(0);

    await fireEvent.press(screen.getByRole('button', { name: 'Sign in with biometrics' }));
    expect(
      await screen.findByText('Biometric sign-in was cancelled. You can use your password instead.'),
    ).toBeOnTheScreen();
    expect(getCalls()).toBe(1);
    expect(screen.queryByLabelText('Calendar tab')).toBeNull();
  });

  it('lets password sign-in continue while the Firebase session is still present', async () => {
    await lockedSession();
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
