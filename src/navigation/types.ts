import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CalendarDate } from '../domain/date/calendarDate';
import type { EventId } from '../domain/events/event';

/**
 * Params must stay serializable: dates travel as `CalendarDate` strings, never
 * as `Date` objects, and callbacks are never passed through navigation.
 */
export type EventFormParams =
  | { kind: 'create'; date: CalendarDate }
  | { kind: 'edit'; eventId: EventId };

export type MainStackParamList = {
  Calendar: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  SignIn: undefined;
  SignUp: undefined;
  Main: NavigatorScreenParams<MainStackParamList>;
  EventForm: EventFormParams;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type MainScreenProps<T extends keyof MainStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<MainStackParamList, T>,
  RootStackScreenProps<'Main'>
>;
