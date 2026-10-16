# Changelog

All notable changes to the Signadot browser extension. Versions match the `version` in `public/manifest.json` and the Chrome Web Store listing.

## Unreleased

- Routing entity list uses a sliding window so long lists stay responsive (#84).
- GitHub Actions are pinned to commit SHAs and kept current by Dependabot (#85).

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
