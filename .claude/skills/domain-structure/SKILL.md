---
name: domain-structure
description: >-
  Project architecture policy for domains (the data/business layer under
  `src/core/domains/`). A domain is a folder named after its entity containing
  `index.ts` (the only public entry point), `repositories/` (descriptive CRUD
  operations), `models/` (interfaces suffixed `Model`, type aliases suffixed
  `Type`, all re-exported from `models/index.ts`, repository return models
  `readonly`), `mappers/` named for their direction
  (`<entity>PayloadToModel` / `<entity>ModelToPayload`, camelCase translation
  only, never reshape the payload), `mocks/`, and a complete unit test. Use this skill whenever you
  create or restructure a domain/entity, add a repository or API call, define a
  data model or DTO, write a payload mapper, or wire the data layer for a feature
  — even if the user does not say "domain".
---

# Domain structure

A **domain** is the data + business layer for one entity: how it is fetched and
persisted (repositories), what shape it has in our code (models), and how the
raw API payload becomes that shape (mappers). Everything a domain exposes to the
rest of the app goes through its `index.ts`.

## Folder layout

```
src/core/domains/<entity>/
├── index.ts                        # the ONLY public entry point
├── repositories/
│   ├── create<Entity>.ts           # one file per operation, descriptive names
│   ├── get<Entity>ById.ts
│   ├── list<Entity>s.ts
│   ├── update<Entity>.ts
│   └── delete<Entity>.ts
├── models/
│   ├── index.ts                    # re-exports every model in this folder
│   ├── <entity>Model.ts            # interfaces  → `Model` suffix
│   ├── <entity>StatusTypes.ts      # enumerations → `as const` + `Types` suffix
│   ├── <entity>IdType.ts           # plain type aliases → `Type` suffix
│   └── <operation>ResponseModel.ts # repository return model, named for the
│                                   # repository, deeply readonly
├── mappers/
│   ├── <entity>PayloadToModel.ts   # payload → camelCase model, structure untouched
│   └── <entity>ModelToPayload.ts   # model → payload shape, only when we write
├── mocks/
│   └── <entity>Mock.ts             # fixtures for tests / stories
└── <entity>.test.ts                # complete unit test for the domain
```

`<entity>` folder name is camelCase (`document/`, `purchaseOrder/`). Files are
camelCase and named for what they do — descriptive, not generic
(`getDocumentById.ts`, not `repo.ts` or `queries.ts`).

## `index.ts` — the boundary

Outside code imports from `@core/domains/<entity>` and nothing deeper. The rest of
the folder is private.

```ts
// src/core/domains/document/index.ts
export * from './models'
export { getDocumentById } from './repositories/getDocumentById'
export { getDocumentList } from './repositories/getDocumentList'
```

Why: the domain stays swappable (change the transport, the models, the mapper —
call sites do not move) and nothing can reach in and couple to an internal file.

## `repositories/`

One file per operation, usually the CRUD set, named descriptively. A repository
imports the service port, calls the transport, hands the payload to the mapper,
and returns a model.

```ts
// src/core/domains/document/repositories/getDocumentById.ts
import { httpService } from '@/services/http'

import { documentPayloadToModel } from '../mappers/documentPayloadToModel'
import { DocumentError, type DocumentPayloadModel, type GetDocumentByIdType } from '../models'

export const getDocumentById: GetDocumentByIdType = async (id) => {
  try {
    const payload = await httpService.get<DocumentPayloadModel>(`/documents/${id}`)

    return documentPayloadToModel(payload)
  } catch (error) {
    throw new DocumentError(`Document ${id} could not be loaded.`, { cause: error })
  }
}
```

**The service is imported, never a parameter.** Parameters are for the caller's
*dynamic* inputs — an id, a query, url or body params. Which transport the
domain speaks through is not something a caller decides, so putting it in the
signature would make every call site carry a dependency it has no opinion about.
The swap-ability that matters is already handled one level down, inside the port
(see the dependency-inversion policy).

Type the function once in `models/` (`GetDocumentByIdType`) so the signature
lives with the rest of the domain's contract instead of being spelled out inline.

**Wrap the call in `try`/`catch`.** A repository is the boundary where a
transport failure becomes a domain failure: catch whatever the service throws
and rethrow a `DocumentError` that names the operation, passing the original as
`{ cause }`. The caller then gets an error it can attribute — "the document list
failed", not "some fetch somewhere failed" — while the underlying `HttpError`
(status, timeout, network) stays attached for logging. Never swallow the error
and return an empty value: the view layer needs to know a section failed so it
can paint its controlled message (see the view-structure policy).

Keep to max 2 parameters — bundle extra inputs into one options object.

## `models/`

- **Interfaces** describing an entity or a nested object → suffix **`Model`**:
  `DocumentModel`, `DocumentAuthorModel`.
- **Type aliases** that are not enumerations (primitives, mapped/utility types)
  → suffix **`Type`**: `DocumentIdType`, `DocumentSortType`.
- **Enumerations** (any fixed set of values) → an `as const` object plus its
  derived type, both sharing a **`Types`** name: `DocumentStatusTypes`.
- Every model is re-exported from `models/index.ts` so consumers import from one
  place.
- **Repository return models are `readonly`.** A caller receiving domain data
  must not mutate it — it may be shared, cached, or handed to several views.
  Make the whole shape deeply immutable.

```ts
// src/core/domains/document/models/documentModel.ts
export interface DocumentModel {
  readonly id: string
  readonly title: string
  readonly status: DocumentStatusTypes
  readonly author: DocumentAuthorModel
  readonly tags: readonly string[]
}

// src/core/domains/document/models/documentStatusTypes.ts
// an enumeration → `as const` object + derived type sharing the `Types` name
export const DocumentStatusTypes = {
  Draft: 'draft',
  Published: 'published',
  Archived: 'archived',
} as const

export type DocumentStatusTypes =
  (typeof DocumentStatusTypes)[keyof typeof DocumentStatusTypes]

// src/core/domains/document/models/listDocumentsResponseModel.ts
export interface ListDocumentsResponseModel {
  readonly items: readonly DocumentModel[]
  readonly total: number
  readonly page: number
}
```

```ts
// src/core/domains/document/models/index.ts
export * from './documentModel'
export * from './documentStatusTypes'
export * from './listDocumentsResponseModel'
```

Note on the three suffixes:

- **`Model`** — an interface describing a data shape (`DocumentModel`).
- **`Type`** — a plain type alias that is *not* an enumeration
  (`DocumentIdType = string`, a mapped or utility type).
- **`Types`** — an enumeration: the `as const` object **and** its derived type
  share this one name (`DocumentStatusTypes`), per the no-typescript-enum
  policy. Any fixed set of values goes here, never a bare union and never
  `enum`.

## `mappers/`

A mapper **translates** the payload — it does not **transform** it. Same keys,
same nesting, same cardinality; only the naming changes (snake_case /
PascalCase / whatever the API sends → camelCase), plus light type coercion
(`"2026-01-01"` string stays a string; don't parse it into a `Date` here).

**A mapper is named for the direction it travels**: `<entity>PayloadToModel` for
reads, `<entity>ModelToPayload` for writes, and the file carries that same name.
Reading a call site tells you which side of the boundary you are on without
opening anything, and when both directions exist they sit next to each other in
the folder as an obvious pair. A vague `documentMapper` hides that — you have to
open it to find out which way it goes.

```ts
// src/core/domains/document/mappers/documentPayloadToModel.ts
import type { DocumentModel, DocumentPayloadModel } from '../models'

export const documentPayloadToModel = (payload: DocumentPayloadModel): DocumentModel => ({
  id: payload.ID,
  title: payload.Title,
  status: payload.Status,
  author: {
    id: payload.Author.ID,
    displayName: payload.Author.DisplayName,
  },
  tags: payload.Tags,
})
```

A nested object big enough to have its own `Model` gets its own mapper file
(`documentAuthorPayloadToModel.ts`) which the parent calls — that keeps each
mapper testable on its own and lets `.map()` take it by reference.

A collection mapper follows the same rule and just delegates:

```ts
// src/core/domains/document/mappers/documentListPayloadToModel.ts
import type { DocumentListPayloadType, DocumentListType } from '../models'
import { documentPayloadToModel } from './documentPayloadToModel'

export const documentListPayloadToModel = (payload: DocumentListPayloadType): DocumentListType =>
  payload.map(documentPayloadToModel)
```

Not in a mapper: filtering fields, flattening nested objects, computing derived
values, merging two payloads, defaulting missing data. That work belongs to a
**view mapper** (see the view-structure policy) or a repository, where it is
visible and testable on its own. Keeping domain mappers structure-preserving
means the API contract stays legible — a reviewer can diff the mapper against
the payload docs field by field.

## `mocks/`

Realistic fixtures for the models and payloads, consumed by the domain test and
by view/component tests. Export both the raw payload mock and the mapped model
mock when both are useful.

## The unit test

Each domain ships a complete unit test (`<entity>.test.ts`) covering:

- **every repository**: the service port module mocked
  (`jest.mock('@/services/http', …)`), asserting the right endpoint/args, that
  the result is the mapped model, and that a rejection surfaces as the domain's
  own error with the original attached as `cause`;
- **every mapper**: feed the payload mock, assert the exact camelCase model
  (including that structure/counts are unchanged);
- **any domain logic** beyond plain pass-through.

Use the fixtures from `mocks/`. Mappers are pure, and a repository needs only
the port module mocked — no rendering, no navigation, and no app config, since
mocking `@/services/http` also keeps the real adapter (and the environment it
reads) out of the test.

## Style (match the project)

No semicolons, 2-space indent, single quotes, sorted imports, max 2 params.
Every function is a `const` bound to an arrow function, never a `function`
declaration (see the arrow-function-declarations policy) — which also means a
helper must be defined above its first use in the file.
Import within a domain by relative path (`../models`); import a domain from
outside by alias (`@core/domains/document`).
