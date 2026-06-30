# Handoff — KanJutsu

_Resume point between conversations. Update this when you finish a work session._

_Last updated: 2026-06-30_

## ⚠️ Active branch: `feat/cloud-flashcards`
The cloud-persistence work is in progress on this branch and is NOT merged to
`main`. Production (`main`) is unchanged: flashcards there are still localStorage.

## Top priority next session
1. **BUG — "Create Deck" button in `CreateDeckModal` doesn't work.** Found while
   testing cloud flashcards. The button is a form submit → `onSave` →
   `createDeck` (now async/cloud). First things to check:
   - Open the browser console — is there an error when you click Create Deck?
   - Which path is broken: creating a deck from the **My Decks** tab (DeckList →
     CreateDeckModal) or from the **Add to Deck** modal (AddToDeckModal →
     CreateDeckModal → `handleCreate` which `await`s `createDeck`)?
   - Does the deck actually get created in the cloud (check the Network tab for
     the GraphQL `createDeck` mutation, or refresh) but the UI not update — or
     does `createDeck` reject (e.g., auth/validation)?
   - Relevant files: `src/components/CreateDeckModal.jsx`,
     `src/components/AddToDeckModal.jsx`, `src/components/DeckList.jsx`,
     `src/hooks/useDecks.js`.
2. **Finish testing cloud flashcards** end-to-end (see test steps below).

## Where things stand (branches not yet on `main`)
- **`feat/cloud-flashcards`** — online flashcards. Two commits:
  - Phase 1 (`amplify/data/resource.ts`): `Deck` + `Card` models, Deck→Cards
    relationship, owner auth, `userPool` mode. Deployed to a personal sandbox.
  - Phase 2 (frontend): Amplify configured in `main.jsx`; Decks tab requires
    login (dictionary stays public); `useDecks` rewritten to the cloud data
    client with `observeQuery`. Lints clean; NOT yet verified end-to-end.
- **`feat/verb-forms`** (`936f84c`) — verbs show dictionary + polite (ます) forms
  on the detail card and flashcard back. Built, spot-checked against Jisho, has
  unit tests. Just needs a PR → merge.

## Decisions locked for cloud flashcards
- Dictionary is public; the flashcard feature requires login.
- Separate `Card` model with a Deck→Cards relationship (done).
- Do NOT migrate existing localStorage decks on first login.

## How to develop the backend (AWS)
- Local AWS profile is SSO, profile name `default`, region **us-east-2**.
- Run `npx ampx sandbox` and keep it running — it deploys the backend and writes
  `amplify_outputs.json` (gitignored). Stop with Ctrl-C.
- Tear down the sandbox's cloud resources when done: `npx ampx sandbox delete`.
- **Use Node 22 LTS** (`nvm use 22`). Node 25 breaks `ampx` (a localStorage error).
- Billing: account is on the AWS paid plan now. Check the Billing console for
  remaining credits and consider setting a $1–5 budget alert. Stopping the
  sandbox avoids lingering charges.

## Test steps for cloud flashcards (with `npx ampx sandbox` running)
`npm install` (pulls `@aws-amplify/ui-react`), then `npm run dev`:
1. Dictionary works logged out.
2. "Add to Deck" while logged out → routes to the My Decks login form.
3. Sign up (email + emailed code), sign in.
4. Create a deck (← the broken button), add a kanji + a word, study, rate.
5. Reload → data persists (cloud).
6. Sign out → decks hidden, dictionary still works.

## Production cutover (do deliberately, later)
Merging `feat/cloud-flashcards` to `main` will: deploy the Deck/Card backend to
the live Amplify app, put the login gate on the live Decks tab, and switch real
users to cloud storage (their localStorage decks will NOT carry over). Only do
this after sandbox testing passes and the Create Deck bug is fixed.

## Git / deploy
- Feature branch → PR → let CI (lint/test/build) go green → merge to `main`.
  Pushing `main` auto-deploys via Amplify. Pushes must be run locally.
- After committing the vitest `package-lock.json`, the CI step can switch from
  `npm install` to `npm ci`.

## Other backlog / loose ends
- Harden owner auth: the sandbox warned the `owner` field on Deck/Card is
  reassignable. Fine for now; lock down later if desired.
- Cosmetic: ある shows its kanji form (有る) because we display Jisho's first
  headword; consider preferring kana when "usually written using kana alone".
- Richer character data toward the Pleco feel: **radicals** and **example
  sentences** (need new data sources).
- Verb forms currently cover the polite present only; past/negative/て-form could
  follow (extend `conjugate.js` + its tests).
