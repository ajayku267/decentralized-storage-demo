const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

function createLogo(size, outputPath) {
  // Create canvas with the specified dimensions
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background - using blockchain theme colors
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#3498db');    // Blue
  gradient.addColorStop(1, '#2c3e50');    // Dark blue
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Create a simple storage icon
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  
  // Draw folder shape
  const padding = size * 0.15;
  const folderWidth = size - (padding * 2);
  const folderHeight = folderWidth * 0.8;
  
  // Folder body
  ctx.beginPath();
  ctx.roundRect(padding, padding + (size * 0.1), folderWidth, folderHeight, 10);
  ctx.fill();
  
  // Folder tab
  ctx.beginPath();
  ctx.roundRect(padding, padding, folderWidth * 0.4, size * 0.1, [5, 5, 0, 0]);
  ctx.fill();
  
  // Add a storage icon/symbol in the center
  ctx.fillStyle = '#3498db';
  const circleRadius = size * 0.15;
  ctx.beginPath();
  ctx.arc(size/2, size/2, circleRadius, 0, 2 * Math.PI);
  ctx.fill();
  
  // Add "B" for Blockchain
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.2}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('B', size/2, size/2);

  // Save to PNG
  try {
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`Created ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`Error creating ${outputPath}:`, error);
    return false;
  }
}

// Install required packages if needed
try {
  require('canvas');
} catch (error) {
  console.log('Canvas package not found. Falling back to base64 image data method.');
  
  // If canvas is not available, use a base64 encoded PNG as fallback
  // This is a simple blue square with a white center as a basic icon
  const pngData = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMy0wNC0yMFQxNjo0MDoxMCswMjowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjMtMDQtMjBUMTY6NDE6NDErMDI6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjMtMDQtMjBUMTY6NDE6NDErMDI6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MmE0YzVmODEtY2YwZS1hMDQ2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',
    'base64'
  );
  
  fs.writeFileSync(path.join(__dirname, 'public', 'logo192.png'), pngData);
  fs.writeFileSync(path.join(__dirname, 'public', 'logo512.png'), pngData);
  console.log('Created logo192.png and logo512.png using base64 fallback method');
  process.exit(0);
}

// Create logos in different sizes
const publicDir = path.join(__dirname, 'public');
createLogo(192, path.join(publicDir, 'logo192.png'));
createLogo(512, path.join(publicDir, 'logo512.png'));

console.log('Logo files created successfully!'); 