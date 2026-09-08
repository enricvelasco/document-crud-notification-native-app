---
name: ui-component-structure
description: >-
  Project architecture policy for UI components under `src/ui/`, organised by
  atomic design (`atoms/`, `molecules/`, `organisms/`). Each component is a
  PascalCase folder containing `index.tsx` (the component itself), `styles.ts`,
  an optional `resources/` folder holding a `use<ComponentName>` hook plus that
  hook's own utils/constants/services when the component needs logic, and an
  optional `components/` folder for subcomponents that make no sense outside the
  parent. Use this skill whenever you create or restructure a reusable UI
  component, decide its atomic layer, move logic out of a component into a hook,
  split a component into subcomponents, or place its styles — even if the user
  just says "component" or "widget".
---

# UI component structure

Reusable UI lives in `src/ui/`, split by **atomic design**. A component is a
self-contained folder: the markup in `index.tsx`, the styling in `styles.ts`,
and — only when there is real logic — a `use<ComponentName>` hook in
`resources/`. Screens compose these; components never reach into domains or
views.

## Atomic layers

```
src/ui/
├── atoms/        # smallest units, no app meaning on their own
│                 #   Button, Text, Icon, Input, Spinner, Badge
├── molecules/    # a few atoms wired into one small reusable piece
│                 #   SearchField (Input + Button), LabeledValue, HintRow
└── organisms/    # larger composed sections with structure/behaviour
                  #   AppHeader, DocumentList, CheckoutForm
```

Choosing a layer: if it is a single primitive with styling and no composition →
**atom**. If it combines a small number of atoms for one focused job →
**molecule**. If it composes molecules/atoms into a substantial, standalone
block (often with its own hook and subcomponents) → **organism**. When unsure,
pick the lower layer; promote later if it grows.

## Folder layout

```
src/ui/<layer>/<ComponentName>/
├── index.tsx                       # the component (markup + props)
├── styles.ts                       # StyleSheet for this component
├── resources/                      # only if the component has logic
│   ├── use<ComponentName>.ts       # the hook — all state/effects/handlers
│   ├── utils.ts                    # pure helpers for the hook (if needed)
│   ├── constants.ts                # constants for the hook (if needed)
│   └── services.ts                 # side effects for the hook (if needed)
└── components/                     # only if it splits into subcomponents
    └── <SubComponentName>/         # same structure, recursively
        ├── index.tsx
        └── styles.ts
```

Folder and component name: **PascalCase, descriptive** — `SubmitButton/`,
`DocumentListRow/`, not `Btn/` or `Item/`. Props type is `<ComponentName>Props`.

## `index.tsx` — markup only

`index.tsx` holds the component and its props. If the component has no logic
(pure presentational), everything lives here. If it has logic, `index.tsx` calls
the hook and stays declarative — it reads state and handlers off the hook and
renders. Keep JSX branching flat (guard clauses, extracted predicates — see the
flat-conditionals policy); use the `no-typescript-enum` `as const` pattern for
variant props.

```tsx
// src/ui/atoms/SubmitButton/index.tsx  — presentational, no logic
import { Pressable, Text } from 'react-native'

import { styles } from './styles'

export interface SubmitButtonProps {
  label: string
  disabled?: boolean
  onPress: () => void
}

export const SubmitButton = ({ label, disabled = false, onPress }: SubmitButtonProps) => (
  <Pressable style={styles.root} disabled={disabled} onPress={onPress}>
    <Text style={styles.label}>{label}</Text>
  </Pressable>
)
```

```tsx
// src/ui/molecules/SearchField/index.tsx  — logic lives in the hook
import { TextInput } from 'react-native'

import { SubmitButton } from '@/ui/atoms/SubmitButton'

import { useSearchField } from './resources/useSearchField'
import { styles } from './styles'

export interface SearchFieldProps {
  onSearch: (query: string) => void
}

export const SearchField = ({ onSearch }: SearchFieldProps) => {
  const { value, canSubmit, handleChange, handleSubmit } = useSearchField(onSearch)

  return (
    <TextInput style={styles.root} value={value} onChangeText={handleChange} />
  )
}
```

## `resources/` — the component's logic

When a component needs state, effects, memoisation, or non-trivial event
handlers, that logic goes into **one hook**, `resources/use<ComponentName>.ts`.
The hook name always mirrors the component: `SearchField` → `useSearchField`.

The hook returns a plain object of values and handlers for `index.tsx` to
render. It may use its own siblings in `resources/`:

- **`utils.ts`** — pure helpers the hook calls (a debounce wrapper, a validator).
  Each is a named `const` arrow function; anything worth testing gets a unit test.
- **`constants.ts`** — local constants (debounce ms, min query length).
- **`services.ts`** — side effects owned by this component that are not a domain
  repository (e.g. firing an analytics event). Cross-cutting services stay in
  `src/services/`; data access still goes through a domain.

```ts
// src/ui/molecules/SearchField/resources/useSearchField.ts
import { useState } from 'react'

import { MIN_QUERY_LENGTH } from './constants'
import { isSubmittable } from './utils'

export const useSearchField = (onSearch: (query: string) => void) => {
  const [value, setValue] = useState('')
  const canSubmit = isSubmittable(value, MIN_QUERY_LENGTH)

  return {
    value,
    canSubmit,
    handleChange: setValue,
    handleSubmit: () => canSubmit && onSearch(value.trim()),
  }
}
```

Keeping logic in the hook means `index.tsx` stays a readable render function,
and the hook + its utils are testable without mounting the component in a
renderer.

## `components/` — subcomponents

Only create `components/` when the component genuinely splits into parts **that
have no meaning on their own outside the parent** — a `DocumentListRow` inside
`DocumentList`, a `CheckoutFormField` inside `CheckoutForm`. Each subcomponent
follows this exact structure recursively (its own `index.tsx`, `styles.ts`, and
`resources/` if it needs logic).

If a piece would be useful elsewhere, it is **not** a subcomponent — promote it
to its own folder in the appropriate atomic layer and import it.

## `styles.ts`

Every component keeps its `StyleSheet` in `styles.ts`, exported as `styles`, so
`index.tsx` is markup and props with no style block at the bottom.

```ts
// src/ui/atoms/SubmitButton/styles.ts
import { StyleSheet } from 'react-native'

import { Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  root: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
  },
  label: {
    fontSize: 16,
    fontWeight: 600,
  },
})
```

Values that describe the design system (colours, spacing, fonts) come from
`@/constants/theme`, not hard-coded per component.

## What a UI component must not do

- Import from `@/core/domains/...` or `@/views/...` — components receive everything
  via props; data fetching is the view's job.
- Hold logic inline in `index.tsx` when it is more than a one-liner — move it to
  `resources/use<ComponentName>.ts`.
- Keep a subcomponent in `components/` that would be reusable elsewhere —
  promote it to its own atomic-layer folder.

## Style (match the project)

No semicolons, 2-space indent, single quotes, sorted imports, max 2 params
(bundle extra props by passing the props object). The component and its hook are
`const` arrow functions (see the arrow-function-declarations policy) — in a
`.tsx` file a generic one needs the disambiguating comma, `<T,>`. Component
folders and names are PascalCase; hook files are `use<ComponentName>.ts`.
