---
name: screen-structure
description: >-
  Project architecture policy for screens under `src/screens/`. A screen follows
  the exact same folder structure as a UI component — `index.tsx`, `styles.ts`,
  optional `resources/` with a `use<ScreenName>` hook, optional `components/` for
  subcomponents — except the main component name and folder carry the `Screen`
  suffix (`DocumentListScreen`). The screen only paints what its paired View
  already mapped, including each section's controlled error. Use this skill
  whenever you create or restructure a screen or route component, wire an
  expo-router route to a screen, render a view model, paint partial content or
  per-section error states, or place a screen's hook, subcomponents or styles.
---

# Screen structure

A **screen** is the `.tsx` component a route renders. Structurally it is just a
UI component (see the ui-component-structure policy) with one difference: its
name and folder end in **`Screen`**.

Its job is narrow on purpose: the paired **View** (`.ts`) has already called the
domains and mapped everything into final render shape, so the screen **paints
and nothing else** — no mapping, no reshaping, no deriving labels.

Layering: `src/app/` route → `<Entity><Purpose>Screen` (paints) →
`<Entity><Purpose>View` (loads + maps) → `@/core/domains/*`.

## Folder layout

```
src/screens/<Entity><Purpose>Screen/
├── index.tsx                            # the screen component
├── styles.ts                            # StyleSheet for this screen
├── resources/                           # only if the screen has logic
│   ├── use<Entity><Purpose>Screen.ts    # the hook — calls the view loader
│   ├── utils.ts                         # pure helpers for the hook (if needed)
│   ├── constants.ts                     # constants for the hook (if needed)
│   └── services.ts                      # screen-only side effects (if needed)
└── components/                          # only if it splits into subcomponents
    └── <SubComponentName>/
        ├── index.tsx
        └── styles.ts
```

Folder and component name: **PascalCase, entity first, `Screen` last** —
`DocumentListScreen/`, `DocumentDetailScreen/`, `PurchaseOrderCheckoutScreen/`.
It pairs 1:1 with `src/views/DocumentListView/`.

## The route stays thin

An expo-router file in `src/app/` does nothing but render the screen, so routing
concerns never leak into the screen and the screen stays testable on its own.

```tsx
// src/app/documents.tsx
export { DocumentListScreen as default } from '@/screens/DocumentListScreen'
```

## `resources/use<ScreenName>.ts` — the hook

Any logic the screen needs lives in **one hook** named after the screen:
`DocumentListScreen` → `useDocumentListScreen`. It calls the view's loader,
tracks the initial-load state, and returns a plain object for `index.tsx` to
render.

```ts
// src/screens/DocumentListScreen/resources/useDocumentListScreen.ts
import { useEffect, useState } from 'react'

import { type DocumentListViewModel, loadDocumentListView } from '@/views/DocumentListView'

export const useDocumentListScreen = () => {
  const [viewModel, setViewModel] = useState<DocumentListViewModel | null>(null)

  useEffect(() => {
    loadDocumentListView().then(setViewModel)
  }, [])

  return { viewModel, isLoading: viewModel === null }
}
```

The hook may use its own siblings in `resources/`: `utils.ts` for pure helpers,
`constants.ts` for local constants, `services.ts` for screen-only side effects
(analytics, an imperative navigation helper). Data access always goes through
the view, never a domain directly.

## `index.tsx` — paint the view model

The screen reads the model and renders. Because the view already resolved every
section into either data or a controlled message, painting **partial content
plus per-section errors** is a flat, declarative pass — no branching pyramids,
no error copy invented here.

```tsx
// src/screens/DocumentListScreen/index.tsx
import { View } from 'react-native'

import { ViewSectionStatusTypes } from '@/views/DocumentListView'
import { Spinner } from '@/ui/atoms/Spinner'
import { DocumentList } from '@/ui/organisms/DocumentList'
import { SectionError } from '@/ui/molecules/SectionError'

import { AuthorFilters } from './components/AuthorFilters'
import { useDocumentListScreen } from './resources/useDocumentListScreen'
import { styles } from './styles'

export const DocumentListScreen = () => {
  const { viewModel, isLoading } = useDocumentListScreen()

  if (isLoading) return <Spinner />

  return (
    <View style={styles.root}>
      {viewModel.authors.status === ViewSectionStatusTypes.Error
        ? <SectionError message={viewModel.authors.message} />
        : <AuthorFilters authors={viewModel.authors.data} />}

      {viewModel.documents.status === ViewSectionStatusTypes.Error
        ? <SectionError message={viewModel.documents.message} />
        : <DocumentList rows={viewModel.documents.data} />}
    </View>
  )
}
```

Each section renders its data or its error independently — a failed authors call
never blanks the documents list. That is the payoff of the view's
`Promise.allSettled` contract.

Keep the branching flat: one ternary per section is a two-value choice and reads
fine; the moment a section needs more, extract a small subcomponent or a named
predicate (see the flat-conditionals policy).

## `components/` — subcomponents

Only when the screen splits into parts that have **no meaning outside this
screen** (`AuthorFilters` inside `DocumentListScreen`). Each follows the same
structure recursively: its own `index.tsx`, `styles.ts`, and `resources/` if it
needs logic.

If a piece would be useful on another screen, it is not a subcomponent —
promote it to `src/ui/` in the right atomic layer and import it.

## `styles.ts`

The screen's `StyleSheet`, exported as `styles`, kept out of `index.tsx`. Pull
colours, spacing and fonts from `@/constants/theme` rather than hard-coding
them.

## What a screen must not do

- Map or reshape data — the view already delivered final render shape. If you
  are writing `.map()` to change a field name in a screen, it belongs in the
  view's mapper.
- Import from `@/core/domains/...` — go through its view.
- Invent error copy — the message comes from the view model.
- Hold logic inline in `index.tsx` beyond a one-liner — move it to
  `resources/use<ScreenName>.ts`.

## Style (match the project)

No semicolons, 2-space indent, single quotes, sorted imports, max 2 params.
The screen component and its hook are `const` arrow functions like everything
else (see the arrow-function-declarations policy), and a default-exported screen
is named first, then exported. Screen folders, component names and props types
are PascalCase (`DocumentListScreenProps`); the hook file is
`use<ScreenName>.ts`.
