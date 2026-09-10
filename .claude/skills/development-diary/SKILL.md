---
name: development-diary
description: >-
  Project documentation policy: every technical decision is recorded, justified,
  in `DEVELOPMENT_DIARY_EN.md` (source of truth) and its mirror
  `DEVELOPMENT_DIARY_ES.md`. The diary is not a changelog — git already lists
  what changed. It records *why* a decision was taken, which alternative was
  rejected and what it cost, as a one-line hook plus a short bullet list an
  evaluator can grasp without reading prose. Use this skill whenever a choice is
  made between alternatives (architecture, library, pattern, folder structure,
  data shape), whenever you finish a PBI or a branch, whenever a previous
  decision is reversed or corrected, whenever you notice the user has applied a
  technical criterion while building a feature — even one they stated in passing
  and did not ask you to record — and whenever the user says "document this",
  "add this to the diary" or "explain why we did this". Also use it before
  editing either diary file by hand, so both languages stay in sync.
---

# Development diary

A repo shows *what* was built. It never shows what was almost built instead, or
why that other path was abandoned. That reasoning is the only part of the work
that cannot be reconstructed by reading the code — and it is exactly what a
reviewer is looking for when they ask "would this person make good calls on my
codebase?".

The diary captures it. Two files, at the repo root:

| File | Role |
|---|---|
| `DEVELOPMENT_DIARY_EN.md` | Source of truth. Write here first. |
| `DEVELOPMENT_DIARY_ES.md` | Faithful translation. Same entries, same order. |

Both files change in the same edit, always. A diary where the Spanish copy is
three entries behind is worse than no Spanish copy at all, because the reader
cannot tell which one is current.

## Who is reading

A technical evaluator who has not seen this codebase before, skimming. Assume
they can read TypeScript but know nothing about this project's history, its
constraints or its conversations. So: name the problem before naming the
solution, expand project-specific terms the first time, and never write "as
discussed" — they were not there.

Skimming is the operative word. An entry is a success if someone who reads only
the heading and the hook line comes away with the decision, and someone who
reads the bullets comes away with the reasoning. Nobody should have to parse a
paragraph to find out what was rejected.

## Entry format

Entries are appended **at the end** of the file, oldest first. The diary is a
record of evolution, so it should read forward like one, and appending keeps
every diff purely additive — nothing already written gets rewritten later.

```markdown
## <Decision phrased as an action>
`YYYY-MM-DD` · `path/or/scope`

> <One line holding the whole idea, graspable without reading on.>

- <The problem that forced a choice.>
- <The decision, and how it actually works.>
- **Rejected** — <the alternative, and why it lost.>
- **Cost** — <what was given up to get this.>

---
```

**The title** is the decision itself, in the imperative — "Wrap the HTTP client
behind a port", not "HTTP client" and not "Refactor". A reader scanning only the
headings should come away with the list of calls that were made.

**The hook line** is the entry compressed to one sentence. If it cannot be
written, the decision is not yet clear enough to record — that is the signal to
think rather than to write more bullets.

**The bullets** are 3 to 6, one idea each, at most two lines. Only the last two
carry labels, because `Rejected` and `Cost` are the ones a writer in a hurry
drops, and an entry without them is not a justification. The earlier bullets are
deliberately unlabelled so the entry stays a piece of thinking rather than a
form to fill in.

Six bullets is a ceiling worth respecting: a decision that needs more is usually
two decisions, so split it into two entries.

### Worked example

```markdown
## Wrap expo-notifications behind a project-owned port
`2026-09-10` · `src/services/notifications/`

> A library called straight from a screen makes that screen untestable and the
> library unswappable.

- Push notifications were being called from three screens, so none of them
  could be tested without the native module.
- A single adapter under `src/services/notifications/` now owns the import and
  exposes our own types; consumers depend on the port.
- **Rejected** — passing the client in as a parameter: parameters are reserved
  for dynamic input, and threading a fixed dependency everywhere moves the
  coupling up a level instead of removing it.
- **Cost** — one indirection per call, and a port to grow as the SDK does.

---
```

## The justification test

Before saving an entry, read it back and ask: **could a reader disagree with
it?** A decision that nobody could argue against is not a decision, it is a
description — and descriptions belong in the code, not here.

| Signal | Meaning |
|---|---|
| The entry names an alternative that was rejected | Worth writing |
| The entry admits a cost, a limit or a trade-off | Worth writing |
| The entry only says what was added or created | Not a diary entry — it is a changelog line, drop it |
| The reason is "best practice" or "cleaner" | Not yet a reason. Say *what* it made possible or prevented |

Vague virtue words — clean, robust, scalable, maintainable — are placeholders
for a reason nobody bothered to find. Replace them with the concrete thing that
got better: what became testable, what stopped breaking, what got cheaper to
change.

```markdown
❌ ## Added the documents domain
   `2026-09-08` · `src/core/domains/document/`

   > Created following clean architecture principles.

   - Added repositories, models and mappers for the document entity.
   - Improves maintainability and separation of concerns.
```

Nothing here is arguable, nothing was rejected, nothing cost anything. It tells
the reader what `ls` would have told them.

```markdown
✅ ## Keep API payload shapes out of the app behind mappers
   `2026-09-08` · `src/core/domains/document/`

   > The backend's field naming should stop at the domain edge, not reach the UI.

   - The documents API returns snake_case fields and nullable date strings.
   - A `<entity>PayloadToModel` mapper is the only place the payload is
     understood, so a backend rename is a one-file change.
   - **Rejected** — mapping lazily inside components: the same translation gets
     rewritten at every call site, each free to disagree with the others.
   - **Cost** — a payload model, a domain model and a mapper per endpoint.
```

## Never invent the reason

The reason recorded must be the reason that actually applied. A plausible
rationale reconstructed after the fact is the most damaging thing this file can
contain: it reads as considered judgement while being fiction, and the reviewer
has no way to tell.

So when the motive is not known — the user chose something without saying why,
or the constraint came from outside the conversation:

- **Ask.** One question is cheaper than a wrong entry. "You went with X over Y
  here — was that about the testing, or something else?"
- If asking is not possible right now, write what is actually known and add a
  final bullet marking the gap: `- **Open** — the trade-off against Y was never
  weighed.`

An entry that admits a gap still tells the truth. An invented one does not.

## When to write

- **A choice between alternatives was made** — architecture, library, pattern,
  folder structure, data shape, naming rule. The core case.
- **A PBI or branch closes** — one entry that pulls together how the piece
  evolved and which calls shaped it, rather than one entry per commit.
- **A decision is reversed** — see below. These are the most valuable entries in
  the file, because they show the criterion being applied to its own past output.
- **The user applies a technical criterion in passing** — they say "no, wrap it
  first" or "that goes in the view, not the screen" while building. That is a
  decision with a reason behind it even though nobody called it one. Capture it,
  asking for the motive if it was not stated.
- **The user asks for it** explicitly.

Not every commit earns an entry. Renames, formatting, dependency bumps and
straightforward implementations of an already-recorded decision do not — they
are the *consequence* of a decision that is already in the file.

## Reversing a decision

Never edit or delete the original entry. The point of a diary is that it shows
thinking changing over time, and a rewritten past hides exactly that.

Append a line under the superseded entry:

```markdown
> **Superseded** on `2026-09-12` by [Move document state into the view layer](#move-document-state-into-the-view-layer) — the screen-level cache could not survive a tab change.
```

Then write the new entry normally, with a bullet for what the earlier attempt
got wrong. What invalidated the old call is the interesting part.

## Keeping both files in sync

Write the English entry first, then translate it into
`DEVELOPMENT_DIARY_ES.md` in the same edit. Translate the reasoning, not the
words: Spanish that reads as Spanish, with the same entry order, the same dates,
the same headings and the same number of bullets, so the two files can be
diffed line for line.

Technical terms stay in English — `mapper`, `port`, `payload`, `view model`,
file paths and identifiers — because they are the names used in the code and
translating them would break the link between the diary and the repo. The two
bullet labels are translated: `Rejected` → `Descartado`, `Cost` → `Coste`,
`Open` → `Abierto`.

## File skeleton

A new diary opens with a short header so the reader knows what they are holding
before the first entry:

```markdown
# Development diary

Why this project is built the way it is. Each entry records a decision, the
alternative it beat and what it cost. Ordered oldest first.

> Spanish version: [DEVELOPMENT_DIARY_ES.md](./DEVELOPMENT_DIARY_ES.md)

---

## <first entry>
```
