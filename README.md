# Calendar App

Android calendar app built with React Native 0.87 and TypeScript. Features email/password auth via Firebase, a custom month grid, event creation and editing, and optional on-device biometric unlock.

`CalendarApp` / `com.calendarapp` are the technical identifiers.

---

## Screenshots

### Calendar

<table>
  <tr>
    <td align="center" width="50%">
      <strong>Dark mode</strong><br/><br/>
      <img src="docs/screenshots/calendar-page.png" width="260" alt="Calendar – dark" />
    </td>
    <td align="center" width="50%">
      <strong>Light mode</strong><br/><br/>
      <img src="docs/screenshots/white-mode.png" width="260" alt="Calendar – light" />
    </td>
  </tr>
</table>

### Events

<table>
  <tr>
    <td align="center" width="50%">
      <strong>New event</strong><br/><br/>
      <img src="docs/screenshots/new-event-screen.png" width="260" alt="New event form" />
    </td>
    <td align="center" width="50%">
      <strong>Edit event</strong><br/><br/>
      <img src="docs/screenshots/edit-event-screen.png" width="260" alt="Edit event form" />
    </td>
  </tr>
</table>

### Profile

<table>
  <tr>
    <td align="center" width="50%">
      <strong>Profile</strong><br/><br/>
      <img src="docs/screenshots/profile-page.png" width="260" alt="Profile screen" />
    </td>
    <td align="center" width="50%">
      <strong>Enabling biometrics</strong><br/><br/>
      <img src="docs/screenshots/turn-on-biometrics.png" width="260" alt="Biometric prompt when enabling unlock" />
    </td>
  </tr>
</table>

### Authentication

<table>
  <tr>
    <td align="center" width="50%">
      <strong>Sign in</strong><br/><br/>
      <img src="docs/screenshots/login-page.png" width="200" alt="Sign in" />
    </td>
    <td align="center" width="50%">
      <strong>Create account</strong><br/><br/>
      <img src="docs/screenshots/create-account-page.png" width="200" alt="Create account" />
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>Biometric login</strong><br/><br/>
      <img src="docs/screenshots/login-page-biometrics-login.png" width="200" alt="Sign in with biometrics available" />
    </td>
    <td align="center" width="50%">
      <strong>Biometric unlock</strong><br/><br/>
      <img src="docs/screenshots/biometrics-login-success.png" width="200" alt="Sign in with biometrics available" />
    </td>
  </tr>
</table>

---

## Prerequisites

| Requirement | Version |
| --- | --- |
| Node.js | `^22.13` / `^24.3` / `>=26` |
| JDK | 17 |
| Android Studio | Narwhal or newer |
| `ANDROID_HOME` | SDK root, `platform-tools` on `PATH` |

```powershell
node -v && java -version && adb version
```

Full SDK setup, emulator acceleration, iOS notes, and Windows `MAX_PATH` workaround: [docs/setup.md](docs/setup.md).

## Install and run

```powershell
npm install

# Terminal 1
npm start

# Terminal 2
npm run android
```

iOS requires CocoaPods: `cd ios && pod install && cd ..` before starting Metro.

## Testing

```powershell
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm test            # jest (131 tests, 16 suites)
npm run test:coverage
```

Coverage thresholds are set in `jest.config.js` just below the measured numbers. Native Firebase adapters are excluded from Jest; Firestore rules are verified in the Firebase Console simulator.

## Source layout

```
src/
  app/          AppShell, App, services.ts
  navigation/   navigators, route types, theme
  domain/       dates, events, auth  (no React imports)
  services/     Firebase, MMKV, Keychain
  features/     auth, calendar, events, profile
  ui/           theme tokens, shared components
  testing/      in-memory service fakes
```

Dependency direction: `app → navigation → features → domain | services | ui | lib`.  
Screens access data through `useAuth()` and `useEvents()` only.

## Documentation

| | |
| --- | --- |
| [Architecture](docs/architecture.md) | Navigation, session state, calendar logic, event form, date model |
| [Data & storage](docs/persistence.md) | Firebase Auth, Firestore schema, Firestore rules, biometric unlock, MMKV prefs |
| [Environment setup](docs/setup.md) | Toolchain versions, Android SDK, emulator, iOS, Windows paths |
