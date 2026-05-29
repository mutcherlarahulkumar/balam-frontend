import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// SVG: two hands coming together (handshake / hands held), Nokia-inspired
// Navy circle background, gold hands silhouette
const svgSrc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Background circle -->
  <circle cx="256" cy="256" r="256" fill="#1a3c5e"/>

  <!-- Left hand (coming from bottom-left, palm up) -->
  <g fill="#d4821a">
    <!-- Left palm -->
    <ellipse cx="185" cy="310" rx="52" ry="38" transform="rotate(-30 185 310)"/>
    <!-- Left thumb -->
    <ellipse cx="148" cy="283" rx="18" ry="28" transform="rotate(-60 148 283)"/>
    <!-- Left index finger -->
    <rect x="162" y="220" width="22" height="72" rx="11" transform="rotate(-15 162 220)"/>
    <!-- Left middle finger -->
    <rect x="188" y="212" width="22" height="80" rx="11" transform="rotate(-5 188 212)"/>
    <!-- Left ring finger -->
    <rect x="214" y="218" width="22" height="74" rx="11" transform="rotate(5 214 218)"/>
    <!-- Left pinky -->
    <rect x="236" y="230" width="20" height="60" rx="10" transform="rotate(15 236 230)"/>
    <!-- Left wrist / arm -->
    <rect x="155" y="308" width="72" height="80" rx="20" transform="rotate(-30 155 308)"/>
  </g>

  <!-- Right hand (coming from bottom-right, palm up, mirrored) -->
  <g fill="#d4821a">
    <!-- Right palm -->
    <ellipse cx="327" cy="310" rx="52" ry="38" transform="rotate(30 327 310)"/>
    <!-- Right thumb -->
    <ellipse cx="364" cy="283" rx="18" ry="28" transform="rotate(60 364 283)"/>
    <!-- Right index finger -->
    <rect x="328" y="220" width="22" height="72" rx="11" transform="rotate(15 328 220)"/>
    <!-- Right middle finger -->
    <rect x="302" y="212" width="22" height="80" rx="11" transform="rotate(5 302 212)"/>
    <!-- Right ring finger -->
    <rect x="276" y="218" width="22" height="74" rx="11" transform="rotate(-5 276 218)"/>
    <!-- Right pinky -->
    <rect x="256" y="230" width="20" height="60" rx="10" transform="rotate(-15 256 230)"/>
    <!-- Right wrist / arm -->
    <rect x="285" y="308" width="72" height="80" rx="20" transform="rotate(30 285 308)"/>
  </g>

  <!-- Interlocked fingers highlight (center overlap glow) -->
  <ellipse cx="256" cy="268" rx="28" ry="22" fill="#e8a040" opacity="0.5"/>
</svg>`;

const svgBuf = Buffer.from(svgSrc);

async function generate(svgBuf, outPath, size) {
  await sharp(svgBuf)
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log(`✓ ${outPath} (${size}x${size})`);
}

// Android mipmap sizes
const androidSizes = [
  { density: 'mdpi',    size: 48,  round: false },
  { density: 'hdpi',    size: 72,  round: false },
  { density: 'xhdpi',   size: 96,  round: false },
  { density: 'xxhdpi',  size: 144, round: false },
  { density: 'xxxhdpi', size: 192, round: false },
];

for (const { density, size } of androidSizes) {
  const dir = join(root, `android/app/src/main/res/mipmap-${density}`);
  await generate(svgBuf, join(dir, 'ic_launcher.png'), size);
  await generate(svgBuf, join(dir, 'ic_launcher_round.png'), size);
  // foreground (same icon, transparent bg variant — just the hands on transparent)
  await generate(svgBuf, join(dir, 'ic_launcher_foreground.png'), size);
}

// Web favicon / public assets
await generate(svgBuf, join(root, 'public/icon-192.png'), 192);
await generate(svgBuf, join(root, 'public/icon-512.png'), 512);
await generate(svgBuf, join(root, 'public/apple-touch-icon.png'), 180);

// Write SVG source for use in React components
writeFileSync(join(root, 'src/components/common/BalamLogo.svg'), svgSrc);
console.log('✓ SVG written to src/components/common/BalamLogo.svg');

console.log('\nAll icons generated.');
