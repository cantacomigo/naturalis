import path from 'path';
import sharp from 'sharp';

async function extractTransparentLogo() {
  const logoSource = path.resolve('src/assets/images/naturalis_logo_og_1787863627463.jpg');
  const publicDir = path.resolve('public');

  const { data, info } = await sharp(logoSource)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h } = info;
  console.log(`Image dimensions: ${w}x${h}`);

  // Create RGBA output buffer
  const outData = Buffer.from(data);

  // We perform a BFS / Flood Fill from the 4 outer image borders.
  const isVisited = new Uint8Array(w * h);
  const queue = new Int32Array(w * h * 2);
  let qHead = 0;
  let qTail = 0;

  function isBackground(idx) {
    const r = data[idx * 4];
    const g = data[idx * 4 + 1];
    const b = data[idx * 4 + 2];
    
    // Check if pixel is light background
    const brightness = (r + g + b) / 3;
    const isDark = (r < 140 && g < 140 && b < 140);
    const isGreen = (g > r + 15 && g > b + 15);
    
    return brightness > 165 && !isDark && !isGreen;
  }

  // Enqueue all border pixels
  for (let x = 0; x < w; x++) {
    const topIdx = x;
    const botIdx = (h - 1) * w + x;
    if (isBackground(topIdx) && !isVisited[topIdx]) {
      isVisited[topIdx] = 1;
      queue[qTail++] = topIdx;
    }
    if (isBackground(botIdx) && !isVisited[botIdx]) {
      isVisited[botIdx] = 1;
      queue[qTail++] = botIdx;
    }
  }
  for (let y = 0; y < h; y++) {
    const leftIdx = y * w;
    const rightIdx = y * w + (w - 1);
    if (isBackground(leftIdx) && !isVisited[leftIdx]) {
      isVisited[leftIdx] = 1;
      queue[qTail++] = leftIdx;
    }
    if (isBackground(rightIdx) && !isVisited[rightIdx]) {
      isVisited[rightIdx] = 1;
      queue[qTail++] = rightIdx;
    }
  }

  // BFS flood-fill
  const dx = [1, -1, 0, 0, 1, -1, 1, -1];
  const dy = [0, 0, 1, -1, 1, 1, -1, -1];

  while (qHead < qTail) {
    const curr = queue[qHead++];
    const cx = curr % w;
    const cy = Math.floor(curr / w);

    for (let i = 0; i < 8; i++) {
      const nx = cx + dx[i];
      const ny = cy + dy[i];
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const nIdx = ny * w + nx;
        if (!isVisited[nIdx] && isBackground(nIdx)) {
          isVisited[nIdx] = 1;
          queue[qTail++] = nIdx;
        }
      }
    }
  }

  // Calculate distances to background for smooth anti-aliased edge
  const alphaMap = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    if (isVisited[i]) {
      alphaMap[i] = 0; // Completely transparent
    } else {
      alphaMap[i] = 255; // Solid badge
    }
  }

  // Smooth edge anti-aliasing
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      if (!isVisited[idx]) {
        let bgCount = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (isVisited[(y + dy) * w + (x + dx)]) bgCount++;
          }
        }
        if (bgCount > 0) {
          const r = data[idx * 4];
          const g = data[idx * 4 + 1];
          const b = data[idx * 4 + 2];
          const brightness = (r + g + b) / 3;
          const factor = Math.max(0, Math.min(1, (220 - brightness) / 70));
          alphaMap[idx] = Math.round(255 * factor);
        }
      }
    }
  }

  // Apply alpha map to output buffer
  for (let i = 0; i < w * h; i++) {
    outData[i * 4 + 3] = alphaMap[i];
  }

  // Save to public/logo.png (Transparent PNG)
  await sharp(outData, {
    raw: { width: w, height: h, channels: 4 }
  })
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'logo.png'));
  console.log('✓ Created transparent public/logo.png');

  // Also update logo-512.png and logo-192.png with transparency
  await sharp(outData, {
    raw: { width: w, height: h, channels: 4 }
  })
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'logo-512.png'));
  console.log('✓ Created transparent public/logo-512.png');

  await sharp(outData, {
    raw: { width: w, height: h, channels: 4 }
  })
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'logo-192.png'));
  console.log('✓ Created transparent public/logo-192.png');

  await sharp(outData, {
    raw: { width: w, height: h, channels: 4 }
  })
    .resize(600, 600, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'logo-square.png'));
  console.log('✓ Created transparent public/logo-square.png');

  console.log('Finished transparent logo extraction!');
}

extractTransparentLogo().catch(console.error);
