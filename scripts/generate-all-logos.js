import path from 'path';
import sharp from 'sharp';

async function generateAllLogoAssets() {
  const logoSource = path.resolve('src/assets/images/naturalis_logo_og_1787863627463.jpg');
  const bannerSource = path.resolve('public/images/banner.jpg');
  const publicDir = path.resolve('public');

  console.log('Generating high-definition logo assets from official emblem...');

  // 1. logo.png (1024x1024)
  await sharp(logoSource)
    .resize(1024, 1024, { fit: 'contain' })
    .png({ compressionLevel: 8 })
    .toFile(path.join(publicDir, 'logo.png'));
  console.log('✓ Created public/logo.png (1024x1024)');

  // 2. logo.jpg (1024x1024)
  await sharp(logoSource)
    .resize(1024, 1024, { fit: 'contain' })
    .jpeg({ quality: 95, mozjpeg: true })
    .toFile(path.join(publicDir, 'logo.jpg'));
  console.log('✓ Created public/logo.jpg (1024x1024)');

  // 3. logo-512.png & logo-192.png for PWA / Mobile
  await sharp(logoSource)
    .resize(512, 512, { fit: 'contain' })
    .png({ compressionLevel: 8 })
    .toFile(path.join(publicDir, 'logo-512.png'));
  console.log('✓ Created public/logo-512.png (512x512)');

  await sharp(logoSource)
    .resize(192, 192, { fit: 'contain' })
    .png({ compressionLevel: 8 })
    .toFile(path.join(publicDir, 'logo-192.png'));
  console.log('✓ Created public/logo-192.png (192x192)');

  // 4. logo-square.jpg & logo-square.png (600x600) for WhatsApp square thumb
  await sharp(logoSource)
    .resize(600, 600, { fit: 'contain' })
    .jpeg({ quality: 95, mozjpeg: true })
    .toFile(path.join(publicDir, 'logo-square.jpg'));
  console.log('✓ Created public/logo-square.jpg (600x600)');

  await sharp(logoSource)
    .resize(600, 600, { fit: 'contain' })
    .png({ compressionLevel: 8 })
    .toFile(path.join(publicDir, 'logo-square.png'));
  console.log('✓ Created public/logo-square.png (600x600)');

  // 5. Ensure og-image.jpg also exists with landscape photo banner & square logo fallback
  await sharp(bannerSource)
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(path.join(publicDir, 'og-image.jpg'));
  console.log('✓ Verified public/og-image.jpg (1200x630)');

  console.log('All logo assets generated perfectly!');
}

generateAllLogoAssets().catch(console.error);
