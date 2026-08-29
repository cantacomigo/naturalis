import path from 'path';
import sharp from 'sharp';
import fs from 'fs';

async function optimizeAndBundleLogo() {
  const source = path.resolve('public/images/Logo.png');
  const srcAssetsLogo = path.resolve('src/assets/images/logo.png');
  const publicDir = path.resolve('public');
  const publicImagesDir = path.resolve('public/images');

  console.log('Optimizing logo image (5.4MB -> ~200KB crisp PNG)...');

  // 1. Generate crisp, lightweight 800x800 transparent PNG for web bundle
  await sharp(source)
    .resize(800, 800, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(srcAssetsLogo);
  console.log('✓ Created src/assets/images/logo.png (Bundled asset)');

  // 2. Also replace public/logo.png
  await sharp(source)
    .resize(800, 800, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'logo.png'));
  console.log('✓ Created public/logo.png');

  // 3. Also public/images/logo.png and Logo.png
  await sharp(source)
    .resize(800, 800, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(path.join(publicImagesDir, 'logo.png'));
  console.log('✓ Created public/images/logo.png');

  // 4. Update logo-512, logo-192, logo-square
  await sharp(source)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'logo-512.png'));

  await sharp(source)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'logo-192.png'));

  await sharp(source)
    .resize(600, 600, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'logo-square.png'));

  console.log('All files optimized and generated!');
}

optimizeAndBundleLogo().catch(console.error);
