# Graderoom extension
## Overview
This extension provides client-side scraping for Graderoom.
## Installation
### Chrome, Edge, or other browsers that support extensions from the Chrome Webstore
Add the extension to your browser from [here](https://chromewebstore.google.com/detail/graderoom/dhidkhdjfikcdmfngbpnbgpnboiodnoo)
### Firefox
Add the extension to your browser from [here](https://addons.mozilla.org/addon/graderoom/)

### Manual installation *For Developers only*
To install the Graderoom extension in Developer mode, follow these steps:
1. Clone this repository
2. Run `make chrome-unpacked`, `make chrome-package`, or `make firefox-package` based on your needs (currently only works on Windows)
3. Look up how to load temporary extensions into your browser for debugging.

## Building for a self-hosted instance

The published build is pinned to `https://*.graderoom.me/*`, in Chrome's
`externally_connectable` and in Firefox's content scripts. A page served from anywhere
else cannot talk to the extension, so a private instance needs its own build.

```bash
# Generate a key so the Chrome extension ID is the same on every machine
node scripts/generate-extension-key.js chrome/manifest.json

# Point the manifest at your instance
GRADEROOM_ORIGIN=https://grades.example.com \
GRADEROOM_EXTENSION_NAME="Graderoom (Private)" \
  node debug-manifest.js chrome/manifest.json
```

`scripts/generate-extension-key.js` prints the extension ID. Put it in the server's
`TEST_EXTENSION_ID`, and have each user install the build as an unpacked extension
(Chrome: Developer mode, "Load unpacked"; Firefox: `about:debugging`, "Load Temporary
Add-on").

The `key` in the manifest pins the Chrome ID. Without it, an unpacked extension's ID is
a hash of its install path, so it differs per machine and one `TEST_EXTENSION_ID` will
only work for one user.
