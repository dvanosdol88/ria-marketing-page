const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const dir = path.join(__dirname, '..', 'public', 'images', 'portraits', 'optimized');
const FINAL = 400; // 400x400 output — 4.5x the 88px display size

async function cropPortrait(filename) {
  const filepath = path.join(dir, filename);
  const buf = await sharp(filepath)
    // Center-crop top portion: skip text in bottom ~112px
    // Horizontal center: (512-400)/2 = 56px from each side
    // Vertical: start 10px down to better center faces
    .extract({ left: 56, top: 10, width: FINAL, height: FINAL })
    .png()
    .toBuffer();

  await sharp(buf).toFile(filepath);
  const stats = fs.statSync(filepath);
  console.log(`  ${filename}: ${FINAL}x${FINAL} (${Math.round(stats.size / 1024)}KB)`);
}

async function main() {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
  console.log(`Cropping ${files.length} portraits to ${FINAL}x${FINAL} (removing name text)...\n`);
  for (const file of files) {
    await cropPortrait(file);
  }
  console.log('\nDone!');
}

main().catch(console.error);
