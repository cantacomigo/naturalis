import path from 'path';
import sharp from 'sharp';

async function processOfficialOgImage() {
  const sourceImage = path.resolve('public/images/banner.jpg');
  const publicDir = path.resolve('public');

  console.log('Processing official Naturalis banner into OG share images...');

  // 1. OG Image 1200x630 (Standard Open Graph Landscape for WhatsApp, Facebook, Telegram, iMessage)
  await sharp(sourceImage)
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(path.join(publicDir, 'og-image.jpg'));
  console.log('✓ Created public/og-image.jpg (1200x630)');

  await sharp(sourceImage)
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .png({ compressionLevel: 8 })
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('✓ Created public/og-image.png (1200x630)');

  // 2. Square Thumbnail (600x600 centered for WhatsApp square previews)
  await sharp(sourceImage)
    .resize(600, 600, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(path.join(publicDir, 'logo-square.jpg'));
  console.log('✓ Created public/logo-square.jpg (600x600)');

  await sharp(sourceImage)
    .resize(600, 600, { fit: 'cover', position: 'center' })
    .png({ compressionLevel: 8 })
    .toFile(path.join(publicDir, 'logo-square.png'));
  console.log('✓ Created public/logo-square.png (600x600)');

  // 3. Fallback banner copy
  await sharp(sourceImage)
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(path.join(publicDir, 'share-image.jpg'));
  console.log('✓ Created public/share-image.jpg (1200x630)');

  console.log('Done processing all share images!');
}

processOfficialOgImage().catch(console.error);
