---
name: view-structure
description: >-
  Project architecture policy for views — the `.ts` (never `.tsx`) data-loading
  layer that feeds a Screen, under `src/core/views/<entity><Purpose>View/`. A view
  calls N domain repositories with `Promise.allSettled`, turns each settled
  result into either data or a controlled error message, and maps everything into
  the exact model the Screen paints on initial load, so the Screen needs zero
  mapping logic and can render partial content plus per-section errors. Contains
  `index.ts`, `view.ts`, `mappers/`, `models/`, `mocks/`, and optional
  `utils.ts`, `constants.ts`, `services.ts`. Use this skill whenever you load or
  orchestrate data for a screen, combine several domain calls, build a view
  model, handle partial-failure or per-call error messages, or write the mappers
  behind a Screen.
---

# View structure

A **view** is the `.ts` data layer behind one Screen. It orchestrates the domain
calls, tolerates partial failure, and hands the Screen a model that is already
in final render shape. The rule that drives everything here: **by the time the
Screen receives the model, there is no mapping left to do** — the Screen only
paints.

Layering: `src/app/` route → `<Entity><Purpose>Screen` (`.tsx`, paints) →
`<Entity><Purpose>View` (`.ts`, loads + maps) → `@core/domains/*` → transport.

## Folder layout

```
src/core/views/<entity><Purpose>View/
├── index.ts          # entry point — re-exports the loader (+ its models)
├── view.ts           # the loader: Promise.allSettled over N domain calls
├── mappers/
│   └── <entity>ToViewModel.ts  # settled results → view model (final shape)
├── models/
│   ├── index.ts                # re-exports every model
│   ├── <entity>ViewModel.ts    # interfaces → `Model` suffix
│   └── <entity>SectionType.ts  # type aliases → `Type` suffix
├── mocks/
│   └── <entity>ViewMock.ts     # fulfilled AND rejected fixtures
├── utils.ts          # only if needed
├── constants.ts      # error copy, page sizes… only if needed
└── services.ts       # only if needed
```

Folder name: **camelCase, entity first, `View` last** — `documentListView/`,
`documentDetailView/`. It pairs 1:1 with `documentListScreen/`. Only
identifiers are PascalCase here: the folder is camelCase like every other
folder in the codebase (see the naming-conventions policy), while the models it
exports keep their capital — `DocumentListViewModel`.

`view.ts` is **`.ts`, not `.tsx`** — a view never contains JSX. If you are
reaching for markup, that belongs to the Screen.

## `view.ts` — load N domains with `Promise.allSettled`

A view usually needs several domain calls. Use **`Promise.allSettled`**, never
`Promise.all`: one failing endpoint must not blank the whole screen. Each call
settles independently, and the mapper converts each settled result into either
its data or a **controlled error message** for that specific section.

```ts
// src/core/views/documentListView/view.ts
import { listAuthors } from '@core/domains/author'
import { listDocuments } from '@core/domains/document'

import { documentListToViewModel } from './mappers/documentListToViewModel'
import type { DocumentListViewModel } from './models'

export const loadDocumentListView = async (): Promise<DocumentListViewModel> => {
  const [documents, authors] = await Promise.allSettled([
    listDocuments(),
    listAuthors(),
  ])

  return documentListToViewModel({ documents, authors })
}
```

The loader stays this thin on purpose: gather, then delegate. All shaping and
all error copy live in the mapper, which is pure and testable without mocking
the whole screen.

## Controlled errors per call

Every domain call the view makes gets its own outcome in the model. Model a
section as a discriminated union so the Screen can render data or the error
message for that section and nothing else is affected.

```ts
// src/core/views/documentListView/models/viewSectionTypes.ts
export const ViewSectionStatusTypes = {
  Ok: 'ok',
  Error: 'error',
} as const

export type ViewSectionStatusTypes =
  (typeof ViewSectionStatusTypes)[keyof typeof ViewSectionStatusTypes]

export type ViewSectionType<TData> =
  | { readonly status: typeof ViewSectionStatusTypes.Ok; readonly data: TData }
  | { readonly status: typeof ViewSectionStatusTypes.Error; readonly message: string }
```

```ts
// src/core/views/documentListView/models/documentListViewModel.ts
export interface DocumentListViewModel {
  readonly documents: ViewSectionType<readonly DocumentRowModel[]>
  readonly authors: ViewSectionType<readonly AuthorChipModel[]>
}
```

Error **messages are decided here, not in the Screen** — put the copy in
`constants.ts` so it is reviewable in one place and the Screen never invents
text. A rejected promise becomes a message the user can read; the raw error is
logged, not rendered.

Once this section pattern repeats across views, hoist `ViewSectionType` and its
`ViewSectionStatusTypes` into a shared location (`src/core/models/`) rather than
copying it.

## `mappers/` — build the final render shape

Domain mappers only translate payloads to camelCase (see the domain-structure
policy). **View mappers do the transforming**: unwrap the settled results, pick
the fields the Screen uses, flatten, rename for the UI, compute labels, badges,
counts, formatted dates and disabled flags, and merge in route params or
translations.

```ts
// src/core/views/documentListView/mappers/documentListToViewModel.ts
import type { DocumentModel, ListDocumentsResponseModel } from '@core/domains/document'

import { ERROR_MESSAGES } from '../constants'
import {
  type DocumentListResultsModel,
  type DocumentListViewModel,
  type DocumentRowModel,
  ViewSectionStatusTypes,
  type ViewSectionType,
} from '../models'

const documentModelToRow = (document: DocumentModel): DocumentRowModel => ({
  id: document.id,
  title: document.title,
  badge: document.status === 'published' ? 'Live' : 'Draft',
})

const documentsResultToSection = (
  result: PromiseSettledResult<ListDocumentsResponseModel>,
): ViewSectionType<readonly DocumentRowModel[]> => {
  if (result.status === 'rejected') {
    return { status: ViewSectionStatusTypes.Error, message: ERROR_MESSAGES.documents }
  }

  return {
    status: ViewSectionStatusTypes.Ok,
    data: result.value.items.map(documentModelToRow),
  }
}

export const documentListToViewModel = (
  results: DocumentListResultsModel,
): DocumentListViewModel => ({
  documents: documentsResultToSection(results.documents),
  authors: authorsResultToSection(results.authors),
})
```

Note the shape of that code: one small named function per section and per row,
each named for the direction it maps (`<source>To<Target>`, like a domain
mapper), guard clause for the rejected branch, a ternary only for a two-value
choice — the flat-conditionals policy applied. The row mapper sits above the
section mapper which sits above the exported entry point, because `const`
arrows are not hoisted and the file therefore reads in dependency order.

## `models/`

View-local shapes describing **what the Screen paints**, not what the API
returns. Interfaces → **`Model`** (`DocumentListViewModel`, `DocumentRowModel`),
type aliases → **`Type`** (`ViewSectionType`), enum-replacement `as const`
objects → **`Types`** (`ViewSectionStatusTypes`, per the no-typescript-enum
policy). All re-exported from `models/index.ts`.

Prefer `readonly` fields: the Screen consumes the model, it does not mutate it.

## `mocks/`

Fixtures for both outcomes of every call — a fulfilled result **and** a rejected
one — so the mapper tests and the Screen previews can exercise partial-failure
states, which is the whole point of `allSettled`.

## `utils.ts`, `constants.ts`, `services.ts` — only if needed

No empty scaffolding. Create the file when the view really has:

- **`utils.ts`** — pure helpers for this view (a comparator, a formatter).
  Reusable across views → `src/utils/` instead.
- **`constants.ts`** — the per-call error messages, page sizes, local copy.
- **`services.ts`** — side effects that are not a domain repository (screen
  analytics, a one-off imperative helper). Cross-cutting → `src/services/`.

## Testing

The loader and the mapper are the testable surface, and they are pure enough to
test without rendering:

- **mapper**: feed fulfilled mocks → assert the exact view model; feed a
  rejected mock for one call → assert that section carries the right message and
  the **other sections still carry their data**.
- **loader**: domains mocked, assert every call is issued and that one rejection
  does not throw out of `loadDocumentListView`.

## What a view must not do

- Contain JSX or import from `react-native` / `@ui` — it is `.ts`.
- Use `Promise.all` for independent calls — one failure would lose everything.
- Let a raw error escape to the Screen — every rejection becomes a controlled
  message.
- Leave mapping for the Screen to finish.
- Touch the transport directly, or reshape raw payloads — always go through a
  domain repository and its models.

## Style (match the project)

No semicolons, 2-space indent, single quotes, sorted imports, max 2 params
(bundle mapper inputs into one object — as `DocumentListResultsModel` does).
Every function is a `const` bound to an arrow function, defined above its first
use (see the arrow-function-declarations policy).
Import domains by alias (`@core/domains/...`), view internals by relative path.
