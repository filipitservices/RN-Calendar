# Architecture

`AppShell` wraps `SafeAreaProvider`, `AppearanceProvider`, `AuthProvider`, `EventsProvider`, and `RootNavigator`. Production `App` injects Firebase Auth, Firestore, and the Keychain biometric service. Tests inject the same tree with in-memory fakes.

## Navigation

`RootNavigator` is one native stack. Which screens exist depends on `AuthState`:

| Status | Screens |
| --- | --- |
| `restoring` | Splash (`animation: 'none'`) |
| `signedOut` or `locked` | Sign in, Create account (`slide_from_right` onto Sign up). Headers hidden; `AuthLayout` owns title and top inset. |
| `signedIn` | `Main` (Calendar + Profile) and `EventForm` as a modal (`slide_from_bottom`). |

Logout and login change that set. There is no `navigate('SignIn')` after `signOut`.

`Main` is a nested native stack with a bar under it. Calendar and Profile are stack pages. The bar calls `navigate` / `popTo`; Profile uses `slide_from_right`, Calendar `slide_from_left` with `headerBackVisible: false`. The bar owns the bottom safe-area inset (44dp targets). Native headers own the top inset on Calendar, Profile, and the event form. `Screen` defaults to left/right edges only.

Event form params: `{ kind: 'create'; date: CalendarDate } | { kind: 'edit'; eventId: EventId }`. Route types are declared in `src/navigation/types.ts` and registered by module augmentation so `useNavigation()` is typed app-wide.

Authenticated headers include the sun/moon control (`AppearanceToggle`). It writes `prefs/appearance` and calls `Appearance.setColorScheme`. Auth screens omit it.

`statusBarStyle` follows the resolved scheme (`dark-content` on light, `light-content` on dark).

## Session

`AuthProvider` subscribes once to `AuthService.subscribe` (`onAuthStateChanged` in production). First emission is `restored`.

| Status | Meaning | UI |
| --- | --- | --- |
| `restoring` | Waiting on the first Auth callback | Splash |
| `signedOut` | No Firebase user | Sign in / Create account |
| `locked` | Firebase user present; this device has a matching Keychain gate | Sign in with password and “Sign in with biometrics”. Calendar is unmounted. Password sign-in keeps the Firebase session. |
| `signedIn` | Firebase user; gate absent or already passed | Calendar, Profile |

`EventsProvider` receives `userId` only while `signedIn`. Sign-out clears the in-memory list. Form actions (`submitStarted`, `submitFailed`) on `signedIn` are ignored, so a late network error cannot drop an active session.

BiometricPrompt pauses the host Activity. `whenAppActive` delays reducer updates until `AppState` is active so Fabric view tags survive the prompt.

## Calendar

`useCalendar` keeps `selected: CalendarDate` and `visibleMonth: YearMonth` independently. Month chevrons change `visibleMonth` only. Day chevrons and cell presses change `selected` and set `visibleMonth` to that day. Today sets both to `todayCalendarDate()`. The Today control is hidden while `selected === today`.

The grid is always six weeks (`buildMonthGrid`), week start Monday. Cells from adjacent months are shown muted; tapping one selects that civil date and pages the grid. Event-count dots come from `countEventsByDate`. Each cell’s accessibility label is the full weekday date plus an event-count hint.

The agenda is `eventsForDate` for `selected`, sorted by start then title. Overlaps use half-open intervals on the same civil day (`eventsOverlap`): 09:00–10:00 and 10:00–11:00 are free; 09:00–10:00 and 09:30–10:30 are conflicted. Conflicts are computed at render (`conflictingEventIds`) and shown as a “Conflicted” badge. They are not stored.

New event opens `{ kind: 'create', date: selected }`. Tapping a row opens `{ kind: 'edit', eventId }`.

## Event form

Create and edit share `EventFormScreen` and `useEventForm`. The civil date is fixed for the screen lifetime (create: route date; edit: the event’s date). Default times for create: 09:00–10:00. Times are `TimeOfDay` integers, adjusted with steppers (`TimeOfDayField`).

Validation (`validateEventDraft`) runs on every change; messages appear after the first submit (`showErrors`). Title: required after trim, ≤ 80, Unicode letters/marks/numbers plus ordinary punctuation, at least one letter or number. Notes: optional, ≤ 500, tab/newline allowed, other control characters rejected. End must be after start.

If `kind: 'edit'` and the event is gone from the list, the screen shows “This event is no longer available.” The form remounts on `eventId` or create-date (`key`) instead of syncing fields in an effect.

## Profile

Display name, email, initials avatar (`initialsOf`: first and last word, else email prefix), event count, member-since from `createdAt`. Biometric card: capability `ready` | `notEnrolled` | `unavailable`; enable runs a Keychain prompt; cancel leaves the gate off.

## Dates

Placement is `date` (`CalendarDate`, `YYYY-MM-DD`) plus `startMinutes` / `endMinutes` (`TimeOfDay`, minutes from local midnight). `createdAt` / `updatedAt` are ISO instants for audit.

`CalendarDate` is built with `calendarDateFromParts`, `todayCalendarDate` (device local calendar), or `parseCalendarDate`. Month math is `addMonths` on `{ year, month }`, which clamps 31 January + 1 month to 28/29 February. `format.ts` is the only `Intl.DateTimeFormat` caller; `asDate` uses local noon so DST does not shift the printed day.

## Modules

```
src/
  app/          AppShell, App, services.ts, AppearanceProvider
  navigation/   RootNavigator, MainNavigator, types, theme, SplashScreen
  domain/       date, events, auth
  services/     auth, events, biometrics, storage
  features/     auth, calendar, events, profile
  ui/           theme, Screen, Button, TextField, Card, Text, Banner
  testing/      in-memory fakes
```

`app → navigation → features → domain | services | ui | lib`. `domain` has zero React imports. Screens call `useAuth()` / `useEvents()`.
