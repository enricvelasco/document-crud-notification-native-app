---
name: single-purpose-functions
description: >-
  Project code policy: every function does exactly one thing, and its name says
  what that thing is without needing a comment. If the name needs an "and", a
  generic verb (`process`, `handle`, `manage`, `doStuff`), or a boolean flag
  parameter that switches behaviour, the function is doing too much — split it.
  Name says what, not how; verb-first with the project's prefix conventions
  (`get`/`is`/`has`/`handle`/`use`/`create`), and mappers named for their
  direction (`documentPayloadToModel`). Use this skill whenever you
  write, name, rename, split or review any function, method, hook, mapper,
  repository or helper, when a function grows past a screenful, or when you catch
  yourself writing a comment to explain what a function does.
---

# Single-purpose functions

Two rules that reinforce each other:

1. **A function does one thing.**
2. **Its name tells you that thing completely**, so you never have to open the
   body to know what a call site does.

When both hold, code becomes readable top-down: a caller reads as a sentence of
named steps, and you only descend into a function when you care *how* it works.
When either breaks, every reader has to reconstruct the intent from the
implementation, every time.

## The naming test

Before you write the body, name the function. If you cannot name it precisely,
you do not yet know what it does — that is the signal to split, not to reach for
a vaguer name.

A name fails the test when it contains:

- **"and"** — `fetchAndMapDocuments`, `validateAndSubmit`. Two things. Split.
- **a generic verb** — `process`, `handle`, `manage`, `doWork`, `run`, `execute`.
  These say "something happens here" and nothing more.
- **a generic noun** — `data`, `info`, `stuff`, `item`, `helper`, `utils` as the
  whole name.
- **the implementation** instead of the intent — `mapFilterReduceDocuments`
  describes how; `getPublishedDocumentTitles` describes what. The *how* is free
  to change; the *what* is the contract.

```ts
// ❌ name hides two responsibilities
const processDocuments = async (rawList: DocumentPayloadModel[]) => …

// ✅ each one nameable, each one testable
const documentListPayloadToModel = (payloads: DocumentListPayloadType): DocumentListType => …
const filterPublished = (documents: DocumentListType): DocumentListType => …
```

## The comment test

If you need a comment above a function explaining *what* it does, the name is
wrong — put that sentence into the name. Comments that survive are the ones
explaining *why* something non-obvious was necessary, which a name cannot carry.

```ts
// ❌ the comment is doing the name's job
// Returns the rows the list should show, dropping archived ones
const getRows = (documents: readonly DocumentModel[]) => …

// ✅ the name carries it
const getVisibleDocumentRows = (documents: readonly DocumentModel[]) => …
```

## Verb prefixes used in this project

Consistent prefixes let a reader infer the shape of a function from its name
alone — what it returns, whether it is pure, whether it touches I/O.

| Prefix | Means | Example |
| --- | --- | --- |
| `get` | returns something already available, cheap, sync or a simple lookup | `getVisibleDocumentRows` |
| `fetch` / `load` | goes to the network or storage, async | `loadDocumentListView` |
| `<source>To<Target>` | pure shape translation, named for its direction | `documentPayloadToModel`, `documentListToViewModel` |
| `is` / `has` / `can` / `should` | predicate, returns boolean | `isPublished`, `canSubmit` |
| `create` / `build` | constructs a new value or object | `createDocument`, `buildQueryParams` |
| `handle` / `on` | event handler in a component or hook | `handleSubmit`, `onPressRow` |
| `use` | React hook | `useDocumentListScreen` |

## Signs a function does too much

- **A boolean flag parameter that switches behaviour.** `save(document, true)`
  is two functions wearing a trench coat, and the call site is unreadable.
  Split into `publishDocument` and `saveDraft`.
- **Mixed levels of abstraction.** A function that both orchestrates named steps
  *and* fiddles with string indexes is operating at two altitudes. Push the
  low-level detail into its own named function so the orchestrator reads as a
  list of intentions.
- **It needs more than 2 parameters.** The project's `max-params` lint rule caps
  this at 2 — a function wanting five inputs is usually coordinating several
  responsibilities. Either split it, or bundle genuinely-cohesive inputs into one
  named model object.
- **You cannot describe it in one sentence** without listing steps.
- **The test needs several unrelated setups** to cover it.

```ts
// ❌ flag parameter switches behaviour
const saveDocument = (document: DocumentModel, publish: boolean) => {
  if (publish) { … } else { … }
}

// ✅ two intentions, two names, two tests
const publishDocument = (document: DocumentModel): Promise<DocumentModel> => …
const saveDraftDocument = (document: DocumentModel): Promise<DocumentModel> => …
```

## Why this matters here

- **Testability.** One responsibility means one reason to fail and one thing to
  assert. A function doing three things needs a combinatorial test suite; three
  functions need three small ones. This is the same force behind the
  flat-conditionals policy, which asks you to extract each condition into a
  named predicate — a predicate is just the smallest single-purpose function.
- **The architecture already assumes it.** Domain repositories are one operation
  per file, domain mappers only translate, view mappers only build the render
  shape, screen hooks only wire the view to the paint. Those boundaries only
  hold if the functions inside them stay single-purpose too.
- **Reuse falls out for free.** A function that does one thing is one you can
  call from somewhere else. A function that does three is one you fork.
- **Diffs stay honest.** Changing one behaviour touches one function, so a
  reviewer can see the whole change without reading around it.

## Splitting, in practice

Extract the inner steps as named functions, then let the outer one read as a
summary of them. The orchestrator keeps the name of the overall intent.

```ts
// before: one function, three jobs, needs a comment to follow
const loadDocumentListView = async () => {
  const [documents, authors] = await Promise.allSettled([listDocuments(), listAuthors()])
  const rows = documents.status === 'fulfilled'
    ? documents.value.items.map((d) => ({ id: d.id, title: d.title, badge: d.status === 'published' ? 'Live' : 'Draft' }))
    : []
  …
}

// after: the loader orchestrates, each step is named and testable on its own
const documentStatusToBadge = (status: DocumentStatusTypes): string => …
const documentModelToRow = (document: DocumentModel): DocumentRowModel => …
const documentsResultToSection = (result: PromiseSettledResult<ListDocumentsResponseModel>) => …
const documentListToViewModel = (results: DocumentListResultsModel): DocumentListViewModel => …

export const loadDocumentListView = async (): Promise<DocumentListViewModel> => {
  const [documents, authors] = await Promise.allSettled([listDocuments(), listAuthors()])

  return documentListToViewModel({ documents, authors })
}
```

Notice the outer function got *shorter and clearer*, not longer. That is the
tell that the split was the right one — if extracting made the caller harder to
read, you split along the wrong seam. Note also that the extracted steps sit
*above* the orchestrator: `const` arrows are not hoisted, so a split file reads
smallest-piece-first and the orchestrator lands last, as a summary of what
precedes it.

## Style (match the project)

No semicolons, 2-space indent, single quotes, camelCase function names
(PascalCase only for components), max 2 parameters. Every function is a `const`
bound to an arrow function (see the arrow-function-declarations policy).
