import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate sunburst rays
let rayElements = '';
const numRays = 32;
const rayAngle = 360 / numRays;
for (let i = 0; i < numRays; i += 2) {
  const a1 = (i * rayAngle * Math.PI) / 180;
  const a2 = ((i + 1) * rayAngle * Math.PI) / 180;
  const r = 180;
  const x1 = (250 + r * Math.sin(a1)).toFixed(1);
  const y1 = (250 - r * Math.cos(a1)).toFixed(1);
  const x2 = (250 + r * Math.sin(a2)).toFixed(1);
  const y2 = (250 - r * Math.cos(a2)).toFixed(1);
  rayElements += `<polygon points="250,250 ${x1},${y1} ${x2},${y2}" fill="#facc15" />\n`;
}

const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <clipPath id="inner-sunburst-clip">
      <circle cx="250" cy="250" r="162" />
    </clipPath>
    <path id="upper-arc-path" d="M 68,250 A 182,182 0 1,1 432,250" fill="none" />
    <path id="lower-arc-path" d="M 95,280 A 182,182 0 0,0 405,280" fill="none" />
  </defs>

  <!-- Outer Ring -->
  <circle cx="250" cy="250" r="248" fill="#1e3a8a" />
  <circle cx="250" cy="250" r="244" fill="#ffffff" />
  <circle cx="250" cy="250" r="240" fill="#b91c1c" stroke="#991b1b" stroke-width="2" />
  <circle cx="250" cy="250" r="166" fill="#1e3a8a" />
  <circle cx="250" cy="250" r="164" fill="#ffffff" />

  <!-- Sunburst -->
  <g clip-path="url(#inner-sunburst-clip)">
    <circle cx="250" cy="250" r="162" fill="#ffffff" />
    ${rayElements}
  </g>
  <circle cx="250" cy="250" r="162" fill="none" stroke="#1e3a8a" stroke-width="4" />

  <!-- Upper Arc Text -->
  <text fill="#ffffff" font-family="Arial, sans-serif" font-size="24" font-weight="900" letter-spacing="2.2" text-anchor="middle">
    <textPath href="#upper-arc-path" startOffset="50%" text-anchor="middle">
      SAMBALPUR TRUCK OWNER'S ASSOCIATION
    </textPath>
  </text>

  <!-- Lower Arc Text -->
  <text fill="#ffffff" font-family="Arial, sans-serif" font-size="28" font-weight="900" letter-spacing="4.5" text-anchor="middle">
    <textPath href="#lower-arc-path" startOffset="50%" text-anchor="middle">
      • SAMBALPUR •
    </textPath>
  </text>

  <!-- Truck Center Illustration -->
  <g transform="translate(250, 255) scale(0.95) translate(-250, -250)">
    <ellipse cx="252" cy="336" rx="146" ry="14" fill="#0f172a" opacity="0.45" />
    <!-- Cargo Body -->
    <path d="M 112,185 C 112,168 128,154 150,152 C 172,150 200,147 240,146 C 285,145 320,148 348,154 C 368,158 376,170 376,186 L 372,210 L 115,208 Z" fill="#5a6048" stroke="#3f4433" stroke-width="3" />
    <rect x="110" y="206" width="268" height="52" rx="4" fill="#b45309" stroke="#78350f" stroke-width="3" />
    <!-- Yellow side slats -->
    <line x1="112" y1="222" x2="376" y2="222" stroke="#facc15" stroke-width="3" />
    <line x1="112" y1="238" x2="376" y2="238" stroke="#facc15" stroke-width="3" />
    <!-- Truck Cabin -->
    <path d="M 320,188 L 362,188 L 388,230 L 388,290 L 318,290 Z" fill="#dc2626" stroke="#991b1b" stroke-width="3" />
    <rect x="345" y="196" width="36" height="30" rx="3" fill="#38bdf8" stroke="#0284c7" stroke-width="2" />
    <!-- Wheels -->
    <circle cx="150" cy="285" r="22" fill="#1e293b" stroke="#0f172a" stroke-width="4" />
    <circle cx="150" cy="285" r="9" fill="#94a3b8" />
    <circle cx="210" cy="285" r="22" fill="#1e293b" stroke="#0f172a" stroke-width="4" />
    <circle cx="210" cy="285" r="9" fill="#94a3b8" />
    <circle cx="355" cy="285" r="22" fill="#1e293b" stroke="#0f172a" stroke-width="4" />
    <circle cx="355" cy="285" r="9" fill="#94a3b8" />
  </g>
</svg>`;

// Write icon.svg
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);
console.log('Created public/icon.svg');

// Generate 192x192 PNG
await sharp(Buffer.from(svgContent))
  .resize(192, 192)
  .png()
  .toFile(path.join(publicDir, 'pwa-192x192.png'));
console.log('Created pwa-192x192.png');

// Generate 512x512 PNG
await sharp(Buffer.from(svgContent))
  .resize(512, 512)
  .png()
  .toFile(path.join(publicDir, 'pwa-512x512.png'));
console.log('Created pwa-512x512.png');

// Generate apple-touch-icon 180x180 PNG
await sharp(Buffer.from(svgContent))
  .resize(180, 180)
  .png()
  .toFile(path.join(publicDir, 'apple-touch-icon.png'));
console.log('Created apple-touch-icon.png');

// Generate maskable 512x512 with safe-zone margin (15% padding around center emblem)
const innerEmblemBuffer = await sharp(Buffer.from(svgContent))
  .resize(410, 410)
  .toBuffer();

await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: { r: 11, g: 31, b: 58, alpha: 1 } // #0B1F3A
  }
})
  .composite([
    {
      input: innerEmblemBuffer,
      top: 51,
      left: 51,
    }
  ])
  .png()
  .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
console.log('Created pwa-maskable-512x512.png');

// Favicon 64x64 PNG copied to favicon.ico
await sharp(Buffer.from(svgContent))
  .resize(64, 64)
  .png()
  .toFile(path.join(publicDir, 'favicon.ico'));
console.log('Created favicon.ico');

console.log('All PWA icons generated successfully!');
