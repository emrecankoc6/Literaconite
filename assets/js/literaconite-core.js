/**
 * LITERACONITE — CORE INTERACTIVE ARCHITECTURE & SANCTUARY ENGINE
 * Pure Vanilla JavaScript — Zero Dependencies
 * Native Top-Layer Dialogs, View-Transition PJAX, Procedural Web Audio, Concordance Search
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
      const saved = localStorage.getItem('lc-theme');
      return THEMES.includes(saved) ? saved : 'midnight';
    } catch (e) {
      return 'midnight';
    }
  }

  function applyTheme(theme) {
    if (!THEMES.includes(theme)) theme = 'midnight';
    document.documentElement.setAttribute('data-theme', theme);
    if (document.body) document.body.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('lc-theme', theme);
    } catch (e) {}

    document.querySelectorAll('.lc-theme-btn').forEach(btn => {
      const label = btn.querySelector('.lc-theme-label');
      if (label) label.textContent = THEME_NAMES[theme] || 'Midnight';
    });
  }

  function cycleTheme() {
    const current = getStoredTheme();
    const nextTheme = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
    applyTheme(nextTheme);
    showToast('Atmosphere: ' + THEME_NAMES[nextTheme]);
    return nextTheme;
  }

  /* ─────────────────────────────────────────────────────────────
     2. NATIVE <dialog> LIGHT-DISMISS HELPER (Safari Fallback)
     ───────────────────────────────────────────────────────────── */
  function attachDialogLightDismiss(dialog) {
    if (!dialog) return;
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (isDialogContent) return;
        dialog.close();
      });
    }
  }

  function openModalDialog(dialog) {
    if (!dialog) return;
    if (!dialog.open) {
      dialog.showModal();
    }
  }

  function closeModalDialog(dialog) {
    if (dialog && dialog.open) {
      dialog.close();
    }
  }

  /* ─────────────────────────────────────────────────────────────
     3. GOTHIC PROCEDURAL SOUND SANCTUARY (Web Audio API)
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

  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtx = new AudioCtx();
        window.__lc_audioCtx = audioCtx;
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function getStoredAudioPref() {
    try {
      return localStorage.getItem('lc-audio') === 'active';
    } catch (e) {
      return false;
    }
  }

  let audioNodesReady = false;
  function initWebAudio() {
    const ctx = getAudioContext();
    if (!ctx || audioNodesReady) return;
    try {
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // 1. Continuous Rainfall
      const rainBuffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const rainData = rainBuffer.getChannelData(0);
      let rLast = 0.0;
      for (let i = 0; i < rainBuffer.length; i++) {
        const white = Math.random() * 2 - 1;
        rLast = (rLast + 0.02 * white) / 1.02;
        rainData[i] = rLast * 3.8;
      }
      const rainSrc = ctx.createBufferSource();
      rainSrc.buffer = rainBuffer;
      rainSrc.loop = true;

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(880, ctx.currentTime);

      rainGain = ctx.createGain();
      rainGain.gain.setValueAtTime(SOUND_STATES.rain ? 0.35 : 0.0001, ctx.currentTime);

      rainSrc.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(masterGain);
      rainSrc.start(0);

      // 2. Hearth Fireplace
      const fireBuffer = ctx.createBuffer(1, ctx.sampleRate * 5, ctx.sampleRate);
      const fireData = fireBuffer.getChannelData(0);
      let fRumble = 0.0;
      for (let i = 0; i < fireBuffer.length; i++) {
        const white = Math.random() * 2 - 1;
        fRumble = (fRumble + 0.015 * white) / 1.015;
        let sample = fRumble * 2.2;
        if (Math.random() < 0.0045) sample += (Math.random() * 2 - 1) * 3.5;
        if (Math.random() < 0.0005) sample += (Math.random() > 0.5 ? 1 : -1) * (5.5 + Math.random() * 3.5);
        fireData[i] = sample;
      }
      const fireSrc = ctx.createBufferSource();
      fireSrc.buffer = fireBuffer;
      fireSrc.loop = true;

      const fireFilter = ctx.createBiquadFilter();
      fireFilter.type = 'bandpass';
      fireFilter.frequency.setValueAtTime(1400, ctx.currentTime);
      fireFilter.Q.setValueAtTime(0.75, ctx.currentTime);

      fireGain = ctx.createGain();
      fireGain.gain.setValueAtTime(SOUND_STATES.fire ? 0.55 : 0.0001, ctx.currentTime);

      fireSrc.connect(fireFilter);
      fireFilter.connect(fireGain);
      fireGain.connect(masterGain);
      fireSrc.start(0);

      // 3. Cathedral Wind
      const windBuffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const windData = windBuffer.getChannelData(0);
      for (let i = 0; i < windBuffer.length; i++) {
        windData[i] = (Math.random() * 2 - 1) * 1.2;
      }
      const windSrc = ctx.createBufferSource();
      windSrc.buffer = windBuffer;
      windSrc.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.setValueAtTime(360, ctx.currentTime);
      windFilter.Q.setValueAtTime(3.2, ctx.currentTime);

      const windLfo = ctx.createOscillator();
      windLfo.frequency.setValueAtTime(0.08, ctx.currentTime);
      const windLfoGain = ctx.createGain();
      windLfoGain.gain.setValueAtTime(290, ctx.currentTime);
      windLfo.connect(windLfoGain);
      windLfoGain.connect(windFilter.frequency);
      windLfo.start(0);

      const droneOsc = ctx.createOscillator();
      droneOsc.frequency.setValueAtTime(55, ctx.currentTime);
      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.045, ctx.currentTime);
      droneOsc.connect(droneGain);
      droneOsc.start(0);

      windGain = ctx.createGain();
      windGain.gain.setValueAtTime(SOUND_STATES.wind ? 0.38 : 0.0001, ctx.currentTime);

      windSrc.connect(windFilter);
      windFilter.connect(windGain);
      droneGain.connect(windGain);
      windGain.connect(masterGain);
      windSrc.start(0);

      // 4. Abbey Bells
      bellsGain = ctx.createGain();
      bellsGain.gain.setValueAtTime(1.0, ctx.currentTime);
      bellsGain.connect(masterGain);

      audioNodesReady = true;
      startBellCycle();
    } catch (e) {
      console.warn('Web Audio init error', e);
    }
  }

  const BELL_FREQS = [
    [220, 442, 665, 1120],
    [277, 554, 831, 1386],
    [330, 660, 990, 1650]
  ];

  function tollAbbeyBell(freqIndex = 0) {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const dest = (isAudioPlaying && bellsGain) ? bellsGain : ctx.destination;
      const scale = (isAudioPlaying && bellsGain) ? 1.0 : 0.45;
      const now = ctx.currentTime;
      const fSet = BELL_FREQS[freqIndex % BELL_FREQS.length];
      const gains = [0.3, 0.18, 0.1, 0.05];

      fSet.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(gains[idx] * scale, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 4.8);
        osc.connect(g);
        g.connect(dest);
        osc.start(now);
        osc.stop(now + 4.9);
      });
    } catch (e) {}
  }

  let bellCycleIndex = 0;
  function startBellCycle() {
    if (bellInterval) clearInterval(bellInterval);
    bellInterval = setInterval(() => {
      if (isAudioPlaying && SOUND_STATES.bells) {
        tollAbbeyBell(bellCycleIndex++);
      }
    }, 14000);
  }

  function toggleSoundTrack(soundKey) {
    if (!isAudioPlaying) startAudio(true);
    SOUND_STATES[soundKey] = !SOUND_STATES[soundKey];

    const targetGains = { rain: 0.35, fire: 0.55, wind: 0.38, bells: 1.0 };

    if (audioCtx && audioNodesReady) {
      const now = audioCtx.currentTime;
      const gainVal = SOUND_STATES[soundKey] ? targetGains[soundKey] : 0.0001;

      if (soundKey === 'rain' && rainGain) {
        rainGain.gain.cancelScheduledValues(now);
        rainGain.gain.setValueAtTime(rainGain.gain.value, now);
        rainGain.gain.linearRampToValueAtTime(gainVal, now + 0.35);
      } else if (soundKey === 'fire' && fireGain) {
        fireGain.gain.cancelScheduledValues(now);
        fireGain.gain.setValueAtTime(fireGain.gain.value, now);
        fireGain.gain.linearRampToValueAtTime(gainVal, now + 0.35);
      } else if (soundKey === 'wind' && windGain) {
        windGain.gain.cancelScheduledValues(now);
        windGain.gain.setValueAtTime(windGain.gain.value, now);
        windGain.gain.linearRampToValueAtTime(gainVal, now + 0.35);
      } else if (soundKey === 'bells' && SOUND_STATES.bells) {
        tollAbbeyBell(bellCycleIndex++);
        showToast('Abbey Bells active');
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
      const active = !!SOUND_STATES[sound];
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function renderAudioDock() {
    if (audioDockEl) return;
    audioDockEl = document.createElement('aside');
    audioDockEl.className = 'lc-audio-dock';
    audioDockEl.id = 'lc-audio-dock';
    audioDockEl.setAttribute('aria-label', 'Ambient Soundscape Mixer');

    audioDockEl.innerHTML = `
      <div class="lc-audio-dock-brand">
        <span class="lc-audio-glow-dot" aria-hidden="true"></span>
        <span class="lc-audio-status-label">Sanctuary</span>
      </div>
      <div class="lc-sound-toggles">
        <button class="lc-sound-chip" data-sound="rain" type="button" aria-pressed="true" title="Toggle Rainfall">Rain</button>
        <button class="lc-sound-chip" data-sound="fire" type="button" aria-pressed="false" title="Toggle Hearth Fire">Fire</button>
        <button class="lc-sound-chip" data-sound="wind" type="button" aria-pressed="false" title="Toggle Cathedral Wind">Wind</button>
        <button class="lc-sound-chip" data-sound="bells" type="button" aria-pressed="false" title="Toggle Abbey Bells">Bells</button>
      </div>
      <input type="range" class="lc-audio-dock-vol" id="lc-master-vol" min="0" max="1" step="0.05" value="0.75" aria-label="Master Volume" title="Master Volume">
      <button class="lc-dock-close" type="button" aria-label="Pause soundscape" title="Pause soundscape">&times;</button>
    `;
    document.body.appendChild(audioDockEl);

    const masterSlider = audioDockEl.querySelector('#lc-master-vol');
    masterSlider.addEventListener('input', () => {
      if (masterGain && audioCtx && isAudioPlaying) {
        masterGain.gain.setTargetAtTime(parseFloat(masterSlider.value), audioCtx.currentTime, 0.05);
      }
    });

    audioDockEl.querySelector('.lc-dock-close').addEventListener('click', () => pauseAudio());

    audioDockEl.querySelectorAll('.lc-sound-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        toggleSoundTrack(chip.getAttribute('data-sound'));
      });
    });

    updateSoundPills();
  }

  function startAudio(silent = false) {
    initWebAudio();
    if (!audioCtx || !masterGain) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    renderAudioDock();

    const volInput = audioDockEl.querySelector('#lc-master-vol');
    const vol = volInput ? parseFloat(volInput.value) : 0.75;
    const now = audioCtx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(vol, now + 0.65);

    isAudioPlaying = true;
    try { localStorage.setItem('lc-audio', 'active'); } catch (e) {}

    updateAudioUI();
    updateSoundPills();
    audioDockEl.classList.add('is-visible');
    if (!silent) showToast('Gothic Sanctuary: Active');
  }

  function pauseAudio(silent = false) {
    if (!audioCtx || !isAudioPlaying) return;

    if (masterGain) {
      const now = audioCtx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(masterGain.gain.value, now);
      masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.45);
    }

    isAudioPlaying = false;
    try { localStorage.setItem('lc-audio', 'paused'); } catch (e) {}

    updateAudioUI();
    if (audioDockEl) audioDockEl.classList.remove('is-visible');
    if (!silent) showToast('Sanctuary: Paused');
  }

  function toggleAudio() {
    if (!isAudioPlaying) startAudio();
    else pauseAudio();
  }

  function updateAudioUI() {
    document.querySelectorAll('.lc-audio-btn').forEach(btn => {
      btn.classList.toggle('is-active', isAudioPlaying);
      btn.setAttribute('aria-pressed', isAudioPlaying ? 'true' : 'false');
      const label = btn.querySelector('.lc-audio-label');
      if (label) label.textContent = isAudioPlaying ? 'Rain On' : 'Rain';
    });
  }

  function checkAutoResumeAudio() {
    if (getStoredAudioPref() && !isAudioPlaying) {
      const resumeHandler = e => {
        if (e.target && e.target.closest && e.target.closest('[data-lc-action="audio"]')) {
          cleanup();
          return;
        }
        if (!isAudioPlaying && getStoredAudioPref()) {
          startAudio(true);
        }
        cleanup();
      };
      const cleanup = () => {
        document.removeEventListener('pointerdown', resumeHandler, true);
        document.removeEventListener('keydown', resumeHandler, true);
      };
      document.addEventListener('pointerdown', resumeHandler, { once: true, capture: true });
      document.addEventListener('keydown', resumeHandler, { once: true, capture: true });
    }
  }

  /* ─────────────────────────────────────────────────────────────
     4. THE INSCRIPTION ORACLE / BIBLIOMANCY (<dialog closedby="any">)
     ───────────────────────────────────────────────────────────── */
  let oracleDialog = null;

  const CANON_INSCRIPTIONS = [
    {
      title: 'Carmilla',
      section: 'Poetry',
      url: '/poetry/carmilla/',
      quote: 'And through the marble colonnade, the velvet dark consumes the shade; Where love and thirst are one and deep, we wake while dying angels sleep.'
    },
    {
      title: 'Mircalla',
      section: 'Poetry',
      url: '/poetry/mircalla/',
      quote: 'Come. Up from the loam-choked dark, you. My macabre. My muse of the red weeping. I summon, no. I bleed you into the room.'
    },
    {
      title: 'Kubla Khan (Reflection)',
      section: 'Poetry',
      url: '/poetry/kubla-khan-by-samuel-taylor-coleridge-a-translation-into-turkish-and-a-reflection/',
      quote: 'A savage place! as holy and enchanted as e’er beneath a waning moon was haunted by woman wailing for her demon-lover!'
    },
    {
      title: 'A Glimpse from the Adrasan Shore',
      section: 'Poetry',
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
  let lastOracleIdx = -1;

  function ensureOracleDialog() {
    if (oracleDialog) return;
    oracleDialog = document.createElement('dialog');
    oracleDialog.className = 'lc-dialog lc-oracle-dialog';
    oracleDialog.id = 'lc-oracle-dialog';
    oracleDialog.setAttribute('closedby', 'any');
    oracleDialog.setAttribute('aria-labelledby', 'oracle-dialog-title');

    oracleDialog.innerHTML = `
      <div class="lc-oracle-modal-box">
        <div class="lc-oracle-tarot-card" id="oracle-tarot-card">
          <div class="lc-oracle-card-frame" aria-hidden="true"></div>
          <button class="lc-oracle-close" type="button" aria-label="Close Oracle">&times;</button>

          <div class="lc-oracle-card-header">
            <h2 class="lc-oracle-sigil" id="oracle-dialog-title">✦ Arcanum Literarium ✦</h2>
            <span class="lc-oracle-arcana" id="oracle-arcana-num">Arcanum VII</span>
          </div>

          <div class="lc-oracle-card-body">
            <div class="lc-oracle-fleuron" aria-hidden="true">❦</div>
            <blockquote class="lc-oracle-quote" id="oracle-quote-text"></blockquote>
            <div class="lc-oracle-citation">
              <span class="lc-oracle-work" id="oracle-work-title"></span>
              <span class="lc-oracle-author">&mdash; Emrecan Koç</span>
            </div>
          </div>

          <div class="lc-oracle-card-actions">
            <button class="lc-oracle-act-btn lc-oracle-draw-btn" id="oracle-draw-btn" type="button" autofocus>Draw Another &#8635;</button>
            <a class="lc-oracle-act-btn lc-oracle-read-btn" id="oracle-read-btn" href="/poetry/carmilla/">Contemplate Piece &rarr;</a>
            <button class="lc-oracle-act-btn lc-oracle-copy-btn" id="oracle-copy-btn" type="button">Copy ❦</button>
          </div>
        </div>

        <p class="lc-oracle-hint">
          Press <kbd>Space</kbd> to draw again &bull; <kbd>Esc</kbd> or click outside to close
        </p>
      </div>
    `;

    document.body.appendChild(oracleDialog);
    attachDialogLightDismiss(oracleDialog);

    oracleDialog.querySelector('.lc-oracle-close').addEventListener('click', closeOracle);
    oracleDialog.querySelector('#oracle-draw-btn').addEventListener('click', drawOracleCard);

    const readBtn = oracleDialog.querySelector('#oracle-read-btn');
    readBtn.addEventListener('click', e => {
      const url = readBtn.getAttribute('href');
      if (url) {
        e.preventDefault();
        closeOracle();
        navigateTo(url, true);
      }
    });

    oracleDialog.querySelector('#oracle-copy-btn').addEventListener('click', () => {
      const quote = oracleDialog.querySelector('#oracle-quote-text').textContent.trim();
      const work = oracleDialog.querySelector('#oracle-work-title').textContent.trim();
      const url = readBtn.getAttribute('href') || window.location.pathname;
      const citation = '> ' + quote + '\n\n— Emrecan Koç, *' + work + '* (' + window.location.origin + url + ')';
      navigator.clipboard.writeText(citation).then(() => {
        showToast('✦ Inscription clipped with citation');
      }).catch(() => {});
    });

    oracleDialog.addEventListener('keydown', e => {
      if (e.key === ' ' && !['BUTTON', 'A', 'INPUT'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        drawOracleCard();
      }
    });
  }

  function drawOracleCard() {
    if (!oracleDialog) return;
    const cardEl = oracleDialog.querySelector('#oracle-tarot-card');
    cardEl.classList.add('is-flipping');

    let idx = Math.floor(Math.random() * CANON_INSCRIPTIONS.length);
    if (idx === lastOracleIdx && CANON_INSCRIPTIONS.length > 1) {
      idx = (idx + 1) % CANON_INSCRIPTIONS.length;
    }
    lastOracleIdx = idx;
    const item = CANON_INSCRIPTIONS[idx];

    setTimeout(() => {
      const roman = ARCANA_NUMERALS[idx % ARCANA_NUMERALS.length];
      oracleDialog.querySelector('#oracle-arcana-num').textContent = 'ARCANUM ' + roman + ' • ' + item.section.toUpperCase();
      oracleDialog.querySelector('#oracle-quote-text').textContent = '“' + item.quote + '”';
      oracleDialog.querySelector('#oracle-work-title').textContent = item.title;
      oracleDialog.querySelector('#oracle-read-btn').setAttribute('href', item.url);
      cardEl.classList.remove('is-flipping');
    }, 140);
  }

  function openOracle() {
    ensureOracleDialog();
    drawOracleCard();
    openModalDialog(oracleDialog);
  }

  function closeOracle() {
    closeModalDialog(oracleDialog);
  }

  /* ─────────────────────────────────────────────────────────────
     5. SEARCH INDEX & COMMAND PALETTE (<dialog closedby="any">)
     ───────────────────────────────────────────────────────────── */
  let paletteDialog = null;
  let rawIndexData = [];
  let searchIndex = [];
  let indexPromise = null;

  const STATIC_COMMANDS = [
    { title: 'Frontispiece', subtitle: 'Return to journal masthead', url: '/', icon: '✦' },
    { title: 'The Inscription Oracle', subtitle: 'Draw a bibliomancy Tarot passage (⌘O)', action: 'oracle', icon: '◈' },
    { title: 'The Sanctum Hub', subtitle: 'Explore all 9 interactive Gothic curiosities', url: '/sanctum/', icon: '⚗' },
    { title: 'The Scrying Mirror of Verse', subtitle: 'Prosody, syllable pulse, rhyme & acoustic cadence', url: '/sanctum/scrying-mirror/', icon: '✧' },
    { title: 'The Concordance — Full Search', subtitle: 'Open full-page live search & section index', url: '/search/', icon: '⌕' },
    { title: 'Motifs & Subjects', subtitle: 'Browse all recurring tags and critical themes', url: '/tags/', icon: '#' },
    { title: 'Poetry & Verse', subtitle: 'Original Gothic and Romantic poems', url: '/poetry/', icon: '❦' },
    { title: 'Criticism & Close Readings', subtitle: 'Dramatic theory and literary essays', url: '/review/', icon: '§' },
    { title: 'Chronological Archive', subtitle: 'Complete dated ledger of inscriptions', url: '/archives/', icon: '☩' },
    { title: 'Sound Sanctuary: Quick Rain', subtitle: 'Toggle ambient rainfall & soundscape dock', action: 'audio', icon: '🌧' },
    { title: 'Sound Sanctuary Studio', subtitle: 'Open dedicated 4-channel acoustic mixer', url: '/sanctuary/', noPjax: true, icon: '♪' },
    { title: 'Atmosphere: Cycle Palette', subtitle: 'Switch Midnight / Candlelight / Crimson', action: 'theme', icon: '🕯' }
  ];

  function loadSearchIndex() {
    if (indexPromise) return indexPromise;
    indexPromise = fetch('/index.json')
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        if (Array.isArray(data)) {
          rawIndexData = data;
          searchIndex = data.map(item => ({
            title: item.title,
            subtitle: item.summary || item.section || 'Inscription',
            content: item.content || '',
            tags: Array.isArray(item.tags) ? item.tags : [],
            section: item.section || '',
            url: item.permalink || item.relpermalink,
            icon: item.section === 'poetry' ? '❦' : item.section === 'sanctum' ? '⚗' : '§'
          }));
        }
        return rawIndexData;
      })
      .catch(err => {
        console.warn('Search index load warning:', err);
        return [];
      });
    return indexPromise;
  }

  function ensurePaletteDialog() {
    if (paletteDialog) return;
    paletteDialog = document.createElement('dialog');
    paletteDialog.className = 'lc-dialog lc-palette-dialog';
    paletteDialog.id = 'lc-palette-dialog';
    paletteDialog.setAttribute('closedby', 'any');
    paletteDialog.setAttribute('aria-label', 'Search Canon and Sanctuary Commands');

    paletteDialog.innerHTML = `
      <div class="lc-palette-modal">
        <div class="lc-palette-header">
          <span class="lc-palette-icon" aria-hidden="true">✦</span>
          <input type="text" class="lc-palette-input" placeholder="Search poems, essays, rituals, or commands..." aria-label="Search query" autocomplete="off" spellcheck="false" autofocus>
          <button type="button" class="lc-palette-close-btn" aria-label="Close Command Palette">ESC</button>
        </div>
        <div class="lc-palette-results" role="listbox" aria-label="Search suggestions"></div>
        <div class="lc-palette-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>ESC</kbd> dismiss</span>
        </div>
      </div>
    `;

    document.body.appendChild(paletteDialog);
    attachDialogLightDismiss(paletteDialog);

    const input = paletteDialog.querySelector('.lc-palette-input');
    const resultsContainer = paletteDialog.querySelector('.lc-palette-results');

    paletteDialog.querySelector('.lc-palette-close-btn').addEventListener('click', closePalette);

    input.addEventListener('input', () => {
      filterPaletteResults(input.value.trim(), resultsContainer);
    });

    input.addEventListener('keydown', e => {
      const items = Array.from(resultsContainer.querySelectorAll('.lc-palette-item'));
      const activeIndex = items.findIndex(el => el.classList.contains('is-active'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (items.length > 0) {
          const next = (activeIndex + 1) % items.length;
          items.forEach(el => el.classList.remove('is-active'));
          items[next].classList.add('is-active');
          items[next].scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (items.length > 0) {
          const prev = (activeIndex - 1 + items.length) % items.length;
          items.forEach(el => el.classList.remove('is-active'));
          items[prev].classList.add('is-active');
          items[prev].scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && items[activeIndex]) {
          items[activeIndex].click();
        }
      }
    });
  }

  function filterPaletteResults(query, container) {
    const allItems = [...STATIC_COMMANDS, ...searchIndex];
    let filtered = allItems;

    if (query) {
      const q = query.toLowerCase();
      filtered = allItems.filter(item => {
        const inTitle = item.title && item.title.toLowerCase().includes(q);
        const inSub = item.subtitle && item.subtitle.toLowerCase().includes(q);
        const inBody = item.content && item.content.toLowerCase().includes(q);
        const inTags = Array.isArray(item.tags) && item.tags.some(t => String(t).toLowerCase().includes(q));
        return inTitle || inSub || inBody || inTags;
      });
    }

    container.innerHTML = '';
    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'lc-palette-empty';
      empty.textContent = 'No inscriptions found for “' + query + '”';
      container.appendChild(empty);
      return;
    }

    filtered.slice(0, 12).forEach((item, index) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'lc-palette-item' + (index === 0 ? ' is-active' : '');

      const iconSpan = document.createElement('span');
      iconSpan.className = 'lc-palette-item-icon';
      iconSpan.setAttribute('aria-hidden', 'true');
      iconSpan.textContent = item.icon || '✦';

      const textWrap = document.createElement('div');
      textWrap.className = 'lc-palette-item-text';

      const titleDiv = document.createElement('div');
      titleDiv.className = 'lc-palette-item-title';
      titleDiv.textContent = item.title;

      const subDiv = document.createElement('div');
      subDiv.className = 'lc-palette-item-sub';
      subDiv.textContent = item.subtitle || '';

      textWrap.appendChild(titleDiv);
      textWrap.appendChild(subDiv);

      const enterSpan = document.createElement('span');
      enterSpan.className = 'lc-palette-item-enter';
      enterSpan.setAttribute('aria-hidden', 'true');
      enterSpan.textContent = '↵';

      row.appendChild(iconSpan);
      row.appendChild(textWrap);
      row.appendChild(enterSpan);

      row.addEventListener('click', () => {
        closePalette();
        if (item.action === 'theme') cycleTheme();
        else if (item.action === 'audio') toggleAudio();
        else if (item.action === 'oracle') openOracle();
        else if (item.url) {
          if (item.external) window.open(item.url, '_blank', 'noopener');
          else if (item.noPjax) window.location.href = item.url;
          else navigateTo(item.url, true);
        }
      });

      row.addEventListener('pointerenter', () => {
        container.querySelectorAll('.lc-palette-item').forEach(el => el.classList.remove('is-active'));
        row.classList.add('is-active');
      });

      container.appendChild(row);
    });
  }

  function openPalette() {
    ensurePaletteDialog();
    const input = paletteDialog.querySelector('.lc-palette-input');
    const results = paletteDialog.querySelector('.lc-palette-results');
    input.value = '';
    filterPaletteResults('', results);
    openModalDialog(paletteDialog);
    input.focus();
    loadSearchIndex().then(() => {
      if (paletteDialog.open) {
        filterPaletteResults(input.value.trim(), results);
      }
    });
  }

  function closePalette() {
    closeModalDialog(paletteDialog);
  }

  /* ─────────────────────────────────────────────────────────────
     6. FULL-PAGE CONCORDANCE (/search/) & MOTIFS FILTER (/tags/)
     ───────────────────────────────────────────────────────────── */
  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function createHighlightedFragment(text, query) {
    const frag = document.createDocumentFragment();
    if (!query) {
      frag.appendChild(document.createTextNode(text));
      return frag;
    }
    const regex = new RegExp('(' + escapeRegExp(query) + ')', 'gi');
    const parts = text.split(regex);
    parts.forEach(part => {
      if (part.toLowerCase() === query.toLowerCase()) {
        const mark = document.createElement('mark');
        mark.className = 'lc-search-highlight';
        mark.textContent = part;
        frag.appendChild(mark);
      } else if (part) {
        frag.appendChild(document.createTextNode(part));
      }
    });
    return frag;
  }

  function initSearchPage() {
    const searchPage = document.getElementById('lc-search-page');
    if (!searchPage) return;

    const input = document.getElementById('lc-search-page-input');
    const clearBtn = document.getElementById('lc-search-clear');
    const statusEl = document.getElementById('lc-search-status');
    const resultsGrid = document.getElementById('lc-search-results');
    const filterBtns = searchPage.querySelectorAll('[data-search-section]');

    let activeSection = 'all';

    // Pre-populate from ?q= URL param if present
    try {
      const params = new URLSearchParams(window.location.search);
      const initialQ = params.get('q');
      if (initialQ) input.value = initialQ;
    } catch (e) {}

    function renderSearchResults() {
      const q = input.value.trim();
      clearBtn.hidden = q.length === 0;

      const qLower = q.toLowerCase();
      const matches = rawIndexData.filter(item => {
        if (activeSection !== 'all' && item.section !== activeSection) return false;
        if (!qLower) return true;
        const inTitle = (item.title || '').toLowerCase().includes(qLower);
        const inSummary = (item.summary || '').toLowerCase().includes(qLower);
        const inContent = (item.content || '').toLowerCase().includes(qLower);
        const inTags = Array.isArray(item.tags) && item.tags.some(t => String(t).toLowerCase().includes(qLower));
        return inTitle || inSummary || inContent || inTags;
      });

      statusEl.textContent = matches.length + (matches.length === 1 ? ' inscription' : ' inscriptions') + (q ? ' matching “' + q + '”' : ' in canon');
      resultsGrid.innerHTML = '';

      if (matches.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'lc-palette-empty';
        empty.style.gridColumn = '1 / -1';
        empty.textContent = 'No canon entries matched “' + q + '”. Try another term or switch section filter.';
        resultsGrid.appendChild(empty);
        return;
      }

      matches.forEach(item => {
        const card = document.createElement('article');
        card.className = 'lc-grid-card lc-card-' + (item.section || 'review');

        const topWrap = document.createElement('div');

        const metaRow = document.createElement('div');
        metaRow.className = 'lc-card-top';

        const dot = document.createElement('span');
        dot.className = 'lc-dot lc-dot-' + (item.section || 'review');
        dot.setAttribute('aria-hidden', 'true');

        const secSpan = document.createElement('span');
        secSpan.className = 'lc-card-section';
        secSpan.textContent = item.section === 'review' ? 'Criticism' : (item.section || 'Entry');

        metaRow.appendChild(dot);
        metaRow.appendChild(secSpan);

        if (item.year && item.year !== '0001') {
          const bull = document.createElement('span');
          bull.className = 'lc-meta-dot';
          bull.textContent = '•';
          const timeEl = document.createElement('span');
          timeEl.className = 'lc-card-time';
          timeEl.textContent = item.date || item.year;
          metaRow.appendChild(bull);
          metaRow.appendChild(timeEl);
        }

        const h2 = document.createElement('h2');
        h2.className = 'lc-grid-title';
        const a = document.createElement('a');
        a.href = item.permalink;
        a.appendChild(createHighlightedFragment(item.title || 'Untitled', q));
        h2.appendChild(a);

        const descP = document.createElement('p');
        descP.className = 'lc-grid-desc';

        let snippet = item.summary || '';
        if (q && item.content && !snippet.toLowerCase().includes(qLower) && item.content.toLowerCase().includes(qLower)) {
          const pos = item.content.toLowerCase().indexOf(qLower);
          const start = Math.max(0, pos - 55);
          const end = Math.min(item.content.length, pos + 115);
          snippet = (start > 0 ? '…' : '') + item.content.slice(start, end).trim() + (end < item.content.length ? '…' : '');
        }
        descP.appendChild(createHighlightedFragment(snippet, q));

        topWrap.appendChild(metaRow);
        topWrap.appendChild(h2);
        topWrap.appendChild(descP);

        const bottom = document.createElement('div');
        bottom.className = 'lc-grid-bottom';
        const readLink = document.createElement('a');
        readLink.className = 'lc-grid-link';
        readLink.href = item.permalink;
        readLink.textContent = item.section === 'sanctum' ? 'Enter Ritual →' : 'Read Inscription →';

        const rt = document.createElement('span');
        rt.className = 'lc-grid-readtime';
        rt.textContent = item.section === 'sanctum' ? 'Interactive' : ((item.readingTime || 1) + ' min');

        bottom.appendChild(readLink);
        bottom.appendChild(rt);

        card.appendChild(topWrap);
        card.appendChild(bottom);
        resultsGrid.appendChild(card);
      });
    }

    input.addEventListener('input', () => {
      renderSearchResults();
      try {
        const url = new URL(window.location.href);
        if (input.value.trim()) url.searchParams.set('q', input.value.trim());
        else url.searchParams.delete('q');
        window.history.replaceState({}, '', url.toString());
      } catch (e) {}
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      input.dispatchEvent(new Event('input'));
      input.focus();
    });

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        activeSection = btn.getAttribute('data-search-section') || 'all';
        renderSearchResults();
      });
    });

    loadSearchIndex().then(renderSearchResults);
  }

  function initTermsFilter() {
    const filterInput = document.getElementById('lc-terms-filter-input');
    const grid = document.getElementById('lc-terms-grid');
    if (!filterInput || !grid) return;

    filterInput.addEventListener('input', () => {
      const q = filterInput.value.trim().toLowerCase();
      grid.querySelectorAll('.lc-term-card').forEach(card => {
        const name = card.getAttribute('data-term-name') || '';
        card.style.display = (!q || name.includes(q)) ? 'flex' : 'none';
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
     7. VIEW-TRANSITION PJAX NAVIGATION
     ───────────────────────────────────────────────────────────── */
  let isNavigating = false;

  function updateNavLinks() {
    const cleanPath = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.lc-nav-list a').forEach(link => {
      try {
        const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/$/, '') || '/';
        const active = linkPath === cleanPath || (linkPath !== '/' && cleanPath.startsWith(linkPath + '/'));
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      } catch (e) {}
    });
  }

  function runPageInitializers() {
    initReadingProgress();
    initStreamFilter();
    initSearchPage();
    initTermsFilter();
    syncZenButtonState();
  }

  async function navigateTo(url, pushHistory = true) {
    if (isNavigating) return;
    isNavigating = true;

    if (isAudioPlaying && audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    const mainContainer = document.querySelector('.lc-container');

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const htmlText = await response.text();

      const parser = new DOMParser();
      const newDoc = parser.parseFromString(htmlText, 'text/html');
      const newMain = newDoc.querySelector('.lc-container');

      // Standalone layouts (e.g. /sanctuary/) fall back to full navigation cleanly
      if (!mainContainer || !newMain) {
        window.location.href = url;
        return;
      }

      const applyDOMSwap = () => {
        if (newDoc.title) document.title = newDoc.title;
        if (newDoc.body) {
          const keepZen = document.body.classList.contains('is-zen-mode');
          document.body.className = newDoc.body.className;
          if (keepZen) document.body.classList.add('is-zen-mode');
          document.body.setAttribute('data-theme', getStoredTheme());
        }
        mainContainer.innerHTML = newMain.innerHTML;

        if (pushHistory) {
          window.history.pushState({ url }, '', url);
        }

        updateNavLinks();
        const targetHash = new URL(url, window.location.origin).hash;
        if (targetHash) {
          const targetEl = document.querySelector(targetHash);
          if (targetEl) targetEl.scrollIntoView();
          else window.scrollTo(0, 0);
        } else {
          window.scrollTo(0, 0);
        }

        runPageInitializers();
        document.dispatchEvent(new CustomEvent('lc:navigate', { detail: { url } }));
      };

      const routeAccessibleFocus = () => {
        const focusTarget = document.getElementById('main-content');
        if (focusTarget) focusTarget.focus({ preventScroll: true });
      };

      if (document.startViewTransition) {
        const transition = document.startViewTransition(applyDOMSwap);
        transition.finished.finally(() => {
          routeAccessibleFocus();
          isNavigating = false;
        });
      } else {
        applyDOMSwap();
        routeAccessibleFocus();
        isNavigating = false;
      }
    } catch (err) {
      isNavigating = false;
      window.location.href = url;
    }
  }

  /* ─────────────────────────────────────────────────────────────
     8. UNIFIED INTERACTION DELEGATION (ZERO DOUBLE-FIRING)
     ───────────────────────────────────────────────────────────── */
  function adjustProseScale(delta, reset = false) {
    let current = 1;
    try {
      current = parseFloat(localStorage.getItem('lc-font-scale')) || 1;
    } catch (e) {}
    const next = reset ? 1 : Math.min(1.3, Math.max(0.85, Math.round((current + delta) * 1000) / 1000));
    document.documentElement.style.setProperty('--lc-prose-scale', String(next));
    try {
      localStorage.setItem('lc-font-scale', String(next));
    } catch (e) {}
    showToast('Typography scale: ' + Math.round(next * 100) + '%');
  }

  function syncZenButtonState() {
    const zenBtn = document.querySelector('[data-reader-action="zen"]');
    if (zenBtn) {
      zenBtn.setAttribute('aria-pressed', document.body.classList.contains('is-zen-mode') ? 'true' : 'false');
    }
  }

  function copyArticleCitation() {
    const article = document.querySelector('.lc-article-page');
    const title = article?.getAttribute('data-page-title') || document.title.split('|')[0].trim();
    const author = article?.getAttribute('data-page-author') || 'Emrecan Koç';
    const pubDate = article?.getAttribute('data-page-date') || '';
    const url = window.location.href;
    const citation = `${author}. "${title}." Literaconite${pubDate ? ', ' + pubDate : ''}, ${url}.`;
    navigator.clipboard.writeText(citation).then(() => {
      showToast('✦ Scholarly citation copied to clipboard');
    }).catch(() => {});
  }

  // Image Lightbox (<dialog closedby="any">)
  let lightboxDialog = null;
  function openImageLightbox(imgEl) {
    if (!lightboxDialog) {
      lightboxDialog = document.createElement('dialog');
      lightboxDialog.className = 'lc-dialog lc-lightbox-dialog';
      lightboxDialog.id = 'lc-lightbox-dialog';
      lightboxDialog.setAttribute('closedby', 'any');
      lightboxDialog.setAttribute('aria-label', 'Enlarged Image Plate');
      lightboxDialog.innerHTML = `
        <div class="lc-lightbox-box">
          <button class="lc-oracle-close" type="button" aria-label="Close Image Preview">&times;</button>
          <img id="lc-lightbox-img" src="" alt="">
          <p class="lc-lightbox-caption" id="lc-lightbox-caption"></p>
        </div>
      `;
      document.body.appendChild(lightboxDialog);
      attachDialogLightDismiss(lightboxDialog);
      lightboxDialog.querySelector('.lc-oracle-close').addEventListener('click', () => closeModalDialog(lightboxDialog));
    }
    const targetImg = lightboxDialog.querySelector('#lc-lightbox-img');
    const capEl = lightboxDialog.querySelector('#lc-lightbox-caption');
    targetImg.src = imgEl.currentSrc || imgEl.src;
    targetImg.alt = imgEl.alt || '';
    const figCap = imgEl.closest('figure')?.querySelector('figcaption')?.textContent || imgEl.alt || '';
    capEl.textContent = figCap;
    openModalDialog(lightboxDialog);
  }

  function initGlobalDelegation() {
    document.addEventListener('click', e => {
      // 1. Header & Global Sanctuary Actions
      const actionBtn = e.target.closest('[data-lc-action]');
      if (actionBtn) {
        e.preventDefault();
        const act = actionBtn.getAttribute('data-lc-action');
        if (act === 'palette') openPalette();
        else if (act === 'oracle') openOracle();
        else if (act === 'hourglass') toggleHourglass();
        else if (act === 'votive') openVotive();
        else if (act === 'theme') cycleTheme();
        else if (act === 'audio') toggleAudio();
        return;
      }

      // 2. Reader Controls Bar
      const readerBtn = e.target.closest('[data-reader-action]');
      if (readerBtn) {
        e.preventDefault();
        const rAct = readerBtn.getAttribute('data-reader-action');
        if (rAct === 'font-down') adjustProseScale(-0.075, false);
        else if (rAct === 'font-reset') adjustProseScale(0, true);
        else if (rAct === 'font-up') adjustProseScale(0.075, false);
        else if (rAct === 'zen') {
          const active = document.body.classList.toggle('is-zen-mode');
          syncZenButtonState();
          showToast(active ? 'Focus Mode: Active' : 'Focus Mode: Restored');
        } else if (rAct === 'cite') {
          copyArticleCitation();
        }
        return;
      }

      // 3. Stanza Contemplation (.lc-verse-mode & .lc-verse-block)
      const stanzaP = e.target.closest('.lc-verse-mode > p, .lc-verse-block > p');
      if (stanzaP && !e.target.closest('a')) {
        const container = stanzaP.parentElement;
        if (container) {
          const allStanzas = Array.from(container.querySelectorAll(':scope > p'));
          const wasLocked = stanzaP.classList.contains('is-locked-stanza');
          allStanzas.forEach(el => el.classList.remove('is-locked-stanza'));
          container.classList.remove('has-locked-stanza');
          if (!wasLocked) {
            stanzaP.classList.add('is-locked-stanza');
            container.classList.add('has-locked-stanza');
            const idx = allStanzas.indexOf(stanzaP) + 1;
            showToast('Stanza ' + idx + ' held in contemplation');
          }
          return;
        }
      } else if (!e.target.closest('.lc-verse-mode, .lc-verse-block')) {
        document.querySelectorAll('.has-locked-stanza').forEach(c => {
          c.classList.remove('has-locked-stanza');
          c.querySelectorAll('.is-locked-stanza').forEach(p => p.classList.remove('is-locked-stanza'));
        });
      }

      // 4. Prose Image Lightbox
      const proseImg = e.target.closest('.lc-prose img');
      if (proseImg && !e.target.closest('a')) {
        openImageLightbox(proseImg);
        return;
      }

      // 5. Internal Link PJAX Interception
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target.closest('a');
      if (!link) return;

      const rawHref = link.getAttribute('href');
      if (!rawHref) return;

      if (
        link.hasAttribute('data-no-pjax') ||
        link.hasAttribute('download') ||
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
        if (targetUrl.origin !== window.location.origin) return;

        const curPath = window.location.pathname.replace(/\/$/, '') || '/';
        const tgtPath = targetUrl.pathname.replace(/\/$/, '') || '/';

        // Standalone Sound Sanctuary Studio opens directly
        if (tgtPath === '/sanctuary') return;

        if (curPath === tgtPath && targetUrl.search === window.location.search) {
          if (targetUrl.hash) return;
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        e.preventDefault();
        navigateTo(targetUrl.href, true);
      } catch (err) {}
    });

    window.addEventListener('popstate', () => {
      navigateTo(window.location.href, false);
    });

    // Global Keyboard Shortcuts
    document.addEventListener('keydown', e => {
      const activeTag = document.activeElement?.tagName || '';
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag) || document.activeElement?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (paletteDialog?.open) closePalette();
        else openPalette();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        if (oracleDialog?.open) closeOracle();
        else openOracle();
      } else if (e.key === '/' && !isTyping && !document.querySelector('dialog[open]')) {
        e.preventDefault();
        openPalette();
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────
     9. TOAST, QUOTE CITATION TOOLTIP, PROGRESS & STREAM FILTER
     ───────────────────────────────────────────────────────────── */
  let toastEl = null;
  let toastTimer = null;

  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'lc-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('is-visible');
    }, 2400);
  }

  let quoteTooltip = null;
  function initQuoteTooltip() {
    if (quoteTooltip) return;
    quoteTooltip = document.createElement('div');
    quoteTooltip.className = 'lc-quote-tooltip';
    quoteTooltip.innerHTML = `
      <button class="lc-quote-btn" type="button">
        <span class="lc-quote-icon" aria-hidden="true">❦</span> Copy with Citation
      </button>
    `;
    document.body.appendChild(quoteTooltip);

    quoteTooltip.querySelector('.lc-quote-btn').addEventListener('click', () => {
      const selection = window.getSelection();
      const text = selection ? selection.toString().trim() : '';
      if (!text) return;

      const pageTitle = document.title.split('|')[0].trim() || 'Literaconite';
      const citation = '> “' + text + '”\n\n— Emrecan Koç, *' + pageTitle + '* (' + window.location.href + ')';

      navigator.clipboard.writeText(citation).then(() => {
        showToast('✦ Excerpt clipped with citation');
        quoteTooltip.classList.remove('is-visible');
        selection.removeAllRanges();
      }).catch(() => {});
    });

    document.addEventListener('mouseup', e => {
      if (quoteTooltip.contains(e.target) || e.target.closest('dialog')) return;
      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection ? selection.toString().trim() : '';
        if (text.length > 12 && !selection.isCollapsed && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          if (!range.commonAncestorContainer.parentElement?.closest('.lc-prose')) {
            quoteTooltip.classList.remove('is-visible');
            return;
          }
          const rect = range.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const left = Math.min(window.innerWidth - 110, Math.max(110, rect.left + rect.width / 2));
            quoteTooltip.style.top = (window.scrollY + rect.top - 12) + 'px';
            quoteTooltip.style.left = (window.scrollX + left) + 'px';
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

  let scrollBound = false;
  function updateScrollUI() {
    const progressBar = document.getElementById('reading-progress');
    const backBtn = document.getElementById('lc-back-to-top');
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    if (progressBar) progressBar.style.width = progress + '%';
    if (backBtn) backBtn.classList.toggle('is-visible', scrollTop > 420);
  }

  function initReadingProgress() {
    if (!scrollBound) {
      window.addEventListener('scroll', updateScrollUI, { passive: true });
      window.addEventListener('resize', updateScrollUI, { passive: true });
      const backBtn = document.getElementById('lc-back-to-top');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
      scrollBound = true;
    }
    updateScrollUI();
  }

  function initStreamFilter() {
    const filterContainer = document.querySelector('.lc-stream-section .lc-filter-pills');
    const grid = document.getElementById('lc-home-grid');
    if (!filterContainer || !grid) return;

    const cards = Array.from(grid.querySelectorAll('.lc-grid-card'));

    filterContainer.onclick = e => {
      const btn = e.target.closest('.lc-filter-pill');
      if (!btn) return;

      filterContainer.querySelectorAll('.lc-filter-pill').forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.getAttribute('data-filter');
      cards.forEach(card => {
        const isFragmentsFeature = card.classList.contains('lc-fragments-feature-card');
        if (filter === 'all') {
          card.style.display = isFragmentsFeature ? 'none' : 'flex';
        } else {
          card.style.display = card.classList.contains('lc-card-' + filter) ? 'flex' : 'none';
        }
      });
    };
  }

  /* ─────────────────────────────────────────────────────────────
     10. THE STUDY — FOCUS HOURGLASS (<dialog>)
     ───────────────────────────────────────────────────────────── */
  let hourglassTimer = null;
  let hourglassTotalSeconds = 1500;
  let hourglassSeconds = 1500;
  let isHourglassRunning = false;
  let hourglassSessions = 0;
  let hourglassDialog = null;

  try {
    hourglassSessions = parseInt(localStorage.getItem('lc-hg-sessions') || '0', 10) || 0;
  } catch (e) {}

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function ensureHourglassDialog() {
    if (hourglassDialog) return;
    hourglassDialog = document.createElement('dialog');
    hourglassDialog.id = 'lc-hourglass-dialog';
    hourglassDialog.className = 'lc-dialog lc-hg-dialog';
    hourglassDialog.setAttribute('closedby', 'closerequest');
    hourglassDialog.setAttribute('aria-labelledby', 'hg-dialog-title');

    hourglassDialog.innerHTML = `
      <div class="lc-hg-shell">
        <div class="lc-hg-bg" aria-hidden="true"></div>
        <div class="lc-hg-vignette" aria-hidden="true"></div>
        <div class="lc-hg-ui">
          <div class="lc-hg-header">
            <h2 class="lc-hg-title" id="hg-dialog-title">The Study &mdash; Focus Sanctuary</h2>
            <div class="lc-hg-header-right">
              <span class="lc-hg-sessions" id="hg-sessions">&#9670; ${hourglassSessions} session${hourglassSessions === 1 ? '' : 's'} complete</span>
              <button class="lc-hg-exit" id="hg-exit" type="button" aria-label="Exit Focus Study">&#10005;</button>
            </div>
          </div>

          <div class="lc-hg-center">
            <div class="lc-hg-ring-wrap">
              <svg class="lc-hg-ring" viewBox="0 0 200 200" aria-hidden="true">
                <circle class="lc-hg-ring-track" cx="100" cy="100" r="88"></circle>
                <circle class="lc-hg-ring-fill" id="hg-ring-fill" cx="100" cy="100" r="88"
                  stroke-dasharray="553"
                  stroke-dashoffset="0"
                  stroke-linecap="round"></circle>
              </svg>
              <div class="lc-hg-clock">
                <span class="lc-hg-time" id="hg-time">25:00</span>
                <span class="lc-hg-status" id="hg-status">Ready</span>
              </div>
            </div>

            <div class="lc-hg-controls">
              <button class="lc-hg-btn lc-hg-btn-main" id="hg-toggle" type="button" autofocus>&#9654; Begin Session</button>
              <button class="lc-hg-btn lc-hg-btn-ghost" id="hg-reset" type="button">Reset</button>
              <button class="lc-hg-btn lc-hg-btn-ghost" id="hg-rain-btn" type="button">Toggle Rain</button>
            </div>

            <div class="lc-hg-presets">
              <button class="lc-hg-preset" type="button" data-min="15">15 min</button>
              <button class="lc-hg-preset active" type="button" data-min="25">25 min</button>
              <button class="lc-hg-preset" type="button" data-min="45">45 min</button>
              <button class="lc-hg-preset" type="button" data-min="60">60 min</button>
              <button class="lc-hg-preset" type="button" id="hg-custom-trigger">Custom</button>
            </div>

            <div class="lc-hg-custom" id="hg-custom-row" style="display:none">
              <input type="number" id="hg-custom-input" class="lc-hg-custom-input" min="1" max="180" value="30" aria-label="Custom minutes">
              <button class="lc-hg-btn lc-hg-btn-ghost" id="hg-custom-set" type="button">Set</button>
            </div>
          </div>

          <div class="lc-hg-footer">
            <span class="lc-hg-quote" id="hg-quote"></span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(hourglassDialog);

    const focusQuotes = [
      '“Time is the devourer of all things.” — Ovid',
      '“An hour of reading is the sovereign remedy.” — Voltaire',
      '“The cradle rocks above an abyss.” — Vladimir Nabokov',
      '“Lost time is never found again.” — Benjamin Franklin',
      '“He who has a why to live can bear almost any how.” — Friedrich Nietzsche'
    ];
    hourglassDialog.querySelector('#hg-quote').textContent = focusQuotes[Math.floor(Math.random() * focusQuotes.length)];

    hourglassDialog.querySelector('#hg-exit').addEventListener('click', () => closeModalDialog(hourglassDialog));
    hourglassDialog.querySelector('#hg-toggle').addEventListener('click', tickHourglass);
    hourglassDialog.querySelector('#hg-rain-btn').addEventListener('click', toggleAudio);

    hourglassDialog.querySelector('#hg-reset').addEventListener('click', () => {
      clearInterval(hourglassTimer);
      isHourglassRunning = false;
      hourglassSeconds = hourglassTotalSeconds;
      updateHourglassUI();
      hourglassDialog.querySelector('#hg-toggle').textContent = '▶ Begin Session';
      hourglassDialog.querySelector('#hg-status').textContent = 'Ready';
    });

    hourglassDialog.querySelectorAll('.lc-hg-preset[data-min]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (isHourglassRunning) return;
        hourglassDialog.querySelectorAll('.lc-hg-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mins = parseInt(btn.getAttribute('data-min'), 10);
        hourglassTotalSeconds = mins * 60;
        hourglassSeconds = hourglassTotalSeconds;
        hourglassDialog.querySelector('#hg-custom-row').style.display = 'none';
        updateHourglassUI();
      });
    });

    hourglassDialog.querySelector('#hg-custom-trigger').addEventListener('click', () => {
      const row = hourglassDialog.querySelector('#hg-custom-row');
      row.style.display = row.style.display === 'none' ? 'flex' : 'none';
    });

    hourglassDialog.querySelector('#hg-custom-set').addEventListener('click', () => {
      if (isHourglassRunning) return;
      const val = parseInt(hourglassDialog.querySelector('#hg-custom-input').value, 10);
      if (!val || val < 1 || val > 180) return;
      hourglassDialog.querySelectorAll('.lc-hg-preset').forEach(b => b.classList.remove('active'));
      hourglassDialog.querySelector('#hg-custom-trigger').classList.add('active');
      hourglassTotalSeconds = val * 60;
      hourglassSeconds = hourglassTotalSeconds;
      hourglassDialog.querySelector('#hg-custom-row').style.display = 'none';
      updateHourglassUI();
    });
  }

  function tickHourglass() {
    const btn = hourglassDialog?.querySelector('#hg-toggle');
    const status = hourglassDialog?.querySelector('#hg-status');
    if (isHourglassRunning) {
      clearInterval(hourglassTimer);
      isHourglassRunning = false;
      if (btn) btn.textContent = '▶ Resume';
      if (status) status.textContent = 'Paused';
    } else {
      if (hourglassSeconds <= 0) hourglassSeconds = hourglassTotalSeconds;
      isHourglassRunning = true;
      if (btn) btn.textContent = '❚❚ Pause';
      if (status) status.textContent = 'Focusing…';
      hourglassTimer = setInterval(() => {
        hourglassSeconds--;
        updateHourglassUI();
        if (hourglassSeconds <= 0) {
          clearInterval(hourglassTimer);
          isHourglassRunning = false;
          hourglassSessions++;
          try { localStorage.setItem('lc-hg-sessions', String(hourglassSessions)); } catch (e) {}
          tollAbbeyBell(0);
          if (btn) btn.textContent = '▶ Begin Session';
          if (status) status.textContent = 'Session complete';
          const sessEl = hourglassDialog?.querySelector('#hg-sessions');
          if (sessEl) sessEl.textContent = `◆ ${hourglassSessions} session${hourglassSessions === 1 ? '' : 's'} complete`;
          showToast('The Hourglass has run empty. The abbey bell tolls.');
        }
      }, 1000);
    }
  }

  function updateHourglassUI() {
    const formatted = formatTime(hourglassSeconds);
    const timeEl = hourglassDialog?.querySelector('#hg-time');
    const ringEl = hourglassDialog?.querySelector('#hg-ring-fill');
    document.querySelectorAll('.lc-hourglass-time').forEach(el => {
      el.textContent = formatted;
    });
    if (timeEl) timeEl.textContent = formatted;
    if (ringEl) {
      const circumference = 553;
      const fraction = hourglassTotalSeconds > 0 ? hourglassSeconds / hourglassTotalSeconds : 1;
      ringEl.style.strokeDashoffset = String(circumference * (1 - fraction));
    }
  }

  function toggleHourglass() {
    ensureHourglassDialog();
    updateHourglassUI();
    openModalDialog(hourglassDialog);
  }

  /* ─────────────────────────────────────────────────────────────
     11. THE VOTIVE LEDGER (<dialog closedby="any"> + Persistence)
     ───────────────────────────────────────────────────────────── */
  let votiveDialog = null;
  const DEFAULT_WHISPERS = [
    'He’s more myself than I am. Whatever our souls are made of, his and mine are the same.',
    'A wrong is unredressed when retribution overtakes its redresser.',
    'I beheld the wretch — the miserable monster whom I had created.',
    'The veil between the worlds is made of language.'
  ];

  function getSavedWhispers() {
    try {
      const raw = JSON.parse(localStorage.getItem('lc-votive-whispers') || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch (e) {
      return [];
    }
  }

  function saveWhispers(list) {
    try {
      localStorage.setItem('lc-votive-whispers', JSON.stringify(list));
    } catch (e) {}
  }

  function renderVotiveEntries() {
    if (!votiveDialog) return;
    const box = votiveDialog.querySelector('#votive-entries');
    box.innerHTML = '';

    DEFAULT_WHISPERS.forEach(text => {
      const row = document.createElement('div');
      row.className = 'lc-votive-entry';
      const span = document.createElement('span');
      span.textContent = '“' + text + '”';
      row.appendChild(span);
      box.appendChild(row);
    });

    const userWhispers = getSavedWhispers();
    userWhispers.forEach((text, idx) => {
      const row = document.createElement('div');
      row.className = 'lc-votive-entry';
      const span = document.createElement('span');
      span.textContent = '“' + text + '”';

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'lc-votive-entry-del';
      delBtn.setAttribute('aria-label', 'Remove your whisper');
      delBtn.title = 'Extinguish whisper';
      delBtn.textContent = '×';
      delBtn.addEventListener('click', () => {
        const next = getSavedWhispers();
        next.splice(idx, 1);
        saveWhispers(next);
        renderVotiveEntries();
      });

      row.appendChild(span);
      row.appendChild(delBtn);
      box.appendChild(row);
    });

    box.scrollTop = box.scrollHeight;
  }

  function ensureVotiveDialog() {
    if (votiveDialog) return;
    votiveDialog = document.createElement('dialog');
    votiveDialog.className = 'lc-dialog lc-votive-dialog';
    votiveDialog.id = 'lc-votive-dialog';
    votiveDialog.setAttribute('closedby', 'any');
    votiveDialog.setAttribute('aria-labelledby', 'votive-dialog-title');

    votiveDialog.innerHTML = `
      <div class="lc-votive-content">
        <button class="lc-votive-close" type="button" aria-label="Close Votive Ledger">&times;</button>
        <div class="lc-votive-header">
          <h2 id="votive-dialog-title">The Votive Ledger</h2>
          <p>Leave a whisper in the dark &mdash; a verse, an omen, or a quiet confession.</p>
        </div>
        <div class="lc-votive-entries" id="votive-entries"></div>
        <form class="lc-votive-form" id="votive-form">
          <input type="text" id="votive-input" maxlength="240" placeholder="Inscribe your whisper..." aria-label="Inscribe your whisper" required autocomplete="off" autofocus>
          <button type="submit">Offer ✦</button>
        </form>
      </div>
    `;
    document.body.appendChild(votiveDialog);
    attachDialogLightDismiss(votiveDialog);

    votiveDialog.querySelector('.lc-votive-close').addEventListener('click', closeVotive);
    votiveDialog.querySelector('#votive-form').addEventListener('submit', submitVotive);
  }

  function openVotive() {
    ensureVotiveDialog();
    renderVotiveEntries();
    openModalDialog(votiveDialog);
    votiveDialog.querySelector('#votive-input')?.focus();
  }

  function closeVotive() {
    closeModalDialog(votiveDialog);
  }

  function submitVotive(e) {
    e.preventDefault();
    const input = votiveDialog?.querySelector('#votive-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const list = getSavedWhispers();
    list.push(text);
    saveWhispers(list);
    input.value = '';
    renderVotiveEntries();
    showToast('Your whisper has been bound to the ledger.');
  }

  /* ─────────────────────────────────────────────────────────────
     12. BOOTSTRAP
     ───────────────────────────────────────────────────────────── */
  function init() {
    applyTheme(getStoredTheme());
    updateAudioUI();
    checkAutoResumeAudio();
    initGlobalDelegation();
    initQuoteTooltip();
    updateNavLinks();
    runPageInitializers();
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
    getAudioContext,
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
