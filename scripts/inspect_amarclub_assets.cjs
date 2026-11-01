const fs = require('fs');
const path = require('path');

const dir = 'extracted_amarclub';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

files.forEach(f => {
  const p = path.join(dir, f);
  const stat = fs.statSync(p);
  console.log(f, (stat.size / 1024).toFixed(1) + ' KB');
});
