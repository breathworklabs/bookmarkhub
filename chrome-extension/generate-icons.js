#!/usr/bin/env node

/**
 * Simple icon generator for Chrome extension
 * Creates basic PNG icons using canvas
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple function to create a basic icon as a data URL
function createIconDataURL(size) {
  // Create a simple SVG icon
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${size/8}" fill="#1da1f2"/>
      <rect x="${size*0.2}" y="${size*0.2}" width="${size*0.6}" height="${size*0.6}" rx="${size*0.1}" fill="white"/>
      <rect x="${size*0.3}" y="${size*0.3}" width="${size*0.4}" height="${size*0.4}" fill="#1da1f2"/>
      <text x="${size/2}" y="${size/2 + size*0.1}" text-anchor="middle" fill="white" font-family="Arial" font-size="${size*0.3}" font-weight="bold">📚</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Create simple placeholder PNG files
function createPlaceholderIcon(size, filename) {
  // For now, create a simple text file that can be converted to PNG
  const content = `# Placeholder icon for ${filename}
# Size: ${size}x${size}
# This is a placeholder file. In production, replace with actual PNG icon.
# You can use the generate-icons.html file to create proper icons.
`;
  
  fs.writeFileSync(path.join(__dirname, 'assets', 'icons', filename.replace('.png', '.txt')), content);
  console.log(`Created placeholder for ${filename}`);
}

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'assets', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate placeholder files for all required icon sizes
const iconSizes = [16, 32, 48, 128];

iconSizes.forEach(size => {
  createPlaceholderIcon(size, `icon${size}.png`);
});

console.log('\n✅ Icon placeholders created!');
console.log('\n📝 Next steps:');
console.log('1. Open generate-icons.html in your browser');
console.log('2. Right-click on each canvas and "Save image as"');
console.log('3. Save as icon16.png, icon32.png, icon48.png, icon128.png');
console.log('4. Place the PNG files in assets/icons/ directory');
console.log('5. Update manifest.json to include the icon references');

// Create a simple HTML file to generate icons
const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Icon Generator</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        canvas { border: 1px solid #ccc; margin: 10px; }
        .icon-group { display: inline-block; text-align: center; margin: 20px; }
    </style>
</head>
<body>
    <h1>BookmarkX Extension Icons</h1>
    <p>Right-click on each icon and "Save image as" to create the PNG files:</p>
    
    <div class="icon-group">
        <canvas id="icon16" width="16" height="16"></canvas>
        <div>icon16.png</div>
    </div>
    
    <div class="icon-group">
        <canvas id="icon32" width="32" height="32"></canvas>
        <div>icon32.png</div>
    </div>
    
    <div class="icon-group">
        <canvas id="icon48" width="48" height="48"></canvas>
        <div>icon48.png</div>
    </div>
    
    <div class="icon-group">
        <canvas id="icon128" width="128" height="128"></canvas>
        <div>icon128.png</div>
    </div>

    <script>
        function drawIcon(canvas, size) {
            const ctx = canvas.getContext('2d');
            
            // Clear canvas
            ctx.clearRect(0, 0, size, size);
            
            // Background circle
            ctx.fillStyle = '#1da1f2';
            ctx.beginPath();
            ctx.arc(size/2, size/2, size/2 - 1, 0, 2 * Math.PI);
            ctx.fill();
            
            // Bookmark icon
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(size * 0.3, size * 0.25);
            ctx.lineTo(size * 0.7, size * 0.25);
            ctx.lineTo(size * 0.7, size * 0.75);
            ctx.lineTo(size * 0.5, size * 0.65);
            ctx.lineTo(size * 0.3, size * 0.75);
            ctx.closePath();
            ctx.fill();
        }
        
        // Draw all icons
        drawIcon(document.getElementById('icon16'), 16);
        drawIcon(document.getElementById('icon32'), 32);
        drawIcon(document.getElementById('icon48'), 48);
        drawIcon(document.getElementById('icon128'), 128);
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'assets', 'icons', 'generate-icons.html'), htmlContent);
console.log('\n🎨 Icon generator HTML created at assets/icons/generate-icons.html');
