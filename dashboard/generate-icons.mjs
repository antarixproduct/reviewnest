import sharp from 'sharp';

const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="112" fill="#2563eb"/>
  <polygon points="280,80 180,280 256,280 232,432 332,232 256,232 280,80" fill="white"/>
</svg>`;

const svgBuffer = Buffer.from(svgContent);

await sharp(svgBuffer).resize(192, 192).png().toFile('public/pwa-192x192.png');
console.log('✅ Generated pwa-192x192.png');

await sharp(svgBuffer).resize(512, 512).png().toFile('public/pwa-512x512.png');
console.log('✅ Generated pwa-512x512.png');

await sharp(svgBuffer).resize(180, 180).png().toFile('public/apple-touch-icon.png');
console.log('✅ Generated apple-touch-icon.png');

await sharp(svgBuffer).resize(32, 32).png().toFile('public/favicon.ico');
console.log('✅ Generated favicon.ico');

console.log('✅ All PWA icons generated');
