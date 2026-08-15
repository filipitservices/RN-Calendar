import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CalendarDate } from '../domain/date/calendarDate';
import type { EventId } from '../domain/events/event';

/**
 * Every route name and param shape in the app is declared here. Screens import
 * these helpers rather than redeclaring route unions locally.
 *
 * Params must stay serializable — dates travel as `CalendarDate` strings, never
 * as `Date` objects, and callbacks are never passed through navigation.
 */

/** Create and edit are the same operation; the discriminant decides which. */
export type EventFormParams =
  | { kind: 'create'; date: CalendarDate }
  | { kind: 'edit'; eventId: EventId };

export type MainTabParamList = {
  Calendar: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  // Unauthenticated group
  SignIn: undefined;
  SignUp: undefined;
  // Authenticated group
  Main: NavigatorScreenParams<MainTabParamList>;
  EventForm: EventFormParams;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

/**
 * Tab screens can also drive the parent stack (opening the event form), so
 * their props combine both navigators.
 */
export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  RootStackScreenProps<'Main'>
>;
