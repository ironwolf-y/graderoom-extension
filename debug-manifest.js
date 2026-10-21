// Rewrites the manifest for an instance that is not graderoom.me.
//
//   GRADEROOM_ORIGIN=https://my.instance.example node debug-manifest.js path/to/manifest.json
//
// GRADEROOM_ORIGIN replaces https://*.graderoom.me/* everywhere it appears, which
// covers Chrome's externally_connectable and Firefox's content scripts. Leaving it
// unset keeps the original pattern and adds localhost, for local development.
//
// GRADEROOM_EXTENSION_KEY pins the Chrome extension ID, so the ID is the same on
// every machine instead of being a hash of the install path.
//
// GRADEROOM_EXTENSION_NAME renames the build, so a personal one is not confused with
// the published one.
const fs = require('fs');

const original = 'https://*.graderoom.me/*';
const site = process.env.GRADEROOM_ORIGIN || original;
const local = ['http://localhost/*', 'http://127.0.0.1/*'];
const key = process.env.GRADEROOM_EXTENSION_KEY;

function addLocalhost(node) {
    if (Array.isArray(node)) {
        if (node.includes(original)) {
            node.push(...local.filter(pattern => !node.includes(pattern)));
            return;
        }
        node.forEach(addLocalhost);
    } else if (node && typeof node === 'object') {
        Object.values(node).forEach(addLocalhost);
    }
}

function replaceSite(node) {
    if (Array.isArray(node)) {
        for (let i = 0; i < node.length; i++) {
            if (node[i] === original) {
                node[i] = site;
            } else if (node[i] && typeof node[i] === 'object') {
                // A content script is an object inside the matches list's parent array
                replaceSite(node[i]);
            }
        }
    } else if (node && typeof node === 'object') {
        Object.values(node).forEach(replaceSite);
    }
}

const manifestPath = process.argv[2];
if (!manifestPath) {
    console.error('usage: node debug-manifest.js <manifest.json>');
    process.exit(2);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
addLocalhost(manifest);
replaceSite(manifest);
if (key) {
    manifest.key = key;
}
if (process.env.GRADEROOM_EXTENSION_NAME) {
    manifest.name = process.env.GRADEROOM_EXTENSION_NAME;
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Patched ${manifestPath} for ${site}`);
