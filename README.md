# CalendarApp

A calendar and meeting-management app for Android, built with plain React Native (no Expo) and TypeScript. It covers registration and sign-in, a custom-built month calendar with day and month navigation, event creation and editing, and a profile screen with logout.

`CalendarApp` / `com.calendarapp` are neutral technical identifiers, not product branding.

## Contents

- [What it does](#what-it-does)
- [Verified version matrix](#verified-version-matrix)
- [Prerequisites](#prerequisites)
- [Android Studio and SDK setup](#android-studio-and-sdk-setup)
- [Emulator or device setup](#emulator-or-device-setup)
- [Install and run](#install-and-run)
- [Testing](#testing)
- [Building](#building)
- [Architecture](#architecture)
- [The date model](#the-date-model)
- [Persistence and the service boundary](#persistence-and-the-service-boundary)
- [Verification status](#verification-status)

## What it does

- **Registration and sign-in** with email/password via Firebase Authentication, per-field validation, loading states, and distinct messages for invalid credentials, an already-registered email, and an unavailable service. Optional **biometric unlock** on this device after the user turns it on in Profile — Firebase remains the identity; biometrics only gate access to an existing session.
- **Calendar dashboard** as the main authenticated screen: a six-row month grid, previous/next month paging, previous/next day paging, a "Today" shortcut, event-count dots per day, and the selected day's agenda.
- **Event creation and editing** through a single form screen — the same validation and the same hook back both, because they are the same domain operation.
- **Profile** with the signed-in user's details, their event count, and logout.
- **Auth-gated navigation**: authenticated and unauthenticated screens are declared in mutually exclusive groups of one root stack, so there is no route from the app back to sign-in, and logout returns to the unauthenticated flow automatically.

The calendar is implemented from scratch with React Native primitives. There is no third-party calendar component and no date library.

## Verified version matrix

Everything below was read off this machine after the project was built, not copied from documentation.

| Component | Version |
| --- | --- |
| React Native | 0.87.0 |
| React | 19.2.3 |
| TypeScript | 6.0.3 |
| Node.js | 24.18.0 (RN 0.87 requires `^22.13.0 \|\| ^24.3.0 \|\| >=26.0.0`) |
| npm | 11.16.0 |
| JDK | Microsoft OpenJDK 17.0.20 (LTS) |
| Gradle (wrapper) | 9.4.1 |
| Android Gradle Plugin | 9.2.1 |
| Kotlin (project) | 2.2.0 |
| Android Studio | Narwhal `AI-261.26222.65.2613.16025427` |
| `compileSdk` / build tools | 37 / 37.0.0 |
| `targetSdk` / `minSdk` | 36 / 24 |
| NDK | 27.1.12297006 |

Runtime and tooling dependencies:

| Package | Version |
| --- | --- |
| `@react-navigation/native` | 7.3.16 |
| `@react-navigation/native-stack` | 7.18.8 |
| `react-native-screens` | 4.27.0 |
| `react-native-safe-area-context` | 5.9.0 |
| `@react-native-firebase/app` | 26.2.0 |
| `@react-native-firebase/auth` | 26.2.0 |
| `@react-native-firebase/firestore` | 26.2.0 |
| Google services Gradle plugin | 4.5.0 |
| `react-native-mmkv` | 4.3.2 |
| `react-native-nitro-modules` | 0.35.9 |
| `react-native-keychain` | 10.0.0 |
| `react-native-svg` | 15.15.5 |
| `lucide-react-native` | 1.31.0 |
| `jest` | 29.7.0 |
| `@testing-library/react-native` | 14.0.1 |
| `test-renderer` | 1.2.0 |
| `eslint` | 8.57.1 |

`react-native-gesture-handler` is deliberately **not** a dependency: the native stack does not require it. No state-management library, date library, or UI kit. Chrome icons (tabs, chevrons, appearance) are Lucide via `react-native-svg` — four named imports, not an icon font.

### React Native 0.87 specifics this project depends on

0.87 is a breaking release, and the code is written against the new behaviour rather than working around it:

- **Strict TypeScript API** is the default. All imports come from the `react-native` root; there are no `react-native/Libraries/*` deep imports and no legacy opt-out in `tsconfig.json`.
- **Edge-to-edge is on** (`edgeToEdgeEnabled=true` in `android/gradle.properties`) and `StatusBar`'s `translucent`/`backgroundColor` props were removed. Content draws behind the system bars. Native-stack **headers** own the top inset (`statusBarStyle: 'dark'` so Android icons stay dark on the light header). The main nav bar owns the bottom inset on Calendar and Profile. `src/ui/components/Screen.tsx` uses `react-native-safe-area-context`'s `SafeAreaView` for leftover edges only — never a hardcoded status-bar height.
- **`keyboardShouldPersistTaps` no longer accepts booleans**, so scroll containers use `"handled"`.
- **Ref types are `*Instance`** (`TextInputInstance`), and `StyleSheet.absoluteFillObject` is gone from the strict API.
- Hermes on Android is built with `HERMES_ENABLE_INTL=True`, which is what lets `src/domain/date/format.ts` use `Intl.DateTimeFormat` as the single source of formatted dates.

## Prerequisites

1. **Node.js 24.x** (or 22.13+). Check with `node -v`.
2. **JDK 17.** React Native 0.87's Gradle 9.4.1 wrapper requires 17 or newer. Set `JAVA_HOME` to the JDK root, e.g. `C:\Program Files\Microsoft\jdk-17.0.20.8-hotspot`.
3. **Android Studio** (Narwhal or newer) with the Android SDK.
4. **`ANDROID_HOME`** pointing at the SDK, e.g. `%LOCALAPPDATA%\Android\Sdk`, with `%ANDROID_HOME%\platform-tools` on `PATH`.

Verify:

```powershell
node -v
java -version
echo $env:JAVA_HOME
echo $env:ANDROID_HOME
adb version
```

## Android Studio and SDK setup

Open **Settings → Languages & Frameworks → Android SDK**. Install exactly these; nothing else is required:

- **SDK Platforms**: Android API 37 (`compileSdk`). API 36 is the target level but does not need a separate platform download.
- **SDK Tools**: Android SDK Build-Tools **37.0.0**, Android SDK Platform-Tools, Android Emulator, and **NDK 27.1.12297006**.

The NDK version is pinned in `android/build.gradle` rather than floating, so native builds are reproducible.

To open the project: **File → Open**, then select the `android` directory (not the repository root). Gradle sync will use the wrapper, so no separate Gradle installation is needed.

## Emulator or device setup

### Emulator

Use **Tools → Device Manager → Create Virtual Device**. A Pixel 7 with an API 35 (Google APIs, x86_64) system image is sufficient — `minSdk` is 24, so the app runs on API 24 and above.

> **Hardware acceleration is required.** The x86_64 emulator will not start without it. On Windows, enable one of the following (both need administrator rights, and enabling Windows Hypervisor Platform needs a reboot):
>
> - **Windows Hypervisor Platform (WHPX)** — enable in *Turn Windows features on or off*, then reboot; or
> - **Android Emulator hypervisor driver (AEHD)** — install from **SDK Manager → SDK Tools → Android Emulator hypervisor driver**, then run its installer from an elevated prompt.
>
> Confirm it worked with `emulator -accel-check`; it should report acceleration is available. Running with `-accel off` is not a workaround — unaccelerated x86_64 emulation crashes during boot.

### Physical device

Enable Developer options and USB debugging, connect over USB, and confirm with `adb devices`.

## Install and run

```powershell
npm install

# iOS only (macOS with CocoaPods): autolinking is not enough for pods
cd ios; pod install; cd ..

# Terminal 1 - Metro
npm start

# Terminal 2 - build, install, and launch on the running emulator or device
npm run android
```

`npm run android` uses the React Native Community CLI (`react-native run-android`); there are no custom wrapper scripts hiding build steps. React Native Firebase, `react-native-mmkv` (Nitro), `react-native-keychain`, and `react-native-svg` are autolinked; Android also applies the Google services plugin in `android/app/build.gradle`. iOS needs `pod install` after the first install or whenever the native lockfile would change, **and** a real `GoogleService-Info.plist` — none is supplied, so iOS Firebase is not configured. Face ID usage text is in `ios/CalendarApp/Info.plist` for when iOS is built. This Windows development machine has no CocoaPods, so `pod install` was not run here.

## Testing

```powershell
npm run typecheck    # tsc --noEmit
npm run lint         # eslint .
npm test             # jest
npm run test:coverage
```

The suite has **234 tests across 17 files**. `jest.config.js` sets thresholds just below the current numbers so a regression fails the build; the assignment's 5% floor is not the design target.

What is actually covered:

- **Date arithmetic** — leap years across the 100/400-year rule, month-length transitions, week-start rotation, year boundaries, and month-addition clamping (31 Jan + 1 month = 28/29 Feb, not 3 Mar).
- **Validation** — email shape, password rules, event title bounds, and end-before-start.
- **Decoding** — malformed persisted records are rejected rather than trusted.
- **The auth reducer's** state transitions, including that a late form action cannot drop an active session.
- **Firebase Auth error mapping** (`mapFirebaseAuthError`) — vendor codes onto the closed `AuthFailure` union.
- **Keychain/BiometricPrompt error mapping** (`mapSecureCredentialError`).
- **Biometric unlock service** against in-memory prefs and a Keychain fake.
- **In-memory auth and event fakes** (`src/testing/fakes/`) for whole-app tests — not the native Firebase SDKs.
- **The MMKV adapter**, against the library's in-memory `createMMKV` mock: missing keys return `null`, writes round-trip, overwrite and remove behave, and a refused write (empty key) rejects.
- **Whole-app flows** (`src/app/AppShell.test.tsx`) through the real navigator and providers: registration, invalid-credential handling, auth gating, session restore, logout, creating an event, editing it, and confirming an event stays on its own day when the selection moves.

Native `firebaseAuthService` / `firestoreEventService` are excluded from coverage. They require the Android Firebase SDK. Use the Firebase Console rules simulator to check `firestore.rules`; this repo does not run an emulator suite.

## Building

```powershell
cd android

# Debug APK (JS served by Metro)
./gradlew assembleDebug

# Release APK (JS bundled and compiled to Hermes bytecode)
./gradlew assembleRelease

# Restrict to the emulator's ABI to build faster
./gradlew assembleDebug -PreactNativeArchitectures=x86_64
```

Output lands in `android/app/build/outputs/apk/`. The release build is signed with the debug keystore, which is fine for local verification but must be replaced with a real keystore before distribution.

## Architecture

```
src/
  app/          AppShell (tree + injected services), App (binds real ones), services.ts
  navigation/   types.ts, RootNavigator.tsx, MainNavigator.tsx, navigationTheme.ts, TabBarIcon, SplashScreen
  domain/       pure TypeScript - no React, no React Native
    date/         calendarDate, timeOfDay, monthGrid, format
    events/       event model, validation
    auth/         user model, validation
  services/     I/O boundary - an interface plus an implementation each
    storage/      keyValueStore, mmkv (device prefs), secureCredentialStore + keychain adapter
    auth/         authService, firebaseAuthService, mapFirebaseAuthError
    biometrics/   biometricUnlockService
    events/       eventService, firestoreEventService
  testing/      fakes/ in-memory AuthService + EventService for Jest only
  features/
    auth/         AuthProvider, authReducer, SignIn / SignUp screens
    calendar/     CalendarScreen, useCalendar, MonthGrid / DayCell / MonthNavigator / …
    events/       EventsProvider, useEventForm, EventFormScreen
    profile/      ProfileScreen
  ui/
    theme/        colors, spacing, radii, typography, elevation
    components/   Screen, Button, TextField, Card, Text, Banner
  lib/          result.ts
```

Dependencies flow one way: `app → navigation → features → domain | services | ui | lib`. `domain` imports nothing from React or React Native, which is why it is trivially testable. Screens never touch a concrete service, MMKV, or `@react-native-firebase/*`; they use `useAuth()` and `useEvents()`.

**State ownership** is explicit. `AuthProvider` owns the session via a reducer whose state is a discriminated union (`restoring | unlocking | locked | signedOut | signedIn`). Calendar mounts only for `signedIn`. `unlocking` keeps the splash while the biometric prompt runs. `locked` is a Firebase session that has not passed the biometric gate — sign-in is shown, but the user is not signed out of Firebase. `EventsProvider` owns the event list.

**Navigation** is typed centrally in `src/navigation/types.ts` and registered by module augmentation, so `useNavigation()` is typed everywhere without per-call annotations. The event form's params are a discriminated union (`{ kind: 'create'; date } | { kind: 'edit'; eventId }`), which makes "edit with no id" unrepresentable. Auth gating is structural: the app never calls `navigate()` in response to an auth-state change — re-declaring the screen set performs the transition.

### Headers, navigation bar, safe areas, and transitions

One root native stack plus a nested native stack for Calendar and Profile. No bottom-tab navigator, no second header library, and no JS stack.

- **Header.** React Navigation native headers on Calendar, Profile, and New event / Edit event. Sign-in and registration hide the stack header; `AuthLayout` owns their title and top safe-area inset. Shared styling lives in `stackScreenOptionsFor` (`src/navigation/navigationTheme.ts`). Authenticated headers include a compact appearance control (sun/moon); auth screens never show it.
- **Navigation bar.** A custom bar under the nested stack (same look as before: Calendar and Profile, active/inactive tint, 44dp targets). It is not a tab navigator: it pushes and pops stack pages. The bar stays put while the pages slide; it owns the bottom safe-area inset (no fixed height).
- **Safe areas.** `SafeAreaProvider` wraps the tree in `AppShell`. Stack headers consume the top inset on Calendar/Profile; the main nav bar consumes the bottom inset. `Screen` defaults to `left`/`right` only. Auth screens pad all edges via `AuthLayout`; event form and splash also pad `bottom` (splash pads `top` too). Insets come from `react-native-safe-area-context` 5.9.0 (`SafeAreaView` + `edges`), which updates on rotation.
- **Transitions** (native-stack APIs, Android-capable):
  - Sign in → Create account: `slide_from_right`
  - Calendar → Profile: `slide_from_right`
  - Profile → Calendar: `slide_from_left` (replace; no back arrow)
  - Calendar/Profile → event form: `presentation: 'modal'` + `slide_from_bottom`
  - Auth → Main: `slide_from_right` on Main (`animationTypeForReplace: 'push'`)

`statusBarStyle` and the root `StatusBar` follow the resolved scheme (`dark-content` on light, `light-content` on dark). Deprecated `statusBarBackgroundColor` / `statusBarTranslucent` are not used (they fight RN 0.87 edge-to-edge).

The engineering standards this project is held to are written down in `.cursor/rules/`, covering architecture boundaries, TypeScript, the RN 0.87 API surface, navigation, state and data, dates, UI and accessibility, and testing.

## The date model

Calendar apps acquire off-by-one-day bugs by storing instants and rendering civil dates. This one prevents that structurally: **no `Date` object is ever stored, persisted, or passed as an event time.**

- `CalendarDate` is a branded `"YYYY-MM-DD"` string — a civil date with no instant and no timezone. Because the encoding is fixed-width, two dates compare with `===` and sort lexicographically, with no conversion.
- `TimeOfDay` is a branded integer: minutes from local midnight, 0–1439.
- An event is `{ date, startMinutes, endMinutes }`, so it cannot render on the wrong day no matter what the device timezone does.
- `new Date("2026-08-15")` is never used, because it parses as UTC midnight and shifts the day west of UTC. `CalendarDate` values are built only through `calendarDateFromParts`, `todayCalendarDate`, or `parseCalendarDate`.
- Month paging uses `addMonths` on a `{ year, month }` cursor, not `Date.setMonth`, which overflows.
- `format.ts` is the only module that touches `Intl.DateTimeFormat`, so every user-visible date string comes from one place.

`createdAt` / `updatedAt` are genuine ISO instants, but they are audit metadata and never drive placement.

## Persistence and the service boundary

`AuthService`, `EventService`, and `BiometricUnlockService` are interfaces. Production bindings live in exactly one file, `src/app/services.ts`: Firebase Authentication, Cloud Firestore, MMKV for non-secret prefs, and Keychain/Keystore for the biometric unlock secret. Tests inject in-memory fakes from `src/testing/fakes/` via `AppShell`. Screens never import Firebase, MMKV, or Keychain.

There is no JavaScript `initializeApp` and no web Firebase config. The native default app is created by the Google services Gradle plugin from `android/app/google-services.json`.

### Android Firebase config

| | |
| --- | --- |
| Gradle source of truth | `android/app/google-services.json` (plural filename; committed — Firebase documents this file as non-secret identifiers) |
| Received dump | `__assets/google-service.json` (singular; gitignored). Do not let it silently diverge from the app-module copy. |
| `applicationId` / `namespace` | `com.calendarapp` — matches `package_name` in the JSON. Do not change the application ID. |
| Firebase project | `react-native-calendar-f87fa` |
| Plugin | `com.google.gms:google-services:4.5.0` on the root classpath; `com.google.gms.google-services` applied in the app module |
| RN Firebase packages | `@react-native-firebase/app`, `auth`, and `firestore`, all pinned at **26.2.0** (same version; v26 requires New Architecture, which this project already enables) |

iOS: no `GoogleService-Info.plist` was supplied. Do not invent one, and do not call `FirebaseApp.configure()` until a real plist exists (it would crash). Android is the configured platform.

**Not in this app:** Cloud Storage, Analytics, Crashlytics, Messaging, Cloud Functions, the Admin SDK, or image pickers. Profile avatars are derived initials. The `storage_bucket` field in `google-services.json` is unused.

### Authentication

`User.id` is the Firebase **UID** (`asUserId(uid)`). Email is not an identifier. `displayName` is written with `updateProfile` after `createUserWithEmailAndPassword`. `createdAt` comes from `user.metadata.creationTime`, normalised to ISO at the service boundary.

`AuthService.subscribe` wraps `onAuthStateChanged`. `AuthProvider` subscribes once; the existing `restoring` status covers Firebase's first callback so the sign-in screen does not flash. Passwords and tokens are not stored in the app. Firebase `error.code` values are mapped in `mapFirebaseAuthError` onto `AuthFailure` (`emailAlreadyRegistered`, `invalidCredentials`, `unavailable`).

Native Firebase already persists the authenticated session on device. This app does **not** copy refresh tokens, ID tokens, or passwords into MMKV or Keychain.

### Biometric unlock (device-local gate)

Biometrics are not a second identity provider. They only unlock the already-persisted Firebase session on this device.

- **Off by default.** A fresh install never shows “Sign in with biometrics”. After email/password, Profile has a compact security card. Turning it on requires a successful device biometric prompt; cancelling leaves it off.
- **What is stored.** Keychain/Keystore (`react-native-keychain` 10.0.0) holds a random nonce, username = Firebase UID, `ACCESS_CONTROL.BIOMETRY_CURRENT_SET`, this-device-only. Reading that item is the gate. MMKV holds `prefs/lastLoggedInEmail`, `prefs/biometricUnlockUserId` (which account enabled the gate — not authorization), and `prefs/appearance` (see Device-local prefs).
- **Cold start.** Firebase restores first. If there is no user, show email/password. If there is a user but this device has no matching Keychain item, open Calendar. If there is a user **and** matching config, stay on splash, prompt once, then Calendar or the password form (`locked`). Cancel, lockout, missing enrollment, or an invalid item fall back to password **without** calling Firebase `signOut`.
- **Sign-in.** The biometric button appears only in `locked` (session still present, gate configured). It is never the only method.
- **Log out.** Profile logout calls Firebase `signOut` and deletes the Keychain item plus the MMKV user id, so the next person must use email/password before they can enable biometrics again.
- **Native.** Android: `USE_BIOMETRIC` and `USE_FINGERPRINT`. iOS: `NSFaceIDUsageDescription` in `Info.plist`. Prompt copy: “Unlock CalendarApp” / “Confirm it's you to open your calendar.”
- **Enrollment changes.** iOS `BIOMETRY_CURRENT_SET` invalidates the item when enrolled biometrics change. Android Keychain does not always invalidate in that case; a failed or mismatched read still locks the app and clears config rather than opening Calendar. Re-enable from Profile after password sign-in.

### Device-local prefs (MMKV)

Small non-secret values go through one MMKV v4 instance (`createMMKV({ id: 'calendarapp' })`) in `src/services/storage/mmkvKeyValueStore.ts`. Secrets do not belong here. MMKV is not encrypted with an app-shipped key.

- **`prefs/lastLoggedInEmail`** and **`prefs/biometricUnlockUserId`** go through the async `KeyValueStore` adapter.
- **`prefs/appearance`** is `'light'` or `'dark'` when the user has chosen an explicit look. If the key is absent, the app follows the system (`Appearance.setColorScheme('auto')`). The signed-in header control writes the opposite of the current resolved scheme; logout does not clear this key. Palette tokens (`lightColors` / `darkColors`) are applied at render via `useTheme()`.

`react-native-mmkv` 4.3.2 is a Nitro module and requires `react-native-nitro-modules` 0.35.9. Android autolinking covers the native side. Jest cannot load Nitro's TurboModule, so `jest.setup.js` stubs `react-native-nitro-modules`; MMKV then uses its in-memory `createMockMMKV` when `JEST_WORKER_ID` is set.

### Events (Cloud Firestore)

Path: `users/{uid}/events/{eventId}`. Document fields match `CalendarEvent` (ISO strings for times and audit fields). Reads go through `decodeCalendarEvent`. Drafts still pass `validateEventDraft` in the service before a write.

Rules are in `firestore.rules` (not open, and not “any signed-in user can read all events”):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/events/{eventId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

`firebase.json` points at those rules for `firebase deploy --only firestore:rules`. This environment cannot log into the Firebase project; publishing rules is an operator step.

### Firebase Console (operator)

Before a device can sign in or persist events:

1. Enable the **Email/Password** sign-in provider.
2. Create a **Cloud Firestore** database.
3. Publish `firestore.rules` (`firebase deploy --only firestore:rules`, or paste them in the Console). Check them in the Console rules simulator rather than an in-repo emulator suite.

## Verification status

Verified after adding the biometric gate:

- `npx tsc --noEmit` — clean, with `strict` on.
- `npx eslint .` — clean, no errors or warnings.
- `npx jest` — 234 tests pass (17 files), including AppShell flows for a fresh install (no biometric control), cancelled gate staying off Calendar, password fallback without signing out of Firebase, and logout clearing configuration.
- `npx react-native bundle --platform android --dev false` — succeeds, including `react-native-keychain`.
- Live emulator/device biometric prompts are **not** claimed (no hypervisor on this machine). Gradle assemble after Keychain is not re-claimed here if `MAX_PATH` blocks the cache.

### Known environment constraints

Two limits of the machine this was developed on. Neither is a defect in the project, and neither is papered over.

**No emulator acceleration.** There is no hypervisor installed, and enabling WHPX or installing AEHD requires administrator rights, so the x86_64 emulator cannot boot. The app has therefore **not been run on a device or emulator**, and that is not claimed anywhere. Consequently there are **no screenshots in this repository** — none will be added until they can be captured from the app genuinely running. See [Emulator or device setup](#emulator-or-device-setup) to enable acceleration.

**Windows `MAX_PATH` and the Gradle cache.** The Android native build unpacks React Native's prefab C++ headers into the Gradle cache, and those header paths are long:

```
…/caches/<gradle-version>/transforms/<hash>/transformed/react-android-0.87.0-debug/prefab/modules/reactnative/include/react/renderer/componentregistry/ComponentDescriptorFactory.h
```

If the Gradle home sits under a long prefix, the total exceeds Windows' 260-character limit and `ninja` fails with `Filename longer than 260 characters` before compiling anything. Keep `GRADLE_USER_HOME` short (the default `C:\Users\<you>\.gradle` is fine), or enable long paths via `LongPathsEnabled` in `HKLM\SYSTEM\CurrentControlSet\Control\FileSystem`. This is an environment property, not a project one — it is triggered by where the cache lives, not by anything in `android/`.
