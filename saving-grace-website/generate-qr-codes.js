const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const qrCodes = [
  {
    name: 'qr-home.png',
    url: 'https://saving-grace-website.vercel.app',
    label: 'Home',
  },
  {
    name: 'qr-get-support.png',
    url: 'https://saving-grace-website.vercel.app/get-support',
    label: 'Get Support',
  },
  {
    name: 'qr-app.png',
    url: 'https://saving-grace-website.vercel.app/app',
    label: 'App Info',
  },
];

async function generateQRCodes() {
  try {
    for (const qr of qrCodes) {
      const filePath = path.join(publicDir, qr.name);
      await QRCode.toFile(filePath, qr.url, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 2,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      console.log(`✓ Generated ${qr.name} → ${qr.url}`);
    }
    console.log('\n✅ All QR codes generated successfully!');
    console.log('\nDownload from:');
    qrCodes.forEach(qr => {
      console.log(`  https://saving-grace-website.vercel.app/${qr.name}`);
    });
  } catch (err) {
    console.error('Error generating QR codes:', err);
    process.exit(1);
  }
}

generateQRCodes();
