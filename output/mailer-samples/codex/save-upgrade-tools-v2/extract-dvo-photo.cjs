// Extract David Van Osdol photo (and verify QR + logo if needed) from the 6MB Designer Handoff HTML.
// We scan the raw file for <img ... alt="David Van Osdol photo" src="data:image/jpeg;base64,..."/>
// and write the decoded bytes to brand-assets/dvo-headshot.jpg.
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'save-upgrade-tools', 'SWW_YAPTOM_SaveUpgradeTools_Designer_Handoff_AllAssets.html');
const OUT = path.resolve(__dirname, 'brand-assets', 'dvo-headshot.jpg');

const html = fs.readFileSync(SRC, 'utf8');

// Find the asset card labeled "David Van Osdol photo"
const heading = 'David Van Osdol photo';
const headingIdx = html.indexOf(heading);
if (headingIdx === -1) {
  console.error('FAIL: heading not found');
  process.exit(1);
}
// From there, find the next <img ... src="data:image/jpeg;base64, ... "
const after = html.slice(headingIdx, headingIdx + 200000); // photo blob fits easily
const m = after.match(/<img\s+src="data:image\/jpeg;base64,([A-Za-z0-9+/=]+)"/);
if (!m) {
  console.error('FAIL: no data URI img found near heading');
  process.exit(1);
}
const b64 = m[1];
const buf = Buffer.from(b64, 'base64');
fs.writeFileSync(OUT, buf);
console.log('OK wrote', OUT, buf.length, 'bytes');
