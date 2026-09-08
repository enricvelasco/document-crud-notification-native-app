---
name: flat-conditionals
description: >-
  Project code policy for conditional logic: keep branching flat. Never nest an
  `if` inside an `if` or a ternary inside a ternary — use guard clauses / early
  returns instead, and use a ternary when you are just choosing between two
  values. Every non-trivial condition must be extracted into a named, pure,
  independently testable predicate function that lives in its proper context
  (`src/utils`, `src/services`, `src/hooks`, or co-located in the component).
  Use this skill whenever you write or refactor `if`/`else`, `switch`, ternaries,
  `&&`/`||` render guards in JSX, boolean-returning helpers, validation logic, or
  any code deciding "which value / which branch / render what" — even if the user
  does not mention conditionals.
---

# Flat conditionals

Branching is where logic hides. Nested `if`s and stacked ternaries bury the
decision inside control flow where you cannot name it, cannot reuse it, and
cannot unit-test it without reconstructing the whole surrounding function. This
policy pulls each decision out into the open.

## The three rules

### 1. No nesting

No `if` inside an `if`. No ternary inside a ternary (in either branch). No
`if` inside a loop body that itself contains an `if`. If you are indenting
branch logic twice, stop and flatten.

Flatten with **guard clauses / early returns**: handle the exceptional or
terminal cases first and `return`, so the main path stays at the top
indentation level.

```ts
// ❌ nested
const getPrice = (user: User | null, cart: Cart): number => {
  if (user) {
    if (user.isPremium) {
      if (cart.total > 100) {
        return cart.total * 0.8
      } else {
        return cart.total * 0.9
      }
    }
  }
  return cart.total
}

// ✅ flat: guard clauses + one ternary for the final two-value choice
const getPrice = (user: User | null, cart: Cart): number => {
  if (!isPremium(user)) return cart.total
  return qualifiesForBulkDiscount(cart) ? cart.total * 0.8 : cart.total * 0.9
}
```

### 2. Ternary when you are choosing a value

If the branch does nothing but pick one of **two** values, write a ternary — it
says "this value or that one" as a single expression, instead of a four-line
`if/else` that just assigns a variable.

```ts
// ❌
let label
if (count === 1) {
  label = 'item'
} else {
  label = 'items'
}

// ✅
const label = count === 1 ? 'item' : 'items'
```

But the moment you want a **second** `?:` — nested or chained past one level —
that is the signal to extract a function or switch to early returns. Chained
`a ? x : b ? y : z` is a nested ternary; do not ship it.

```tsx
// ❌ nested ternary in JSX
{status === 'loading'
  ? <Spinner />
  : status === 'error'
    ? <ErrorState />
    : <List items={items} />}

// ✅ early returns in the component
const Feed = ({ status, items }: FeedProps) => {
  if (status === 'loading') return <Spinner />
  if (status === 'error') return <ErrorState />
  return <List items={items} />
}
```

### 3. Name every non-trivial condition

Any condition with meaning — more than a bare `x === y` or `!x` — becomes a
named predicate function: a pure function that takes its inputs and returns a
`boolean` (or a type guard). Name it for the domain concept, not the mechanics:
`isEligibleForDiscount(user)`, not `user.plan === 'pro' && user.credits > 0`.

A named predicate:
- documents intent at the call site (the name replaces the comment you'd write),
- is unit-testable in isolation — input in, boolean out, no mocks,
- is reusable across the util / service / hook / component that needs it,
- keeps the branching statement short enough to read at a glance.

```ts
// ❌ condition inline, untestable without exercising the whole flow
if (form.name.trim().length > 1 && /.+@.+\..+/.test(form.email)) {
  submit()
}

// ✅ each rule extracted and testable
export const hasValidName = (name: string): boolean => name.trim().length > 1
export const hasValidEmail = (email: string): boolean => /.+@.+\..+/.test(email)

if (hasValidName(form.name) && hasValidEmail(form.email)) submit()
```

## Where the predicate lives

Put it in the context that owns the rule, and give it a sibling unit test.

| The rule depends on…                                  | Put it in                                  |
| ---------------------------------------------------- | ------------------------------------------ |
| Only its arguments — pure data, no app deps          | `src/utils/` (e.g. `src/utils/pricing.ts`) |
| Domain objects, API shapes, service-level concerns   | `src/services/`                            |
| React state, context, other hooks                    | `src/hooks/` (e.g. `useCanSubmit`)         |
| One component's rendering decision, used nowhere else | co-located in that component file, still as a named function |

```ts
// src/hooks/use-can-submit.ts
import { hasValidEmail, hasValidName } from '@/utils/validation'

export const useCanSubmit = (form: FormState): boolean =>
  hasValidName(form.name) && hasValidEmail(form.email)
```

```tsx
// src/components/checkout-button.tsx — decision specific to this component
const isCheckoutBlocked = (cart: Cart): boolean =>
  cart.items.length === 0 || cart.isSyncing

export const CheckoutButton = ({ cart }: CheckoutButtonProps) => (
  <Button disabled={isCheckoutBlocked(cart)} onPress={checkout} />
)
```

## Decision guide

- Choosing between **two values**? → ternary, inline.
- **More than two** outcomes, or the branches **do work** (side effects, early
  exit) rather than pick a value? → guard clauses / early returns.
- Condition you'd explain in a comment, or that appears more than once? →
  extract a named predicate + test, place it per the table above.
- Reaching for a **second** `?:`, or a third `if` indent? → stop; extract.
- `switch` with fall-through logic per case? → one function per case, or a
  lookup object (`Record<KeyTypes, () => Result>`).

## Keep predicates testable

- Pure: same inputs → same boolean, no I/O, no `Date.now()` / `Math.random()`
  captured internally (pass them in).
- Small: one rule per function. Compose them (`a() && b()`) rather than building
  one mega-condition.
- Typed: return `boolean`, or a type guard (`(x): x is Foo`) when it also
  narrows.
- Respect project style: no semicolons, 2-space indent, max 2 parameters per
  function (bundle extra inputs into one options object), and declared as a
  `const` arrow function above its first use (see the
  arrow-function-declarations policy).
