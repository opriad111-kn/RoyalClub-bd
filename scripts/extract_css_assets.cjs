const fs = require('fs');

function extractUrls(filePath) {
  const css = fs.readFileSync(filePath, 'utf8');
  const regex = /url\(([^)]+)\)/g;
  let match;
  const urls = new Set();
  while ((match = regex.exec(css)) !== null) {
    urls.add(match[1].replace(/['"]/g, ''));
  }
  return Array.from(urls);
}

console.log('URLs in public3Home:', extractUrls('extracted_amarclub/public3Home-BHUgacia.css'));
console.log('URLs in index CSS (first 30):', extractUrls('extracted_amarclub/index-D5JJ_MyT.css').slice(0, 30));
