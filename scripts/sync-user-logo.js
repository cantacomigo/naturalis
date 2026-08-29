import path from 'path';
import sharp from 'sharp';
import fs from 'fs';

async function syncUserLogo() {
  const userUploadedLogo = path.resolve('public/images/Logo.png');
  const publicDir = path.resolve('public');
  const publicImagesDir = path.resolve('public/images');

  if (!fs.existsSync(userUploadedLogo)) {
    console.error('File not found:', userUploadedLogo);
    return;
  }

  console.log('Syncing user-uploaded logo (public/images/Logo.png) across all paths...');

  // 1. Direct copy to public/logo.png
  await fs.promises.copyFile(userUploadedLogo, path.join(publicDir, 'logo.png'));
  console.log('✓ Copied to public/logo.png');

  // 2. Direct copy to public/images/logo.png (lowercase fallback)
  await fs.promises.copyFile(userUploadedLogo, path.join(publicImagesDir, 'logo.png'));
  console.log('✓ Copied to public/images/logo.png');

  // 3. Generate logo-512.png (512x512)
  await sharp(userUploadedLogo)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'logo-512.png'));
  console.log('✓ Generated public/logo-512.png');

  // 4. Generate logo-192.png (192x192)
  await sharp(userUploadedLogo)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'logo-192.png'));
  console.log('✓ Generated public/logo-192.png');

  // 5. Generate logo-square.png & logo-square.jpg
  await sharp(userUploadedLogo)
    .resize(600, 600, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'logo-square.png'));
  console.log('✓ Generated public/logo-square.png');

  await sharp(userUploadedLogo)
    .resize(600, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .jpeg({ quality: 95, mozjpeg: true })
    .toFile(path.join(publicDir, 'logo-square.jpg'));
  console.log('✓ Generated public/logo-square.jpg');

  console.log('All paths synchronized successfully with the exact uploaded logo!');
}

syncUserLogo().catch(console.error);
