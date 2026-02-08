import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildDir = join(__dirname, '..', 'build');

// Ensure build directory exists
mkdirSync(buildDir, { recursive: true });

// Create a 512x512 icon
const size = 512;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Background - dark theme color
ctx.fillStyle = '#1a1b26';
ctx.fillRect(0, 0, size, size);

// Draw a rounded rectangle background
const padding = 40;
const radius = 80;
ctx.fillStyle = '#0f1117';
ctx.beginPath();
ctx.roundRect(padding, padding, size - padding * 2, size - padding * 2, radius);
ctx.fill();

// Draw the "T" for Tusk in accent color
ctx.fillStyle = '#7aa2f7';
ctx.font = 'bold 280px -apple-system, BlinkMacSystemFont, sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('T', size / 2, size / 2 + 10);

// Add a subtle tusk curve accent
ctx.strokeStyle = '#9ece6a';
ctx.lineWidth = 12;
ctx.lineCap = 'round';
ctx.beginPath();
ctx.moveTo(320, 340);
ctx.quadraticCurveTo(380, 400, 360, 450);
ctx.stroke();

// Save as PNG
const buffer = canvas.toBuffer('image/png');
writeFileSync(join(buildDir, 'icon.png'), buffer);

console.log('Generated build/icon.png (512x512)');
console.log('Note: electron-builder will auto-generate .icns and .ico from this PNG');
