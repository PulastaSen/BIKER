import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const brainDir = 'C:\\Users\\pulas\\.gemini\\antigravity-ide\\brain\\a189b3b4-7358-4f3d-a6f9-46b87d474507';
const srcImagesDir = path.resolve(__dirname, '../src/assets/images');
const publicDir = path.resolve(__dirname, '../public');

// Create bike directories in src/assets/images/bikes
const bikesSrcDir = path.join(srcImagesDir, 'bikes');
fs.mkdirSync(path.join(bikesSrcDir, 'himalayan-450'), { recursive: true });
fs.mkdirSync(path.join(bikesSrcDir, 'transalp-750'), { recursive: true });
fs.mkdirSync(path.join(bikesSrcDir, 'tiger-900'), { recursive: true });

// Copy generated images
fs.copyFileSync(
  path.join(brainDir, 're_himalayan_450_1791403780034.jpg'),
  path.join(bikesSrcDir, 'himalayan-450', 'himalayan-450-main.jpg')
);

fs.copyFileSync(
  path.join(brainDir, 'honda_transalp_750_1791403797750.jpg'),
  path.join(bikesSrcDir, 'transalp-750', 'transalp-750-main.jpg')
);

fs.copyFileSync(
  path.join(brainDir, 'triumph_tiger_900_1791403817122.jpg'),
  path.join(bikesSrcDir, 'tiger-900', 'tiger-900-main.jpg')
);

console.log('Bike photos copied to src/assets/images/bikes');

// Recursive copy helper
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// Mirror to public destinations so that ANY path pattern resolves in production:
// 1. /images/...
copyRecursive(srcImagesDir, path.join(publicDir, 'images'));

// 2. /assets/images/...
copyRecursive(srcImagesDir, path.join(publicDir, 'assets', 'images'));

// 3. /src/assets/images/... (matching existing raw strings)
copyRecursive(srcImagesDir, path.join(publicDir, 'src', 'assets', 'images'));

console.log('All image assets successfully synchronized to public directories for Vercel production!');
