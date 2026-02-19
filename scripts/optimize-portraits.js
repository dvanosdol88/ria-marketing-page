const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = 'public/images/portraits';
const OUT = 'public/images/portraits/optimized';
const SIZE = 512; // 512px covers up to 5x retina of 90px display

async function processAll() {
  const files = fs.readdirSync(SRC).filter(f => f.startsWith('WSJ-') && f.endsWith('.jpg'));
  
  for (const file of files) {
    const src = path.join(SRC, file);
    const outName = file.replace('.jpg', '.png');
    const dst = path.join(OUT, outName);
    
    try {
      await sharp(src)
        .resize(SIZE, SIZE, {
          fit: 'cover',
          position: sharp.strategy.attention  // saliency-based smart crop
        })
        .png({ quality: 90, compressionLevel: 6 })
        .toFile(dst);
      
      const srcSize = Math.round(fs.statSync(src).size / 1024);
      const dstSize = Math.round(fs.statSync(dst).size / 1024);
      console.log(`${file}: ${srcSize}KB -> ${outName}: ${dstSize}KB`);
    } catch (err) {
      console.error(`FAILED: ${file} - ${err.message}`);
    }
  }
}

processAll();
