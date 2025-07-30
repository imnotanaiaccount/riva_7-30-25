// scripts/fetch-screenshot.js
// Fetches a screenshot of the homepage using thum.io and saves it to public/jackson-preview.png
const https = require('https');
const fs = require('fs');
const path = require('path');

const targetUrl = 'https://jacksoninvestmentsolutions2.netlify.app/';
const screenshotUrl = `https://image.thum.io/get/width/1200/crop/800/${encodeURIComponent(targetUrl)}`;
const outputPath = path.join(__dirname, '../public/jackson-preview.png');

console.log('Fetching screenshot from:', screenshotUrl);

https.get(screenshotUrl, (res) => {
  if (res.statusCode !== 200) {
    console.error('Failed to fetch screenshot. Status:', res.statusCode);
    res.resume();
    process.exit(1);
  }
  const fileStream = fs.createWriteStream(outputPath);
  res.pipe(fileStream);
  fileStream.on('finish', () => {
    fileStream.close();
    console.log('Screenshot saved to', outputPath);
  });
}).on('error', (err) => {
  console.error('Error fetching screenshot:', err.message);
  process.exit(1);
}); 