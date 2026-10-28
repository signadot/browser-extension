# Changelog

All notable changes to the Signadot browser extension. Versions match the `version` in `public/manifest.json` and the Chrome Web Store listing.

## Unreleased

- Applies routing header changes one at a time in the background worker, so a burst of changes while the popup loads no longer logs "Rule with id 1 does not have a unique ID".

## 2.2.0 - 2026-10-26

- Loads every sandbox through the paginated sandboxes API, and keeps long lists responsive with a sliding window (#84, #91).
- Shows a loading state while sandboxes and route groups load, instead of "No Sandbox or RouteGroup selected", and a message if loading fails (#115).
- No longer injects a content script into every page, and drops the unused `declarativeNetRequestFeedback` permission (#95).
- Log out is now a real button (#94).
- Dependency upgrades: React 19, Blueprint 6, TanStack Query 5 (replacing react-query 3), TypeScript 6, Jest 30, Biome 2, webpack-cli 7, css-loader 7, style-loader 4, ts-loader 9, react-icons 5, react-hotkeys-hook 5, and others (#96 to #114).
- CI runs lint, typecheck, tests and a build on every PR; releases are built and attached by a tag-driven workflow; GitHub Actions are pinned to commit SHAs and kept current by Dependabot (#85, #94).

## 2.1.0 - 2025-11-11

- Route groups that span multiple clusters get the right routing headers (#81).

## 2.0.0 - 2025-05-02

- Uses the v2 org API (#76).
- Optional `traceparent` header injection (#41).
- Log out from the extension (#59).
- Enable/disable toggle moved into the routing entity card (#71).
- Reworked top bar, panels and loading states to match the dashboard (#57, #61, #63, #68).
- Fixes for state handling, empty result lists, icon state, and API URL changes (#50, #58, #64, #65, #70).

## 1.2.0 - 2024-12-18

- Custom routing headers from cluster configuration (#33, #37).
- Badge shows whether routing is active (#31).
- New icon (#34).
- Better handling of expired sessions (#32).

## 1.1.0 - 2024-02-29

- Fix empty routing key in injected headers (#27).
- Logo shows on Chrome's extensions page (#26).
- Updated header injection exclusions (#20).

## 1.0 - 2023-11-22

- First release.
