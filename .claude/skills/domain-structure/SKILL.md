---
name: domain-structure
description: >-
  Project architecture policy for domains (the data/business layer under
  `src/domains/`). A domain is a folder named after its entity containing
  `index.ts` (the only public entry point), `repositories/` (descriptive CRUD
  operations), `models/` (interfaces suffixed `Model`, type aliases suffixed
  `Type`, all re-exported from `models/index.ts`, repository return models
  `readonly`), `mappers/` (camelCase translation only, never reshape the
  payload), `mocks/`, and a complete unit test. Use this skill whenever you
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
src/domains/<entity>/
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
│   └── list<Entity>sResponseModel.ts   # repository return models (readonly)
├── mappers/
│   └── <entity>Mapper.ts           # payload → camelCase, structure untouched
├── mocks/
│   └── <entity>Mock.ts             # fixtures for tests / stories
└── <entity>.test.ts                # complete unit test for the domain
```

`<entity>` folder name is camelCase (`document/`, `purchaseOrder/`). Files are
camelCase and named for what they do — descriptive, not generic
(`getDocumentById.ts`, not `repo.ts` or `queries.ts`).

## `index.ts` — the boundary

Outside code imports from `@/domains/<entity>` and nothing deeper. The rest of
the folder is private.

```ts
// src/domains/document/index.ts
export { createDocument } from './repositories/createDocument'
export { getDocumentById } from './repositories/getDocumentById'
export { listDocuments } from './repositories/listDocuments'
export * from './models'
```

Why: the domain stays swappable (change the transport, the models, the mapper —
call sites do not move) and nothing can reach in and couple to an internal file.

## `repositories/`

One file per operation, usually the CRUD set, named descriptively. A repository
function talks to the transport (fetch / SDK / storage), calls the mapper, and
returns a model.

```ts
// src/domains/document/repositories/getDocumentById.ts
import { httpClient } from '@/services/http-client'

import { toDocumentModel } from '../mappers/documentMapper'
import type { DocumentModel } from '../models'

export async function getDocumentById(id: string): Promise<DocumentModel> {
  const payload = await httpClient.get(`/documents/${id}`)
  return toDocumentModel(payload)
}
```

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
// src/domains/document/models/documentModel.ts
export interface DocumentModel {
  readonly id: string
  readonly title: string
  readonly status: DocumentStatusTypes
  readonly author: DocumentAuthorModel
  readonly tags: readonly string[]
}

// src/domains/document/models/documentStatusTypes.ts
// an enumeration → `as const` object + derived type sharing the `Types` name
export const DocumentStatusTypes = {
  Draft: 'draft',
  Published: 'published',
  Archived: 'archived',
} as const

export type DocumentStatusTypes =
  (typeof DocumentStatusTypes)[keyof typeof DocumentStatusTypes]

// src/domains/document/models/listDocumentsResponseModel.ts
export interface ListDocumentsResponseModel {
  readonly items: readonly DocumentModel[]
  readonly total: number
  readonly page: number
}
```

```ts
// src/domains/document/models/index.ts
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

```ts
// src/domains/document/mappers/documentMapper.ts
import type { DocumentModel } from '../models'

export function toDocumentModel(payload: DocumentPayload): DocumentModel {
  return {
    id: payload.id,
    title: payload.title,
    status: payload.status,
    author: {
      id: payload.author.id,
      displayName: payload.author.display_name,
    },
    tags: payload.tags,
  }
}
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

- **every repository**: transport mocked, assert the right endpoint/args and
  that the result is the mapped model;
- **every mapper**: feed the payload mock, assert the exact camelCase model
  (including that structure/counts are unchanged);
- **any domain logic** beyond plain pass-through.

Use the fixtures from `mocks/`. Repositories and mappers are pure enough that
tests need only the transport mocked — no rendering, no navigation.

## Style (match the project)

No semicolons, 2-space indent, single quotes, sorted imports, max 2 params.
Import within a domain by relative path (`../models`); import a domain from
outside by alias (`@/domains/document`).
