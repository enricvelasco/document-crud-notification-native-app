---
name: no-code-comments
description: >-
  Project code policy: do not write comments in application code. A comment is a
  second source of truth that drifts away from the code it describes, and a
  comment explaining *what* the code does is a symptom — the name, the size or
  the shape of that code is wrong. Fix it by naming things: extract a named
  predicate, split the function, introduce a named constant, or let the type say
  it. The only comments allowed in `src/` are machine directives
  (`eslint-disable-*`, `@ts-expect-error`) and JSDoc that is rendered to a human
  as product documentation (Storybook story descriptions). Use this skill
  whenever you write, refactor or review any code, whenever you catch yourself
  typing `//` or `/*`, whenever you are tempted to leave a `TODO`, a `FIXME`, a
  section banner or a block of commented-out code, and whenever you paste code in
  from a snippet, another codebase or an LLM answer — even if the user does not
  mention comments.
---

# No code comments

Code is the only artefact that runs. A comment sits next to it making a claim
nobody verifies: the code gets refactored, the comment does not, and now the
file contains a confident lie. This policy removes that failure mode entirely by
removing the comment — and, more importantly, by treating the *urge* to write
one as a design signal.

**If you need a comment to explain what code does, the code is wrong.** Not the
reader. Rename it, split it, or give it a type.

## The rule

No `//` and no `/* */` in `src/`. That includes:

- explanatory comments (`// loop over the users and pick the active ones`)
- section banners (`// --- handlers ---`)
- `TODO`, `FIXME`, `HACK`, `XXX` and dated notes
- commented-out code
- JSDoc blocks on internal functions, types and constants
- trailing clarifications (`const limit = 20 // per page`)

Commented-out code is deleted, never parked. Git remembers it; the file should
not. A `TODO` belongs in the tracker, not in a file where nobody reads it.

## What to do instead

### Name the thing

The comment you were about to write is almost always a name.

```ts
// ❌
// a document is editable when the user owns it and it is not archived
if (document.ownerId === userId && !document.archivedAt) {
  ...
}

// ✅
const isDocumentEditable = ({ document, userId }: IsDocumentEditableParams) =>
  document.ownerId === userId && !document.archivedAt

if (isDocumentEditable({ document, userId })) {
  ...
}
```

### Name the value

A bare number or string that needed explaining becomes a named constant.

```ts
// ❌
setTimeout(refresh, 300000) // refresh every 5 minutes

// ✅
const REFRESH_INTERVAL_MS = 5 * 60 * 1000

setTimeout(refresh, REFRESH_INTERVAL_MS)
```

### Split the function

A comment marking "this part does X, this part does Y" is telling you the
function does two things. That is the single-purpose-functions policy talking —
split it and let the two names carry the explanation.

```ts
// ❌
const handleSubmit = () => {
  // validate
  ...
  // send
  ...
}

// ✅
const handleSubmit = () => {
  const errors = getValidationErrors(values)
  if (errors.length) return setErrors(errors)

  return sendDocument(values)
}
```

### Let the type say it

```ts
// ❌
// status is one of 'draft', 'published' or 'archived'
status: string

// ✅
status: DocumentStatusTypes
```

## The two exceptions

### 1. Machine directives

Instructions to a tool are not prose about the code — they change what the tool
does, and the tool requires them to be written as comments.

```ts
// eslint-disable-next-line no-restricted-imports -- adapter owns this library
import { I18n } from 'i18n-js'
```

Keep them on the narrowest possible scope (`-next-line`, never a whole file) and
state the reason after `--`, because a suppression without a reason is a defect.

### 2. Documentation that is rendered to a human

JSDoc that Storybook turns into a docs page is product output, not a note in the
margin — its whole purpose is to be read outside the file, and it is visible
enough that it does not silently rot. Story descriptions and the
`parameters.docs.description.component` block of a `*.stories.tsx` stay.

```tsx
/** Muted fill, muted label, and presses are ignored. */
export const Disabled: Story = {
  args: { disabled: true },
}
```

This exception is for `*.stories.tsx` and `*.mdx` only. It is not a licence to
JSDoc the component itself.

## Where the "why" goes

Some knowledge genuinely is not expressible as a name: a workaround for a
library bug, an ordering forced by a platform quirk, a decision that looks
arbitrary until you know what was rejected.

First, try harder to encode it:

```ts
const IOS_KEYBOARD_INSET_WORKAROUND = 8
```

If it still does not fit, it is not a comment — it is a **decision**, and it
belongs where decisions are recorded and reviewed: the commit message, the PR
description, or the planning docs. Those are read when someone asks "why is this
like this"; a comment is read only by whoever already has the file open.

## Reviewing

When you touch a file that still has comments, delete the ones covering code you
are already changing and apply the fix above. Do not do a comment-stripping pass
across untouched files as a side quest — that is a separate change, and it
belongs in its own commit.
