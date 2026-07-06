/**
 * Generate PWA icons for TaskFlow.
 * Run: node scripts/generate-icons.js
 */

const sharp = require("sharp");
const path = require("path");

const outDir = path.join(__dirname, "..", "public", "icons");

function generateSVG(size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.22;
  const sw = size * 0.06;
  const cs = size * 0.22;

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#9333ea"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
  <g transform="translate(${cx}, ${cy - size * 0.04})">
    <polyline
      points="${-cs * 0.5},${cs * 0.05} ${-cs * 0.1},${cs * 0.45} ${cs * 0.55},${-cs * 0.35}"
      fill="none" stroke="white" stroke-width="${sw}"
      stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${cs * 0.45}" cy="${-cs * 0.6}" r="${size * 0.03}" fill="rgba(255,255,255,0.85)"/>
    <circle cx="${cs * 0.65}" cy="${-cs * 0.15}" r="${size * 0.02}" fill="rgba(255,255,255,0.6)"/>
    <circle cx="${-cs * 0.6}" cy="${-cs * 0.5}" r="${size * 0.025}" fill="rgba(255,255,255,0.7)"/>
  </g>
  <text x="${cx}" y="${cy + size * 0.28}" text-anchor="middle" fill="rgba(255,255,255,0.95)"
    font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="${size * 0.095}"
    letter-spacing="${size * 0.003}">TaskFlow</text>
</svg>`);
}

async function main() {
  const sizes = [192, 512];
  for (const size of sizes) {
    const svg = generateSVG(size);
    const outPath = path.join(outDir, `icon-${size}x${size}.png`);
    await sharp(svg).resize(size, size).png().toFile(outPath);
    console.log(`Created ${outPath}`);
  }

  // Apple touch icon (180x180)
  const appleSvg = generateSVG(180);
  const applePath = path.join(outDir, "apple-touch-icon.png");
  await sharp(appleSvg).resize(180, 180).png().toFile(applePath);
  console.log(`Created ${applePath}`);

  console.log("Done! PWA icons generated.");
}

main().catch(console.error);
