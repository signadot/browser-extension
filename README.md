# Signadot Browser Extension

[![build](https://github.com/signadot/browser-extension/actions/workflows/build.yml/badge.svg)](https://github.com/signadot/browser-extension/actions/workflows/build.yml)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/aigejiccjejdeiikegdjlofgcjhhnkim?label=Chrome%20Web%20Store)](https://chromewebstore.google.com/detail/signadot/aigejiccjejdeiikegdjlofgcjhhnkim)

The Signadot Browser Extension lets you test web applications against [Signadot sandboxes](https://www.signadot.com/docs/overview/core-concepts/sandboxes) and route groups from your browser. Pick a sandbox or route group, turn the extension on, and it adds the routing headers to the requests your browser makes, so traffic reaches the sandboxed services without any code changes.

## Features

- **Sandbox and route group selection.** Log in with your Signadot account and search across the sandboxes and route groups in your org.
- **One-click toggle.** Enable or disable routing without changing the application you are testing.
- **Automatic header injection.** Adds `baggage` and `tracestate` with the routing key, any custom routing headers configured for the cluster, and optionally a `traceparent` header.

## Installation and usage

1. Install the extension from the [Chrome Web Store](https://chromewebstore.google.com/detail/signadot/aigejiccjejdeiikegdjlofgcjhhnkim).
2. Open the extension and log in to your Signadot account.
3. Select the sandbox or route group you want to route to.
4. Switch the toggle to **ON**. Requests from your browser now carry the routing headers until you switch it off.

See the [docs](https://www.signadot.com/docs/guides/developer-environments/access-sandboxes) for more on accessing sandboxes.

## How it works

The popup authenticates with the Signadot API using the `signadot-auth` cookie from the Signadot preview domain, lists the routing entities in your org, and computes the headers for the one you select. A background service worker turns those headers into `declarativeNetRequest` dynamic rules, which Chrome applies to outgoing requests. Nothing is injected into web pages, and the extension does not collect or send any data other than the API calls needed to list your sandboxes.

## Permissions

| Permission | Why |
| --- | --- |
| `declarativeNetRequest`, `declarativeNetRequestWithHostAccess` | Add routing headers to requests. |
| `host_permissions: <all_urls>` | Headers must be added to requests to whichever application you are testing. |
| `cookies` | Read the `signadot-auth` cookie to authenticate with the Signadot API. |
| `storage` | Remember the selected routing entity and settings. |

## Development

Requires Node.js 20.9 or newer and Yarn 1.

```
yarn install
yarn watch
```

Then load the `dist/` directory as an unpacked extension from `chrome://extensions` (enable **Developer mode**, then **Load unpacked**). Reload the extension from that page after each rebuild.

```
yarn lint        # Biome lint and format check
yarn typecheck   # tsc --noEmit
yarn test        # Jest
yarn build       # production build into dist/
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the PR and release process, [CHANGELOG.md](CHANGELOG.md) for what changed in each version, and [SECURITY.md](SECURITY.md) for how to report vulnerabilities.

## License

[Apache 2.0](LICENSE.md)
