# Security policy

## Reporting a vulnerability

Please do not open a public issue for security problems.

Report them through [GitHub private vulnerability reporting](https://github.com/signadot/browser-extension/security/advisories/new). Include the extension version, steps to reproduce, and the impact you see.

We will acknowledge the report within a few business days and keep you updated as we work on a fix.

## Supported versions

Only the latest version published on the Chrome Web Store receives fixes.

## What the extension has access to

The extension asks for broad host permissions because it must add routing headers to requests your browser makes to the applications you are testing. It reads one cookie, `signadot-auth`, from the Signadot preview domain to authenticate against the Signadot API, and it does not collect or send any other data.
