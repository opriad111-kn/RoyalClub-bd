// Authentic Sound Engine for Royal Club BD
// Seamlessly plays official high-fidelity audio assets with Web Audio API fallback

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true; // Enabled by default for rich gaming immersion
    this.audioCache = {};
    
    // Official sound assets
    this.soundPaths = {
      tick: '/assets/audio/di1-BcK6vZoZ.mp3',
      buzzer: '/assets/audio/di2-DpfFojGs.mp3',
      win: '/assets/audio/win-DVm17j99.mp3',
      winExplode: '/assets/audio/win_explode-_OlEPAkj.mp3',
      loss: '/assets/audio/lost_explode-Cs7ekDlG.mp3',
      chip: '/assets/audio/change-Bh52s7NG.mp3',
      light: '/assets/audio/light-CeWq7hyj.mp3'
    };

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('royalclub_sound_enabled');
      if (stored !== null) {
        this.enabled = stored === 'true';
      }
      // Unlock audio on first user touch/click
      const unlockAudio = () => {
        this.init();
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('click', unlockAudio);
      };
      window.addEventListener('touchstart', unlockAudio, { passive: true });
      window.addEventListener('click', unlockAudio, { passive: true });
    }
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('royalclub_sound_enabled', this.enabled ? 'true' : 'false');
    }
    return this.enabled;
  }

  setSoundEnabled(val) {
    this.enabled = !!val;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('royalclub_sound_enabled', this.enabled ? 'true' : 'false');
    }
  }

  isSoundEnabled() {
    return this.enabled;
  }

  // Play an MP3 audio file with automatic fallback
  playAudioFile(key, fallbackFn) {
    if (!this.enabled || typeof window === 'undefined') return;
    this.init();

    try {
      const path = this.soundPaths[key];
      if (path) {
        let audio = this.audioCache[key];
        if (!audio) {
          audio = new Audio(path);
          audio.preload = 'auto';
          this.audioCache[key] = audio;
        } else {
          audio.currentTime = 0;
        }
        audio.play().catch(() => {
          // Fallback to Web Audio synthesis if browser blocks unmuted audio
          if (fallbackFn) fallbackFn();
        });
        return;
      }
    } catch (e) {
      if (fallbackFn) fallbackFn();
    }
  }

  // Countdown Mechanical Tick (di1.mp3)
  playTick() {
    this.playAudioFile('tick', () => {
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(950, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } catch (e) {}
    });
  }

  // 0-Second Buzzer (di2.mp3)
  playBuzzer() {
    this.playAudioFile('buzzer', () => {
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } catch (e) {}
    });
  }

  // Casino Chip Click / Bet Confirmation
  playBet() {
    this.playAudioFile('chip', () => {
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } catch (e) {}
    });
  }

  // Victory Celebration (win.mp3 + win_explode.mp3)
  playWin() {
    this.playAudioFile('win', () => {
      if (!this.ctx) return;
      try {
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        const now = this.ctx.currentTime;
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const start = now + idx * 0.08;
          const dur = idx === notes.length - 1 ? 0.7 : 0.12;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.22, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(start);
          osc.stop(start + dur);
        });
      } catch (e) {}
    });
  }

  // Loss Sound (lost_explode.mp3)
  playLoss() {
    this.playAudioFile('loss', () => {
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } catch (e) {}
    });
  }

  // Ball rolling sound
  playRoll() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.linearRampToValueAtTime(450, now + 0.35);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  // Peg Click
  playPegClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {}
  }

  // Slot Reel Mechanical Stop Thud
  playReelStop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  // Aviator Engine Sound
  playEngineHum(pitchRatio = 1.0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const freq = Math.min(600, 120 + pitchRatio * 60);
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }
}

export const soundManager = new AudioEngine();
