const fs = require('fs');
const path = require('path');

const src = 'extracted_amarclub';
const dest = 'public/assets/amarclub';
if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

const mapping = {
  'h5setting_20250609143900go1p.png': 'logo.png',
  'Banner_202512312013586s5u.png': 'banner1.png',
  'Banner_202512312014103p57.png': 'banner2.png',
  'icon_sevice-l6ugmMY7.png': 'service.png',
  'gamecategory_202506031704314fni.png': 'cat_slots.png',
  'gamecategory_20250603170547x7o4.png': 'cat_lottery.png',
  'gamecategory_20250603170603hccp.png': 'cat_original.png',
  'gamecategory_20250609093655mi8d.png': 'cat_casino.png',
  'gamecategory_20250609093705qe8v.png': 'cat_fishing.png',
  '51.png': 'game_aviator.png',
  '223.png': 'game_moneycoming.png',
  '804.png': 'game_fortunegems.png',
  'lotterycategory_2025060317031148t4.png': 'game_wingo.png'
};

for (const [orig, target] of Object.entries(mapping)) {
  const sPath = path.join(src, orig);
  if (fs.existsSync(sPath)) {
    fs.copyFileSync(sPath, path.join(dest, target));
    console.log(`Copied ${orig} -> ${target}`);
  } else {
    console.log(`Missing ${orig}`);
  }
}
