# Running the app

Install, Metro, and `npm run android` are in the [README](../README.md).

## Toolchain

| | |
| --- | --- |
| React Native | 0.87.0 |
| Node | `^22.13.0 \|\| ^24.3.0 \|\| >=26.0.0` (this repo: 24.x) |
| JDK | 17 (Gradle wrapper 9.4.1) |
| Android | `compileSdk` 37, `targetSdk` 36, `minSdk` 24, Build-Tools 37.0.0 |
| NDK | 27.1.12297006, pinned in `android/build.gradle` |
| Firebase | `@react-native-firebase/app`, `auth`, `firestore` 26.2.0 |
| Navigation | `@react-navigation/native` 7.x, native-stack, `react-native-screens`, `react-native-safe-area-context` 5.9.0 |
| Device | `react-native-mmkv` 4.3.2 + `react-native-nitro-modules` 0.35.9, `react-native-keychain` 10.0.0 |
| Icons | `react-native-svg` + `lucide-react-native` (named imports) |

Open **`android/`** in Android Studio (wrapper Gradle). SDK Manager: API 37 platform, Build-Tools 37.0.0, Platform-Tools, Emulator, NDK 27.1.12297006.

The app draws edge-to-edge (`edgeToEdgeEnabled=true`). Headers take the top inset on Calendar, Profile, and the event form; the Calendar/Profile bar takes the bottom inset; Sign in / Create account pad the top inset in `AuthLayout`. Date strings use `Intl` (Hermes INTL on Android).

## Emulator and device

x86_64 emulator: Windows Hypervisor Platform or Android Emulator hypervisor driver. Confirm with `emulator -accel-check`. API 35 Google APIs image is sufficient (`minSdk` 24).

Physical device: Developer options, USB debugging, `adb devices`.

## Windows Gradle paths

React Native unpacks prefab C++ headers into the Gradle cache. Nested `GRADLE_USER_HOME` can exceed `MAX_PATH` (260) and fail `ninja` with `Filename longer than 260 characters`. Keep Gradle home short (`C:\Users\<you>\.gradle`) or set `LongPathsEnabled` under `HKLM\SYSTEM\CurrentControlSet\Control\FileSystem`.
