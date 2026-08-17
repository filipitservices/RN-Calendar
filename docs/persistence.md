# Accounts, meetings, and device data

Three stores:

| Store | Holds |
| --- | --- |
| Firebase Authentication | UID, email, display name, session (native SDK persistence) |
| Cloud Firestore | Events at `users/{uid}/events/{eventId}` |
| This device | MMKV prefs; Keychain nonce for biometric unlock |

Bindings are in `src/app/services.ts`. The native default app is created from `android/app/google-services.json` (`com.calendarapp`, project `react-native-calendar-f87fa`). iOS has no `GoogleService-Info.plist`; Firebase on iOS is unconfigured.

## Accounts

`User.id` is the Firebase UID (`asUserId`). Email identifies the sign-in method. Display name is written with `updateProfile` after `createUserWithEmailAndPassword`. `createdAt` is `metadata.creationTime`, normalised to ISO in `firebaseAuthService`.

`normaliseEmail` trims and lowercases before Auth calls.

Client checks: email shape and length ≤ 256; registration password length 6–4096 (Firebase default minimum). Console password policy applies on `createUser`. Sign-in requires a non-empty password (≤ 4096).

`mapFirebaseAuthError` maps vendor codes onto `AuthFailure`: `invalidCredentials` (including `user-not-found` / `wrong-password` / `invalid-email`), `emailAlreadyRegistered`, `weakPassword`, `unavailable`.

## Events

`addDoc` into `users/{uid}/events`. Document id is the event id; it is not a field. Payload from `fieldsFromDraft`: trimmed title, notes `null` when blank, `date`, `startMinutes`, `endMinutes`, plus `createdAt` / `updatedAt` ISO strings on create. Update writes title, notes, date, times, `updatedAt` and leaves `createdAt`.

| Field | Written value |
| --- | --- |
| `title` | trimmed, 1–80 chars, letters/numbers and ordinary punctuation |
| `notes` | `null` or 1–500 chars |
| `date` | `YYYY-MM-DD` |
| `startMinutes`, `endMinutes` | ints in `[0, 1439]`, end > start |
| `createdAt`, `updatedAt` | ISO strings |

`firestoreEventService` and the in-memory fake both reject drafts that fail `validateEventDraft`. Reads run `decodeCalendarEvent` (title/notes bounds, civil date, times, end after start); a bad document is skipped.

[`firestore.rules`](../firestore.rules): `request.auth.uid == userId`. Create/update require `keys().hasAll` / `hasOnly` the seven fields. Update `affectedKeys().hasOnly(['title','notes','date','startMinutes','endMinutes','updatedAt'])`.

List is per `userId`. Overlap badges are derived in the UI.

## Biometric unlock

Enabled from Profile after a successful Keychain prompt. Disabled by default.

Keychain item (`com.calendarapp.biometricUnlock`): random nonce, username = UID, `ACCESS_CONTROL.BIOMETRY_CURRENT_SET`, `WHEN_UNLOCKED_THIS_DEVICE_ONLY`, AES-GCM. `has` / `remove` do not present a prompt. Authenticate reads the item (prompt). iOS invalidates the item when the enrolled set changes. Android may not; a mismatch or failed read still clears config and stays on Sign in.

MMKV: `prefs/biometricUnlockUserId` (which account turned the gate on), `prefs/lastLoggedInEmail` (Sign-in prefills). Authorization is the Keychain read.

Cold start, after Firebase restore:

1. No user → Sign in.
2. User, Keychain/config mismatch or absent → Calendar (`signedIn`).
3. User and matching gate → `locked` (Sign in with biometrics + password).

Cancel, lockout, `notEnrolled`, `unavailable`, or invalidated secret: stay on Sign in, `gateFailure` message, Firebase session kept. Logout: `signOut`, Keychain reset, MMKV UID removed.

## Prefs (MMKV)

Instance id `calendarapp`. Adapter: missing key → `null`; empty key write rejected.

| Key | Value |
| --- | --- |
| `prefs/appearance` | `'light'` or `'dark'`; absent follows system. Logout leaves it. |
| `prefs/lastLoggedInEmail` | last successful email |
| `prefs/biometricUnlockUserId` | UID that enabled the gate |

`AppearanceProvider` uses `useMMKVString` and `Appearance.setColorScheme`. Jest: `jest.setup.js` stubs Nitro; MMKV uses `createMockMMKV`.
