# Architecture

## App tree

`AppShell` is the root component. It composes `SafeAreaProvider`, `AppearanceProvider`, `AuthProvider`, `EventsProvider`, and `RootNavigator`. `App` passes production service implementations; tests pass in-memory fakes via the same props.

## Navigation

`RootNavigator` is a single native stack. The rendered screen group depends on `AuthState`:


| `AuthState.status`     | Active screens                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| `restoring`            | `Splash` — no animation                                                                             |
| `signedOut` / `locked` | `SignIn`, `SignUp` (`slide_from_right`) — headers hidden, `AuthLayout` owns title and safe-area top |
| `signedIn`             | `Main` (nested stack) + `EventForm` modal (`slide_from_bottom`)                                     |


Auth transitions work by declaring a different screen group. There is no programmatic `navigate('SignIn')`.

`Main` is a nested native stack with a persistent bottom bar. Calendar uses `slide_from_left`; Profile uses `slide_from_right`; neither shows a back arrow. The bottom bar owns the bottom safe-area inset. Native headers own the top inset on all authenticated screens.

Route params for the event form are a discriminated union:

```ts
{ kind: 'create'; date: CalendarDate } | { kind: 'edit'; eventId: EventId }
```

All route types live in `src/navigation/types.ts` and are registered via module augmentation, giving `useNavigation()` full type coverage without per-call annotations.

Authenticated headers include `AppearanceToggle` (sun/moon icon), which writes `prefs/appearance` and calls `Appearance.setColorScheme`. Auth screens omit it.

## Session state

`AuthProvider` calls `AuthService.subscribe` once on mount. The observable is `onAuthStateChanged` in production; the in-memory fake emits synchronously. State is a discriminated union managed by `authReducer`:


| Status      | Firebase user                      | Mounted UI                                           |
| ----------- | ---------------------------------- | ---------------------------------------------------- |
| `restoring` | unknown                            | Splash                                               |
| `signedOut` | none                               | Sign in / Create account                             |
| `locked`    | present; biometric gate configured | Sign in (password + biometrics). Calendar unmounted. |
| `signedIn`  | present                            | Calendar, Profile                                    |


`EventsProvider` only receives a `userId` while `signedIn`; signing out empties the list. `submitStarted` / `submitFailed` actions are no-ops in `signedIn`, preventing a stale network response from dropping an active session.

Biometric prompt pauses the host Activity. Auth reducer updates are deferred until `AppState` is `active` to avoid orphaned Fabric view references.

## Calendar

`useCalendar` owns two independent state values: `selected: CalendarDate` and `visibleMonth: YearMonth`.


| Action         | `selected`         | `visibleMonth`            |
| -------------- | ------------------ | ------------------------- |
| Month chevrons | unchanged          | advances/retreats         |
| Day chevrons   | shifts by ±1 day   | follows selection         |
| Cell press     | set to tapped date | follows if adjacent month |
| Today          | set to today       | set to today's month      |


The Today button is hidden when `selected === today`.

The grid is always 6 × 7 cells (`buildMonthGrid`), week starting Monday. Cells outside the current month render muted.

The agenda lists `eventsForDate(events, selected)`, sorted by start time then title. Overlap detection uses half-open intervals on the same civil day: `startA < endB && startB < endA`. Conflicts produce a "Conflicted" badge at render time; they are not stored.

## Event form

`EventFormScreen` and `useEventForm` are shared between create and edit. The civil date is fixed for the form's lifetime. Default new-event times are 09:00–10:00.

Validation runs on every field change via `validateEventDraft`. Error messages are withheld until the first submit attempt (`showErrors` flag).


| Field    | Rules                                                                                                                                  |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `title`  | Required after trim; ≤ 80 chars; Unicode letters, marks, numbers, and ordinary punctuation; must contain at least one letter or number |
| `notes`  | Optional; ≤ 500 chars; tab and newline permitted; other control characters rejected                                                    |
| end time | Must be after start time                                                                                                               |


When `kind: 'edit'` and the event is absent from the list (deleted elsewhere), the form renders a terminal "no longer available" state. The form remounts via `key` when the target event or create date changes.

## Date model

Events are placed by a civil date and two clock times, not by a pair of instants.


| Type           | Representation                               | Range  |
| -------------- | -------------------------------------------- | ------ |
| `CalendarDate` | branded `YYYY-MM-DD` string                  | —      |
| `TimeOfDay`    | branded integer, minutes from local midnight | 0–1439 |


`CalendarDate` is constructed via `calendarDateFromParts`, `todayCalendarDate`, or `parseCalendarDate`. Month arithmetic uses `addMonths({ year, month }, n)`, which clamps rather than overflows (31 Jan + 1 month = 28/29 Feb). `format.ts` is the sole `Intl.DateTimeFormat` caller; it uses local noon to prevent DST from shifting the displayed date.

`createdAt` / `updatedAt` are ISO 8601 instants used for auditing only.

## Module structure

```
src/
  app/          AppShell, App, services.ts, AppearanceProvider
  navigation/   RootNavigator, MainNavigator, types, navigationTheme, SplashScreen
  domain/       date, events, auth  (zero React / React Native imports)
  services/     auth, events, biometrics, storage
  features/     auth, calendar, events, profile
  ui/           theme tokens, Screen, Button, TextField, Card, Text, Banner
  testing/      in-memory fakes (Jest only)
```

Allowed import direction: `app → navigation → features → domain | services | ui | lib`.  
`domain` has no React imports and is testable with plain Jest.  
Screens use `useAuth()` and `useEvents()`, no direct imports from services or Firebase.