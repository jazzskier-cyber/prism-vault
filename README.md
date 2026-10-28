# 棱光秘藏 · Prism Vault

A three-chapter falling-gem adventure with color explosions, gravity cascades, and two alternating hidden-object interludes. The original project folder remains `neon-stack` so existing local references stay valid.

## Play locally

`npm start` (`tools/serve.mjs`) serves http://127.0.0.1:5175. Set `PORT=5177 npm start` for a second preview. `npm run build` produces a static `dist/` with no backend or dependencies. `npm test` runs engine, cascade, treasure-layout, i18n and leaderboard tests.

## Adventure

- Default mode: 秘藏探险. Six orthogonally connected gems of one color explode. A single four-cell piece cannot self-clear. Full rows still clear.
- Gems above explosions fall independently. New groups explode in animated waves, with 25 points per gem multiplied by the chain number and 100 per full row multiplied by the chain number.
- Each chapter starts with a small three-color foundation. Clear 28/36/44 gems to open its treasure room.
- Odd chapters: find the five listed relics in an illustrated alchemy workshop. Even chapters: find all seven hidden fireflies in a moonlit greenhouse. Rooms have shifted target placements across the journey.
- Each found object awards 150 points. Full collection adds 500 points and two blast charges; partial collection adds one charge. Skipping without finds adds none. Charges cap at five. There is no search timer; hints are available. The third search gives points only, then switches to an endless chase on a fresh board: score and collected relics are kept, level/lines reset, color explosions and blast charges end, and no more treasure rooms appear. The whole run, endless stage included, counts for the Adventure board.
- B / 棱光冲击: aim with the falling piece and blast a three-column shaft below its horizontal center. Costs one charge only when gems are hit and can start cascades.
- Adventure and classic best scores use separate local storage keys. Classic mode is the original block game with its own board.

Arrows move, Up/X rotates, Z rotates left, Space drops, C/Shift holds, B blasts, Escape/P pauses. Touch buttons and board swipes are supported. Switching away pauses gameplay and cascade animation. Dialogs stop background controls.

## Art

Treasure rooms are locally rendered original SVG scenes with actual clickable objects, checklists, hints and accessible target labels. Google Fonts are optional; local system fonts are fallbacks.

## Languages

Chinese (original), English, Japanese, Korean and Spanish. Text lives in `i18n/*.json`; the language comes from `?lang=`, then the browser language, then English.

## AIWANNA

Play it at https://www.aiwanna.games/games/c3dc0fddf4a7ca4a8ad99616373026e9-e32d976e

Two boards, one per mode: **秘藏探险 · Adventure** (the final score of an adventure run, endless stage included) and **经典模式 · Classic**. Every finished run submits to its mode's board. The in-game Rankings dialog has a tab for each. Board IDs are in `leaderboard-config.js`.
