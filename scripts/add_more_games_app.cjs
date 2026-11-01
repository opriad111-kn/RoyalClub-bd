const fs = require('fs');

let appCode = fs.readFileSync('src/App.jsx', 'utf8');

// Add imports
appCode = appCode.replace(
  "import Crazy777Game from './components/games/Crazy777Game';",
  "import Crazy777Game from './components/games/Crazy777Game';\nimport SevenUpDownGame from './components/games/SevenUpDownGame';\nimport FortuneOxGame from './components/games/FortuneOxGame';"
);

// Add game overlays
appCode = appCode.replace(
  "{activeGame === 'crazy777' && <Crazy777Game onClose={() => setActiveGame(null)} />}",
  "{activeGame === 'crazy777' && <Crazy777Game onClose={() => setActiveGame(null)} />}\n        {activeGame === 'sevenupdown' && <SevenUpDownGame onClose={() => setActiveGame(null)} />}\n        {(activeGame === 'fortuneox' || activeGame === 'wildbounty' || activeGame === 'buffalowin') && <FortuneOxGame onClose={() => setActiveGame(null)} />}"
);

fs.writeFileSync('src/App.jsx', appCode, 'utf8');
console.log('Added SevenUpDownGame and FortuneOxGame to App.jsx!');
