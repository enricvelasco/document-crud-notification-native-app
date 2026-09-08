---
name: arrow-function-declarations
description: >-
  Project code policy: every function is declared as a `const` bound to an arrow
  function — `export const toUserModel = (payload: UserPayloadModel):
  UserModel => ({...})` — never with the `function` keyword. This covers
  components, hooks, mappers, repositories, predicates, event handlers, module
  helpers and test helpers alike; `function` declarations are reserved for
  nothing. Use this skill whenever you write, refactor or review any function,
  method-like helper, React component, custom hook or callback, whenever you
  port code in from a snippet or another codebase, and whenever you catch
  yourself typing the word `function` — even if the user does not mention
  declaration style.
---

# Arrow function declarations

## The rule

Every function in `src/` is a `const` bound to an arrow function. The `function`
keyword does not appear in application code.

```ts
// ❌
export function documentPayloadToModel(payload: DocumentPayloadModel): DocumentModel {
  return { id: payload.ID }
}

// ✅
export const documentPayloadToModel = (payload: DocumentPayloadModel): DocumentModel => ({
  id: payload.ID,
})
```

This is not decoration — three things follow from it.

**One shape to read.** A file where some things are `const x = …` and others are
`function x(…)` makes the reader classify each declaration before understanding
it. Uniformity means the eye finds the name in the same column every time.

**No hoisting, so order tells the truth.** A `function` declaration can be
called fifty lines above where it is defined, which lets a module's real
dependency order stay invisible. A `const` arrow must be defined before it is
used, so reading a file top to bottom shows the actual build-up: primitives
first, then what composes them, then the exported entry point. When you convert
a `function` declaration that was used earlier in the file, you are not fighting
the rule — the rule is surfacing an ordering the old code was hiding.

**`this` cannot surprise you.** Arrow functions close over the enclosing `this`
instead of rebinding it, which removes an entire class of callback bug in
handlers and object literals.

## What this looks like across the codebase

Mappers, repositories, predicates, helpers:

```ts
export const isAbortError = (error: unknown): boolean =>
  error instanceof Error && error.name === 'AbortError'

export const getDocumentList: GetDocumentListType = async () => {
  try {
    const payload = await httpService.get<DocumentListPayloadType>(DOCUMENT_LIST_PATH)

    return documentListPayloadToModel(payload)
  } catch (error) {
    throw new DocumentError('The document list could not be loaded.', { cause: error })
  }
}
```

Components and hooks — same rule, PascalCase for the component per the
naming-conventions policy:

```ts
export const SubmitButton = ({ label, onPress }: SubmitButtonProps) => (
  <Pressable onPress={onPress}>
    <Text>{label}</Text>
  </Pressable>
)

export const useDocumentList = (): UseDocumentListModel => {
  const [documents, setDocuments] = useState<DocumentListType>([])

  return { documents, setDocuments }
}
```

Object literal members, including a port's adapter, are arrow properties rather
than method shorthand — method shorthand is the `function` keyword wearing a
disguise, and it reintroduces dynamic `this`:

```ts
// ❌ method shorthand
export const createFetchHttpAdapter = (config: HttpClientConfigModel): HttpServiceModel => ({
  get(path) { return getJson(path) },
})

// ✅
export const createFetchHttpAdapter = (config: HttpClientConfigModel): HttpServiceModel => ({
  get: <TResponse,>(path: string): Promise<TResponse> =>
    getJson<TResponse>(toRequestUrl(config.baseUrl, path), config.timeoutMs),
})
```

A default export is named first, then exported — `export default (props) => …`
is anonymous, which is what React DevTools and stack traces end up showing:

```tsx
const DocumentListScreen = () => (
  <ThemedView>…</ThemedView>
)

export default DocumentListScreen
```

## Writing the body

Prefer a concise body (no braces, no `return`) when the function is a single
expression — that is most mappers and predicates. Wrap an object literal in
parentheses so it is not parsed as a block. Use a block body the moment you need
a statement: a `try`/`catch`, an early-return guard clause (see the
flat-conditionals policy), or a local `const` that names an intermediate value.

```ts
// single expression → concise body
export const documentListPayloadToModel = (payload: DocumentListPayloadType): DocumentListType =>
  payload.map(documentPayloadToModel)

// needs statements → block body
export const parseJsonResponse = async <TResponse,>(response: Response): Promise<TResponse> => {
  try {
    return (await response.json()) as TResponse
  } catch {
    throw new HttpError('Invalid JSON.', { type: HttpErrorTypes.Parse, status: response.status })
  }
}
```

Neither form changes what the function does, so pick the one that reads better
and do not add braces just to look uniform.

## Two mechanical details that bite

**Generics in `.tsx` need a trailing comma.** `<TResponse>` at the start of an
arrow function is parsed as a JSX tag in a `.tsx` file. Write `<TResponse,>`.
In a plain `.ts` file either form works; using the comma everywhere means moving
code between files never breaks.

**Type predicates still work.** `value is AppEnv` annotates the return type of an
arrow the same way it does a declaration:

```ts
export const isAppEnv = (value: unknown): value is AppEnv =>
  typeof value === 'string' && (APP_ENVS as readonly string[]).includes(value)
```

## The one exception

Generated files and third-party code inside `node_modules` are not ours to
restyle. Everything under `src/` is.

## Enforcing it

ESLint holds this line so it does not depend on anyone remembering:

```js
// eslint.config.js
'func-style': ['error', 'expression', { allowArrowFunctions: true }],
'prefer-arrow-callback': 'error',
```

`func-style: expression` rejects `function` declarations; `prefer-arrow-callback`
catches `function` expressions passed as callbacks. If a rule fires on code you
believe is a genuine exception, fix the code — the exceptions above are the whole
list.

## Style (match the project)

No semicolons, 2-space indent, single quotes, sorted imports, max 2 params.
Module-level fixed constants are UPPER_CASE, components and types are
PascalCase, everything else camelCase (see the naming-conventions policy).
