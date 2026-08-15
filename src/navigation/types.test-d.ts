/**
 * Type-level checks. These have no runtime assertions — they fail the build via
 * `npm run typecheck` if the navigation types stop guaranteeing what the rest
 * of the app relies on.
 */
import type { EventFormParams, RootStackParamList } from './types';

type Expect<T extends true> = T;
type Equals<A, B> = (<G>() => G extends A ? 1 : 2) extends <G>() => G extends B ? 1 : 2
  ? true
  : false;

/**
 * The root navigator must be registered globally via module augmentation,
 * otherwise `useNavigation()` loses its typing app-wide. Comparing the param
 * type rather than just the route name is what makes this a real check.
 */
type _RootNavigatorIsRegistered = Expect<
  Equals<ReactNavigation.RootParamList['EventForm'], EventFormParams>
>;

/** The event form's params stay a discriminated union, so "edit with no id" cannot be expressed. */
type _EditRequiresAnId = Expect<
  Equals<Extract<RootStackParamList['EventForm'], { kind: 'edit' }>['eventId'] extends string
    ? true
    : false, true>
>;

type _CreateRequiresADate = Expect<
  Equals<Extract<RootStackParamList['EventForm'], { kind: 'create' }>['date'] extends string
    ? true
    : false, true>
>;
