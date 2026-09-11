---
name: const-bindings
description: >-
  Project code policy: every binding in `src/` is declared with `const`. `let`
  does not appear in application code, and `var` never does. When something has
  to change over time — a counter, a cached handle, an accumulator, a closure's
  private state — the mutable part goes inside a `const`-bound object, an
  interface named `<Thing>StateModel`, so the name still means one thing for its
  whole life. Use this skill whenever you write or refactor a closure that holds
  state, a factory returning a controller or adapter, a loop or accumulator, a
  value assigned inside a `try`/`catch` or an `if`, and whenever you catch
  yourself typing `let` — even if the user does not mention declaration style.
---

# Const bindings

## The rule

Every binding in `src/` is a `const`. `let` is not used; `var` is not used.

```ts
// ❌
let failureCount = 0
failureCount += 1

// ✅
const state = { failureCount: 0 }
state.failureCount += 1
```

## Why, precisely

Be accurate about what this buys, because two common justifications are wrong
and repeating them makes the policy easy to dismiss.

**It is not about performance.** `let` and `const` compile to the same thing.
V8 and Hermes both resolve a closure variable through the same scope slot
whichever keyword declared it, and neither engine optimises `const` bindings
harder because the binding is fixed. Anyone who benchmarks this will find
nothing, so do not defend the rule on those grounds.

**It is not about hoisting either.** `let` and `const` hoist identically: both
are lifted to the top of their block and both sit in the temporal dead zone
until the declaration runs, which is why touching either one early throws
`ReferenceError`. The hoisting argument is real for `function` declarations
versus `const` arrows — see the arrow-function-declarations policy — but it does
not separate `let` from `const`.

What it actually buys is **reading cost**. A `const` is a promise that the name
points at the same thing on line 80 as it did on line 12, so a reader
encountering it halfway down a function does not have to scan upward for a
reassignment. A `let` withdraws that promise for the whole scope, even when it
is reassigned exactly once. In a closure-heavy codebase — controllers, adapters,
ports, all of which are factories returning functions that share captured state
— that scan is the expensive part of reading the file.

The second thing it buys is that mutation becomes **visible and named**. A
`let` scattered near the top of a factory is state nobody declared as state.
Forcing it into an object gives it a type, a name, and one place to look.

## Holding state that has to change

Mutable state is legitimate. A subscription controller has to remember whether
it is subscribed; a websocket adapter has to remember its socket. The rule does
not ban the mutation, it bans the loose binding.

Declare an interface named after what it holds, suffixed `StateModel`, and bind
one `const` to it:

```ts
interface NotificationStreamStateModel {
  subscription: NotificationSubscriptionModel | null
  failureCount: number
}

export const createNotificationStreamController = (
  options: NotificationStreamControllerOptionsModel,
): NotificationStreamControllerModel => {
  const state: NotificationStreamStateModel = {
    subscription: null,
    failureCount: INITIAL_FAILURE_COUNT,
  }

  const stop = (): void => {
    if (!state.subscription) return

    state.subscription.close()
    state.subscription = null
  }

  return { start, stop }
}
```

Three things follow from this shape and they are the actual payoff:

- `state` names the closure's memory, so a reader sees its full extent in one
  declaration instead of collecting `let`s scattered down the file.
- The interface types it, so adding a fourth field is a decision with a
  diff, not an extra `let` nobody reviews.
- `state.failureCount` at the use site says *this is mutable* out loud, where a
  bare `failureCount` read exactly like a constant.

The fields are deliberately **not** `readonly` — the `readonly` convention in
this project marks models that are handed out (repository returns, view models,
props). A state model is the opposite: it exists to be written to.

## The cases that tempt a `let`

**A value assigned inside `try`/`catch`.** Extract the attempt into a function
that returns the value or `null`, and let the caller branch:

```ts
// ❌
let message: TMessage
try {
  message = JSON.parse(String(event.data)) as TMessage
} catch {
  notifyError(toParseError(url))

  return
}

// ✅
const toParsedMessage = <TMessage,>(data: unknown): TMessage | null => {
  try {
    return JSON.parse(String(data)) as TMessage
  } catch {
    return null
  }
}

const message = toParsedMessage<TMessage>(event.data)

if (message === null) {
  notifyError(toParseError(url))

  return
}
```

This is the case where the rule pays for itself twice: the parse becomes an
independently testable function, and the guard clause is flat (see the
flat-conditionals policy).

**A value chosen by a branch.** Use a ternary, or a named function when the
choice is non-trivial:

```ts
// ❌
let delay
if (attempt > 0) delay = backoffMs else delay = initialMs

// ✅
const delay = attempt > 0 ? backoffMs : initialMs
```

**An accumulator in a loop.** Use `reduce`, `map` or `filter`. If the reduction
is genuinely awkward as an expression, it belongs in its own named function
where the accumulation is the whole point of the function.

**A timer handle reassigned on every reconnect.** That is real state — put it in
the state model next to everything else the closure remembers.

## Enforcing it

**Not yet enforced by the linter.** This is the one project policy that still
depends on review, which by this project's own criterion — `yarn lint` *is* the
style guide — is a gap, not a design. Turning it on is three rules:

```js
// eslint.config.js
'no-var': 'error',
'prefer-const': 'error',
'no-restricted-syntax': ['error', {
  selector: 'VariableDeclaration[kind="let"]',
  message: 'Use const. State that has to change goes in a const-bound <Thing>StateModel object.',
}],
```

`prefer-const` alone is not enough — it only flags a `let` that is never
reassigned, which is exactly the case nobody gets wrong. The
`no-restricted-syntax` selector is what bans the rest.

Switching it on fails the build on two files that predate the policy:
`src/services/webSocket/adapters/nativeWebSocketAdapter.ts` (six bindings,
including the `try`/`catch` case above) and
`src/services/language/adapters/expoLocalizationLanguageAdapter.ts` (one cached
handle). Both need the state-model shape before the rules go in.

Until then, apply the policy by hand on everything you write, and do not read
the surviving `let`s in those two adapters as precedent.

If the rule fires on code you believe is a genuine exception, restructure the
code using one of the shapes above. There is no approved exception inside
`src/`.

## Style (match the project)

No semicolons, 2-space indent, single quotes, sorted imports, max 2 params.
Module-level fixed constants are UPPER_CASE, components and types are
PascalCase, everything else camelCase (see the naming-conventions policy).
