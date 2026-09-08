---
name: dependency-inversion
description: >-
  Project architecture policy: our code depends on our own abstractions, never
  directly on third-party libraries. Every external dependency (http client,
  notifications, storage, analytics, dates, logging, i18n…) is wrapped in a
  project-owned port under `src/services/<capability>/`, where a single adapter
  file is the only place that imports the library, and library types never leak
  into our models. Consumers import the port — never take it as a parameter,
  which is reserved for dynamic inputs — and a test mocks that one module we own
  instead of the library. Use this skill whenever you add or upgrade an npm
  package, call a third-party SDK, write an `import` from a library into a
  domain/view/screen/component, set up http, notifications, storage or
  analytics, or make code testable that currently reaches out to a library.
---

# Dependency inversion

The rule: **high-level code (domains, views, screens, components) must not know
which library implements a capability.** It depends on a small interface we own;
one adapter behind that interface knows the library. Dependencies point inward,
toward our abstractions — never outward toward `node_modules`.

## Why, concretely

- **Libraries churn, our code shouldn't.** A breaking major version, a
  deprecation, a package that goes unmaintained — with a port, that is one
  adapter file to rewrite. Without it, it is every call site in `src/`, found by
  grep and fixed by hope.
- **Tests stop fighting the module system.** Injecting our own interface means a
  test passes a plain object. Mocking a library means intercepting module
  resolution, faking native modules, and coupling the test to the library's
  internals — which then breaks on upgrade even though our behaviour didn't.
- **The surface shrinks to what we actually use.** A library exposes 90
  functions; we need four. The port documents those four in our own domain
  language, so nobody discovers a fifth way to do the same thing.
- **React Native makes this sharper.** Native modules, platform splits and Expo
  SDK upgrades all land in one adapter instead of scattering `Platform.select`
  and SDK imports across the app.

## Structure

```
src/services/<capability>/
├── index.ts                       # the port — the ONLY thing the app imports
├── models/
│   ├── index.ts
│   └── <capability>ServiceModel.ts # our interface + our types
└── adapters/
    └── <library>Adapter.ts        # the ONLY file that imports the library
```

### 1. Define the port in our language

The interface describes the capability the way *we* talk about it, using *our*
models — not the library's vocabulary, not the library's types.

```ts
// src/services/notifications/models/notificationServiceModel.ts
export const NotificationPermissionTypes = {
  Granted: 'granted',
  Denied: 'denied',
  Undetermined: 'undetermined',
} as const

export type NotificationPermissionTypes =
  (typeof NotificationPermissionTypes)[keyof typeof NotificationPermissionTypes]

export interface ScheduledNotificationModel {
  readonly title: string
  readonly body: string
  readonly triggerAt: string
}

export interface NotificationServiceModel {
  requestPermission: () => Promise<NotificationPermissionTypes>
  schedule: (notification: ScheduledNotificationModel) => Promise<string>
  cancel: (notificationId: string) => Promise<void>
}
```

Declare the members as **property signatures** (`name: (args) => Ret`), not
method signatures (`name(args): Ret`). TypeScript checks method parameters
bivariantly and property parameters contravariantly, so the property form
actually catches an adapter whose argument types drift from the port.

### 2. One adapter, one library import

The adapter is the translation boundary: it maps our model to the library's
shape and the library's result back to ours — the same discipline as a domain
mapper, applied to a dependency instead of a payload.

```ts
// src/services/notifications/adapters/expoNotificationsAdapter.ts
import * as Notifications from 'expo-notifications' // the ONLY import of this library

import {
  type NotificationPermissionTypes,
  NotificationPermissionTypes as PermissionTypes,
  type NotificationServiceModel,
  type ScheduledNotificationModel,
} from '../models'

const toPermissionType = (status: string): NotificationPermissionTypes => {
  if (status === 'granted') return PermissionTypes.Granted
  if (status === 'denied') return PermissionTypes.Denied
  return PermissionTypes.Undetermined
}

export const expoNotificationsAdapter: NotificationServiceModel = {
  requestPermission: async (): Promise<NotificationPermissionTypes> => {
    const { status } = await Notifications.requestPermissionsAsync()

    return toPermissionType(status)
  },

  schedule: (notification: ScheduledNotificationModel): Promise<string> =>
    Notifications.scheduleNotificationAsync({
      content: { title: notification.title, body: notification.body },
      trigger: { date: new Date(notification.triggerAt) },
    }),

  cancel: async (notificationId: string): Promise<void> => {
    await Notifications.cancelScheduledNotificationAsync(notificationId)
  },
}
```

Note that `toPermissionType` sits **above** the object that uses it. Arrow
consts are not hoisted, so an adapter reads bottom-up: translation helpers
first, then the object that assembles them.

### 3. The port picks the adapter

```ts
// src/services/notifications/index.ts
export * from './models'
export { expoNotificationsAdapter as notificationService } from './adapters/expoNotificationsAdapter'
```

Everything else imports `@/services/notifications` and sees only our interface.
Swapping `expo-notifications` for something else changes this one line and one
adapter file.

## Consumers import the port

A consumer imports the port and calls it. **The service does not travel through
the signature** — parameters are for the caller's dynamic inputs (an id, a
query, url or body params), and which implementation the app speaks through is
not the caller's decision. Threading a service through every signature spreads a
dependency that the port exists precisely to contain.

```ts
// src/core/domains/reminder/repositories/scheduleReminder.ts
import { notificationService } from '@/services/notifications'

import { reminderModelToScheduledNotification } from '../mappers/reminderModelToScheduledNotification'
import { ReminderError, type ScheduleReminderType } from '../models'

export const scheduleReminder: ScheduleReminderType = async (reminder) => {
  try {
    return await notificationService.schedule(reminderModelToScheduledNotification(reminder))
  } catch (error) {
    throw new ReminderError('The reminder could not be scheduled.', { cause: error })
  }
}
```

A test controls the dependency by mocking the port module — one line, and the
real adapter (plus the native module and app config behind it) never loads:

```ts
// in the test — the port is mocked, not the library
jest.mock('@/services/notifications', () => ({
  notificationService: { schedule: jest.fn() },
}))

const scheduleMock = notificationService.schedule as jest.Mock
```

This is still the payoff of the port: the test mocks **one module we own** with
a shape we defined, instead of intercepting `expo-notifications`, shimming
native modules, and coupling the test to the library's internals. Taking the
service as a parameter is reserved for the rare helper that genuinely has to run
against two different implementations in the same process.

## Never leak library types

A library type in one of our models re-couples everything the model touches.
`AxiosResponse`, `Notifications.NotificationRequest`, `Dayjs` — none of these
belong in a `Model` or a function signature outside the adapter. Convert at the
boundary; our side speaks only our types.

```ts
// ❌ the whole app now depends on axios' type surface
export interface DocumentResponseModel { raw: AxiosResponse<DocumentPayload> }

// ✅ ours
export interface DocumentResponseModel { readonly document: DocumentModel }
```

## What to wrap, and what not to

Wrapping everything is as harmful as wrapping nothing — a pointless port adds
indirection without buying anything.

**Wrap** capabilities that are *replaceable implementations of something we
need*: http clients, notifications, storage/persistence, analytics, logging,
date/time libraries, i18n, feature flags, crypto, file access.

**Don't wrap** the platform we have chosen to build on: `react`,
`react-native` primitives, `expo-router`'s routing, JSX itself. These are not
swappable dependencies — they are the app. A `useState` port helps nobody.

The judgment call: **if this library disappeared tomorrow, is replacing it a
file or a project?** If it is a project, wrap it. If the answer is "we would
rewrite the app anyway", don't.

## Enforcing it

Once a port exists, stop the library from being imported anywhere else. The
project's ESLint config can hold this line for you:

```js
// eslint.config.js — inside a config object scoped to src/
'no-restricted-imports': ['error', {
  paths: [{
    name: 'expo-notifications',
    message: 'Import @/services/notifications instead — only its adapter may use this library.',
  }],
}],
```

Scope the rule so the adapter folder is exempt, and the boundary becomes
impossible to cross by accident rather than a convention people remember.

## Checklist when adding a dependency

1. Is this a replaceable capability, or the platform? (Platform → import it
   directly and move on.)
2. Name the capability in our language and write the interface in
   `src/services/<capability>/models/`.
3. Write one adapter importing the library; convert its types to ours there.
4. Export the port from `index.ts`.
5. Add the `no-restricted-imports` entry.
6. Consumers that need testing take the interface as a parameter.

## Style (match the project)

No semicolons, 2-space indent, single quotes, sorted imports, max 2 params.
Every function is a `const` bound to an arrow function and object members are
arrow properties, never method shorthand (see the arrow-function-declarations
policy). Interfaces use the `Model` suffix, enumerations the `as const` +
`Types` pattern (see the no-typescript-enum policy), files camelCase.
