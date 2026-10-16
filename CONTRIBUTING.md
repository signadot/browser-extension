# Contributing

Thanks for helping improve the Signadot browser extension. Bug reports, feature requests and pull requests are all welcome.

## Reporting a problem

Open a [GitHub issue](https://github.com/signadot/browser-extension/issues) with the extension version (visible at `chrome://extensions`), the Chrome version, and what you expected to happen. For security problems, see [SECURITY.md](SECURITY.md) instead.

## Development setup

You need Node.js 20.9 or newer and Yarn 1 (classic).

```
yarn install
yarn watch        # rebuilds dist/ on every change
```

Then open `chrome://extensions`, turn on **Developer mode**, choose **Load unpacked** and select the `dist/` directory. After each rebuild, click the reload icon on the extension card.

Other useful commands:

```
yarn lint         # Biome lint + format check
yarn format       # rewrite files with Biome
yarn typecheck    # tsc --noEmit
yarn test         # Jest
yarn build        # production build into dist/
```

## Pull requests

- Branch from `main` and open the PR against `main`. CI runs lint, typecheck, tests and a production build on every PR.
- Keep PRs focused. A PR that changes behaviour should say how it was tested in Chrome.
- Changes to `public/manifest.json` permissions need an explanation in the PR, since they affect what users are asked to grant.
- Do not bump the version in a feature PR. Versions are bumped in a dedicated release PR (see below).

## Releasing

1. Open a PR that bumps `version` in both `package.json` and `public/manifest.json` and adds a section to [CHANGELOG.md](CHANGELOG.md).
2. After it merges, tag the merge commit and push the tag:

   ```
   git tag v2.2.0
   git push origin v2.2.0
   ```

3. The `release` workflow builds the extension, checks that the tag matches the manifest version, and creates a GitHub release with `signadot-browser-extension-vX.Y.Z.zip` attached.
4. Upload that zip to the [Chrome Web Store developer dashboard](https://chrome.google.com/webstore/devconsole) and submit it for review.
