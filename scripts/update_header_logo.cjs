const fs = require('fs');

let headerCode = fs.readFileSync('src/components/AmarHeader.jsx', 'utf8');

// Replace the mock crown with the authentic AmarClub / RoyalClub logo
headerCode = headerCode.replace(
  `<div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
          <Crown className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-base font-black tracking-wider text-emerald-600 font-mono leading-none flex items-center">
            ROYAL<span className="text-slate-900 ml-1">CLUB</span>
          </h1>
        </div>
      </div>`,
  `<div className="flex items-center space-x-2">
        <img 
          src="/assets/amarclub/logo.png" 
          alt="Royal Club" 
          className="h-8 object-contain"
        />
      </div>`
);

fs.writeFileSync('src/components/AmarHeader.jsx', headerCode, 'utf8');
console.log('Updated AmarHeader with real logo.png!');
