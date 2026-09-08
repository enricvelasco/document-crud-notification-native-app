---
name: no-typescript-enum
description: >-
  Project code policy: never use the TypeScript `enum` keyword. Model
  enumerations as a `const` object asserted `as const` plus a derived `type` of
  the same name, and that name must always end with the `Types` suffix (e.g.
  `UserRoleTypes`). Use this skill whenever you are about to write, review, or
  refactor an enumeration, a set of named string/number constants, a status/kind/
  variant union, a discriminated-union tag, or any code that reaches for `enum`
  or `const enum` — even if the user does not mention enums explicitly.
---

# No TypeScript `enum`

## The rule

1. **Never** write `enum` or `const enum`. Not in `src/`, not in tests, not in
   config.
2. Model the enumeration as a plain object literal asserted `as const`.
3. Export a `type` **with the same identifier** as the object, derived from the
   object's values.
4. The identifier **always ends with `Types`**. `UserRole` becomes
   `UserRoleTypes`; `HttpStatus` becomes `HttpStatusTypes`.

## The pattern

```ts
// ❌ Don't
export enum UserRole {
  Admin = 'admin',
  Member = 'member',
  Guest = 'guest',
}

// ✅ Do — value and type share the name `UserRoleTypes`
export const UserRoleTypes = {
  Admin: 'admin',
  Member: 'member',
  Guest: 'guest',
} as const

export type UserRoleTypes = (typeof UserRoleTypes)[keyof typeof UserRoleTypes]
```

Using it reads almost the same as an enum would:

```ts
const canPublish = (role: UserRoleTypes): boolean => role === UserRoleTypes.Admin

const role: UserRoleTypes = UserRoleTypes.Member
```

Sharing one name between the value and the type is intentional and safe:
TypeScript keeps value and type namespaces separate, so `UserRoleTypes` the
object and `UserRoleTypes` the type never collide. It also keeps the call site
honest — there is exactly one name to import and remember.

## Why we do this

- **`enum` emits runtime code.** A normal `enum` compiles to an IIFE with a
  reverse-mapping object. It is not erased like the rest of our types, it does
  not tree-shake, and it bloats the bundle for a React Native / web app where
  size matters.
- **Babel can't do `const enum`.** Expo's Metro pipeline strips types with Babel,
  which has no cross-file type information. `const enum` either fails or silently
  misbehaves under `isolatedModules`. The const-object pattern is plain
  JavaScript and just works.
- **Numeric `enum` is not type-safe.** Any `number` is assignable to a numeric
  enum type. The `as const` object gives you an exact union of the real values.
- **It's just an object.** You get `Object.values(...)`, `Object.keys(...)`,
  spread, iteration, and `satisfies` for free, with no `enum`-specific rules to
  remember.

## Recipes

**Runtime list of the values** (for a `<Picker>`, validation, tests):

```ts
const allRoles = Object.values(UserRoleTypes) // ('admin' | 'member' | 'guest')[]
```

**Union of the keys** rather than the values:

```ts
type UserRoleKey = keyof typeof UserRoleTypes // 'Admin' | 'Member' | 'Guest'
```

**Numeric / ordered enumerations** — assign the numbers explicitly instead of
relying on auto-increment:

```ts
export const LogLevelTypes = {
  Debug: 0,
  Info: 1,
  Warn: 2,
  Error: 3,
} as const

export type LogLevelTypes = (typeof LogLevelTypes)[keyof typeof LogLevelTypes]
```

**Discriminated unions** — the tag type comes from the same pattern:

```ts
export const ShapeKindTypes = {
  Circle: 'circle',
  Square: 'square',
} as const

export type ShapeKindTypes = (typeof ShapeKindTypes)[keyof typeof ShapeKindTypes]

type Shape =
  | { kind: typeof ShapeKindTypes.Circle; radius: number }
  | { kind: typeof ShapeKindTypes.Square; side: number }
```

## Style notes (match the project)

- No semicolons, 2-space indent, single quotes.
- The object is a `const` in `PascalCase` — allowed by the project's
  `@typescript-eslint/naming-convention` config (the `variable` selector permits
  `PascalCase`); the `type` is `PascalCase` via the `typeLike` selector.
- Keep the `as const` on its own — do not also annotate the object with the
  derived type, or you create a circular reference.

## When you find an existing `enum`

Replace it in place using the pattern above, rename it to end in `Types`, and
update imports. `MyEnum.Foo` call sites keep working unchanged once the object
is named `MyEnumTypes` and you adjust the identifier. Check for
`import type { MyEnum }` vs `import { MyEnum }` — with this pattern you usually
want a single plain `import { MyEnumTypes }` because you need both the value and
the type.
