// Generates a keypair that pins the Chrome extension ID, so every user who installs
// the build gets the same ID and one TEST_EXTENSION_ID on the server works for all of
// them.
//
//   node scripts/generate-extension-key.js path/to/manifest.json
//
// It writes the public key into the manifest and prints the extension ID to put in
// the server's TEST_EXTENSION_ID. The private key is what signs a packaged build, so
// keep the file it names.
const fs = require('fs');
const crypto = require('crypto');

const manifestPath = process.argv[2];
if (!manifestPath) {
    console.error('usage: node scripts/generate-extension-key.js <manifest.json>');
    process.exit(2);
}

const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {type: 'spki', format: 'der'},
    privateKeyEncoding: {type: 'pkcs8', format: 'pem'},
});

// Chrome derives the extension ID from the first 128 bits of the SHA-256 of the DER
// public key, mapping each hex digit onto a to p.
const digest = crypto.createHash('sha256').update(publicKey).digest('hex').slice(0, 32);
const extensionId = [...digest].map(c => String.fromCharCode('a'.charCodeAt(0) + parseInt(c, 16))).join('');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.key = publicKey.toString('base64');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

const privateKeyPath = manifestPath.replace(/\.json$/, '') + '.key.pem';
fs.writeFileSync(privateKeyPath, privateKey);
console.log('extension id: ' + extensionId);
console.log('private key:  ' + privateKeyPath + ' (keep this, it is what signs a packaged build)');
