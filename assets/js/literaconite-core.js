/**
 * LITERACONITE CORE INTERACTIVE SYSTEM & GOTHIC SANCTUARY
 * Pure Vanilla JavaScript — Zero Dependencies, High Fidelity Procedural Audio, Bibliomancy Oracle
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     1. ATMOSPHERE THEME ENGINE
     ───────────────────────────────────────────────────────────── */
  const THEMES = ['midnight', 'candlelight', 'crimson'];
  const THEME_NAMES = {
    midnight: 'Midnight',
    candlelight: 'Candlelight',
    crimson: 'Crimson'
  };

  function getStoredTheme() {
    try {
      return localStorage.getItem('lc-theme') || 'midnight';
    } catch(e) {
      return 'midnight';
    }
  }

  function applyTheme(theme) {
    if (!THEMES.includes(theme)) theme = 'midnight';
    document.documentElement.setAttribute('data-theme', theme);
    if (document.body) document.body.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('lc-theme', theme);
    } catch(e) {}

    document.querySelectorAll('.lc-theme-btn').forEach(btn => {
      const label = btn.querySelector('.lc-theme-label');
      if (label) label.textContent = THEME_NAMES[theme] || 'Midnight';
    });
  }

  function cycleTheme() {
    const current = getStoredTheme();
    const nextIndex = (THEMES.indexOf(current) + 1) % THEMES.length;
    const nextTheme = THEMES[nextIndex];
    applyTheme(nextTheme);
    showToast('Atmosphere: ' + (THEME_NAMES[nextTheme] || 'Midnight'));
    return nextTheme;
  }

  /* ─────────────────────────────────────────────────────────────
     2. GOTHIC PROCEDURAL SOUND SANCTUARY (Web Audio API)
     4 Channels: Rainfall, Multi-Layered Hearth Fire, Cathedral Wind, Abbey Bells
     ───────────────────────────────────────────────────────────── */
  let audioCtx = window.__lc_audioCtx || null;
  let isAudioPlaying = false;
  let masterGain = null;
  let rainGain = null, fireGain = null, windGain = null, bellsGain = null;
  let bellInterval = null;
  let audioDockEl = null;

  const SOUND_STATES = {
    rain: true,
    fire: false,
    wind: false,
    bells: false
  };

  function getStoredAudioPref() {
    try {
      return localStorage.getItem('lc-audio') === 'active';
    } catch(e) {
      return false;
    }
  }

  function initWebAudio() {
    if (audioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      audioCtx = new AudioContext();
      window.__lc_audioCtx = audioCtx;

      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);

      // ── 1. CONTINUOUS RAINFALL (Pink noise bed + droplets) ──
      const rainBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 4, audioCtx.sampleRate);
      const rainData = rainBuffer.getChannelData(0);
      let rLast = 0.0;
      for (let i = 0; i < rainBuffer.length; i++) {
        const white = Math.random() * 2 - 1;
        rLast = (rLast + 0.02 * white) / 1.02;
        rainData[i] = rLast * 3.8;
      }
      const rainSrc = audioCtx.createBufferSource();
      rainSrc.buffer = rainBuffer;
      rainSrc.loop = true;

      const rainFilter = audioCtx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(880, audioCtx.currentTime);

      rainGain = audioCtx.createGain();
      rainGain.gain.setValueAtTime(SOUND_STATES.rain ? 0.35 : 0.0001, audioCtx.currentTime);

      rainSrc.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(masterGain);
      rainSrc.start(0);

      // ── 2. MULTI-LAYER HEARTH FIREPLACE (Wood crackles + snap pops + warm combustion) ──
      const fireBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 5, audioCtx.sampleRate);
      const fireData = fireBuffer.getChannelData(0);
      let fRumble = 0.0;
      for (let i = 0; i < fireBuffer.length; i++) {
        const white = Math.random() * 2 - 1;
        // Warm sub-rumble
        fRumble = (fRumble + 0.015 * white) / 1.015;
        let sample = fRumble * 2.2;

        // Frequent wood crackling snaps (short impulses)
        if (Math.random() < 0.0045) {
          sample += (Math.random() * 2 - 1) * 3.5;
        }
        // Sudden loud ember pop / wood burst
        if (Math.random() < 0.0005) {
          sample += (Math.random() > 0.5 ? 1 : -1) * (5.5 + Math.random() * 3.5);
        }
        fireData[i] = sample;
      }
      const fireSrc = audioCtx.createBufferSource();
      fireSrc.buffer = fireBuffer;
      fireSrc.loop = true;

      const fireFilter = audioCtx.createBiquadFilter();
      fireFilter.type = 'bandpass';
      fireFilter.frequency.setValueAtTime(1400, audioCtx.currentTime);
      fireFilter.Q.setValueAtTime(0.75, audioCtx.currentTime);

      fireGain = audioCtx.createGain();
      fireGain.gain.setValueAtTime(SOUND_STATES.fire ? 0.55 : 0.0001, audioCtx.currentTime);

      fireSrc.connect(fireFilter);
      fireFilter.connect(fireGain);
      fireGain.connect(masterGain);
      fireSrc.start(0);

      // ── 3. CATHEDRAL WIND (Swept resonant draft + 55Hz drone) ──
      const windBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 4, audioCtx.sampleRate);
      const windData = windBuffer.getChannelData(0);
      for (let i = 0; i < windBuffer.length; i++) {
        windData[i] = (Math.random() * 2 - 1) * 1.2;
      }
      const windSrc = audioCtx.createBufferSource();
      windSrc.buffer = windBuffer;
      windSrc.loop = true;

      const windFilter = audioCtx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.setValueAtTime(360, audioCtx.currentTime);
      windFilter.Q.setValueAtTime(3.2, audioCtx.currentTime);

      const windLfo = audioCtx.createOscillator();
      windLfo.frequency.setValueAtTime(0.08, audioCtx.currentTime);
      const windLfoGain = audioCtx.createGain();
      windLfoGain.gain.setValueAtTime(290, audioCtx.currentTime);
      windLfo.connect(windLfoGain);
      windLfoGain.connect(windFilter.frequency);
      windLfo.start(0);

      const droneOsc = audioCtx.createOscillator();
      droneOsc.frequency.setValueAtTime(55, audioCtx.currentTime);
      const droneGain = audioCtx.createGain();
      droneGain.gain.setValueAtTime(0.045, audioCtx.currentTime);
      droneOsc.connect(droneGain);
      droneOsc.start(0);

      windGain = audioCtx.createGain();
      windGain.gain.setValueAtTime(SOUND_STATES.wind ? 0.38 : 0.0001, audioCtx.currentTime);

      windSrc.connect(windFilter);
      windFilter.connect(windGain);
      droneGain.connect(windGain);
      windGain.connect(masterGain);
      windSrc.start(0);

      // ── 4. ABBEY BELLS CHANNEL (Cathedral Chimes with Periodic Cycle) ──
      bellsGain = audioCtx.createGain();
      bellsGain.gain.setValueAtTime(1.0, audioCtx.currentTime);
      bellsGain.connect(masterGain);

      startBellCycle();
    } catch(e) {
      console.warn('Web Audio init error', e);
    }
  }

  const BELL_FREQS = [
    [220, 442, 665, 1120],  // Deep A
    [277, 554, 831, 1386],  // C#
    [330, 660, 990, 1650]   // E
  ];

  function tollAbbeyBell(freqIndex = 0) {
    if (!audioCtx || !bellsGain) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    try {
      const now = audioCtx.currentTime;
      const fSet = BELL_FREQS[freqIndex % BELL_FREQS.length];
      const gains = [0.35, 0.20, 0.12, 0.06];

      fSet.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(gains[idx], now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);
        osc.connect(g);
        g.connect(bellsGain);
        osc.start(now);
        osc.stop(now + 5.6);
      });
    } catch(e) {}
  }

  let bellCycleIndex = 0;
  function startBellCycle() {
    if (bellInterval) clearInterval(bellInterval);
    bellInterval = setInterval(() => {
      if (isAudioPlaying && SOUND_STATES.bells) {
        tollAbbeyBell(bellCycleIndex++);
      }
    }, 10000);
  }

  function toggleSoundTrack(soundKey) {
    if (!isAudioPlaying) startAudio(true);
    SOUND_STATES[soundKey] = !SOUND_STATES[soundKey];

    const targetGains = {
      rain: 0.35,
      fire: 0.55,
      wind: 0.38,
      bells: 1.0
    };

    if (audioCtx) {
      const now = audioCtx.currentTime;
      const gainVal = SOUND_STATES[soundKey] ? targetGains[soundKey] : 0.0001;

      if (soundKey === 'rain' && rainGain) {
        rainGain.gain.cancelScheduledValues(now);
        rainGain.gain.setValueAtTime(rainGain.gain.value, now);
        rainGain.gain.linearRampToValueAtTime(gainVal, now + 0.4);
      } else if (soundKey === 'fire' && fireGain) {
        fireGain.gain.cancelScheduledValues(now);
        fireGain.gain.setValueAtTime(fireGain.gain.value, now);
        fireGain.gain.linearRampToValueAtTime(gainVal, now + 0.4);
      } else if (soundKey === 'wind' && windGain) {
        windGain.gain.cancelScheduledValues(now);
        windGain.gain.setValueAtTime(windGain.gain.value, now);
        windGain.gain.linearRampToValueAtTime(gainVal, now + 0.4);
      } else if (soundKey === 'bells') {
        if (SOUND_STATES.bells) {
          tollAbbeyBell(bellCycleIndex++);
          showToast('🔔 Abbey Bells active (tolling periodically)');
        }
      }
    }

    updateSoundPills();
    const names = { rain: 'Rainfall', fire: 'Hearth Fire', wind: 'Cathedral Wind', bells: 'Abbey Bells' };
    if (soundKey !== 'bells') {
      showToast(names[soundKey] + ': ' + (SOUND_STATES[soundKey] ? 'On' : 'Off'));
    }
  }

  function updateSoundPills() {
    if (!audioDockEl) return;
    audioDockEl.querySelectorAll('.lc-sound-chip').forEach(chip => {
      const sound = chip.getAttribute('data-sound');
      const isActive = !!SOUND_STATES[sound];
      chip.classList.toggle('is-active', isActive);
      if (isActive) {
        chip.style.setProperty('background', 'rgba(255, 23, 68, 0.2)', 'important');
        chip.style.setProperty('border-color', 'var(--lc-red-bright, #ff1744)', 'important');
        chip.style.setProperty('color', '#ffffff', 'important');
        chip.style.setProperty('box-shadow', '0 0 12px rgba(255, 23, 68, 0.4)', 'important');
      } else {
        chip.style.setProperty('background', 'rgba(255, 255, 255, 0.07)', 'important');
        chip.style.setProperty('border-color', 'rgba(255, 255, 255, 0.15)', 'important');
        chip.style.setProperty('color', 'var(--lc-muted, #9b8fb3)', 'important');
        chip.style.setProperty('box-shadow', 'none', 'important');
      }
    });
  }

  function renderAudioDock() {
    if (audioDockEl) return;
    audioDockEl = document.createElement('div');
    audioDockEl.className = 'lc-audio-dock is-visible';
    audioDockEl.id = 'lc-audio-dock';
    audioDockEl.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;align-items:center;background:rgba(18,8,14,0.94);border:1px solid rgba(255,50,75,0.35);border-radius:50px;padding:6px 14px;box-shadow:0 12px 35px rgba(0,0,0,0.9),0 0 22px rgba(255,23,68,0.28);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);font-family:Inter,sans-serif;color:#fff;gap:10px;white-space:nowrap;';

    audioDockEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="width:8px;height:8px;border-radius:50%;background:#ff1744;box-shadow:0 0 8px #ff1744;display:inline-block;animation:pulse 2s infinite;"></span>
        <span style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#e2d9f3;">Sanctuary</span>
      </div>

      <div class="lc-sound-toggles" style="display:flex;align-items:center;gap:5px;">
        <button class="lc-sound-chip ${SOUND_STATES.rain ? 'is-active' : ''}" data-sound="rain" type="button" title="Toggle Rainfall" style="all:unset;box-sizing:border-box;display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:500;cursor:pointer;line-height:1;transition:all 140ms ease;">
          <span>🌧️</span> <span>Rain</span>
        </button>
        <button class="lc-sound-chip ${SOUND_STATES.fire ? 'is-active' : ''}" data-sound="fire" type="button" title="Toggle Hearth Fire" style="all:unset;box-sizing:border-box;display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:500;cursor:pointer;line-height:1;transition:all 140ms ease;">
          <span>🔥</span> <span>Fire</span>
        </button>
        <button class="lc-sound-chip ${SOUND_STATES.wind ? 'is-active' : ''}" data-sound="wind" type="button" title="Toggle Cathedral Wind" style="all:unset;box-sizing:border-box;display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:500;cursor:pointer;line-height:1;transition:all 140ms ease;">
          <span>🌬️</span> <span>Wind</span>
        </button>
        <button class="lc-sound-chip ${SOUND_STATES.bells ? 'is-active' : ''}" data-sound="bells" type="button" title="Toggle Abbey Bells" style="all:unset;box-sizing:border-box;display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:500;cursor:pointer;line-height:1;transition:all 140ms ease;">
          <span>🔔</span> <span>Bells</span>
        </button>
      </div>

      <div style="display:flex;align-items:center;padding:0 2px;">
        <input type="range" class="lc-audio-dock-vol" id="lc-master-vol" min="0" max="1" step="0.05" value="0.75" title="Master Volume" style="-webkit-appearance:none;appearance:none;width:55px;height:4px;background:rgba(255,255,255,0.2);border-radius:999px;outline:none;border:none;cursor:pointer;">
      </div>

      <button class="lc-dock-close" type="button" title="Close soundscape" style="all:unset;background:transparent;border:none;color:#9b8fb3;font-size:18px;line-height:1;cursor:pointer;padding:0 2px;transition:color 120ms ease;">&times;</button>
    `;
    document.body.appendChild(audioDockEl);

    const masterSlider = audioDockEl.querySelector('#lc-master-vol');
    const closeBtn = audioDockEl.querySelector('.lc-dock-close');

    masterSlider.oninput = () => {
      if (masterGain && audioCtx && isAudioPlaying) {
        masterGain.gain.setValueAtTime(parseFloat(masterSlider.value), audioCtx.currentTime);
      }
    };

    closeBtn.onclick = () => {
      pauseAudio();
    };

    audioDockEl.querySelectorAll('.lc-sound-chip').forEach(chip => {
      chip.onclick = () => {
        const sound = chip.getAttribute('data-sound');
        toggleSoundTrack(sound);
      };
    });

    updateSoundPills();
  }

  function startAudio(silent = false) {
    if (!audioCtx) initWebAudio();
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    renderAudioDock();

    if (masterGain) {
      const volInput = audioDockEl?.querySelector('#lc-master-vol');
      const vol = volInput ? parseFloat(volInput.value) : 0.75;
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + 0.8);
    }

    isAudioPlaying = true;
    try {
      localStorage.setItem('lc-audio', 'active');
    } catch(e) {}

    updateAudioUI();
    updateSoundPills();
    if (audioDockEl) audioDockEl.style.display = 'flex';
    if (!silent) showToast('🌧️ Gothic Sanctuary: Active');
  }

  function pauseAudio(silent = false) {
    if (!audioCtx || !isAudioPlaying) return;

    if (masterGain) {
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);
    }

    isAudioPlaying = false;
    try {
      localStorage.setItem('lc-audio', 'paused');
    } catch(e) {}

    updateAudioUI();
    if (audioDockEl) audioDockEl.style.display = 'none';
    if (!silent) showToast('Sanctuary: Paused');
  }

  function toggleAudio() {
    if (!isAudioPlaying) {
      startAudio();
    } else {
      pauseAudio();
    }
  }

  function updateAudioUI() {
    document.querySelectorAll('.lc-audio-btn').forEach(btn => {
      btn.classList.toggle('is-active', isAudioPlaying);
      const label = btn.querySelector('.lc-audio-label');
      if (label) label.textContent = isAudioPlaying ? 'Rain On' : 'Rain';
    });
  }

  function checkAutoResumeAudio() {
    if (getStoredAudioPref() && !isAudioPlaying) {
      const resumeHandler = () => {
        if (!isAudioPlaying && getStoredAudioPref()) {
          startAudio(true);
        }
        document.removeEventListener('click', resumeHandler, true);
        document.removeEventListener('keydown', resumeHandler, true);
        document.removeEventListener('touchstart', resumeHandler, true);
      };
      document.addEventListener('click', resumeHandler, { once: true, capture: true });
      document.addEventListener('keydown', resumeHandler, { once: true, capture: true });
      document.addEventListener('touchstart', resumeHandler, { once: true, capture: true });
    }
  }

  /* ─────────────────────────────────────────────────────────────
     3. THE INSCRIPTION ORACLE / GOTHIC BIBLIOMANCY (Cmd+O)
     Instant zero-lag Tarot divination card drawing from the canon
     ───────────────────────────────────────────────────────────── */
  let oracleModalEl = null;

  const CANON_INSCRIPTIONS = [
    {
      title: 'Carmilla',
      section: 'Poem',
      url: '/poetry/carmilla/',
      quote: 'And through the marble colonnade, the velvet dark consumes the shade; Where love and thirst are one and deep, we wake while dying angels sleep.'
    },
    {
      title: 'Mircalla',
      section: 'Poem',
      url: '/poetry/mircalla/',
      quote: 'Come. Up from the loam-choked dark, you. My macabre. My muse of the red weeping. I summon, no. I bleed you into the room.'
    },
    {
      title: 'Kubla Khan (Reflection)',
      section: 'Poem',
      url: '/poetry/kubla-khan-by-samuel-taylor-coleridge-a-translation-into-turkish-and-a-reflection/',
      quote: 'A savage place! as holy and enchanted as e’er beneath a waning moon was haunted by woman wailing for her demon-lover!'
    },
    {
      title: 'A Glimpse from the Adrasan Shore',
      section: 'Poem',
      url: '/poetry/adrasan-shore/',
      quote: 'Sinuous strings Present, aureate gets it, when those agleam rays humbly hit. A curve, be it an arch, laid for sure, under a quiet dusk.'
    },
    {
      title: 'The Crucible: Allegory & Hysteria',
      section: 'Criticism',
      url: '/review/the-crucible-allegory-witchcraft-and-mob-hysteria/',
      quote: 'When terror replaces reason, the court becomes the theater of the damned. Guilt is no longer proven; it is created by consensus.'
    },
    {
      title: 'Death of a Salesman: Theoretical Perspectives',
      section: 'Criticism',
      url: '/review/close-reading-of-arthur-millers-death-of-a-salesman-theoretical-perspectives/',
      quote: 'The tragedy of modern existence is the worship of illusions that demand everything and forgive nothing.'
    },
    {
      title: 'Poe’s The Cask of Amontillado and Vengeance',
      section: 'Criticism',
      url: '/review/on-the-relation-between-poes-the-cask-of-amontillado-and-vengeance-as-a-subject-matter/',
      quote: 'A wrong is unredressed when retribution overtakes its redresser. In the damp vaults of nitre, silence is the final masonry.'
    },
    {
      title: 'Claude Debussy and Musical Impressionism',
      section: 'Criticism',
      url: '/review/claude-debussys-clair-de-lune-and-musical-impressionism/',
      quote: 'Music begins where the word fails. Impressionism is the fleeting perfume of a melancholy evening.'
    },
    {
      title: 'The 18th Century Novel and Crime',
      section: 'Criticism',
      url: '/review/the-18th-century-novel-and-crime-as-a-subject/',
      quote: 'Society invents its own transgressors to justify the architecture of its prisons and the reach of its laws.'
    }
  ];

  const ARCANA_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

  function renderOracleModal() {
    if (oracleModalEl) return;
    oracleModalEl = document.createElement('div');
    oracleModalEl.className = 'lc-oracle-backdrop';
    oracleModalEl.id = 'lc-oracle-modal';
    oracleModalEl.style.cssText = 'display:none;position:fixed;inset:0;z-index:999999;background:rgba(3,2,6,0.92);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);align-items:center;justify-content:center;padding:20px;';

    oracleModalEl.innerHTML = `
      <div class="lc-oracle-modal-box" role="dialog" aria-modal="true" aria-label="Inscription Oracle" style="position:relative;max-width:520px;width:100%;display:flex;flex-direction:column;align-items:center;">
        <button class="lc-oracle-close" type="button" aria-label="Close Oracle" style="all:unset;position:absolute;top:-45px;right:0;background:transparent;border:none;color:#9b8fb3;font-size:32px;line-height:1;cursor:pointer;transition:color 140ms ease;">&times;</button>
        
        <div class="lc-oracle-tarot-card" id="oracle-tarot-card" style="position:relative;width:100%;background:var(--lc-surface-hover, #181024);border:2px solid var(--lc-border-hover, rgba(255,23,68,0.4));border-radius:20px;padding:36px 30px 28px;box-shadow:0 25px 65px rgba(0,0,0,0.95),0 0 35px rgba(255,23,68,0.35);text-align:center;transition:transform 280ms cubic-bezier(0.16,1,0.3,1),opacity 200ms ease;">
          <div class="lc-oracle-card-frame" style="position:absolute;inset:8px;border:1px dashed rgba(255,255,255,0.15);border-radius:12px;pointer-events:none;opacity:0.6;"></div>
          
          <div class="lc-oracle-card-header" style="display:flex;flex-direction:column;align-items:center;gap:4px;margin-bottom:24px;">
            <span class="lc-oracle-sigil" style="font-family:'Cinzel',serif;font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:var(--lc-red-bright, #ff1744);">✦ ARCANUM LITERARIUM ✦</span>
            <span class="lc-oracle-arcana" id="oracle-arcana-num" style="font-family:'Inter',sans-serif;font-size:9px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#9b8fb3;">NOCTURNE VII</span>
          </div>

          <div class="lc-oracle-card-body">
            <div class="lc-oracle-fleuron" style="color:var(--lc-red-bright, #ff1744);font-size:22px;margin-bottom:14px;opacity:0.9;">❦</div>
            <blockquote class="lc-oracle-quote" id="oracle-quote-text" style="font-family:'Playfair Display','EB Garamond',Georgia,serif;font-style:italic;font-size:clamp(18px,4vw,22px);line-height:1.75;color:#ffffff;margin-bottom:24px;padding:0 8px;">
              "And through the marble colonnade, the velvet dark consumes the shade..."
            </blockquote>
            <div class="lc-oracle-citation" style="display:flex;flex-direction:column;gap:3px;margin-bottom:26px;">
              <span class="lc-oracle-work" id="oracle-work-title" style="font-family:'Cinzel',serif;font-size:13px;font-weight:600;letter-spacing:0.14em;color:#ffffff;">Carmilla</span>
              <span class="lc-oracle-author" style="font-family:'Inter',sans-serif;font-size:10px;letter-spacing:0.08em;color:#9b8fb3;">— Emrecan Koç</span>
            </div>
          </div>

          <div class="lc-oracle-card-actions" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
            <button class="lc-oracle-act-btn lc-oracle-draw-btn" id="oracle-draw-btn" type="button" style="all:unset;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;padding:10px 20px;border-radius:999px;font-family:'Inter',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);color:#ffffff;transition:all 160ms ease;">
              <span>Draw Inscription ↺</span>
            </button>
            <a class="lc-oracle-act-btn lc-oracle-read-btn" id="oracle-read-btn" href="#" style="all:unset;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;padding:10px 20px;border-radius:999px;font-family:'Inter',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;background:var(--lc-red-bright, #ff1744);border:1px solid var(--lc-red-bright, #ff1744);color:#ffffff;box-shadow:0 0 16px rgba(255,23,68,0.4);transition:all 160ms ease;">
              <span>Contemplate Piece &rarr;</span>
            </a>
            <button class="lc-oracle-act-btn lc-oracle-copy-btn" id="oracle-copy-btn" type="button" title="Copy Inscription" style="all:unset;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;padding:10px 14px;border-radius:999px;font-family:'Inter',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;background:transparent;border:1px solid rgba(255,255,255,0.15);color:#9b8fb3;transition:all 160ms ease;">
              <span>Copy ❦</span>
            </button>
          </div>
        </div>

        <div class="lc-oracle-hint" style="margin-top:18px;font-family:'Inter',sans-serif;font-size:10px;letter-spacing:0.08em;color:#9b8fb3;">
          <span>Press <kbd style="background:rgba(255,255,255,0.1);padding:2px 5px;border-radius:4px;">Space</kbd> or <kbd style="background:rgba(255,255,255,0.1);padding:2px 5px;border-radius:4px;">↵</kbd> to draw another &bull; <kbd style="background:rgba(255,255,255,0.1);padding:2px 5px;border-radius:4px;">ESC</kbd> to exit</span>
        </div>
      </div>
    `;

    document.body.appendChild(oracleModalEl);

    const closeBtn = oracleModalEl.querySelector('.lc-oracle-close');
    const drawBtn = oracleModalEl.querySelector('#oracle-draw-btn');
    const readBtn = oracleModalEl.querySelector('#oracle-read-btn');
    const copyBtn = oracleModalEl.querySelector('#oracle-copy-btn');

    oracleModalEl.onclick = e => {
      if (e.target === oracleModalEl) closeOracle();
    };

    closeBtn.onclick = closeOracle;

    drawBtn.onclick = () => {
      drawOracleCard();
    };

    readBtn.onclick = e => {
      const url = readBtn.getAttribute('href');
      if (url && url !== '#') {
        e.preventDefault();
        closeOracle();
        navigateTo(url, true);
      }
    };

    copyBtn.onclick = () => {
      const quote = oracleModalEl.querySelector('#oracle-quote-text').textContent.trim();
      const work = oracleModalEl.querySelector('#oracle-work-title').textContent.trim();
      const url = readBtn.getAttribute('href') || window.location.href;
      const citation = '> ' + quote + '\n\n— Emrecan Koç, *' + work + '* (' + window.location.origin + url + ')';
      navigator.clipboard.writeText(citation).then(() => {
        showToast('✦ Inscription clipped with citation!');
      });
    };
  }

  function drawOracleCard() {
    if (!oracleModalEl) return;
    const cardEl = oracleModalEl.querySelector('#oracle-tarot-card');
    cardEl.style.transform = 'scale(0.96) rotateY(15deg)';
    cardEl.style.opacity = '0.4';

    setTimeout(() => {
      const item = CANON_INSCRIPTIONS[Math.floor(Math.random() * CANON_INSCRIPTIONS.length)];
      const quoteEl = oracleModalEl.querySelector('#oracle-quote-text');
      const workEl = oracleModalEl.querySelector('#oracle-work-title');
      const readBtn = oracleModalEl.querySelector('#oracle-read-btn');
      const arcanaNum = oracleModalEl.querySelector('#oracle-arcana-num');

      const roman = ARCANA_NUMERALS[Math.floor(Math.random() * ARCANA_NUMERALS.length)];
      arcanaNum.textContent = 'ARCANUM ' + roman + ' • ' + item.section.toUpperCase();
      quoteEl.textContent = '"' + item.quote + '"';
      workEl.textContent = item.title;
      readBtn.setAttribute('href', item.url);

      cardEl.style.transform = 'none';
      cardEl.style.opacity = '1';
    }, 160);
  }

  function openOracle() {
    renderOracleModal();
    drawOracleCard();
    if (oracleModalEl) {
      oracleModalEl.style.display = 'flex';
      oracleModalEl.classList.add('is-open');
    }
  }

  function closeOracle() {
    if (oracleModalEl) {
      oracleModalEl.style.display = 'none';
      oracleModalEl.classList.remove('is-open');
    }
  }

  /* ─────────────────────────────────────────────────────────────
     4. BULLETPROOF CAPTURE-PHASE PJAX NAVIGATION
     ───────────────────────────────────────────────────────────── */
  let isNavigating = false;

  function updateNavLinks() {
    const cleanPath = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.lc-nav-list a').forEach(link => {
      const linkPath = link.getAttribute('href')?.replace(/\/$/, '') || '/';
      if (linkPath === cleanPath || (linkPath !== '/' && cleanPath.startsWith(linkPath))) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });
  }

  async function navigateTo(url, pushHistory = true) {
    if (isNavigating) return;
    isNavigating = true;

    if (isAudioPlaying && audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const mainContainer = document.querySelector('.lc-container');
    if (mainContainer) mainContainer.classList.add('is-transitioning');

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const htmlText = await response.text();

      const parser = new DOMParser();
      const newDoc = parser.parseFromString(htmlText, 'text/html');

      if (newDoc.title) document.title = newDoc.title;
      if (newDoc.body) document.body.className = newDoc.body.className;

      const newMain = newDoc.querySelector('.lc-container');
      if (mainContainer && newMain) {
        mainContainer.innerHTML = newMain.innerHTML;
      }

      if (pushHistory) {
        window.history.pushState({ url }, '', url);
      }

      updateNavLinks();
      window.scrollTo(0, 0);

      initReadingProgress();
      initVerseFocus();
      initStreamFilter();

      // Re-initialise Sanctum tools after PJAX swap
      if (window.LiteraconiteSanctum && typeof window.LiteraconiteSanctum.init === 'function') {
        window.LiteraconiteSanctum.init();
      }
      // Also fire a custom event for any other listeners
      document.dispatchEvent(new CustomEvent('lc:navigate', { detail: { url } }));

    } catch (err) {
      console.warn('PJAX fallback to direct load', err);
      window.location.href = url;
    } finally {
      setTimeout(() => {
        if (mainContainer) mainContainer.classList.remove('is-transitioning');
        isNavigating = false;
      }, 50);
    }
  }

  function initPjax() {
    document.addEventListener('click', e => {
      const oracleBtn = e.target.closest('.lc-oracle-trigger');
      if (oracleBtn) {
        e.preventDefault();
        openOracle();
        return;
      }

      const themeBtn = e.target.closest('.lc-theme-btn');
      if (themeBtn) {
        e.preventDefault();
        cycleTheme();
        return;
      }

      const audioBtn = e.target.closest('.lc-audio-btn');
      if (audioBtn) {
        e.preventDefault();
        toggleAudio();
        return;
      }

      const searchBtn = e.target.closest('.lc-palette-trigger');
      if (searchBtn) {
        e.preventDefault();
        openPalette();
        return;
      }

      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target.closest('a');
      if (!link) return;

      const rawHref = link.getAttribute('href');
      if (!rawHref) return;

      if (
        link.target === '_blank' ||
        rawHref.startsWith('#') ||
        rawHref.startsWith('mailto:') ||
        rawHref.startsWith('tel:') ||
        rawHref.startsWith('javascript:') ||
        link.getAttribute('rel')?.includes('external')
      ) {
        return;
      }

      try {
        const targetUrl = new URL(link.href, window.location.origin);
        if (targetUrl.origin === window.location.origin) {
          const curPath = window.location.pathname.replace(/\/$/, '') || '/';
          const tgtPath = targetUrl.pathname.replace(/\/$/, '') || '/';

          if (curPath === tgtPath && !targetUrl.hash) {
            e.preventDefault();
            e.stopImmediatePropagation();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }

          e.preventDefault();
          e.stopImmediatePropagation();
          navigateTo(targetUrl.href, true);
        }
      } catch(err) {}
    }, true);

    window.addEventListener('popstate', () => {
      navigateTo(window.location.href, false);
    });
  }

  /* ─────────────────────────────────────────────────────────────
     5. TOAST NOTIFICATIONS
     ───────────────────────────────────────────────────────────── */
  let toastEl = null;
  let toastTimer = null;

  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'lc-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('is-visible');
    }, 2400);
  }

  /* ─────────────────────────────────────────────────────────────
     6. COMMAND PALETTE (Cmd+K / Ctrl+K / /)
     ───────────────────────────────────────────────────────────── */
  let paletteEl = null;
  let searchIndex = [];
  let isIndexLoaded = false;

  const STATIC_COMMANDS = [
    { title: 'Frontispiece', subtitle: 'Return to front page', url: '/', icon: '✦' },
    { title: 'The Inscription Oracle', subtitle: 'Consult Tarot bibliomancy (⌘O)', action: 'oracle', icon: '🔮' },
    { title: 'Sound Sanctuary', subtitle: 'Toggle ambient rain & soundscape', action: 'audio', icon: '🌧️' },
    { title: 'Toll Abbey Bell', subtitle: 'Strike distant cathedral bell', action: 'toll', icon: '🔔' },
    { title: 'Poetry & Verse', subtitle: 'Original Gothic and Romantic verse', url: '/poetry/', icon: '📜' },
    { title: 'Criticism & Close Readings', subtitle: 'Dramatic essays and literary theory', url: '/review/', icon: '🖋️' },
    { title: 'Chronological Archive', subtitle: 'Full ledger of all writings', url: '/archives/', icon: '📂' },
    { title: 'Fragments & Miscellaneous', subtitle: 'Scraps, fragments, and art', url: '/miscellaneous/', icon: '✨' },
    { title: 'Atmosphere: Toggle Theme', subtitle: 'Switch Midnight / Candlelight / Crimson', action: 'theme', icon: '🕯️' },
    { title: 'Letterboxd Diary', subtitle: 'Film diary by Emrecan Koç', url: 'https://boxd.it/3s7QH', icon: '🎞️', external: true }
  ];

  async function loadSearchIndex() {
    if (isIndexLoaded) return;
    try {
      const res = await fetch('/index.json');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          searchIndex = data.map(item => ({
            title: item.title,
            subtitle: item.summary || item.section || 'Article',
            url: item.permalink || item.relpermalink,
            icon: (item.section === 'poetry' ? '📜' : '🖋️')
          }));
        }
      }
    } catch (e) {
      console.warn('Search index fallback', e);
    }
    isIndexLoaded = true;
  }

  function renderPaletteModal() {
    if (paletteEl) return;
    paletteEl = document.createElement('div');
    paletteEl.className = 'lc-palette-backdrop';
    paletteEl.innerHTML = `
      <div class="lc-palette-modal" role="dialog" aria-modal="true" aria-label="Command Palette">
        <div class="lc-palette-header">
          <span class="lc-palette-icon">✦</span>
          <input type="text" class="lc-palette-input" placeholder="Search inscriptions, consult oracle, or switch mood (Esc to exit)..." autocomplete="off" spellcheck="false" />
          <kbd class="lc-palette-kbd">ESC</kbd>
        </div>
        <div class="lc-palette-results"></div>
        <div class="lc-palette-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> select</span>
          <span><kbd>ESC</kbd> dismiss</span>
        </div>
      </div>
    `;

    document.body.appendChild(paletteEl);

    const input = paletteEl.querySelector('.lc-palette-input');
    const resultsContainer = paletteEl.querySelector('.lc-palette-results');

    paletteEl.onclick = e => {
      if (e.target === paletteEl) closePalette();
    };

    input.oninput = () => {
      filterPaletteResults(input.value.trim(), resultsContainer);
    };

    input.onkeydown = e => {
      const items = Array.from(resultsContainer.querySelectorAll('.lc-palette-item'));
      let activeIndex = items.findIndex(el => el.classList.contains('is-active'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (activeIndex < items.length - 1) {
          if (activeIndex >= 0) items[activeIndex].classList.remove('is-active');
          items[activeIndex + 1].classList.add('is-active');
          items[activeIndex + 1].scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeIndex > 0) {
          items[activeIndex].classList.remove('is-active');
          items[activeIndex - 1].classList.add('is-active');
          items[activeIndex - 1].scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && items[activeIndex]) {
          items[activeIndex].click();
        }
      } else if (e.key === 'Escape') {
        closePalette();
      }
    };
  }

  function filterPaletteResults(query, container) {
    const allItems = [...STATIC_COMMANDS, ...searchIndex];
    let filtered = allItems;

    if (query) {
      const q = query.toLowerCase();
      filtered = allItems.filter(item => {
        return (item.title && item.title.toLowerCase().includes(q)) ||
               (item.subtitle && item.subtitle.toLowerCase().includes(q));
      });
    }

    container.innerHTML = '';
    if (filtered.length === 0) {
      container.innerHTML = '<div class="lc-palette-empty">No inscriptions found for "' + query + '"</div>';
      return;
    }

    filtered.slice(0, 10).forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'lc-palette-item ' + (index === 0 ? 'is-active' : '');
      row.innerHTML = `
        <span class="lc-palette-item-icon">${item.icon || '✦'}</span>
        <div class="lc-palette-item-text">
          <div class="lc-palette-item-title">${item.title}</div>
          <div class="lc-palette-item-sub">${item.subtitle || ''}</div>
        </div>
        <span class="lc-palette-item-enter">↵</span>
      `;

      row.onclick = () => {
        closePalette();
        if (item.action === 'theme') {
          cycleTheme();
        } else if (item.action === 'audio') {
          toggleAudio();
        } else if (item.action === 'oracle') {
          openOracle();
        } else if (item.action === 'toll') {
          tollAbbeyBell(0);
        } else if (item.url) {
          if (item.external) {
            window.open(item.url, '_blank', 'noopener');
          } else {
            navigateTo(item.url, true);
          }
        }
      };

      row.onmouseenter = () => {
        container.querySelectorAll('.lc-palette-item').forEach(el => el.classList.remove('is-active'));
        row.classList.add('is-active');
      };

      container.appendChild(row);
    });
  }

  function openPalette() {
    renderPaletteModal();
    loadSearchIndex();
    paletteEl.classList.add('is-open');
    const input = paletteEl.querySelector('.lc-palette-input');
    input.value = '';
    filterPaletteResults('', paletteEl.querySelector('.lc-palette-results'));
    setTimeout(() => input.focus(), 50);
  }

  function closePalette() {
    if (paletteEl) paletteEl.classList.remove('is-open');
  }

  // Keyboard Shortcuts
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (paletteEl && paletteEl.classList.contains('is-open')) closePalette();
      else openPalette();
    } else if ((e.metaKey || e.ctrlKey) && (e.key === 'o' || e.key === 'O')) {
      e.preventDefault();
      if (oracleModalEl && oracleModalEl.classList.contains('is-open')) closeOracle();
      else openOracle();
    } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      openPalette();
    } else if (e.key === 'Escape') {
      if (paletteEl && paletteEl.classList.contains('is-open')) closePalette();
      if (oracleModalEl && oracleModalEl.classList.contains('is-open')) closeOracle();
    } else if ((e.key === ' ' || e.key === 'Enter') && oracleModalEl && oracleModalEl.classList.contains('is-open')) {
      if (!['BUTTON', 'A'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        drawOracleCard();
      }
    }
  });

  /* ─────────────────────────────────────────────────────────────
     7. VERSE FOCUS & STANZA CONTEMPLATION
     ───────────────────────────────────────────────────────────── */
  function initVerseFocus() {
    const proseContainer = document.querySelector('.lc-verse-mode') || document.querySelector('.is-poetry-article .lc-prose');
    if (!proseContainer) return;

    const paragraphs = Array.from(proseContainer.querySelectorAll('p')).filter(p => !p.closest('figcaption'));

    paragraphs.forEach((p, idx) => {
      p.onclick = e => {
        if (e.target.closest('a')) return;
        const isAlreadyLocked = p.classList.contains('is-locked-stanza');

        paragraphs.forEach(el => el.classList.remove('is-locked-stanza'));
        proseContainer.classList.remove('has-locked-stanza');

        if (!isAlreadyLocked) {
          p.classList.add('is-locked-stanza');
          proseContainer.classList.add('has-locked-stanza');
          showToast('Stanza ' + (idx + 1) + ' locked in contemplation');
        }
      };
    });

    document.addEventListener('click', e => {
      if (!proseContainer.contains(e.target)) {
        proseContainer.classList.remove('has-locked-stanza');
        paragraphs.forEach(el => el.classList.remove('is-locked-stanza'));
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────
     8. GOTHIC EXCERPT & CITATION TOOLTIP
     ───────────────────────────────────────────────────────────── */
  let quoteTooltip = null;

  function initQuoteTooltip() {
    if (quoteTooltip) return;
    quoteTooltip = document.createElement('div');
    quoteTooltip.className = 'lc-quote-tooltip';
    quoteTooltip.innerHTML = `
      <button class="lc-quote-btn" type="button">
        <span class="lc-quote-icon">❦</span> Copy with Citation
      </button>
    `;
    document.body.appendChild(quoteTooltip);

    const btn = quoteTooltip.querySelector('.lc-quote-btn');
    btn.onclick = () => {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      if (!text) return;

      const pageTitle = document.title.split('|')[0].trim() || 'Literaconite';
      const url = window.location.href;
      const citation = '> "' + text + '"\n\n— Emrecan Koç, *' + pageTitle + '* (' + url + ')';

      navigator.clipboard.writeText(citation).then(() => {
        showToast('✦ Quote clipped with citation!');
        quoteTooltip.classList.remove('is-visible');
        window.getSelection().removeAllRanges();
      });
    };

    document.addEventListener('mouseup', () => {
      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection ? selection.toString().trim() : '';

        if (text.length > 10 && !selection.isCollapsed) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            quoteTooltip.style.top = `${window.scrollY + rect.top - 46}px`;
            quoteTooltip.style.left = `${window.scrollX + rect.left + (rect.width / 2)}px`;
            quoteTooltip.classList.add('is-visible');
            return;
          }
        }
        quoteTooltip.classList.remove('is-visible');
      }, 20);
    });

    document.addEventListener('mousedown', e => {
      if (quoteTooltip && !quoteTooltip.contains(e.target)) {
        quoteTooltip.classList.remove('is-visible');
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────
     9. READING PROGRESS BAR
     ───────────────────────────────────────────────────────────── */
  function initReadingProgress() {
    const progressBar = document.querySelector('#reading-progress');
    if (!progressBar) return;

    function updateProgress() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = `${progress}%`;
    }

    window.onscroll = updateProgress;
    window.onresize = updateProgress;
    updateProgress();
  }

  /* ─────────────────────────────────────────────────────────────
     10. HOMEPAGE STREAM FILTER
     ───────────────────────────────────────────────────────────── */
  function initStreamFilter() {
    const filterContainer = document.querySelector('.lc-filter-pills');
    const cards = document.querySelectorAll('.lc-grid-card');
    if (!filterContainer || cards.length === 0) return;

    filterContainer.onclick = e => {
      const btn = e.target.closest('.lc-filter-pill');
      if (!btn) return;

      filterContainer.querySelectorAll('.lc-filter-pill').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        if (filter === 'all' || card.classList.contains('lc-card-' + filter)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    };
  }

  /* ─────────────────────────────────────────────────────────────
     11. DOM INITIALIZATION
     ───────────────────────────────────────────────────────────── */
  function init() {
    applyTheme(getStoredTheme());
    updateAudioUI();
    checkAutoResumeAudio();
    initReadingProgress();
    initQuoteTooltip();
    initVerseFocus();
    initStreamFilter();
    initPjax();
  }

  /* ─────────────────────────────────────────────────────────────
     12. HOURGLASS OF THE DAMNED (POMODORO)
     ───────────────────────────────────────────────────────────── */
  let hourglassTimer = null;
  let hourglassSeconds = 1500; // 25 mins
  let isHourglassRunning = false;

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function toggleHourglass() {
    const label = document.querySelector('.lc-hourglass-time');
    if (isHourglassRunning) {
      clearInterval(hourglassTimer);
      isHourglassRunning = false;
      showToast('Hourglass suspended.');
      if (label) label.textContent = formatTime(hourglassSeconds);
    } else {
      isHourglassRunning = true;
      if (hourglassSeconds <= 0) hourglassSeconds = 1500;
      showToast('Hourglass inverted. Time trickles away.');
      if (!isAudioPlaying) toggleAudio(); // Start rain for focus
      
      hourglassTimer = setInterval(() => {
        hourglassSeconds--;
        if (label) label.textContent = formatTime(hourglassSeconds);
        
        if (hourglassSeconds <= 0) {
          clearInterval(hourglassTimer);
          isHourglassRunning = false;
          tollAbbeyBell(0); // Toll the bell
          showToast('The Hourglass has run empty.');
        }
      }, 1000);
    }
  }

  /* ─────────────────────────────────────────────────────────────
     13. VOTIVE LEDGER (WALL OF WHISPERS)
     ───────────────────────────────────────────────────────────── */
  let votiveModal = null;

  function openVotive() {
    if (!votiveModal) {
      votiveModal = document.createElement('div');
      votiveModal.className = 'lc-votive-modal';
      votiveModal.innerHTML = `
        <div class="lc-votive-overlay"></div>
        <div class="lc-votive-content">
          <button class="lc-votive-close" aria-label="Close Ledger">&times;</button>
          <div class="lc-votive-header">
            <h3>The Votive Ledger</h3>
            <p>Leave a whisper in the dark &mdash; a confession, a fear, an inscription.</p>
          </div>
          <div class="lc-votive-entries" id="votive-entries">
            <div class="lc-votive-entry">&ldquo;He&rsquo;s more myself than I am. Whatever our souls are made of, his and mine are the same.&rdquo;</div>
            <div class="lc-votive-entry">&ldquo;A wrong is unredressed when retribution overtakes its redresser.&rdquo;</div>
            <div class="lc-votive-entry">&ldquo;I beheld the wretch &mdash; the miserable monster whom I had created.&rdquo;</div>
            <div class="lc-votive-entry">&ldquo;The veil between the worlds is made of language.&rdquo;</div>
          </div>
          <form class="lc-votive-form" id="votive-form">
            <input type="text" id="votive-input" placeholder="Inscribe your whisper..." required autocomplete="off">
            <button type="submit">Offer &nbsp;&#128367;&#65039;</button>
          </form>
        </div>
      `;
      document.body.appendChild(votiveModal);
      votiveModal.querySelector('.lc-votive-overlay').addEventListener('click', closeVotive);
      votiveModal.querySelector('.lc-votive-close').addEventListener('click', closeVotive);
      votiveModal.querySelector('#votive-form').addEventListener('submit', submitVotive);
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && votiveModal && votiveModal.classList.contains('is-open')) closeVotive();
      });
    }
    votiveModal.classList.add('is-open');
    setTimeout(() => { const inp = document.getElementById('votive-input'); if (inp) inp.focus(); }, 120);
  }

  function closeVotive() {
    if (votiveModal) votiveModal.classList.remove('is-open');
  }

  function submitVotive(e) {
    e.preventDefault();
    const input = document.getElementById('votive-input');
    const text = input.value.trim();
    if (!text) return;

    const entriesBox = document.getElementById('votive-entries');
    const newEntry = document.createElement('div');
    newEntry.className = 'lc-votive-entry new-entry';
    newEntry.innerHTML = '&ldquo;' + text + '&rdquo;';
    entriesBox.appendChild(newEntry);
    entriesBox.scrollTop = entriesBox.scrollHeight;

    input.value = '';
    showToast('Your whisper has been bound to the ledger.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.Literaconite = {
    cycleTheme,
    startAudio,
    pauseAudio,
    toggleAudio,
    toggleSoundTrack,
    tollAbbeyBell,
    openPalette,
    closePalette,
    openOracle,
    closeOracle,
    toggleHourglass,
    openVotive,
    closeVotive,
    submitVotive,
    showToast,
    navigateTo
  };
})();
