const fs = require('fs');

// 1. 7UP 7DOWN SVG (Matching Image 1)
const sevenUpSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320">
  <defs>
    <radialGradient id="bowlBg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="60%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>
    <radialGradient id="glassSphere" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8" />
      <stop offset="30%" stop-color="#38bdf8" stop-opacity="0.3" />
      <stop offset="70%" stop-color="#0284c7" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.8" />
    </radialGradient>
    <filter id="diceGlow">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#38bdf8" flood-opacity="0.8" />
    </filter>
  </defs>

  <rect width="400" height="320" rx="24" fill="url(#bowlBg)" />

  <!-- JILI Badge -->
  <rect x="320" y="14" width="64" height="26" rx="8" fill="#e11d48" />
  <text x="352" y="32" fill="#ffffff" font-family="'Arial Black', sans-serif" font-weight="900" font-size="13" text-anchor="middle">JILI</text>

  <!-- Big Glass Bowl Cloche -->
  <circle cx="200" cy="125" r="95" fill="url(#glassSphere)" stroke="#7dd3fc" stroke-width="2.5" opacity="0.9" />
  <ellipse cx="200" cy="195" rx="85" ry="25" fill="#0369a1" opacity="0.4" />

  <!-- Two 3D White Rolling Casino Dice (Matching Image 1) -->
  <!-- Left Die -->
  <g transform="translate(160, 115) rotate(-18)" filter="url(#diceGlow)">
    <rect x="-28" y="-28" width="56" height="56" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" />
    <circle cx="-14" cy="-14" r="5" fill="#dc2626" />
    <circle cx="14" cy="14" r="5" fill="#dc2626" />
    <circle cx="0" cy="0" r="6" fill="#dc2626" />
  </g>

  <!-- Right Die -->
  <g transform="translate(235, 125) rotate(22)" filter="url(#diceGlow)">
    <rect x="-28" y="-28" width="56" height="56" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" />
    <circle cx="-14" cy="-14" r="5" fill="#1e293b" />
    <circle cx="14" cy="14" r="5" fill="#1e293b" />
    <circle cx="-14" cy="14" r="5" fill="#1e293b" />
    <circle cx="14" cy="-14" r="5" fill="#1e293b" />
  </g>

  <!-- 3D 7up 7down Typography -->
  <g filter="url(#diceGlow)">
    <text x="200" y="260" text-anchor="middle" font-family="'Arial Black', Impact, sans-serif" font-size="34" font-weight="900" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5">7up 7down</text>
    <rect x="140" y="275" width="120" height="24" rx="12" fill="#0284c7" />
    <text x="200" y="291" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="900" fill="#ffffff">DICE ARENA</text>
  </g>
</svg>`;

// 2. FORTUNE OX SVG (Matching Image 2)
const fortuneOxSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320">
  <defs>
    <radialGradient id="oxBg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#7f1d1d" />
      <stop offset="60%" stop-color="#450a0a" />
      <stop offset="100%" stop-color="#1c0505" />
    </radialGradient>
    <linearGradient id="goldHorns" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff" />
      <stop offset="30%" stop-color="#fef08a" />
      <stop offset="70%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <filter id="oxGlow">
      <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#f59e0b" flood-opacity="0.8" />
    </filter>
  </defs>

  <rect width="400" height="320" rx="24" fill="url(#oxBg)" />

  <!-- PG Soft Badge -->
  <rect x="320" y="14" width="64" height="26" rx="8" fill="#1e293b" />
  <text x="352" y="32" fill="#38bdf8" font-family="'Arial Black', sans-serif" font-weight="900" font-size="13" text-anchor="middle">PG</text>

  <!-- 3D Red Ox Warrior (Matching Image 2) -->
  <g transform="translate(200, 115)" filter="url(#oxGlow)">
    <!-- Golden Horns -->
    <path d="M -50 -15 C -80 -45 -60 -75 -40 -85 C -45 -65 -30 -45 -15 -35 Z" fill="url(#goldHorns)" stroke="#78350f" stroke-width="2" />
    <path d="M 50 -15 C 80 -45 60 -75 40 -85 C 45 -65 30 -45 15 -35 Z" fill="url(#goldHorns)" stroke="#78350f" stroke-width="2" />
    
    <!-- Red Robe Body -->
    <path d="M -50 55 L -40 -5 L 40 -5 L 50 55 Z" fill="#dc2626" stroke="#991b1b" stroke-width="2" />
    <line x1="0" y1="-5" x2="0" y2="55" stroke="#fef08a" stroke-width="4" />

    <!-- Ox Head -->
    <ellipse cx="0" cy="-10" rx="42" ry="34" fill="#b91c1c" stroke="#7f1d1d" stroke-width="2" />
    
    <!-- Snout & Golden Ring -->
    <ellipse cx="0" cy="5" rx="26" ry="16" fill="#fca5a5" />
    <circle cx="-8" cy="4" r="3.5" fill="#450a0a" />
    <circle cx="8" cy="4" r="3.5" fill="#450a0a" />
    <circle cx="0" cy="18" r="8" fill="none" stroke="url(#goldHorns)" stroke-width="3" />

    <!-- Cute Fierce Eyes -->
    <polygon points="-24,-18 -12,-14 -16,-8" fill="#ffffff" />
    <circle cx="-18" cy="-13" r="2.5" fill="#000" />
    <polygon points="24,-18 12,-14 16,-8" fill="#ffffff" />
    <circle cx="18" cy="-13" r="2.5" fill="#000" />
  </g>

  <!-- Golden Sycee / Ingot -->
  <g transform="translate(200, 205)" filter="url(#oxGlow)">
    <path d="M -35 0 C -45 15 -25 25 0 25 C 25 25 45 15 35 0 C 20 8 -20 8 -35 0 Z" fill="url(#goldHorns)" stroke="#78350f" stroke-width="2" />
    <ellipse cx="0" cy="0" rx="25" ry="10" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5" />
  </g>

  <!-- Typography -->
  <g filter="url(#oxGlow)">
    <text x="200" y="270" text-anchor="middle" font-family="'Arial Black', Impact, sans-serif" font-size="30" font-weight="900" fill="#fef08a" stroke="#b45309" stroke-width="1.5">FORTUNE OX</text>
    <text x="200" y="295" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="900" fill="#38bdf8">10X RESPIN SLOTS</text>
  </g>
</svg>`;

// 3. WILD BOUNTY SHOWDOWN SVG (Matching Image 2)
const wildBountySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320">
  <defs>
    <radialGradient id="wbBg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#451a03" />
      <stop offset="60%" stop-color="#1c0a00" />
      <stop offset="100%" stop-color="#0c0400" />
    </radialGradient>
    <filter id="goldGlow">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#f59e0b" flood-opacity="0.8" />
    </filter>
  </defs>

  <rect width="400" height="320" rx="24" fill="url(#wbBg)" />

  <!-- PG Soft Badge -->
  <rect x="320" y="14" width="64" height="26" rx="8" fill="#1e293b" />
  <text x="352" y="32" fill="#38bdf8" font-family="'Arial Black', sans-serif" font-weight="900" font-size="13" text-anchor="middle">PG</text>

  <!-- Western Cowgirl Silhouette & Golden Revolvers -->
  <g transform="translate(200, 115)" filter="url(#goldGlow)">
    <!-- Cowboy Hat -->
    <ellipse cx="0" cy="-35" rx="55" ry="14" fill="#78350f" stroke="#ca8a04" stroke-width="2" />
    <path d="M -30 -35 Q 0 -65 30 -35 Z" fill="#92400e" stroke="#ca8a04" stroke-width="2" />

    <!-- Sheriff Star Badge -->
    <polygon points="0,-18 5,-8 16,-8 7,0 10,12 0,5 -10,12 -7,0 -16,-8 -5,-8" fill="#fef08a" stroke="#b45309" stroke-width="1.5" />

    <!-- Cross Revolvers -->
    <g transform="translate(-30, 25) rotate(-35)">
      <rect x="-6" y="-18" width="12" height="36" rx="2" fill="#94a3b8" />
      <rect x="-8" y="10" width="16" height="18" rx="3" fill="#78350f" />
    </g>
    <g transform="translate(30, 25) rotate(35)">
      <rect x="-6" y="-18" width="12" height="36" rx="2" fill="#94a3b8" />
      <rect x="-8" y="10" width="16" height="18" rx="3" fill="#78350f" />
    </g>
  </g>

  <!-- Typography -->
  <g filter="url(#goldGlow)">
    <text x="200" y="260" text-anchor="middle" font-family="'Arial Black', Impact, sans-serif" font-size="24" font-weight="900" fill="#fef08a" stroke="#78350f" stroke-width="1.5">WILD BOUNTY</text>
    <text x="200" y="290" text-anchor="middle" font-family="'Arial Black', Impact, sans-serif" font-size="28" font-weight="900" fill="#ef4444" stroke="#ffffff" stroke-width="1.5">SHOWDOWN</text>
  </g>
</svg>`;

// 4. BUFFALO WIN SVG (Matching Image 2)
const buffaloWinSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320">
  <defs>
    <radialGradient id="bufBg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#78350f" />
      <stop offset="60%" stop-color="#451a03" />
      <stop offset="100%" stop-color="#1c0a00" />
    </radialGradient>
    <filter id="bufGlow">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#f59e0b" flood-opacity="0.8" />
    </filter>
  </defs>

  <rect width="400" height="320" rx="24" fill="url(#bufBg)" />

  <!-- PG Soft Badge -->
  <rect x="320" y="14" width="64" height="26" rx="8" fill="#1e293b" />
  <text x="352" y="32" fill="#38bdf8" font-family="'Arial Black', sans-serif" font-weight="900" font-size="13" text-anchor="middle">PG</text>

  <!-- Golden Charging Bison / Buffalo Head -->
  <g transform="translate(200, 115)" filter="url(#bufGlow)">
    <!-- Massive Curved Horns -->
    <path d="M -45 -10 C -75 -35 -65 -65 -45 -75 C -50 -55 -35 -40 -20 -30 Z" fill="#0f172a" stroke="#f59e0b" stroke-width="2" />
    <path d="M 45 -10 C 75 -35 65 -65 45 -75 C 50 -55 35 -40 20 -30 Z" fill="#0f172a" stroke="#f59e0b" stroke-width="2" />

    <!-- Fluffy Buffalo Head -->
    <ellipse cx="0" cy="-10" rx="45" ry="38" fill="#92400e" stroke="#78350f" stroke-width="3" />
    <path d="M -30 -35 Q 0 -55 30 -35 Q 15 -15 0 -20 Q -15 -15 -30 -35 Z" fill="#b45309" />

    <!-- Eyes -->
    <circle cx="-18" cy="-12" r="4" fill="#fef08a" />
    <circle cx="18" cy="-12" r="4" fill="#fef08a" />

    <!-- Snout & Ring -->
    <ellipse cx="0" cy="8" rx="24" ry="15" fill="#451a03" />
    <circle cx="0" cy="18" r="8" fill="none" stroke="#f59e0b" stroke-width="3" />
  </g>

  <!-- Typography -->
  <g filter="url(#bufGlow)">
    <text x="200" y="260" text-anchor="middle" font-family="'Arial Black', Impact, sans-serif" font-size="28" font-weight="900" fill="#fef08a" stroke="#78350f" stroke-width="1.5">BUFFALO WIN</text>
    <rect x="140" y="275" width="120" height="24" rx="12" fill="#f59e0b" />
    <text x="200" y="291" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="900" fill="#000">INFINITY REELS</text>
  </g>
</svg>`;

fs.writeFileSync('public/assets/games/7up7down.svg', sevenUpSvg, 'utf8');
fs.writeFileSync('public/assets/games/fortuneox.svg', fortuneOxSvg, 'utf8');
fs.writeFileSync('public/assets/games/wildbounty.svg', wildBountySvg, 'utf8');
fs.writeFileSync('public/assets/games/buffalowin.svg', buffaloWinSvg, 'utf8');
console.log('Saved 7up7down, fortuneox, wildbounty, buffalowin game covers!');
