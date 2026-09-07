---
name: naming-conventions
description: >-
  Project naming policy. camelCase is the default for everything — file names,
  folder names, variables, functions, hooks, object properties, mappers,
  repositories. The exception is components: a component definition, its folder,
  and its props type are PascalCase (`SubmitButton`, `DocumentListScreen`), as
  are all types and interfaces. Module-level fixed constants are UPPER_CASE. Use
  this skill whenever you name or rename a file, folder, variable, function,
  hook, type, interface or component, create any new file in `src/`, or are
  unsure which casing applies — even if the user does not ask about naming.
---

# Naming conventions

**camelCase is the default. Components are the exception.**

Everything in this codebase — file names, folder names, variables, functions,
hooks, properties — is camelCase, so there is one habit to hold. The moment you
are naming a **component**, switch to PascalCase: the component function, the
folder it lives in, and its props type.

## The lookup table

| What | Casing | Example |
| --- | --- | --- |
| Non-component file | camelCase | `getDocumentById.ts`, `documentMapper.ts`, `view.ts`, `styles.ts` |
| Non-component folder | camelCase | `src/domains/purchaseOrder/`, `repositories/`, `mappers/` |
| **Component definition** | **PascalCase** | `export function SubmitButton()` |
| **Component folder** | **PascalCase** | `src/ui/atoms/SubmitButton/` |
| Component file inside it | lowercase | `index.tsx`, `styles.ts` |
| Props type | PascalCase + `Props` | `SubmitButtonProps` |
| Hook function & file | camelCase, `use` prefix | `useSearchField()` in `useSearchField.ts` |
| Variable, function, parameter | camelCase | `documentRows`, `toDocumentModel(payload)` |
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
only thing that works. The folder and props type follow the component's name so
that one identifier — `SubmitButton` — is what you search for, import, and see
in a stack trace.

```tsx
// src/ui/atoms/SubmitButton/index.tsx
export interface SubmitButtonProps {
  label: string
  onPress: () => void
}

export function SubmitButton({ label, onPress }: SubmitButtonProps) { … }
```

```ts
// src/domains/document/repositories/getDocumentById.ts  — camelCase file + function
export async function getDocumentById(id: string): Promise<DocumentModel> { … }
```

## Architectural suffixes

The structural policies add a required suffix on top of the casing. All of these
are PascalCase because they name a component or a type:

| Thing | Suffix | Example |
| --- | --- | --- |
| Screen component + folder | `Screen` | `DocumentListScreen` |
| View folder + its model | `View` | `DocumentListView`, `DocumentListViewModel` |
| Interface (data shape) | `Model` | `DocumentModel` |
| Type alias | `Type` | `ViewSectionType` |
| `as const` object replacing an `enum`, and its derived type | `Types` | `DocumentStatusTypes` |
| Component props | `Props` | `SubmitButtonProps` |

## Edge cases

- **A file that only exports a component** does not need the component's name —
  it is `index.tsx` inside the PascalCase folder. The folder carries the
  identity.
- **A hook is not a component**, even though it is React: camelCase, `use`
  prefix, camelCase file — `resources/useDocumentListScreen.ts`.
- **A multi-word entity folder** stays camelCase: `src/domains/purchaseOrder/`,
  not `purchase-order/` or `PurchaseOrder/`.
- **API payload keys** keep the server's casing inside the mapper — that is the
  one place snake_case is allowed to appear, because the mapper's job is to
  translate it away. Nothing downstream of the mapper sees it.
- **A constant that holds a fixed literal** is UPPER_CASE; a computed or derived
  `const` is camelCase. `const MAX_RETRIES = 3` vs `const retryCount = …`.

## The lint rules that back this

`@typescript-eslint/naming-convention` in `eslint.config.js` already enforces
most of it: `default` → camelCase, `variable` → camelCase / UPPER_CASE /
PascalCase (so arrow-function components pass), `function` → camelCase /
PascalCase (so component declarations pass), `typeLike` → PascalCase,
`parameter` → camelCase, with imports and object/type properties deliberately
unpoliced so we do not fight names we do not own.

File and folder names are not lintable — those are on you.
