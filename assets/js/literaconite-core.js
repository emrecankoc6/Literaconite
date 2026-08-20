/**
 * LITERACONITE CORE INTERACTIVE SYSTEM & GOTHIC SANCTUARY
 * Pure Vanilla JavaScript — Zero Dependencies, Web Audio Synth, Bibliomancy Oracle, Constellation Graph & PJAX
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
    showToast(`Atmosphere: ${THEME_NAMES[nextTheme]}`);
    return nextTheme;
  }

  /* ─────────────────────────────────────────────────────────────
     2. GOTHIC PROCEDURAL 4-CHANNEL SOUNDBOARD ENGINE (Web Audio API)
     Rain + Fireplace + Cathedral Wind + Abbey Bell Chimes
     ───────────────────────────────────────────────────────────── */
  let audioCtx = window.__lc_audioCtx || null;
  let isAudioPlaying = false;
  let masterGain = null;
  let rainGain = null, fireGain = null, windGain = null, bellsGain = null;
  let bellTimer = null;
  let audioDockEl = null;

  const TRACK_LEVELS = {
    rain: 0.70,
    fire: 0.40,
    wind: 0.50,
    bells: 0.60
  };

  const SOUND_PRESETS = {
    rainstorm: { rain: 0.95, fire: 0.10, wind: 0.45, bells: 0.20 },
    hearthside: { rain: 0.25, fire: 0.90, wind: 0.20, bells: 0.15 },
    nocturne: { rain: 0.15, fire: 0.20, wind: 0.75, bells: 0.85 },
    sanctum: { rain: 0.75, fire: 0.55, wind: 0.65, bells: 0.70 }
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

      // ── 1. RAINFALL CHANNEL ──
      const rainBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 4, audioCtx.sampleRate);
      const rainData = rainBuffer.getChannelData(0);
      let rLast = 0.0;
      for (let i = 0; i < rainBuffer.length; i++) {
        const white = Math.random() * 2 - 1;
        rLast = (rLast + 0.02 * white) / 1.02;
        rainData[i] = rLast * 3.6;
      }
      const rainSrc = audioCtx.createBufferSource();
      rainSrc.buffer = rainBuffer;
      rainSrc.loop = true;

      const rainFilter = audioCtx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(820, audioCtx.currentTime);

      rainGain = audioCtx.createGain();
      rainGain.gain.setValueAtTime(TRACK_LEVELS.rain * 0.22, audioCtx.currentTime);

      rainSrc.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(masterGain);
      rainSrc.start(0);

      // ── 2. FIREPLACE CHANNEL (Brown noise + random crackle pops) ──
      const fireBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 4, audioCtx.sampleRate);
      const fireData = fireBuffer.getChannelData(0);
      let fLast = 0.0;
      for (let i = 0; i < fireBuffer.length; i++) {
        const white = Math.random() * 2 - 1;
        fLast = (fLast + (0.014 * white)) / 1.014;
        const pop = (Math.random() < 0.0009) ? (Math.random() * 2 - 1) * 3.2 : 0;
        fireData[i] = (fLast * 2.8) + pop;
      }
      const fireSrc = audioCtx.createBufferSource();
      fireSrc.buffer = fireBuffer;
      fireSrc.loop = true;

      const fireFilter = audioCtx.createBiquadFilter();
      fireFilter.type = 'bandpass';
      fireFilter.frequency.setValueAtTime(420, audioCtx.currentTime);
      fireFilter.Q.setValueAtTime(1.2, audioCtx.currentTime);

      fireGain = audioCtx.createGain();
      fireGain.gain.setValueAtTime(TRACK_LEVELS.fire * 0.18, audioCtx.currentTime);

      fireSrc.connect(fireFilter);
      fireFilter.connect(fireGain);
      fireGain.connect(masterGain);
      fireSrc.start(0);

      // ── 3. CATHEDRAL WIND CHANNEL (LFO Swept Filter + 55Hz Drone) ──
      const windBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 4, audioCtx.sampleRate);
      const windData = windBuffer.getChannelData(0);
      for (let i = 0; i < windBuffer.length; i++) {
        windData[i] = (Math.random() * 2 - 1) * 0.9;
      }
      const windSrc = audioCtx.createBufferSource();
      windSrc.buffer = windBuffer;
      windSrc.loop = true;

      const windFilter = audioCtx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.setValueAtTime(320, audioCtx.currentTime);
      windFilter.Q.setValueAtTime(3.2, audioCtx.currentTime);

      const windLfo = audioCtx.createOscillator();
      windLfo.frequency.setValueAtTime(0.11, audioCtx.currentTime);
      const windLfoGain = audioCtx.createGain();
      windLfoGain.gain.setValueAtTime(260, audioCtx.currentTime);
      windLfo.connect(windLfoGain);
      windLfoGain.connect(windFilter.frequency);
      windLfo.start(0);

      const droneOsc = audioCtx.createOscillator();
      droneOsc.frequency.setValueAtTime(55, audioCtx.currentTime);
      const droneGain = audioCtx.createGain();
      droneGain.gain.setValueAtTime(0.035, audioCtx.currentTime);
      droneOsc.connect(droneGain);
      droneOsc.start(0);

      windGain = audioCtx.createGain();
      windGain.gain.setValueAtTime(TRACK_LEVELS.wind * 0.20, audioCtx.currentTime);

      windSrc.connect(windFilter);
      windFilter.connect(windGain);
      droneGain.connect(windGain);
      windGain.connect(masterGain);
      windSrc.start(0);

      // ── 4. ABBEY BELL CHIMES CHANNEL (Inharmonic Additive Synthesis) ──
      bellsGain = audioCtx.createGain();
      bellsGain.gain.setValueAtTime(TRACK_LEVELS.bells, audioCtx.currentTime);
      bellsGain.connect(masterGain);

      scheduleBellToll();
    } catch(e) {
      console.warn('Web Audio init error', e);
    }
  }

  function tollAbbeyBell() {
    if (!audioCtx || !bellsGain) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    try {
      const now = audioCtx.currentTime;
      const freqs = [220, 442, 665, 1120];
      const gains = [0.22, 0.12, 0.07, 0.035];

      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(gains[idx], now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 4.8);
        osc.connect(g);
        g.connect(bellsGain);
        osc.start(now);
        osc.stop(now + 4.9);
      });
      showToast('🔔 Abbey Bell tolled in the distance');
    } catch(e) {}
  }

  function scheduleBellToll() {
    clearTimeout(bellTimer);
    bellTimer = setTimeout(() => {
      if (isAudioPlaying) tollAbbeyBell();
      scheduleBellToll();
    }, 45000 + Math.random() * 25000);
  }

  function renderAudioDock() {
    if (audioDockEl) return;
    audioDockEl = document.createElement('div');
    audioDockEl.className = 'lc-audio-dock';
    audioDockEl.innerHTML = `
      <div class="lc-audio-dock-bar">
        <div class="lc-audio-dock-info">
          <span class="lc-audio-dock-icon">🌧️</span>
          <span class="lc-audio-dock-text">Gothic Sanctuary</span>
        </div>
        <div class="lc-audio-dock-actions">
          <input type="range" class="lc-audio-dock-vol" min="0" max="1" step="0.05" value="0.7" title="Master Volume">
          <button class="lc-dock-btn lc-dock-mixer-btn" type="button" title="Expand Soundboard Mixer">🎛️ Mixer</button>
          <button class="lc-dock-btn lc-dock-pop" type="button" title="Open persistent pop-out companion player">↗ Pop-out</button>
          <button class="lc-dock-close" type="button" title="Close soundscape">&times;</button>
        </div>
      </div>

      <!-- Expandable Multi-Channel Mixer Tray -->
      <div class="lc-mixer-tray" id="lc-mixer-tray">
        <div class="lc-mixer-header">
          <span>Atmospheric Soundboard</span>
          <button class="lc-mixer-toll" type="button" id="lc-dock-toll">🔔 Toll Bell</button>
        </div>
        <div class="lc-mixer-grid">
          <div class="lc-mixer-track">
            <div class="lc-track-head"><span>🌧️ Rain</span><span id="txt-rain">70%</span></div>
            <input type="range" id="mix-rain" min="0" max="1" step="0.05" value="0.7">
          </div>
          <div class="lc-mixer-track">
            <div class="lc-track-head"><span>🔥 Fire</span><span id="txt-fire">40%</span></div>
            <input type="range" id="mix-fire" min="0" max="1" step="0.05" value="0.4">
          </div>
          <div class="lc-mixer-track">
            <div class="lc-track-head"><span>🌬️ Wind</span><span id="txt-wind">50%</span></div>
            <input type="range" id="mix-wind" min="0" max="1" step="0.05" value="0.5">
          </div>
          <div class="lc-mixer-track">
            <div class="lc-track-head"><span>🔔 Bells</span><span id="txt-bells">60%</span></div>
            <input type="range" id="mix-bells" min="0" max="1" step="0.05" value="0.6">
          </div>
        </div>
        <div class="lc-mixer-presets">
          <button class="lc-preset-chip" type="button" data-preset="rainstorm">Rainstorm</button>
          <button class="lc-preset-chip" type="button" data-preset="hearthside">Hearthside</button>
          <button class="lc-preset-chip" type="button" data-preset="nocturne">Nocturne</button>
          <button class="lc-preset-chip" type="button" data-preset="sanctum">Grand Sanctum</button>
        </div>
      </div>
    `;
    document.body.appendChild(audioDockEl);

    const masterSlider = audioDockEl.querySelector('.lc-audio-dock-vol');
    const mixerToggle = audioDockEl.querySelector('.lc-dock-mixer-btn');
    const mixerTray = audioDockEl.querySelector('#lc-mixer-tray');
    const popBtn = audioDockEl.querySelector('.lc-dock-pop');
    const closeBtn = audioDockEl.querySelector('.lc-dock-close');
    const tollBtn = audioDockEl.querySelector('#lc-dock-toll');

    mixerToggle.onclick = () => {
      mixerTray.classList.toggle('is-open');
      mixerToggle.classList.toggle('is-active', mixerTray.classList.contains('is-open'));
    };

    tollBtn.onclick = () => {
      tollAbbeyBell();
    };

    masterSlider.oninput = () => {
      if (masterGain && audioCtx && isAudioPlaying) {
        masterGain.gain.setValueAtTime(parseFloat(masterSlider.value), audioCtx.currentTime);
      }
    };

    popBtn.onclick = () => {
      pauseAudio(true);
      window.open('/sanctuary/', 'LiteraconiteSanctuary', 'width=380,height=360,resizable=no,scrollbars=no');
    };

    closeBtn.onclick = () => {
      pauseAudio();
    };

    // Bind sub-track sliders
    const tracks = [
      { id: 'mix-rain', txt: 'txt-rain', key: 'rain', gain: () => rainGain, scale: 0.22 },
      { id: 'mix-fire', txt: 'txt-fire', key: 'fire', gain: () => fireGain, scale: 0.18 },
      { id: 'mix-wind', txt: 'txt-wind', key: 'wind', gain: () => windGain, scale: 0.20 },
      { id: 'mix-bells', txt: 'txt-bells', key: 'bells', gain: () => bellsGain, scale: 0.80 }
    ];

    tracks.forEach(t => {
      const slider = audioDockEl.querySelector(`#${t.id}`);
      const txt = audioDockEl.querySelector(`#${t.txt}`);
      slider.oninput = () => {
        const val = parseFloat(slider.value);
        TRACK_LEVELS[t.key] = val;
        txt.textContent = Math.round(val * 100) + '%';
        const g = t.gain();
        if (g && audioCtx) {
          g.gain.setValueAtTime(val * t.scale, audioCtx.currentTime);
        }
      };
    });

    // Preset chips
    audioDockEl.querySelectorAll('.lc-preset-chip').forEach(chip => {
      chip.onclick = () => {
        const pKey = chip.getAttribute('data-preset');
        const p = SOUND_PRESETS[pKey];
        if (!p) return;
        tracks.forEach(t => {
          const slider = audioDockEl.querySelector(`#${t.id}`);
          slider.value = p[t.key];
          slider.dispatchEvent(new Event('input'));
        });
        showToast(`Soundboard: ${chip.textContent}`);
      };
    });
  }

  function startAudio(silent = false) {
    if (!audioCtx) initWebAudio();
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    renderAudioDock();

    if (masterGain) {
      const volInput = audioDockEl?.querySelector('.lc-audio-dock-vol');
      const vol = volInput ? parseFloat(volInput.value) : 0.7;
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + 0.8);
    }

    isAudioPlaying = true;
    try {
      localStorage.setItem('lc-audio', 'active');
    } catch(e) {}

    updateAudioUI();
    if (audioDockEl) audioDockEl.classList.add('is-visible');
    if (!silent) showToast('🌧️ Gothic Sound Sanctuary: Active');
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
    if (audioDockEl) audioDockEl.classList.remove('is-visible');
    if (!silent) showToast('Sound Sanctuary: Paused');
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
     Divination cards drawing from the canon
     ───────────────────────────────────────────────────────────── */
  let oracleModalEl = null;
  let allInscriptions = [];
  let isOracleLoading = false;

  const FALLBACK_INSCRIPTIONS = [
    {
      title: 'Carmilla',
      section: 'poetry',
      url: '/poetry/carmilla/',
      quote: 'And through the marble colonnade, the velvet dark consumes the shade; Where love and thirst are one and deep, we wake while dying angels sleep.'
    },
    {
      title: 'The Catacomb Litany',
      section: 'poetry',
      url: '/poetry/the-catacomb-litany/',
      quote: 'Beneath the vaulted stone we keep the solemn vigil of our grief; No sun shall pierce this holy deep, nor autumn wind shake down a leaf.'
    },
    {
      title: 'Mircalla',
      section: 'poetry',
      url: '/poetry/mircalla/',
      quote: 'In moonlight pale and shadows thin, she whispered of the ancient sin; The portrait smiles upon the wall, as empire and cathedral fall.'
    },
    {
      title: 'On the Gothic Sublime',
      section: 'review',
      url: '/review/gothic-sublime/',
      quote: 'Terror is not the destruction of thought, but its darkest expansion. It is the moment when the mind recognizes the vastness of its own haunted architecture.'
    }
  ];

  async function loadOracleData() {
    if (allInscriptions.length > 0 || isOracleLoading) return;
    isOracleLoading = true;
    try {
      const res = await fetch('/index.json');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          allInscriptions = data.map(item => ({
            title: item.title,
            section: item.section || 'poetry',
            url: item.permalink || item.relpermalink,
            summary: item.summary,
            content: item.content,
            tags: item.tags || []
          }));
        }
      }
    } catch(e) {
      console.warn('Oracle index fallback', e);
    } finally {
      if (allInscriptions.length === 0) allInscriptions = FALLBACK_INSCRIPTIONS;
      isOracleLoading = false;
    }
  }

  function renderOracleModal() {
    if (oracleModalEl) return;
    oracleModalEl = document.createElement('div');
    oracleModalEl.className = 'lc-oracle-backdrop';
    oracleModalEl.innerHTML = `
      <div class="lc-oracle-modal" role="dialog" aria-modal="true" aria-label="Inscription Oracle">
        <button class="lc-oracle-close" type="button" aria-label="Close Oracle">&times;</button>
        
        <div class="lc-oracle-card" id="oracle-card-frame">
          <div class="lc-oracle-card-border"></div>
          <div class="lc-oracle-header">
            <span class="lc-oracle-sigil">✦ ARCANUM LITERARIUM ✦</span>
            <span class="lc-oracle-arcana" id="oracle-arcana-num">NOCTURNE VII</span>
          </div>

          <div class="lc-oracle-body">
            <div class="lc-oracle-fleuron">❦</div>
            <blockquote class="lc-oracle-quote" id="oracle-quote-text">
              "Through the marble colonnade, the velvet dark consumes the shade..."
            </blockquote>
            <div class="lc-oracle-citation">
              <span class="lc-oracle-work" id="oracle-work-title">Carmilla</span>
              <span class="lc-oracle-author">— Emrecan Koç</span>
            </div>
          </div>

          <div class="lc-oracle-actions">
            <button class="lc-oracle-btn lc-oracle-draw-btn" id="oracle-draw-btn" type="button">
              <span>Draw Inscription ↺</span>
            </button>
            <a class="lc-oracle-btn lc-oracle-read-btn" id="oracle-read-btn" href="#">
              <span>Contemplate Piece &rarr;</span>
            </a>
            <button class="lc-oracle-btn lc-oracle-copy-btn" id="oracle-copy-btn" type="button" title="Copy with Citation">
              <span>Copy ❦</span>
            </button>
          </div>
        </div>

        <div class="lc-oracle-hint">
          <span>Press <kbd>Space</kbd> or <kbd>↵</kbd> to draw another &bull; <kbd>ESC</kbd> to dismiss</span>
        </div>
      </div>
    `;

    document.body.appendChild(oracleModalEl);

    const closeBtn = oracleModalEl.querySelector('.lc-oracle-close');
    const drawBtn = oracleModalEl.querySelector('#oracle-draw-btn');
    const readBtn = oracleModalEl.querySelector('#oracle-read-btn');
    const copyBtn = oracleModalEl.querySelector('#oracle-copy-btn');

    oracleModalEl.addEventListener('click', e => {
      if (e.target === oracleModalEl) closeOracle();
    });

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
      const citation = `> ${quote}\n\n— Emrecan Koç, *${work}* (${window.location.origin}${url})`;
      navigator.clipboard.writeText(citation).then(() => {
        showToast('✦ Oracle inscription clipped with citation!');
      });
    };
  }

  const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];

  function drawOracleCard() {
    if (allInscriptions.length === 0) return;
    const cardFrame = oracleModalEl.querySelector('#oracle-card-frame');
    cardFrame.classList.add('is-flipping');

    setTimeout(() => {
      const item = allInscriptions[Math.floor(Math.random() * allInscriptions.length)];
      const quoteEl = oracleModalEl.querySelector('#oracle-quote-text');
      const workEl = oracleModalEl.querySelector('#oracle-work-title');
      const readBtn = oracleModalEl.querySelector('#oracle-read-btn');
      const arcanaNum = oracleModalEl.querySelector('#oracle-arcana-num');

      // Extract a striking 2-4 line excerpt from content or summary
      let text = item.quote || item.summary || item.content || '';
      if (item.content && item.content.length > 80) {
        const sentences = item.content.split(/[.\n]/).filter(s => s.trim().length > 25);
        if (sentences.length > 0) {
          text = sentences.slice(0, 2).join('. ').trim() + '.';
        }
      }

      const roman = ROMAN_NUMERALS[Math.floor(Math.random() * ROMAN_NUMERALS.length)];
      arcanaNum.textContent = `ARCANUM ${roman} • ${(item.section || 'POETRY').toUpperCase()}`;
      quoteEl.textContent = `"${text.replace(/^["']|["']$/g, '')}"`;
      workEl.textContent = item.title;
      readBtn.setAttribute('href', item.url || '#');

      cardFrame.classList.remove('is-flipping');
    }, 180);
  }

  async function openOracle() {
    renderOracleModal();
    await loadOracleData();
    drawOracleCard();
    oracleModalEl.classList.add('is-open');
  }

  function closeOracle() {
    if (oracleModalEl) oracleModalEl.classList.remove('is-open');
  }

  /* ─────────────────────────────────────────────────────────────
     4. THEMATIC CONSTELLATION GRAPH ENGINE (Canvas Physics)
     Interactive force-directed node graph in /archives/
     ───────────────────────────────────────────────────────────── */
  let constellationAnimId = null;

  function initConstellationGraph() {
    const canvas = document.getElementById('lc-constellation-canvas');
    const wrapper = document.getElementById('constellation-wrapper');
    if (!canvas || !wrapper) return;

    if (constellationAnimId) {
      cancelAnimationFrame(constellationAnimId);
      constellationAnimId = null;
    }

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = wrapper.clientWidth);
    let height = (canvas.height = Math.min(520, window.innerHeight * 0.65));

    function handleResize() {
      if (!wrapper || !canvas) return;
      width = canvas.width = wrapper.clientWidth;
      height = canvas.height = Math.min(520, window.innerHeight * 0.65);
    }
    window.addEventListener('resize', handleResize);

    // Central Motif Hubs
    const MOTIF_HUBS = [
      { id: 'm-gothic', label: 'Gothic Romanticism', type: 'theme', x: width * 0.35, y: height * 0.38, radius: 16, color: '#c084fc' },
      { id: 'm-carmilla', label: 'Vampirism & Carmilla', type: 'theme', x: width * 0.65, y: height * 0.35, radius: 16, color: '#ff1744' },
      { id: 'm-sublime', label: 'The Sublime & Ruin', type: 'theme', x: width * 0.25, y: height * 0.65, radius: 15, color: '#fbbf24' },
      { id: 'm-criticism', label: 'Dramatic Theory', type: 'theme', x: width * 0.75, y: height * 0.65, radius: 15, color: '#38bdf8' },
      { id: 'm-cinema', label: 'Cinema & Shadows', type: 'theme', x: width * 0.50, y: height * 0.75, radius: 14, color: '#e879f9' }
    ];

    let nodes = [...MOTIF_HUBS];
    let links = [];

    // Populate article nodes from loaded search index or fallback
    const items = allInscriptions.length > 0 ? allInscriptions : FALLBACK_INSCRIPTIONS;
    items.slice(0, 32).forEach((item, idx) => {
      const isPoetry = item.section === 'poetry';
      const angle = (idx / 32) * Math.PI * 2;
      const dist = 110 + Math.random() * 110;
      const hubIdx = idx % MOTIF_HUBS.length;
      const hub = MOTIF_HUBS[hubIdx];

      const node = {
        id: `art-${idx}`,
        label: item.title,
        type: item.section || 'poetry',
        url: item.url,
        summary: item.summary || item.content || 'A gothic piece in contemplation.',
        x: hub.x + Math.cos(angle) * dist,
        y: hub.y + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: isPoetry ? 7 : 8,
        color: isPoetry ? '#aa75f8' : (item.section === 'review' ? '#38bdf8' : '#fbbf24')
      };

      nodes.push(node);
      links.push({ source: node, target: hub });

      // Cross-link some nodes
      if (Math.random() < 0.25) {
        const otherHub = MOTIF_HUBS[(hubIdx + 1) % MOTIF_HUBS.length];
        links.push({ source: node, target: otherHub });
      }
    });

    let activeFilter = 'all';
    let hoveredNode = null;
    let draggedNode = null;
    let mouse = { x: -1000, y: -1000 };

    // Tooltip card elements
    const card = document.getElementById('constellation-card');
    const nodeType = document.getElementById('node-type');
    const nodeTitle = document.getElementById('node-title');
    const nodeDesc = document.getElementById('node-desc');
    const nodeLink = document.getElementById('node-link');
    const nodeClose = document.getElementById('node-close');

    if (nodeClose && card) {
      nodeClose.onclick = () => card.classList.remove('is-visible');
    }

    if (nodeLink) {
      nodeLink.onclick = e => {
        const url = nodeLink.getAttribute('href');
        if (url && url !== '#') {
          e.preventDefault();
          navigateTo(url, true);
        }
      };
    }

    // Filter Pills
    const filterBtns = wrapper.querySelectorAll('[data-graph-filter]');
    filterBtns.forEach(b => {
      b.onclick = () => {
        filterBtns.forEach(el => el.classList.remove('is-active'));
        b.classList.add('is-active');
        activeFilter = b.getAttribute('data-graph-filter');
      };
    });

    const resetBtn = wrapper.querySelector('.lc-constellation-reset');
    if (resetBtn) {
      resetBtn.onclick = () => {
        nodes.forEach(n => {
          n.vx = (Math.random() - 0.5) * 4;
          n.vy = (Math.random() - 0.5) * 4;
        });
      };
    }

    function getNodeAt(x, y) {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        const dx = n.x - x;
        const dy = n.y - y;
        if (dx * dx + dy * dy < (n.radius + 6) * (n.radius + 6)) {
          return n;
        }
      }
      return null;
    }

    canvas.onmousemove = e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      if (!draggedNode) {
        hoveredNode = getNodeAt(mouse.x, mouse.y);
        canvas.style.cursor = hoveredNode ? 'pointer' : 'crosshair';
      }
    };

    canvas.onmouseleave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      hoveredNode = null;
    };

    canvas.onmousedown = e => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const target = getNodeAt(clickX, clickY);

      if (target) {
        draggedNode = target;
        selectNode(target);
      }
    };

    window.onmouseup = () => {
      draggedNode = null;
    };

    // Touch support for phones
    canvas.ontouchstart = e => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const tx = touch.clientX - rect.left;
      const ty = touch.clientY - rect.top;
      const target = getNodeAt(tx, ty);
      if (target) {
        draggedNode = target;
        selectNode(target);
      }
    };

    canvas.ontouchmove = e => {
      if (draggedNode && e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        draggedNode.x = touch.clientX - rect.left;
        draggedNode.y = touch.clientY - rect.top;
      }
    };

    canvas.ontouchend = () => {
      draggedNode = null;
    };

    function selectNode(n) {
      if (!card) return;
      nodeType.textContent = (n.type || 'NODE').toUpperCase();
      nodeTitle.textContent = n.label;
      nodeDesc.textContent = n.summary || (n.type === 'theme' ? 'Core motif cluster across Literaconite writings.' : '');
      if (n.url) {
        nodeLink.style.display = 'inline-block';
        nodeLink.setAttribute('href', n.url);
      } else {
        nodeLink.style.display = 'none';
      }
      card.classList.add('is-visible');
    }

    // Force Simulation Loop
    function updatePhysics() {
      // Repulsion between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distSq = dx * dx + dy * dy || 1;
          if (distSq < 22000) {
            const force = 180 / distSq;
            const fx = (dx / Math.sqrt(distSq)) * force;
            const fy = (dy / Math.sqrt(distSq)) * force;
            a.vx -= fx;
            a.vy -= fy;
            b.vx += fx;
            b.vy += fy;
          }
        }
      }

      // Spring attraction along links
      links.forEach(l => {
        const dx = l.target.x - l.source.x;
        const dy = l.target.y - l.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = l.target.type === 'theme' ? 85 : 120;
        const force = (dist - targetDist) * 0.0035;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        l.source.vx += fx;
        l.source.vy += fy;
        l.target.vx -= fx * 0.5;
        l.target.vy -= fy * 0.5;
      });

      // Damping & Bounds
      nodes.forEach(n => {
        if (n === draggedNode) {
          n.x = mouse.x;
          n.y = mouse.y;
          n.vx = 0;
          n.vy = 0;
          return;
        }

        // Center gravity
        n.vx += (width / 2 - n.x) * 0.0004;
        n.vy += (height / 2 - n.y) * 0.0004;

        n.vx *= 0.88;
        n.vy *= 0.88;
        n.x += n.vx;
        n.y += n.vy;

        // Keep inside canvas
        n.x = Math.max(n.radius + 10, Math.min(width - n.radius - 10, n.x));
        n.y = Math.max(n.radius + 10, Math.min(height - n.radius - 10, n.y));
      });
    }

    function renderCanvas() {
      ctx.clearRect(0, 0, width, height);

      // Draw Constellation Lines
      links.forEach(l => {
        const isSrcActive = activeFilter === 'all' || l.source.type === activeFilter;
        const isTgtActive = activeFilter === 'all' || l.target.type === activeFilter;
        const isHoveredLink = hoveredNode && (l.source === hoveredNode || l.target === hoveredNode);

        if (!isSrcActive && !isTgtActive && !isHoveredLink) return;

        ctx.beginPath();
        ctx.moveTo(l.source.x, l.source.y);
        ctx.lineTo(l.target.x, l.target.y);

        if (isHoveredLink) {
          ctx.strokeStyle = '#ff1744';
          ctx.lineWidth = 1.8;
          ctx.shadowColor = 'rgba(255, 23, 68, 0.7)';
          ctx.shadowBlur = 8;
        } else {
          ctx.strokeStyle = 'rgba(168, 105, 255, 0.15)';
          ctx.lineWidth = 0.8;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
      });
      ctx.shadowBlur = 0;

      // Draw Nodes
      nodes.forEach(n => {
        const isActive = activeFilter === 'all' || n.type === activeFilter;
        const isHovered = n === hoveredNode;
        const alpha = isActive || isHovered ? 1 : 0.18;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Outer glow
        if (n.type === 'theme' || isHovered) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 6, 0, Math.PI * 2);
          ctx.fillStyle = n.color || '#a855f7';
          ctx.globalAlpha = isHovered ? 0.4 : 0.15;
          ctx.fill();
          ctx.globalAlpha = alpha;
        }

        // Star body
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color || '#aa75f8';
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = isHovered ? 2.5 : 1.2;
        ctx.stroke();

        // Node Label
        if (n.type === 'theme' || isHovered || width > 600) {
          ctx.font = n.type === 'theme' ? '600 11px Cinzel, serif' : '400 10px Inter, sans-serif';
          ctx.fillStyle = isHovered ? '#ffffff' : (n.type === 'theme' ? '#fde68a' : '#b5a2cf');
          ctx.textAlign = 'center';
          ctx.fillText(n.label, n.x, n.y + n.radius + 14);
        }

        ctx.restore();
      });

      updatePhysics();
      constellationAnimId = requestAnimationFrame(renderCanvas);
    }

    renderCanvas();
  }

  /* ─────────────────────────────────────────────────────────────
     5. BULLETPROOF CAPTURE-PHASE PJAX NAVIGATION
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

    // Keep audio active
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

      // Update Document Title
      if (newDoc.title) document.title = newDoc.title;

      // Update Body Classes
      if (newDoc.body) document.body.className = newDoc.body.className;

      // Swap Main Container
      const newMain = newDoc.querySelector('.lc-container');
      if (mainContainer && newMain) {
        mainContainer.innerHTML = newMain.innerHTML;
      }

      // Update History State
      if (pushHistory) {
        window.history.pushState({ url }, '', url);
      }

      // Update Active Navigation Links in Header
      updateNavLinks();

      // Scroll to top
      window.scrollTo(0, 0);

      // Re-initialize dynamic page interactive components
      initReadingProgress();
      initVerseFocus();
      initStreamFilter();
      initConstellationGraph();

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
    // CAPTURE PHASE LISTENER
    document.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = e.target.closest('a');
      if (!link) return;

      const rawHref = link.getAttribute('href');
      if (!rawHref) return;

      // Ignore external, mailto, tel, hash anchors, javascript, target="_blank"
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
     6. TOAST NOTIFICATIONS
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
     7. COMMAND PALETTE (Cmd+K / Ctrl+K / /)
     ───────────────────────────────────────────────────────────── */
  let paletteEl = null;
  let searchIndex = [];
  let isIndexLoaded = false;

  const STATIC_COMMANDS = [
    { title: 'Frontispiece', subtitle: 'Return to front page', url: '/', icon: '✦' },
    { title: 'The Inscription Oracle', subtitle: 'Consult Tarot bibliomancy (⌘O)', action: 'oracle', icon: '🔮' },
    { title: 'Soundboard Mixer', subtitle: 'Rain, fire, wind & bells audio', action: 'audio', icon: '🎛️' },
    { title: 'Thematic Constellation', subtitle: 'Interactive motif & archives map', url: '/archives/', icon: '🕸️' },
    { title: 'Poetry & Verse', subtitle: 'Original Gothic and Romantic verse', url: '/poetry/', icon: '📜' },
    { title: 'Criticism & Close Readings', subtitle: 'Dramatic essays and literary theory', url: '/review/', icon: '🖋️' },
    { title: 'Chronological Archive', subtitle: 'Full ledger of all writings', url: '/archives/', icon: '📂' },
    { title: 'Fragments & Miscellaneous', subtitle: 'Scraps, fragments, and art', url: '/miscellaneous/', icon: '✨' },
    { title: 'Atmosphere: Toggle Theme', subtitle: 'Switch Midnight / Candlelight / Crimson', action: 'theme', icon: '🕯️' },
    { title: 'Toll Abbey Bell', subtitle: 'Strike distant bell chime', action: 'toll', icon: '🔔' },
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

    paletteEl.addEventListener('click', e => {
      if (e.target === paletteEl) closePalette();
    });

    input.addEventListener('input', () => {
      filterPaletteResults(input.value.trim(), resultsContainer);
    });

    input.addEventListener('keydown', e => {
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
    });
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
      container.innerHTML = `<div class="lc-palette-empty">No inscriptions found for "${query}"</div>`;
      return;
    }

    filtered.slice(0, 10).forEach((item, index) => {
      const row = document.createElement('div');
      row.className = `lc-palette-item ${index === 0 ? 'is-active' : ''}`;
      row.innerHTML = `
        <span class="lc-palette-item-icon">${item.icon || '✦'}</span>
        <div class="lc-palette-item-text">
          <div class="lc-palette-item-title">${item.title}</div>
          <div class="lc-palette-item-sub">${item.subtitle || ''}</div>
        </div>
        <span class="lc-palette-item-enter">↵</span>
      `;

      row.addEventListener('click', () => {
        closePalette();
        if (item.action === 'theme') {
          cycleTheme();
        } else if (item.action === 'audio') {
          toggleAudio();
        } else if (item.action === 'oracle') {
          openOracle();
        } else if (item.action === 'toll') {
          tollAbbeyBell();
        } else if (item.url) {
          if (item.external) {
            window.open(item.url, '_blank', 'noopener');
          } else {
            navigateTo(item.url, true);
          }
        }
      });

      row.addEventListener('mouseenter', () => {
        container.querySelectorAll('.lc-palette-item').forEach(el => el.classList.remove('is-active'));
        row.classList.add('is-active');
      });

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

  // Keyboard Shortcuts (⌘K search, ⌘O oracle, / quick open, Esc)
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
     8. VERSE FOCUS & STANZA INTERACTION
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
          showToast(`Stanza ${idx + 1} locked in contemplation`);
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
     9. GOTHIC EXCERPT & CITATION TOOLTIP
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
    btn.addEventListener('click', () => {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      if (!text) return;

      const pageTitle = document.title.split('|')[0].trim() || 'Literaconite';
      const url = window.location.href;
      const citation = `> "${text}"\n\n— Emrecan Koç, *${pageTitle}* (${url})`;

      navigator.clipboard.writeText(citation).then(() => {
        showToast('✦ Quote clipped with citation!');
        quoteTooltip.classList.remove('is-visible');
        window.getSelection().removeAllRanges();
      });
    });

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
     10. READING PROGRESS BAR
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
     11. HOMEPAGE STREAM FILTER
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
        if (filter === 'all' || card.classList.contains(`lc-card-${filter}`)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    };
  }

  /* ─────────────────────────────────────────────────────────────
     12. DOM INITIALIZATION
     ───────────────────────────────────────────────────────────── */
  function init() {
    applyTheme(getStoredTheme());
    updateAudioUI();
    checkAutoResumeAudio();

    document.querySelectorAll('.lc-theme-btn').forEach(btn => {
      btn.onclick = e => {
        e.preventDefault();
        cycleTheme();
      };
    });

    document.querySelectorAll('.lc-palette-trigger').forEach(btn => {
      btn.onclick = e => {
        e.preventDefault();
        openPalette();
      };
    });

    document.querySelectorAll('.lc-oracle-trigger').forEach(btn => {
      btn.onclick = e => {
        e.preventDefault();
        openOracle();
      };
    });

    document.querySelectorAll('.lc-audio-btn').forEach(btn => {
      btn.onclick = e => {
        e.preventDefault();
        toggleAudio();
      };
    });

    initReadingProgress();
    initQuoteTooltip();
    initVerseFocus();
    initStreamFilter();
    initConstellationGraph();
    initPjax();
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
    tollAbbeyBell,
    openPalette,
    closePalette,
    openOracle,
    closeOracle,
    showToast,
    navigateTo
  };
})();
