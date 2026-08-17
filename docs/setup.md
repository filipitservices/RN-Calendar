# Environment setup

## Toolchain versions

| Dependency | Version |
| --- | --- |
| React Native | 0.87.0 |
| Node.js | `^22.13.0 \|\| ^24.3.0 \|\| >=26.0.0` |
| JDK | 17 |
| Gradle wrapper | 9.4.1 |
| Android Gradle Plugin | 9.2.1 |
| `compileSdk` | 37 |
| `targetSdk` | 36 |
| `minSdk` | 24 |
| Build-Tools | 37.0.0 |
| NDK | 27.1.12297006 |
| `@react-native-firebase/*` | 26.2.0 |
| `react-native-mmkv` | 4.3.2 |
| `react-native-nitro-modules` | 0.35.9 |
| `react-native-keychain` | 10.0.0 |
| `react-native-safe-area-context` | 5.9.0 |

Full dependency list: `package.json`.

## Android SDK

Open the **`android/`** directory in Android Studio (not the repo root). Gradle syncs via the wrapper.

Required SDK components (Settings → Languages & Frameworks → Android SDK):

- **SDK Platform:** Android API 37
- **SDK Tools:** Build-Tools 37.0.0, Platform-Tools, Emulator, NDK 27.1.12297006

The NDK version is pinned in `android/build.gradle`.

## Emulator

The x86_64 emulator requires hardware acceleration. On Windows, enable one of:

- **Windows Hypervisor Platform (WHPX)** — Turn Windows features on or off → reboot
- **Android Emulator Hypervisor Driver (AEHD)** — SDK Manager → SDK Tools → install, then run as administrator

Verify: `emulator -accel-check`

An API 35 Google APIs x86_64 image is sufficient (`minSdk` is 24).

## Physical device

Enable Developer options and USB debugging. Confirm ADB sees the device: `adb devices`.

## iOS

Requires macOS with CocoaPods. Run `cd ios && pod install` after `npm install` and whenever native dependencies change.

Firebase requires a real `GoogleService-Info.plist` — one is not included in this repository. Face ID usage description (`NSFaceIDUsageDescription`) is already present in `ios/CalendarApp/Info.plist`.

## Edge-to-edge and safe areas

The app runs edge-to-edge (`edgeToEdgeEnabled=true` in `android/gradle.properties`). Safe-area insets are consumed as follows:

- **Top:** native stack headers on Calendar, Profile, and the event form; `AuthLayout` on Sign in and Create account.
- **Bottom:** the Calendar/Profile navigation bar.
- **Left/right:** `Screen` component default.

`StatusBar` style follows the resolved colour scheme.

Formatted date strings use `Intl.DateTimeFormat` (enabled on Android via Hermes with `HERMES_ENABLE_INTL=True`).

## Windows: Gradle cache path length

React Native prefab C++ headers are unpacked into the Gradle cache during native builds. If `GRADLE_USER_HOME` is under a long directory path, the unpacked paths exceed Windows' 260-character limit and the build fails with `Filename longer than 260 characters`.

**Solutions:**

- Keep `GRADLE_USER_HOME` short (the default `C:\Users\<name>\.gradle` is safe).
- Enable long path support: set `LongPathsEnabled = 1` in `HKLM\SYSTEM\CurrentControlSet\Control\FileSystem`.
