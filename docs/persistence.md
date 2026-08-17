# Data and storage

## Storage overview

| Store | Contents | Binding |
| --- | --- | --- |
| Firebase Authentication | UID, email, display name, session token | `firebaseAuthService.ts` |
| Cloud Firestore | Events at `users/{uid}/events/{eventId}` | `firestoreEventService.ts` |
| Keychain / Keystore | Biometric unlock nonce | `keychainSecureCredentialStore.ts` |
| MMKV | Appearance pref, last email, biometric UID | `mmkvKeyValueStore.ts` |

All production bindings are wired in `src/app/services.ts`. Tests inject in-memory fakes through the same `AppShell` props.

## Firebase Authentication

`User.id` is the Firebase UID. Email is a credential; it is not used as a document key. Display name is set via `updateProfile` after account creation. `createdAt` is sourced from `metadata.creationTime` and normalised to ISO 8601.

All Auth calls normalise the email address (trim + lowercase) via `normaliseEmail`.

**Client-side validation**

| Field | Constraint |
| --- | --- |
| Email | Valid shape; ≤ 256 characters |
| Password (registration) | 6–4096 characters (Firebase default minimum; Console policy may be stricter) |
| Password (sign-in) | Non-empty; ≤ 4096 characters |

**Error mapping** (`mapFirebaseAuthError`)

| Firebase code | `AuthFailure.kind` |
| --- | --- |
| `invalid-credential`, `wrong-password`, `user-not-found`, `invalid-email`, `user-disabled` | `invalidCredentials` |
| `email-already-in-use` | `emailAlreadyRegistered` |
| `weak-password` | `weakPassword` |
| anything else | `unavailable` |

## Firestore events

**Path:** `users/{uid}/events/{eventId}` — the document ID is the event ID.

**Document schema**

| Field | Type | Constraints |
| --- | --- | --- |
| `title` | string | 1–80 characters; Unicode letters, marks, numbers, and ordinary punctuation; must contain at least one letter or number |
| `notes` | string \| null | `null` when blank; otherwise 1–500 characters |
| `date` | string | `YYYY-MM-DD` |
| `startMinutes` | integer | 0–1439 |
| `endMinutes` | integer | 0–1439; must be > `startMinutes` |
| `createdAt` | string | ISO 8601 instant; immutable after creation |
| `updatedAt` | string | ISO 8601 instant |

**Writes:** `fieldsFromDraft` trims the title and stores blank notes as `null`. `firestoreEventService` rejects any draft that fails `validateEventDraft` before writing.

**Reads:** `decodeCalendarEvent` validates every field on read. Malformed documents are silently dropped rather than surfaced as errors.

**Security rules** — [`firestore.rules`](../firestore.rules)

- Ownership: `request.auth.uid == userId` (path-based, not a document field).
- Create / update: document must contain exactly the seven fields above (`keys().hasAll` + `keys().hasOnly`).
- Update: only `title`, `notes`, `date`, `startMinutes`, `endMinutes`, `updatedAt` may change (`affectedKeys().hasOnly`). `createdAt` is immutable.
- Read / delete: owner only.

## Biometric unlock

Biometric unlock is an optional, device-local gate over an already-authenticated Firebase session. It is off by default and must be enabled from Profile.

**Keychain item**

| Property | Value |
| --- | --- |
| Service | `com.calendarapp.biometricUnlock` |
| Username | Firebase UID |
| Secret | Random nonce (not a token or password) |
| Access control | `BIOMETRY_CURRENT_SET` |
| Accessibility | `WHEN_UNLOCKED_THIS_DEVICE_ONLY` |
| Storage | AES-GCM |

`has()` and `remove()` never present a biometric prompt. `authenticate()` reads the item, which triggers the system prompt.

**Cold start logic** (after Firebase restores the session)

1. No Firebase user → `signedOut`, show Sign in.
2. Firebase user; no matching Keychain item or config → `signedIn`, open Calendar.
3. Firebase user and matching gate → `locked`, show Sign in with biometrics + password.

**Failure handling**

Cancel, lockout, unenrolled biometry, unavailable hardware, or an invalidated Keychain item all result in the `gateFailure` banner on Sign in. The Firebase session is preserved. Logout calls `signOut`, resets the Keychain item, and removes `prefs/biometricUnlockUserId`.

**Platform notes**

- iOS: `BIOMETRY_CURRENT_SET` invalidates the Keychain item when enrolled biometrics change.
- Android: enrollment changes may not invalidate the item; a failed or mismatched read clears config and keeps the user on Sign in.

## MMKV prefs

Instance ID: `calendarapp`. Used for non-secret, device-local preferences only.

| Key | Type | Notes |
| --- | --- | --- |
| `prefs/appearance` | `'light'` \| `'dark'` \| absent | Absent means follow the system scheme. Persists across logout. |
| `prefs/lastLoggedInEmail` | string | Pre-fills the Sign in email field |
| `prefs/biometricUnlockUserId` | string | Records which UID enabled the gate. Not used for authorisation. |

`AppearanceProvider` reads this key with `useMMKVString` and applies the override via `Appearance.setColorScheme`.

In Jest, `jest.setup.js` stubs `react-native-nitro-modules` so MMKV falls back to `createMockMMKV`.

## Firebase project setup (operator)

1. Enable the **Email/Password** sign-in provider.
2. Create a **Cloud Firestore** database.
3. Deploy `firestore.rules` — `firebase deploy --only firestore:rules` or paste into the Console rules editor.
4. Optionally configure a password policy under **Authentication → Settings**. The app forwards `weakPassword` errors from Firebase but does not enforce complexity client-side.
