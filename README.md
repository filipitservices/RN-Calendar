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

- **Registration and sign-in** with email/password, per-field validation, loading states, and distinct messages for invalid credentials, an already-registered email, and storage failure.
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
| `@react-navigation/bottom-tabs` | 7.18.16 |
| `react-native-screens` | 4.27.0 |
| `react-native-safe-area-context` | 5.9.0 |
| `react-native-mmkv` | 4.3.2 |
| `react-native-nitro-modules` | 0.35.9 |
| `jest` | 29.7.0 |
| `@testing-library/react-native` | 14.0.1 |
| `test-renderer` | 1.2.0 |
| `eslint` | 8.57.1 |

`react-native-gesture-handler` is deliberately **not** a dependency: neither the native stack nor bottom tabs requires it. No state-management library, date library, icon font, or UI kit is used either.

### React Native 0.87 specifics this project depends on

0.87 is a breaking release, and the code is written against the new behaviour rather than working around it:

- **Strict TypeScript API** is the default. All imports come from the `react-native` root; there are no `react-native/Libraries/*` deep imports and no legacy opt-out in `tsconfig.json`.
- **Edge-to-edge is on** (`edgeToEdgeEnabled=true` in `android/gradle.properties`) and `StatusBar`'s `translucent`/`backgroundColor` props were removed. Content draws behind the system bars, so `src/ui/components/Screen.tsx` applies real safe-area insets on every screen and nothing hardcodes a bar height.
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

`npm run android` uses the React Native Community CLI (`react-native run-android`); there are no custom wrapper scripts hiding build steps. `react-native-mmkv` v4 is a Nitro module; Android picks it up through the existing autolinking in `android/settings.gradle`. iOS needs `pod install` after the first install or whenever the native lockfile would change. This Windows development machine has no CocoaPods, so `pod install` was not run here.

## Testing

```powershell
npm run typecheck    # tsc --noEmit
npm run lint         # eslint .
npm test             # jest
npm run test:coverage
```

The suite has **217 tests across 15 files**, at **91.6% statement coverage** overall and effectively full coverage of `src/domain`. `jest.config.js` sets thresholds just below the current numbers so a regression fails the build; the assignment's 5% floor is not the design target.

What is actually covered:

- **Date arithmetic** — leap years across the 100/400-year rule, month-length transitions, week-start rotation, year boundaries, and month-addition clamping (31 Jan + 1 month = 28/29 Feb, not 3 Mar).
- **Validation** — email shape, password rules, event title bounds, and end-before-start.
- **Decoding** — malformed persisted records are rejected rather than trusted.
- **The auth reducer's** state transitions, including that a late form action cannot drop an active session.
- **Services**, against an in-memory `KeyValueStore` rather than a mocked native storage module.
- **The MMKV adapter**, against the library's in-memory `createMMKV` mock: missing keys return `null`, writes round-trip, overwrite and remove behave, and a refused write (empty key) rejects.
- **Whole-app flows** (`src/app/AppShell.test.tsx`) through the real navigator and providers: registration, invalid-credential handling, auth gating, session restore, logout, creating an event, editing it, and confirming an event stays on its own day when the selection moves.

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
  navigation/   types.ts, RootNavigator.tsx, MainTabs.tsx, navigationTheme.ts, TabBarIcon, SplashScreen
  domain/       pure TypeScript - no React, no React Native
    date/         calendarDate, timeOfDay, monthGrid, format
    events/       event model, validation
    auth/         user model, validation
  services/     I/O boundary - an interface plus an implementation each
    storage/      keyValueStore (interface), mmkv + memory implementations
    auth/         authService (interface), localAuthService
    events/       eventService (interface), localEventService
  features/
    auth/         AuthProvider, authReducer, SignIn / SignUp screens
    calendar/     CalendarScreen, useCalendar, MonthGrid / DayCell / MonthNavigator / …
    events/       EventsProvider, useEventForm, EventFormScreen
    profile/      ProfileScreen
  ui/
    theme/        colors, spacing, radii, typography, elevation
    components/   Screen, Button, TextField, Card, Text, Banner, EmptyState
  lib/          result.ts, id.ts
```

Dependencies flow one way: `app → navigation → features → domain | services | ui | lib`. `domain` imports nothing from React or React Native, which is why it is trivially testable. Screens never touch a concrete service or MMKV; they use `useAuth()` and `useEvents()`.

**State ownership** is explicit. `AuthProvider` owns the session via a reducer whose state is a discriminated union (`restoring | signedOut | signedIn`), so "signed in without a user" cannot be represented. `EventsProvider` owns the event list. Everything else — a day's agenda, per-day event counts — is derived during render with `useMemo`, so there is no second copy kept in sync by effects. Updates are immutable throughout.

**Navigation** is typed centrally in `src/navigation/types.ts` and registered by module augmentation, so `useNavigation()` is typed everywhere without per-call annotations. The event form's params are a discriminated union (`{ kind: 'create'; date } | { kind: 'edit'; eventId }`), which makes "edit with no id" unrepresentable. Auth gating is structural: the app never calls `navigate()` in response to an auth-state change — re-declaring the screen set performs the transition.

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

`AuthService` and `EventService` are interfaces. The MVP implementations sit on a `KeyValueStore` interface, and everything read back from storage is decoded and validated — a corrupt record is dropped, not trusted and not crashed on. The concrete implementations are chosen in exactly one file, `src/app/services.ts`. Replacing them with a backend means writing new implementations of the same interfaces, with no changes to any screen. The component tests already exploit this by injecting in-memory implementations.

`KeyValueStore` is the app's storage contract: `read` / `write` / `remove` over `Promise<string | null>`. Missing keys are `null`. JSON serialisation lives in `readJson` / `writeJson` above that interface, not inside the backend. The contract is async even though MMKV itself is synchronous, so auth and event services do not change when the native library does.

The production backend is a single MMKV v4 instance (`createMMKV({ id: 'calendarapp' })`) in `src/services/storage/mmkvKeyValueStore.ts`. That file is the only import of `react-native-mmkv`. The instance id is the namespace; keys at the interface remain `auth/accounts`, `auth/session`, and `events/${userId}`. `set` throws (for example on an empty key) become rejected promises, which those services already map to `{ kind: 'storageUnavailable' }`. MMKV is not encrypted: encrypting the file with a key shipped in the app would imply a security boundary that still does not exist.

`react-native-mmkv` 4.3.2 is a Nitro module and requires `react-native-nitro-modules` 0.35.9 (the pair 4.3.2 was published against). No extra Gradle or Podfile entries are added; Android autolinking covers the native side, and iOS needs `pod install`. Jest cannot load Nitro's TurboModule, so `jest.setup.js` stubs `react-native-nitro-modules`. MMKV then uses its own in-memory `createMockMMKV` when `JEST_WORKER_ID` is set.

There is no AsyncStorage-to-MMKV data migration. This app is `0.1.0`, has never been run on a device, and the official MMKV migration sample keeps AsyncStorage plus `InteractionManager` (removed in RN 0.87). A migrator would have preserved a dependency for data that does not exist.

**On credentials:** accounts are stored on the device, and the password is held in local storage in plain form. This is stated plainly rather than disguised — hashing on the client with a client-side salt would protect nothing and would only imply a security guarantee that does not exist. There is no backend, no fabricated credentials, and no security boundary here. Real credential handling belongs on a server behind `AuthService`.

There is no device-authentication code, and no placeholder pretending it exists.

## Verification status

Verified by running it:

- `npx tsc --noEmit` — clean, with `strict` on and no `any`, no non-null assertions, and no error-silencing casts anywhere in `src/`.
- `npx eslint .` — clean, no errors or warnings.
- `npx jest --coverage` — 217 tests pass; 91.6% statements overall, ~100% of `src/domain`.
- `npx react-native bundle --platform android --dev false` — **succeeds** after the MMKV adapter was added. This walks the entire Metro module graph, including `react-native-mmkv`, so every import in the app resolves for the device runtime. It is the check that stays reproducible when the Gradle path constraint below applies.
- The whole-app tests mount the real `RootNavigator`, providers, and screens, so navigation, auth gating, and the create/edit/logout flows are exercised end to end in the test suite.
- `./gradlew assembleDebug -PreactNativeArchitectures=x86_64` — **BUILD SUCCESSFUL** on this machine before the storage backend changed (158 tasks; `compileSdk 37`; React Navigation native edits compiled). The next assemble will autolink `react-native-mmkv` and `react-native-nitro-modules`. That rebuild was not repeated in this session because of the Gradle `MAX_PATH` constraint below; it is not claimed as re-verified after MMKV.
- `./gradlew assembleRelease` — **BUILD SUCCESSFUL** in the same pre-MMKV session (24.4 MB APK). Same caveat as debug.

### Known environment constraints

Two limits of the machine this was developed on. Neither is a defect in the project, and neither is papered over.

**No emulator acceleration.** There is no hypervisor installed, and enabling WHPX or installing AEHD requires administrator rights, so the x86_64 emulator cannot boot. The app has therefore **not been run on a device or emulator**, and that is not claimed anywhere. Consequently there are **no screenshots in this repository** — none will be added until they can be captured from the app genuinely running. See [Emulator or device setup](#emulator-or-device-setup) to enable acceleration.

**Windows `MAX_PATH` and the Gradle cache.** The Android native build unpacks React Native's prefab C++ headers into the Gradle cache, and those header paths are long:

```
…/caches/<gradle-version>/transforms/<hash>/transformed/react-android-0.87.0-debug/prefab/modules/reactnative/include/react/renderer/componentregistry/ComponentDescriptorFactory.h
```

If the Gradle home sits under a long prefix, the total exceeds Windows' 260-character limit and `ninja` fails with `Filename longer than 260 characters` before compiling anything. Keep `GRADLE_USER_HOME` short (the default `C:\Users\<you>\.gradle` is fine), or enable long paths via `LongPathsEnabled` in `HKLM\SYSTEM\CurrentControlSet\Control\FileSystem`. This is an environment property, not a project one — it is triggered by where the cache lives, not by anything in `android/`.
