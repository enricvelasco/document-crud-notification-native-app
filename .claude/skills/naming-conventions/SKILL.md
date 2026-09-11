---
name: naming-conventions
description: >-
  Project naming policy. camelCase is the default for everything — file names,
  folder names, variables, functions, hooks, object properties, repositories,
  and mappers, which are named for the direction they travel
  (`documentPayloadToModel`, `documentListToViewModel`). Every folder is
  camelCase too, components included (`src/ui/atoms/submitButton/`). PascalCase
  is for identifiers only: a component definition, its props type, and all
  types and interfaces (`SubmitButton`, `SubmitButtonProps`, `DocumentModel`).
  Module-level fixed constants are UPPER_CASE. Use
  this skill whenever you name or rename a file, folder, variable, function,
  hook, type, interface or component, create any new file in `src/`, or are
  unsure which casing applies — even if the user does not ask about naming.
---

# Naming conventions

**Everything on disk is camelCase. PascalCase is for identifiers.**

File names, folder names, variables, functions, hooks and properties are all
camelCase, so there is one habit to hold whenever you are naming something the
filesystem will see. PascalCase starts where the code does: the component
function, its props type, and every type and interface.

The split is not cosmetic. PascalCase on a component is a language requirement
— see below. PascalCase on the folder around it never was: that was the
component's name leaking onto a path that nothing but an import statement ever
reads.

## The lookup table

| What | Casing | Example |
| --- | --- | --- |
| Non-component file | camelCase | `getDocumentById.ts`, `documentPayloadToModel.ts`, `view.ts`, `styles.ts` |
| Folder — every folder, no exception | camelCase | `src/ui/atoms/submitButton/`, `src/core/domains/purchaseOrder/`, `repositories/` |
| **Component definition** | **PascalCase** | `export const SubmitButton = () => …` |
| Component file inside its folder | lowercase | `index.tsx`, `styles.ts` |
| Props type | PascalCase + `Props` | `SubmitButtonProps` |
| Hook function & file | camelCase, `use` prefix | `useSearchField()` in `useSearchField.ts` |
| Variable, function, parameter | camelCase | `documentRows`, `documentPayloadToModel(payload)` |
| Type / interface | PascalCase | `DocumentModel`, `ViewSectionType` |
| Module-level fixed constant | UPPER_CASE | `MIN_QUERY_LENGTH`, `ERROR_MESSAGES` |
| Payload properties from an API | left as the API sends them | `display_name` (only inside the mapper) |

## Why components are PascalCase

This is not a style preference — JSX depends on it. React treats a lowercase tag
as an intrinsic host element and a capitalised one as a component reference:

```tsx
<submitButton />   // ❌ React looks for a native element named "submitButton"
<SubmitButton />   // ✅ React renders your component
```

A lowercase component fails silently or renders nothing, so PascalCase is the
only thing that works — for the identifier. The props type follows it, so that
one name, `SubmitButton`, is what you search for, import, and see in a stack
trace.

The folder is not a JSX tag, so none of that reasoning reaches it. It is a path
segment like `repositories/` or `mappers/`, and it is camelCase for the same
reason they are: casing that varies by folder is a rule you have to remember
instead of one you can apply, and on a case-insensitive filesystem the mistake
stays invisible until CI runs on Linux.

```tsx
// src/ui/atoms/submitButton/index.tsx
export interface SubmitButtonProps {
  label: string
  onPress: () => void
}

export const SubmitButton = ({ label, onPress }: SubmitButtonProps) => …
```

```ts
// src/core/domains/document/mappers/documentPayloadToModel.ts  — camelCase file + function
export const documentPayloadToModel = (payload: DocumentPayloadModel): DocumentModel => …
```

Casing is the only thing that changes between the two: both are a `const` bound
to an arrow function, because that is how every function in this codebase is
declared (see the arrow-function-declarations policy).

## Architectural suffixes

The structural policies add a required suffix on top of the casing. The suffix
is the same on both sides of the split — only the first letter moves:

| Thing | Suffix | Example |
| --- | --- | --- |
| Screen component | `Screen` | `DocumentListScreen` in `src/screens/documentListScreen/` |
| View loader + its model | `View` | `DocumentListViewModel` in `src/core/views/documentListView/` |
| Interface (data shape) | `Model` | `DocumentModel` |
| Type alias | `Type` | `ViewSectionType` |
| `as const` object replacing an `enum`, and its derived type | `Types` | `DocumentStatusTypes` |
| Component props | `Props` | `SubmitButtonProps` |

A **mapper** is named for the direction it travels, not for being a mapper:
`documentPayloadToModel`, `documentModelToPayload`,
`documentListToViewModel`. `documentMapper` tells you nothing about which side
of the boundary you end up on (see the domain-structure and view-structure
policies).

## Edge cases

- **A file that only exports a component** does not need the component's name —
  it is `index.tsx` inside the camelCase folder. The folder carries the
  identity, in the casing every other folder uses.
- **A hook is not a component**, even though it is React: camelCase, `use`
  prefix, camelCase file — `resources/useDocumentListScreen.ts`.
- **A multi-word folder** stays camelCase whatever it holds:
  `src/core/domains/purchaseOrder/`, `src/ui/molecules/cardListItem/` — never
  `purchase-order/`, `PurchaseOrder/` or `CardListItem/`.
- **API payload keys** keep the server's casing inside the mapper — that is the
  one place snake_case is allowed to appear, because the mapper's job is to
  translate it away. Nothing downstream of the mapper sees it.
- **A constant that holds a fixed literal** is UPPER_CASE; a computed or derived
  `const` is camelCase. `const MAX_RETRIES = 3` vs `const retryCount = …`.

## The lint rules that back this

`@typescript-eslint/naming-convention` in `eslint.config.js` already enforces
most of it: `default` → camelCase, `variable` → camelCase / UPPER_CASE /
PascalCase (which is the selector that matters, since every function — component
or not — is a `const`), `typeLike` → PascalCase, `parameter` → camelCase, with
imports and object/type properties deliberately unpoliced so we do not fight
names we do not own.

File and folder names are not lintable — those are on you.
