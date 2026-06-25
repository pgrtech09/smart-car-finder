#!/usr/bin/env node
// Run: node scripts/generate-icons.js
// Generates placeholder SVG icons (replace with real icons in production)

const fs = require("fs");
const path = require("path");

const iconsDir = path.join(__dirname, "../public/icons");
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create SVG icon
const createSVG = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4c6ef5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
    </linearGradient>
    <clipPath id="clip">
      <rect width="${size}" height="${size}" rx="${size * 0.22}" ry="${size * 0.22}"/>
    </clipPath>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#grad)" clip-path="url(#clip)"/>
  <!-- Car body -->
  <g transform="translate(${size * 0.12}, ${size * 0.28}) scale(${size / 100})">
    <rect x="5" y="25" width="70" height="28" rx="5" fill="white" opacity="0.95"/>
    <polygon points="15,25 22,10 58,10 65,25" fill="white" opacity="0.95"/>
    <circle cx="20" cy="55" r="8" fill="#0a0e1a" opacity="0.9"/>
    <circle cx="20" cy="55" r="4" fill="#4c6ef5"/>
    <circle cx="60" cy="55" r="8" fill="#0a0e1a" opacity="0.9"/>
    <circle cx="60" cy="55" r="4" fill="#4c6ef5"/>
    <!-- Windows -->
    <rect x="23" y="13" width="13" height="11" rx="2" fill="#0a0e1a" opacity="0.4"/>
    <rect x="39" y="13" width="13" height="11" rx="2" fill="#0a0e1a" opacity="0.4"/>
    <!-- Location pin -->
    <circle cx="72" cy="8" r="7" fill="#ef4444"/>
    <line x1="72" y1="15" x2="72" y2="20" stroke="#ef4444" stroke-width="2"/>
    <circle cx="72" cy="8" r="3" fill="white"/>
  </g>
</svg>`;

sizes.forEach((size) => {
  const svgContent = createSVG(size);
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✓ Created icon-${size}x${size}.svg`);
});

// apple touch icon
fs.writeFileSync(path.join(iconsDir, "apple-touch-icon.svg"), createSVG(180));
console.log("✓ Created apple-touch-icon.svg");
console.log("\n⚠️  SVG icons created. For production, convert to PNG using:");
console.log("   npx sharp-cli --input public/icons/*.svg --output public/icons/ --format png");
console.log("   Or use https://realfavicongenerator.net");
