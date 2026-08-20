/**
 * LITERACONITE CORE INTERACTIVE SYSTEM & GOTHIC SANCTUARY
 * Pure Vanilla JavaScript — High Performance, Zero Dependencies, Seamless PJAX
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
     2. GOTHIC PROCEDURAL SOUND SANCTUARY (Web Audio API)
     4-Track Atmospheric Soundscape: Rain, Fire, Wind, Bells
     ───────────────────────────────────────────────────────────── */
  let audioCtx = window.__lc_audioCtx || null;
  let isAudioPlaying = false;
  let masterGain = null;
  let rainGain = null, fireGain = null, windGain = null, bellsGain = null;
  let bellTimer = null;
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

      // ── 1. RAIN CHANNEL ──
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
      rainFilter.frequency.setValueAtTime(860, audioCtx.currentTime);

      rainGain = audioCtx.createGain();
      rainGain.gain.setValueAtTime(SOUND_STATES.rain ? 0.32 : 0.0001, audioCtx.currentTime);

      rainSrc.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(masterGain);
      rainSrc.start(0);

      // ── 2. FIREPLACE CHANNEL (Warm log rumble + crackle pops) ──
      const fireBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 4, audioCtx.sampleRate);
      const fireData = fireBuffer.getChannelData(0);
      let fLast = 0.0;
      for (let i = 0; i < fireBuffer.length; i++) {
        const white = Math.random() * 2 - 1;
        fLast = (fLast + (0.015 * white)) / 1.015;
        // Periodic audible ember snap
        const pop = (Math.random() < 0.0012) ? (Math.random() * 2 - 1) * 3.6 : 0;
        fireData[i] = (fLast * 3.0) + pop;
      }
      const fireSrc = audioCtx.createBufferSource();
      fireSrc.buffer = fireBuffer;
      fireSrc.loop = true;

      const fireFilter = audioCtx.createBiquadFilter();
      fireFilter.type = 'bandpass';
      fireFilter.frequency.setValueAtTime(550, audioCtx.currentTime);
      fireFilter.Q.setValueAtTime(1.0, audioCtx.currentTime);

      fireGain = audioCtx.createGain();
      fireGain.gain.setValueAtTime(SOUND_STATES.fire ? 0.35 : 0.0001, audioCtx.currentTime);

      fireSrc.connect(fireFilter);
      fireFilter.connect(fireGain);
      fireGain.connect(masterGain);
      fireSrc.start(0);

      // ── 3. CATHEDRAL WIND CHANNEL (LFO Filter + 55Hz Sub Drone) ──
      const windBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 4, audioCtx.sampleRate);
      const windData = windBuffer.getChannelData(0);
      for (let i = 0; i < windBuffer.length; i++) {
        windData[i] = (Math.random() * 2 - 1) * 1.1;
      }
      const windSrc = audioCtx.createBufferSource();
      windSrc.buffer = windBuffer;
      windSrc.loop = true;

      const windFilter = audioCtx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.setValueAtTime(360, audioCtx.currentTime);
      windFilter.Q.setValueAtTime(3.0, audioCtx.currentTime);

      const windLfo = audioCtx.createOscillator();
      windLfo.frequency.setValueAtTime(0.09, audioCtx.currentTime);
      const windLfoGain = audioCtx.createGain();
      windLfoGain.gain.setValueAtTime(280, audioCtx.currentTime);
      windLfo.connect(windLfoGain);
      windLfoGain.connect(windFilter.frequency);
      windLfo.start(0);

      const droneOsc = audioCtx.createOscillator();
      droneOsc.frequency.setValueAtTime(55, audioCtx.currentTime);
      const droneGain = audioCtx.createGain();
      droneGain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      droneOsc.connect(droneGain);
      droneOsc.start(0);

      windGain = audioCtx.createGain();
      windGain.gain.setValueAtTime(SOUND_STATES.wind ? 0.32 : 0.0001, audioCtx.currentTime);

      windSrc.connect(windFilter);
      windFilter.connect(windGain);
      droneGain.connect(windGain);
      windGain.connect(masterGain);
      windSrc.start(0);

      // ── 4. ABBEY BELLS CHANNEL ──
      bellsGain = audioCtx.createGain();
      bellsGain.gain.setValueAtTime(1.0, audioCtx.currentTime);
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
      const gains = [0.30, 0.16, 0.09, 0.045];

      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(gains[idx], now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 5.2);
        osc.connect(g);
        g.connect(bellsGain);
        osc.start(now);
        osc.stop(now + 5.3);
      });
      showToast('🔔 Abbey Bell tolled in the night');
    } catch(e) {}
  }

  function scheduleBellToll() {
    clearTimeout(bellTimer);
    bellTimer = setTimeout(() => {
      if (isAudioPlaying && SOUND_STATES.bells) {
        tollAbbeyBell();
      }
      scheduleBellToll();
    }, 45000 + Math.random() * 25000);
  }

  function toggleSoundTrack(soundKey) {
    if (!isAudioPlaying) startAudio(true);
    SOUND_STATES[soundKey] = !SOUND_STATES[soundKey];

    const targetGain = SOUND_STATES[soundKey] ? (soundKey === 'fire' ? 0.35 : 0.32) : 0.0001;

    if (audioCtx) {
      const now = audioCtx.currentTime;
      if (soundKey === 'rain' && rainGain) {
        rainGain.gain.cancelScheduledValues(now);
        rainGain.gain.setValueAtTime(rainGain.gain.value, now);
        rainGain.gain.linearRampToValueAtTime(targetGain, now + 0.5);
      } else if (soundKey === 'fire' && fireGain) {
        fireGain.gain.cancelScheduledValues(now);
        fireGain.gain.setValueAtTime(fireGain.gain.value, now);
        fireGain.gain.linearRampToValueAtTime(targetGain, now + 0.5);
      } else if (soundKey === 'wind' && windGain) {
        windGain.gain.cancelScheduledValues(now);
        windGain.gain.setValueAtTime(windGain.gain.value, now);
        windGain.gain.linearRampToValueAtTime(targetGain, now + 0.5);
      } else if (soundKey === 'bells') {
        if (SOUND_STATES.bells) tollAbbeyBell();
      }
    }

    updateSoundPills();
    const names = { rain: 'Rain', fire: 'Fireplace', wind: 'Cathedral Wind', bells: 'Abbey Bells' };
    showToast(`${names[soundKey]}: ${SOUND_STATES[soundKey] ? 'On' : 'Off'}`);
  }

  function updateSoundPills() {
    if (!audioDockEl) return;
    audioDockEl.querySelectorAll('.lc-sound-chip').forEach(chip => {
      const sound = chip.getAttribute('data-sound');
      chip.classList.toggle('is-active', !!SOUND_STATES[sound]);
    });
  }

  function renderAudioDock() {
    if (audioDockEl) return;
    audioDockEl = document.createElement('div');
    audioDockEl.className = 'lc-audio-dock';
    audioDockEl.id = 'lc-audio-dock';
    audioDockEl.innerHTML = `
      <div class="lc-audio-capsule">
        <div class="lc-audio-status">
          <span class="lc-audio-glow-dot"></span>
          <span class="lc-audio-status-label">Sanctuary</span>
        </div>

        <div class="lc-sound-toggles">
          <button class="lc-sound-chip ${SOUND_STATES.rain ? 'is-active' : ''}" data-sound="rain" type="button" title="Toggle Rainfall">
            <span>🌧️ Rain</span>
          </button>
          <button class="lc-sound-chip ${SOUND_STATES.fire ? 'is-active' : ''}" data-sound="fire" type="button" title="Toggle Fireplace Embers">
            <span>🔥 Fire</span>
          </button>
          <button class="lc-sound-chip ${SOUND_STATES.wind ? 'is-active' : ''}" data-sound="wind" type="button" title="Toggle Cathedral Wind">
            <span>🌬️ Wind</span>
          </button>
          <button class="lc-sound-chip ${SOUND_STATES.bells ? 'is-active' : ''}" data-sound="bells" type="button" title="Strike / Toggle Abbey Bells">
            <span>🔔 Bells</span>
          </button>
        </div>

        <div class="lc-audio-slider-wrap">
          <input type="range" class="lc-audio-dock-vol" id="lc-master-vol" min="0" max="1" step="0.05" value="0.7" title="Master Volume">
        </div>

        <button class="lc-dock-close" type="button" title="Close soundscape">&times;</button>
      </div>
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
    updateSoundPills();
    if (audioDockEl) audioDockEl.classList.add('is-visible');
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
    if (audioDockEl) audioDockEl.classList.remove('is-visible');
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
    oracleModalEl.innerHTML = `
      <div class="lc-oracle-modal-box" role="dialog" aria-modal="true" aria-label="Inscription Oracle">
        <button class="lc-oracle-close" type="button" aria-label="Close Oracle">&times;</button>
        
        <div class="lc-oracle-tarot-card" id="oracle-tarot-card">
          <div class="lc-oracle-card-frame"></div>
          
          <div class="lc-oracle-card-header">
            <span class="lc-oracle-sigil">✦ ARCANUM LITERARIUM ✦</span>
            <span class="lc-oracle-arcana" id="oracle-arcana-num">NOCTURNE VII</span>
          </div>

          <div class="lc-oracle-card-body">
            <div class="lc-oracle-fleuron">❦</div>
            <blockquote class="lc-oracle-quote" id="oracle-quote-text">
              "And through the marble colonnade, the velvet dark consumes the shade..."
            </blockquote>
            <div class="lc-oracle-citation">
              <span class="lc-oracle-work" id="oracle-work-title">Carmilla</span>
              <span class="lc-oracle-author">— Emrecan Koç</span>
            </div>
          </div>

          <div class="lc-oracle-card-actions">
            <button class="lc-oracle-act-btn lc-oracle-draw-btn" id="oracle-draw-btn" type="button">
              <span>Draw Inscription ↺</span>
            </button>
            <a class="lc-oracle-act-btn lc-oracle-read-btn" id="oracle-read-btn" href="#">
              <span>Contemplate Piece &rarr;</span>
            </a>
            <button class="lc-oracle-act-btn lc-oracle-copy-btn" id="oracle-copy-btn" type="button" title="Copy Inscription">
              <span>Copy ❦</span>
            </button>
          </div>
        </div>

        <div class="lc-oracle-hint">
          <span>Press <kbd>Space</kbd> or <kbd>↵</kbd> to draw another &bull; <kbd>ESC</kbd> to exit</span>
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
      const citation = `> ${quote}\n\n— Emrecan Koç, *${work}* (${window.location.origin}${url})`;
      navigator.clipboard.writeText(citation).then(() => {
        showToast('✦ Inscription clipped with citation!');
      });
    };
  }

  function drawOracleCard() {
    if (!oracleModalEl) return;
    const cardEl = oracleModalEl.querySelector('#oracle-tarot-card');
    cardEl.classList.add('is-flipping');

    setTimeout(() => {
      const item = CANON_INSCRIPTIONS[Math.floor(Math.random() * CANON_INSCRIPTIONS.length)];
      const quoteEl = oracleModalEl.querySelector('#oracle-quote-text');
      const workEl = oracleModalEl.querySelector('#oracle-work-title');
      const readBtn = oracleModalEl.querySelector('#oracle-read-btn');
      const arcanaNum = oracleModalEl.querySelector('#oracle-arcana-num');

      const roman = ARCANA_NUMERALS[Math.floor(Math.random() * ARCANA_NUMERALS.length)];
      arcanaNum.textContent = `ARCANUM ${roman} • ${item.section.toUpperCase()}`;
      quoteEl.textContent = `"${item.quote}"`;
      workEl.textContent = item.title;
      readBtn.setAttribute('href', item.url);

      cardEl.classList.remove('is-flipping');
    }, 160);
  }

  function openOracle() {
    renderOracleModal();
    drawOracleCard();
    oracleModalEl.classList.add('is-open');
  }

  function closeOracle() {
    if (oracleModalEl) oracleModalEl.classList.remove('is-open');
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

      // Update Title & Body Class
      if (newDoc.title) document.title = newDoc.title;
      if (newDoc.body) document.body.className = newDoc.body.className;

      // Swap Main Container
      const newMain = newDoc.querySelector('.lc-container');
      if (mainContainer && newMain) {
        mainContainer.innerHTML = newMain.innerHTML;
      }

      // Update URL
      if (pushHistory) {
        window.history.pushState({ url }, '', url);
      }

      updateNavLinks();
      window.scrollTo(0, 0);

      // Re-init in-page interactives
      initReadingProgress();
      initVerseFocus();
      initStreamFilter();

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
      // Direct action buttons
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

      // Link navigation
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

      row.onclick = () => {
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
      const citation = `> "${text}"\n\n— Emrecan Koç, *${pageTitle}* (${url})`;

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
        if (filter === 'all' || card.classList.contains(`lc-card-${filter}`)) {
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
    showToast,
    navigateTo
  };
})();
