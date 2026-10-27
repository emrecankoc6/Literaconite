/**
 * LITERACONITE — THE SANCTUM INTERACTIVE CABINET
 * Pure Vanilla JavaScript — All 9 Gothic Rituals & Curiosities
 * Clean lifecycle teardown on PJAX navigation, Web Audio synthesis, Canvas exports, & Persistence
 */
(function () {
  'use strict';

  let activeCleanupFns = [];

  function onCleanup(fn) {
    activeCleanupFns.push(fn);
  }

  function runCleanups() {
    while (activeCleanupFns.length > 0) {
      const fn = activeCleanupFns.pop();
      try { fn(); } catch (e) {}
    }
  }

  function toast(msg) {
    if (window.Literaconite && typeof window.Literaconite.showToast === 'function') {
      window.Literaconite.showToast(msg);
    }
  }

  function getCtx() {
    if (window.Literaconite && typeof window.Literaconite.getAudioContext === 'function') {
      return window.Literaconite.getAudioContext();
    }
    return null;
  }

  function playTone(freq, duration = 0.35, type = 'sine', peak = 0.08) {
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peak, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch (e) {}
  }

  function playKeyClack(isBell = false) {
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      if (isBell) {
        playTone(1320, 0.7, 'sine', 0.09);
        playTone(2640, 0.45, 'triangle', 0.04);
        return;
      }
      const len = Math.floor(ctx.sampleRate * 0.028);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.25));
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600 + Math.random() * 500, now);
      filter.Q.setValueAtTime(1.8, now);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.16, now);
      src.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);
      src.start(now);
    } catch (e) {}
  }

  /* ═════════════════════════════════════════════════════════════
     1. THE SPIRIT BOARD OF THE CANON
     ═════════════════════════════════════════════════════════════ */
  const SPIRIT_CANON = [
    {
      word: 'MIRCALLA',
      text: 'Come. Up from the loam-choked dark, you. My macabre. My muse of the red weeping.',
      source: 'Emrecan Koç — Mircalla',
      link: '/poetry/mircalla/'
    },
    {
      word: 'SELENE',
      text: 'Darkness crept upon the fertile field; silence dominated the domain. Even Selene hesitated to give her glow over the marble, erect stones.',
      source: 'Emrecan Koç — Carmilla',
      link: '/poetry/carmilla/'
    },
    {
      word: 'XANADU',
      text: 'A savage place! as holy and enchanted as e’er beneath a waning moon was haunted by woman wailing for her demon-lover!',
      source: 'S. T. Coleridge — Kubla Khan (Reflected)',
      link: '/poetry/kubla-khan-by-samuel-taylor-coleridge-a-translation-into-turkish-and-a-reflection/'
    },
    {
      word: 'FORTUNATO',
      text: 'A wrong is unredressed when retribution overtakes its redresser. In the damp vaults of nitre, silence is the final masonry.',
      source: 'On Poe’s The Cask of Amontillado',
      link: '/review/on-the-relation-between-poes-the-cask-of-amontillado-and-vengeance-as-a-subject-matter/'
    },
    {
      word: 'SALEM',
      text: 'When terror replaces reason, the court becomes the theater of the damned. Guilt is no longer proven; it is created by consensus.',
      source: 'The Crucible: Allegory & Hysteria',
      link: '/review/the-crucible-allegory-witchcraft-and-mob-hysteria/'
    },
    {
      word: 'MOOR',
      text: 'He’s more myself than I am. Whatever our souls are made of, his and mine are the same.',
      source: 'Emily Brontë — Wuthering Heights',
      link: '/poetry/carmilla/'
    },
    {
      word: 'CLAIR',
      text: 'Music begins where the word fails. Impressionism is the fleeting perfume of a melancholy evening.',
      source: 'Debussy’s Clair de Lune & Impressionism',
      link: '/review/claude-debussys-clair-de-lune-and-musical-impressionism/'
    },
    {
      word: 'URUK',
      text: 'Even the mightiest king of walled Uruk must cross the waters of death to learn that immortality belongs to the inscription.',
      source: 'Gilgamesh Through a Comparative Perspective',
      link: '/review/today-i-am-choosing-an-eastern-hero-for-myself-to-examine/'
    }
  ];

  function initSpiritBoard(container) {
    const row1 = 'ABCDEFGHIJKLM'.split('');
    const row2 = 'NOPQRSTUVWXYZ'.split('');
    const nums = '1234567890'.split('');

    container.innerHTML = `
      <div class="lc-spirit-board">
        <p class="lc-sanctum-sub">Inscribe an inquiry for the literary dead &mdash; watch the brass planchette spell their omen.</p>
        <div class="lc-board-surface" id="spirit-surface">
          <div class="lc-planchette" id="planchette" aria-hidden="true">
            <svg viewBox="0 0 68 82" width="68" height="82" fill="none">
              <path d="M34 4 C52 24, 63 46, 58 68 C55 76, 46 78, 34 74 C22 78, 13 76, 10 68 C5 46, 16 24, 34 4 Z" fill="rgba(236, 217, 178, 0.92)" stroke="#b8892d" stroke-width="2.2"/>
              <path d="M34 11 C47 27, 55 46, 52 64 C49 70, 42 71, 34 68 C26 71, 19 70, 16 64 C13 46, 21 27, 34 11 Z" stroke="#855e18" stroke-width="1" stroke-dasharray="3 2"/>
              <circle cx="34" cy="44" r="13" fill="rgba(22, 12, 6, 0.55)" stroke="#b8892d" stroke-width="2.4"/>
              <line x1="34" y1="27" x2="34" y2="31" stroke="#b8892d" stroke-width="1.5"/>
              <line x1="34" y1="57" x2="34" y2="61" stroke="#b8892d" stroke-width="1.5"/>
            </svg>
          </div>

          <div class="lc-board-top-ornaments">
            <span class="lc-board-token" data-token="YES">☽ YES</span>
            <span aria-hidden="true">✦</span>
            <span class="lc-board-token" data-token="NO">NO ☉</span>
          </div>

          <div class="lc-board-rows">
            <div class="lc-board-row">
              ${row1.map(ch => `<span class="lc-board-token" data-token="${ch}">${ch}</span>`).join('')}
            </div>
            <div class="lc-board-row">
              ${row2.map(ch => `<span class="lc-board-token" data-token="${ch}">${ch}</span>`).join('')}
            </div>
            <div class="lc-board-row lc-board-nums">
              ${nums.map(n => `<span class="lc-board-token" data-token="${n}">${n}</span>`).join('')}
            </div>
            <div class="lc-board-goodbye">
              <span class="lc-board-token" data-token="GOODBYE">GOODBYE</span>
            </div>
          </div>
        </div>

        <div class="lc-spirit-spelled-bar" id="spirit-spelled" aria-live="polite">&mdash;</div>

        <div class="lc-spirit-controls">
          <input type="text" id="spirit-input" class="lc-spirit-input" placeholder="Ask the canon a question (or summon directly)..." aria-label="Question for the Spirit Board" autocomplete="off">
          <button class="lc-sanctum-btn" id="spirit-summon-btn" type="button">✦ Summon</button>
        </div>

        <div class="lc-spirit-output" id="spirit-output" aria-live="polite"></div>
      </div>
    `;

    const surface = document.getElementById('spirit-surface');
    const planchette = document.getElementById('planchette');
    const spelledBar = document.getElementById('spirit-spelled');
    const output = document.getElementById('spirit-output');
    const input = document.getElementById('spirit-input');
    const summonBtn = document.getElementById('spirit-summon-btn');

    let timers = [];
    let isSummoning = false;

    function clearSpiritTimers() {
      timers.forEach(t => clearTimeout(t));
      timers = [];
    }
    onCleanup(clearSpiritTimers);

    function centerPlanchette() {
      if (!surface || !planchette) return;
      const rect = surface.getBoundingClientRect();
      const x = Math.max(0, rect.width / 2 - 34);
      const y = Math.max(0, rect.height / 2 - 44);
      planchette.style.transform = `translate(${x}px, ${y}px) rotate(0deg)`;
    }
    requestAnimationFrame(centerPlanchette);

    function movePlanchetteToToken(tokenKey) {
      const target = surface.querySelector(`[data-token="${tokenKey}"]`);
      surface.querySelectorAll('.lc-board-token').forEach(el => el.classList.remove('is-lit'));
      if (!target) return;
      target.classList.add('is-lit');

      const sRect = surface.getBoundingClientRect();
      const tRect = target.getBoundingClientRect();
      const x = (tRect.left - sRect.left) + (tRect.width / 2) - 34;
      const y = (tRect.top - sRect.top) + (tRect.height / 2) - 44;
      const tilt = ((x / Math.max(1, sRect.width)) - 0.5) * 14;
      planchette.style.transform = `translate(${x}px, ${y}px) rotate(${tilt.toFixed(1)}deg)`;
    }

    function summon() {
      if (isSummoning) return;
      isSummoning = true;
      summonBtn.disabled = true;
      clearSpiritTimers();

      output.classList.remove('visible');
      spelledBar.textContent = '';

      const qText = input.value.trim().toLowerCase();
      const isYesNo = /^(is|are|am|will|shall|can|could|should|do|does|did|have|has|may)\b/.test(qText);

      // Deterministic or varied selection weighted by query
      let pickIdx = Math.floor(Math.random() * SPIRIT_CANON.length);
      if (qText) {
        let hash = 0;
        for (let i = 0; i < qText.length; i++) hash = (hash * 31 + qText.charCodeAt(i)) >>> 0;
        pickIdx = (hash + Math.floor(Math.random() * 2)) % SPIRIT_CANON.length;
      }
      const chosen = SPIRIT_CANON[pickIdx];

      const sequence = [];
      if (isYesNo) {
        sequence.push(pickIdx % 2 === 0 ? 'YES' : 'NO');
      }
      chosen.word.split('').forEach(ch => sequence.push(ch));

      const scaleNotes = [293.66, 329.63, 349.23, 392.0, 440.0, 466.16, 523.25, 587.33];
      let built = '';

      sequence.forEach((tok, idx) => {
        const t = setTimeout(() => {
          movePlanchetteToToken(tok);
          playTone(scaleNotes[idx % scaleNotes.length], 0.32, 'sine', 0.055);
          if (tok === 'YES' || tok === 'NO') {
            built += tok + ' · ';
          } else {
            built += tok;
          }
          spelledBar.textContent = built;
        }, idx * 460 + 120);
        timers.push(t);
      });

      const endT = setTimeout(() => {
        surface.querySelectorAll('.lc-board-token').forEach(el => el.classList.remove('is-lit'));
        centerPlanchette();
        playTone(220, 0.9, 'triangle', 0.07);

        output.innerHTML = '';
        const omenEl = document.createElement('span');
        omenEl.className = 'lc-spirit-omen-word';
        omenEl.textContent = '✦ Omen Spelled: ' + built + ' ✦';

        const quoteEl = document.createElement('blockquote');
        quoteEl.className = 'lc-spirit-quote';
        quoteEl.textContent = '“' + chosen.text + '”';

        const metaRow = document.createElement('div');
        metaRow.className = 'lc-spirit-meta-row';

        const srcEl = document.createElement('span');
        srcEl.className = 'lc-spirit-source';
        srcEl.textContent = '— ' + chosen.source;

        const linkEl = document.createElement('a');
        linkEl.className = 'lc-spirit-canon-link';
        linkEl.href = chosen.link;
        linkEl.textContent = 'Read Inscription →';

        metaRow.appendChild(srcEl);
        metaRow.appendChild(linkEl);
        output.appendChild(omenEl);
        output.appendChild(quoteEl);
        output.appendChild(metaRow);

        output.classList.add('visible');
        isSummoning = false;
        summonBtn.disabled = false;
      }, sequence.length * 460 + 480);
      timers.push(endT);
    }

    summonBtn.addEventListener('click', summon);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') summon();
    });
  }

  /* ═════════════════════════════════════════════════════════════
     2. THE ALEMBIC CAULDRON (15 Elixirs + Persistent Grimoire)
     ═════════════════════════════════════════════════════════════ */
  const REAGENTS = [
    { id: 'Wolfsbane', label: 'Wolfsbane', color: '#a855f7' },
    { id: 'Gravedust', label: 'Gravedust', color: '#94a3b8' },
    { id: 'Tears', label: 'Elegiac Tears', color: '#38bdf8' },
    { id: 'Hemlock', label: 'Hemlock', color: '#34d399' },
    { id: 'Ink', label: 'Iron-Gall Ink', color: '#c084fc' },
    { id: 'Aconite', label: 'Crimson Aconite', color: '#fb7185' }
  ];

  const POTION_RECIPES = {
    'Gravedust+Wolfsbane': { title: 'Oil of Nocturnal Passage', color: '#a855f7', text: '“Didst thou not hear it? — No; it was but the wind, or the car rattling o’er the stony street.”', note: 'Grants safe crossing across threshold corridors.' },
    'Tears+Wolfsbane': { title: 'Tincture of Petrified Grief', color: '#60a5fa', text: '“I wept not, so of stone grew I within.” — Dante Alighieri, Inferno', note: 'Stills trembling hands before the blank page.' },
    'Hemlock+Wolfsbane': { title: 'Essence of Perpetual Night', color: '#10b981', text: '“My name is Night — I dwell amidst the dark.” — Lord Byron, Manfred', note: 'Sharpens vision beneath starless skies.' },
    'Ink+Wolfsbane': { title: 'Fluid of the Unbound Script', color: '#c084fc', text: '“Beware; for I am fearless, and therefore powerful.” — Mary Shelley, Frankenstein', note: 'Causes latent marginalia to glow under candlelight.' },
    'Aconite+Wolfsbane': { title: 'Literaconite Sovereign Draught', color: '#f43f5e', text: '“Where love and thirst are one and deep, we wake while dying angels sleep.” — Emrecan Koç', note: 'The namesake poison-remedy of the sanctuary itself.' },
    'Gravedust+Tears': { title: 'Elixir of Ancestral Memory', color: '#93c5fd', text: '“Whatever our souls are made of, his and mine are the same.” — Emily Brontë', note: 'Restores effaced epitaphs on weathered marble.' },
    'Gravedust+Hemlock': { title: 'Lethean Draught of Sleep', color: '#2dd4bf', text: '“The boundaries which divide Life from Death are at best shadowy and vague.” — E. A. Poe', note: 'Suspends waking sorrow until the third bell.' },
    'Gravedust+Ink': { title: 'Vitriol of the Revenant', color: '#a78bfa', text: '“A wrong is unredressed when retribution overtakes its redresser.” — E. A. Poe', note: 'Binds spoken vows permanently into vellum.' },
    'Aconite+Gravedust': { title: 'Ashes of Styria', color: '#fb7185', text: '“Up from the loam-choked dark, you. My macabre. My muse of the red weeping.” — Emrecan Koç', note: 'Summons velvet echoes from ruined chapels.' },
    'Hemlock+Tears': { title: 'Cordial of Quiet Ending', color: '#38bdf8', text: '“I wish I could hold you till we were both dead.” — Wuthering Heights', note: 'Turns tempestuous grief into still glass.' },
    'Ink+Tears': { title: 'Memoir of the Sleepless', color: '#818cf8', text: '“Deep into that darkness peering, long I stood there wondering, fearing…” — E. A. Poe', note: 'Distills midnight confession into metre.' },
    'Aconite+Tears': { title: 'Weeping Ruby Distillate', color: '#f472b6', text: '“O, my lovely spirit, how you have fallen from Heaven.” — Emrecan Koç, Carmilla', note: 'Warms cold marble at the touch of a mourner.' },
    'Hemlock+Ink': { title: 'The Censor’s Bane', color: '#34d399', text: '“Because it is my name! Because I cannot have another in my life!” — Arthur Miller, The Crucible', note: 'Renders coerced signatures invisible at dawn.' },
    'Aconite+Hemlock': { title: 'Venom of Xanadu', color: '#fb923c', text: '“And close your eyes with holy dread, for he on honey-dew hath fed, and drunk the milk of Paradise.” — Coleridge', note: 'Unlocks waking visions of sunlit caverns of ice.' },
    'Aconite+Ink': { title: 'Rubrication of the Canon', color: '#e11d48', text: '“Strange love! that in the very moment of its dawning should have burst upon me with such power.” — J. S. Le Fanu', note: 'Illuminates initial drop-caps in undying crimson.' }
  };

  function getDiscoveredPotions() {
    try {
      const arr = JSON.parse(localStorage.getItem('lc-alembic-grimoire') || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveDiscoveredPotion(key) {
    const list = getDiscoveredPotions();
    if (!list.includes(key)) {
      list.push(key);
      try { localStorage.setItem('lc-alembic-grimoire', JSON.stringify(list)); } catch (e) {}
    }
  }

  function initAlembic(container) {
    let selected = [];
    let brewTimer = null;
    onCleanup(() => clearTimeout(brewTimer));

    container.innerHTML = `
      <div class="lc-alembic">
        <p class="lc-sanctum-sub">Select any two reagents to distill a canonical elixir &amp; record it in your Grimoire.</p>
        <div class="lc-ingredients" id="alembic-ingredients">
          ${REAGENTS.map(r => `
            <button type="button" class="lc-ingredient" data-reagent="${r.id}" aria-pressed="false">
              <span class="lc-reagent-dot" style="background:${r.color};box-shadow:0 0 8px ${r.color}"></span>
              <span>${r.label}</span>
            </button>
          `).join('')}
        </div>

        <div class="lc-cauldron-stage" id="cauldron-stage" aria-hidden="true">
          <svg class="lc-alembic-svg" viewBox="0 0 140 150" fill="none">
            <defs>
              <clipPath id="flask-clip">
                <path d="M56 26 V54 L20 112 C14 123 22 136 35 136 H105 C118 136 126 123 120 112 L84 54 V26 Z"/>
              </clipPath>
            </defs>
            <g clip-path="url(#flask-clip)">
              <rect id="flask-liquid" x="10" y="128" width="120" height="90" fill="#c084fc" opacity="0.72" style="transition: y 320ms ease, fill 320ms ease;"/>
              <circle cx="52" cy="118" r="4" fill="rgba(255,255,255,0.45)"/>
              <circle cx="84" cy="124" r="3" fill="rgba(255,255,255,0.35)"/>
              <circle cx="68" cy="108" r="2.5" fill="rgba(255,255,255,0.4)"/>
            </g>
            <path d="M50 24 H90 M56 24 V54 L20 112 C14 123 22 136 35 136 H105 C118 136 126 123 120 112 L84 54 V24" stroke="rgba(235, 224, 255, 0.7)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M36 105 C42 96, 52 92, 60 95" stroke="rgba(255,255,255,0.22)" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>

        <div class="lc-alembic-actions">
          <button class="lc-sanctum-btn" id="brew-btn" type="button">✦ Transmute Reagents</button>
          <button class="lc-sanctum-btn lc-btn-ghost" id="clear-flask-btn" type="button">Empty Retort</button>
        </div>

        <div class="lc-alembic-result" id="alembic-result" aria-live="polite"></div>

        <div class="lc-grimoire-panel">
          <div class="lc-grimoire-head">
            <span>Alchemical Grimoire</span>
            <span id="grimoire-count">0 / 15 Discovered</span>
          </div>
          <div class="lc-grimoire-chips" id="grimoire-chips"></div>
        </div>
      </div>
    `;

    const liquidRect = document.getElementById('flask-liquid');
    const stage = document.getElementById('cauldron-stage');
    const resultBox = document.getElementById('alembic-result');
    const grimoireCount = document.getElementById('grimoire-count');
    const grimoireChips = document.getElementById('grimoire-chips');

    function updateFlaskVisual() {
      if (selected.length === 0) {
        liquidRect.setAttribute('y', '132');
      } else if (selected.length === 1) {
        const r = REAGENTS.find(x => x.id === selected[0]);
        liquidRect.setAttribute('y', '104');
        liquidRect.setAttribute('fill', r ? r.color : '#c084fc');
      } else {
        const key = [...selected].sort().join('+');
        const p = POTION_RECIPES[key];
        liquidRect.setAttribute('y', '82');
        liquidRect.setAttribute('fill', p ? p.color : '#c084fc');
      }
    }

    function showPotion(key) {
      const potion = POTION_RECIPES[key];
      if (!potion) return;
      resultBox.style.borderLeftColor = potion.color;
      resultBox.innerHTML = '';

      const head = document.createElement('div');
      head.className = 'lc-potion-header';
      const title = document.createElement('span');
      title.className = 'lc-potion-title';
      title.style.color = potion.color;
      title.textContent = potion.title;
      const formula = document.createElement('span');
      formula.className = 'lc-potion-formula';
      formula.textContent = key.replace('+', ' + ');
      head.appendChild(title);
      head.appendChild(formula);

      const quote = document.createElement('p');
      quote.className = 'lc-potion-text';
      quote.textContent = potion.text;

      const note = document.createElement('p');
      note.className = 'lc-potion-note';
      note.textContent = '✦ ' + potion.note;

      resultBox.appendChild(head);
      resultBox.appendChild(quote);
      resultBox.appendChild(note);
      resultBox.classList.add('visible');
    }

    function renderGrimoire() {
      const discovered = getDiscoveredPotions().filter(k => POTION_RECIPES[k]);
      grimoireCount.textContent = `${discovered.length} / 15 Discovered`;
      grimoireChips.innerHTML = '';
      if (discovered.length === 0) {
        const hint = document.createElement('span');
        hint.className = 'lc-potion-formula';
        hint.textContent = 'No elixirs recorded yet — combine two reagents above.';
        grimoireChips.appendChild(hint);
        return;
      }
      discovered.forEach(key => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'lc-grimoire-chip';
        btn.textContent = POTION_RECIPES[key].title;
        btn.addEventListener('click', () => {
          liquidRect.setAttribute('y', '82');
          liquidRect.setAttribute('fill', POTION_RECIPES[key].color);
          showPotion(key);
        });
        grimoireChips.appendChild(btn);
      });
    }

    container.querySelectorAll('.lc-ingredient').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-reagent');
        const idx = selected.indexOf(id);
        if (idx > -1) {
          selected.splice(idx, 1);
          btn.setAttribute('aria-pressed', 'false');
        } else {
          if (selected.length >= 2) {
            toast('The retort holds two reagents at a time.');
            return;
          }
          selected.push(id);
          btn.setAttribute('aria-pressed', 'true');
          playTone(340 + selected.length * 90, 0.2, 'sine', 0.05);
        }
        updateFlaskVisual();
      });
    });

    document.getElementById('clear-flask-btn').addEventListener('click', () => {
      selected = [];
      container.querySelectorAll('.lc-ingredient').forEach(b => b.setAttribute('aria-pressed', 'false'));
      updateFlaskVisual();
    });

    document.getElementById('brew-btn').addEventListener('click', () => {
      if (selected.length < 2) {
        toast('Select two reagents to transmute.');
        return;
      }
      const key = [...selected].sort().join('+');
      stage.classList.add('brewing');
      resultBox.classList.remove('visible');
      playTone(261.63, 0.35, 'triangle', 0.06);
      setTimeout(() => playTone(329.63, 0.35, 'triangle', 0.06), 180);
      setTimeout(() => playTone(392.0, 0.55, 'sine', 0.07), 360);

      brewTimer = setTimeout(() => {
        stage.classList.remove('brewing');
        saveDiscoveredPotion(key);
        showPotion(key);
        renderGrimoire();
        selected = [];
        container.querySelectorAll('.lc-ingredient').forEach(b => b.setAttribute('aria-pressed', 'false'));
      }, 720);
    });

    renderGrimoire();
  }

  /* ═════════════════════════════════════════════════════════════
     3. THE NOCTURNAL EPHEMERIS (SVG Terminator + Date Scrubber)
     ═════════════════════════════════════════════════════════════ */
  const LUNAR_OMENS = [
    { name: 'New Moon', mansion: 'Mansion of Obsidian Ink', omen: 'A night for shadow work and first drafts. What is written unseen gathers quiet power.', verse: '“Deep into that darkness peering, long I stood there wondering, fearing…”', cite: 'Edgar Allan Poe — The Raven' },
    { name: 'Waxing Crescent', mansion: 'Mansion of the Silver Sickle', omen: 'Slender light cuts the mist. Plant an image or metaphor tonight and let sleep tend its roots.', verse: '“A curve, be it an arch, laid for sure, under a fertile field…”', cite: 'Emrecan Koç — A Glimpse from the Adrasan Shore' },
    { name: 'First Quarter', mansion: 'Mansion of Divided Glass', omen: 'Half in radiance, half in shade: dramatic tension thrives where two truths refuse reconciliation.', verse: '“The boundaries which divide Life from Death are at best shadowy and vague.”', cite: 'Edgar Allan Poe — The Premature Burial' },
    { name: 'Waxing Gibbous', mansion: 'Mansion of Rising Tide', omen: 'As the orb swells, buried motifs surface. Revise ruthlessly while perception is heightened.', verse: '“A savage place! as holy and enchanted as e’er beneath a waning moon was haunted…”', cite: 'Samuel Taylor Coleridge — Kubla Khan' },
    { name: 'Full Moon', mansion: 'Mansion of Selene’s Crown', omen: 'The veil is gossamer-thin. Every marble inscription gleams with uncanny clarity tonight.', verse: '“Even Selene hesitated to give her glow over the marble, erect stones…”', cite: 'Emrecan Koç — Carmilla' },
    { name: 'Waning Gibbous', mansion: 'Mansion of Falling Embers', omen: 'Harvest the insight of recent nights; pare away ornament until only bone-clean truth remains.', verse: '“Music begins where the word fails.”', cite: 'On Claude Debussy & Musical Impressionism' },
    { name: 'Last Quarter', mansion: 'Mansion of the Iron Key', omen: 'Close unfinished ledgers and forgive old ghosts; the pruning blade prepares the next season.', verse: '“A wrong is unredressed when retribution overtakes its redresser.”', cite: 'Edgar Allan Poe — The Cask of Amontillado' },
    { name: 'Waning Crescent', mansion: 'Mansion of Silent Vespers', omen: 'Balsamic stillness before renewal. Rest the quill and listen to rain against the casement.', verse: '“What is it about the night? The way it softens all the edges of the world…”', cite: 'J. Sheridan Le Fanu — Carmilla' }
  ];

  function buildMoonTerminatorPath(phaseFraction) {
    // phaseFraction: 0 = New, 0.25 = First Quarter, 0.5 = Full, 0.75 = Last Quarter
    const r = 56;
    const cx = 74, cy = 74;
    if (phaseFraction <= 0.015 || phaseFraction >= 0.985) {
      return '';
    }
    if (Math.abs(phaseFraction - 0.5) < 0.015) {
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
    }
    const waxing = phaseFraction < 0.5;
    const k = Math.cos(phaseFraction * 2 * Math.PI); // 1 at new, 0 at quarters, -1 at full
    const rx = Math.abs(k) * r;
    if (waxing) {
      // Right limb lit: top -> bottom clockwise along right outer arc, then terminator back to top
      const sweepInner = phaseFraction < 0.25 ? 0 : 1;
      return `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${rx.toFixed(2)} ${r} 0 0 ${sweepInner} ${cx} ${cy - r} Z`;
    } else {
      // Left limb lit: top -> bottom counter-clockwise along left outer arc, then terminator back to top
      const sweepInner = phaseFraction > 0.75 ? 1 : 0;
      return `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} A ${rx.toFixed(2)} ${r} 0 0 ${sweepInner} ${cx} ${cy - r} Z`;
    }
  }

  function initEphemeris(container) {
    const SYNODIC = 29.530588;
    const KNOWN_NEW = Date.UTC(2024, 0, 11, 11, 57, 0);

    function toInputDateStr(d) {
      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      return `${yr}-${mo}-${da}`;
    }

    const baseNow = new Date();

    container.innerHTML = `
      <div class="lc-ephemeris">
        <p class="lc-sanctum-sub">Astronomical lunar terminator &amp; nocturnal literary horoscope</p>
        <div class="lc-moon-stage">
          <svg class="lc-moon-svg" viewBox="0 0 148 148" aria-hidden="true">
            <defs>
              <radialGradient id="moon-lit-grad" cx="38%" cy="35%" r="68%">
                <stop offset="0%" stop-color="#fffdf7"/>
                <stop offset="65%" stop-color="#e7dcf7"/>
                <stop offset="100%" stop-color="#b9a4da"/>
              </radialGradient>
            </defs>
            <circle cx="74" cy="74" r="64" fill="none" stroke="rgba(255,255,255,0.08)" stroke-dasharray="2 4"/>
            <circle cx="74" cy="74" r="56" fill="#120c1c" stroke="rgba(255,255,255,0.18)" stroke-width="1.2"/>
            <path id="moon-lit-path" d="" fill="url(#moon-lit-grad)"/>
            <circle cx="56" cy="54" r="7" fill="rgba(90, 70, 120, 0.14)"/>
            <circle cx="88" cy="68" r="10" fill="rgba(90, 70, 120, 0.12)"/>
            <circle cx="66" cy="92" r="5.5" fill="rgba(90, 70, 120, 0.14)"/>
          </svg>
        </div>

        <h3 class="lc-moon-phase" id="eph-phase-name"></h3>
        <div class="lc-moon-metrics">
          <span class="lc-moon-metric-pill" id="eph-illum"></span>
          <span class="lc-moon-metric-pill" id="eph-age"></span>
          <span class="lc-moon-metric-pill" id="eph-mansion"></span>
        </div>

        <div class="lc-ephemeris-scrubber">
          <div class="lc-ephemeris-scrubber-top">
            <label for="eph-date" class="lc-potion-formula">Inspect Any Night:</label>
            <div style="display:flex;gap:0.45rem;align-items:center;">
              <input type="date" id="eph-date" class="lc-ephemeris-date-input" value="${toInputDateStr(baseNow)}">
              <button type="button" class="lc-tw-mini-btn" id="eph-tonight">Tonight</button>
            </div>
          </div>
          <input type="range" id="eph-offset" class="lc-ephemeris-range" min="-15" max="15" step="1" value="0" aria-label="Scrub lunar days around selected date">
        </div>

        <div class="lc-omen" id="eph-omen"></div>
        <div class="lc-ephemeris-canon">
          <p class="lc-canon-verse" id="eph-verse"></p>
        </div>
      </div>
    `;

    const litPath = document.getElementById('moon-lit-path');
    const phaseName = document.getElementById('eph-phase-name');
    const illumEl = document.getElementById('eph-illum');
    const ageEl = document.getElementById('eph-age');
    const mansionEl = document.getElementById('eph-mansion');
    const omenEl = document.getElementById('eph-omen');
    const verseEl = document.getElementById('eph-verse');
    const dateInput = document.getElementById('eph-date');
    const offsetInput = document.getElementById('eph-offset');

    function updateForDate(targetDate) {
      const elapsedDays = (targetDate.getTime() - KNOWN_NEW) / 86400000;
      const cycleDay = ((elapsedDays % SYNODIC) + SYNODIC) % SYNODIC;
      const frac = cycleDay / SYNODIC;
      const illum = Math.round(((1 - Math.cos(frac * 2 * Math.PI)) / 2) * 100);
      const idx = Math.floor(((frac + 1 / 16) % 1) * 8);
      const info = LUNAR_OMENS[idx];

      litPath.setAttribute('d', buildMoonTerminatorPath(frac));
      phaseName.textContent = info.name;
      illumEl.textContent = `${illum}% Illuminated`;
      ageEl.textContent = `Day ${cycleDay.toFixed(1)} of 29.5`;
      mansionEl.textContent = info.mansion;
      omenEl.textContent = '“' + info.omen + '”';
      verseEl.innerHTML = '';
      verseEl.appendChild(document.createTextNode(info.verse));
      const citeSpan = document.createElement('span');
      citeSpan.textContent = '— ' + info.cite;
      verseEl.appendChild(citeSpan);
    }

    function computeCurrentTarget() {
      const parts = (dateInput.value || toInputDateStr(baseNow)).split('-').map(Number);
      const base = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1, 22, 0, 0);
      const offsetDays = parseInt(offsetInput.value || '0', 10);
      return new Date(base.getTime() + offsetDays * 86400000);
    }

    dateInput.addEventListener('change', () => {
      offsetInput.value = '0';
      updateForDate(computeCurrentTarget());
    });

    offsetInput.addEventListener('input', () => {
      updateForDate(computeCurrentTarget());
    });

    document.getElementById('eph-tonight').addEventListener('click', () => {
      dateInput.value = toInputDateStr(new Date());
      offsetInput.value = '0';
      updateForDate(new Date());
    });

    updateForDate(baseNow);
  }

  /* ═════════════════════════════════════════════════════════════
     4. THE BLACKOUT POETRY ALTAR (Drag-Paint + PNG Export)
     ═════════════════════════════════════════════════════════════ */
  const BLACKOUT_PASSAGES = [
    {
      source: 'J. Sheridan Le Fanu — Carmilla',
      text: 'Sometimes after an hour of apathy, my strange and beautiful companion would take my hand and hold it with a fond pressure, renewed again and again; blushing softly, gazing in my face with languid and burning eyes, and breathing so fast that her dress rose and fell with the tumultuous respiration.'
    },
    {
      source: 'Mary Shelley — Frankenstein',
      text: 'It was a dreary night of November that I beheld the accomplishment of my toils. With an anxiety that almost amounted to agony, I collected the instruments of life around me, that I might infuse a spark of being into the lifeless thing that lay at my feet. The rain pattered dismally against the panes, and my candle was nearly burnt out.'
    },
    {
      source: 'Emily Brontë — Wuthering Heights',
      text: 'I have dreamt in my life, dreams that have stayed with me ever after, and changed my ideas; they have gone through and through me, like wine through water, and altered the color of my mind. Heaven did not seem to be my home; and I broke my heart with weeping to come back to earth.'
    },
    {
      source: 'Edgar Allan Poe — The Fall of the House of Usher',
      text: 'During the whole of a dull, dark, and soundless day in the autumn of the year, when the clouds hung oppressively low in the heavens, I had been passing alone, on horseback, through a singularly dreary tract of country; and at length found myself, as the shades of the evening drew on, within view of the melancholy House of Usher.'
    },
    {
      source: 'H. P. Lovecraft — The Call of Cthulhu',
      text: 'We live on a placid island of ignorance in the midst of black seas of infinity, and it was not meant that we should voyage far. Some day the piecing together of dissociated knowledge will open up such terrifying vistas of reality that we shall flee from the deadly light into the peace and safety of a new dark age.'
    },
    {
      source: 'Samuel Taylor Coleridge — Kubla Khan',
      text: 'In Xanadu did Kubla Khan a stately pleasure-dome decree: Where Alph, the sacred river, ran through caverns measureless to man down to a sunless sea. So twice five miles of fertile ground with walls and towers were girdled round.'
    }
  ];

  function initBlackoutAltar(container) {
    let currentIdx = 0;
    let isPainting = false;
    let paintRedactState = true;

    const upHandler = () => { isPainting = false; };
    window.addEventListener('pointerup', upHandler);
    onCleanup(() => window.removeEventListener('pointerup', upHandler));

    container.innerHTML = `
      <div class="lc-blackout">
        <div class="lc-blackout-topbar">
          <p class="lc-sanctum-sub" style="margin:0">Click or drag across words to redact &mdash; leave your emergent verse unshadowed.</p>
          <select id="blackout-select" class="lc-blackout-select" aria-label="Choose source manuscript">
            ${BLACKOUT_PASSAGES.map((p, i) => `<option value="${i}">${p.source}</option>`).join('')}
          </select>
        </div>

        <div class="lc-blackout-text" id="blackout-text"></div>

        <div class="lc-blackout-preview">
          <span class="lc-blackout-preview-label">Extracted Verse</span>
          <div class="lc-blackout-preview-verse" id="blackout-verse-preview"></div>
        </div>

        <div class="lc-blackout-controls">
          <button type="button" class="lc-sanctum-btn lc-btn-ghost" id="blackout-invert">Invert Redaction</button>
          <button type="button" class="lc-sanctum-btn lc-btn-ghost" id="blackout-clear">Reset Sheet</button>
          <button type="button" class="lc-sanctum-btn lc-btn-ghost" id="blackout-copy">Copy Poem</button>
          <button type="button" class="lc-sanctum-btn" id="blackout-export">✦ Export Broadside PNG</button>
        </div>
      </div>
    `;

    const sheetEl = document.getElementById('blackout-text');
    const previewEl = document.getElementById('blackout-verse-preview');
    const selectEl = document.getElementById('blackout-select');

    function getExtractedPoem() {
      const kept = Array.from(sheetEl.querySelectorAll('.lc-blackout-word:not(.redacted)')).map(w => w.textContent);
      return kept.join(' ').trim();
    }

    function updatePreview() {
      const text = getExtractedPoem();
      previewEl.textContent = text || '… (all words redacted — click shaded bars to reveal words) …';
    }

    function renderPassage(index) {
      currentIdx = index;
      const passage = BLACKOUT_PASSAGES[index];
      sheetEl.innerHTML = '';
      passage.text.split(/\s+/).forEach((word, i, arr) => {
        const span = document.createElement('span');
        span.className = 'lc-blackout-word';
        span.textContent = word;
        sheetEl.appendChild(span);
        if (i < arr.length - 1) {
          sheetEl.appendChild(document.createTextNode(' '));
        }
      });
      updatePreview();
    }

    sheetEl.addEventListener('pointerdown', e => {
      const word = e.target.closest('.lc-blackout-word');
      if (!word) return;
      e.preventDefault();
      isPainting = true;
      paintRedactState = !word.classList.contains('redacted');
      word.classList.toggle('redacted', paintRedactState);
      updatePreview();
    });

    sheetEl.addEventListener('pointerover', e => {
      if (!isPainting) return;
      const word = e.target.closest('.lc-blackout-word');
      if (!word) return;
      word.classList.toggle('redacted', paintRedactState);
      updatePreview();
    });

    selectEl.addEventListener('change', () => {
      renderPassage(parseInt(selectEl.value, 10) || 0);
    });

    document.getElementById('blackout-invert').addEventListener('click', () => {
      sheetEl.querySelectorAll('.lc-blackout-word').forEach(w => w.classList.toggle('redacted'));
      updatePreview();
    });

    document.getElementById('blackout-clear').addEventListener('click', () => {
      sheetEl.querySelectorAll('.lc-blackout-word').forEach(w => w.classList.remove('redacted'));
      updatePreview();
    });

    document.getElementById('blackout-copy').addEventListener('click', () => {
      const poem = getExtractedPoem();
      if (!poem) {
        toast('Leave at least a few words unredacted first.');
        return;
      }
      const out = `“${poem}”\n— Blackout erasure from ${BLACKOUT_PASSAGES[currentIdx].source} (via Literaconite)`;
      navigator.clipboard.writeText(out).then(() => toast('✦ Blackout poem copied')).catch(() => {});
    });

    document.getElementById('blackout-export').addEventListener('click', () => {
      const words = Array.from(sheetEl.querySelectorAll('.lc-blackout-word'));
      const canvas = document.createElement('canvas');
      const w = 960, pad = 72;
      const c = canvas.getContext('2d');
      c.font = '28px Georgia, serif';

      // Measure lines
      const maxLineW = w - pad * 2;
      const lines = [];
      let curLine = [];
      let curW = 0;
      const spaceW = c.measureText(' ').width + 4;

      words.forEach(el => {
        const txt = el.textContent;
        const ww = c.measureText(txt).width + 8;
        if (curW + ww > maxLineW && curLine.length > 0) {
          lines.push(curLine);
          curLine = [];
          curW = 0;
        }
        curLine.push({ text: txt, redacted: el.classList.contains('redacted'), width: ww });
        curW += ww + spaceW;
      });
      if (curLine.length > 0) lines.push(curLine);

      const lineH = 54;
      const h = pad * 2 + 70 + lines.length * lineH + 75;
      canvas.width = w;
      canvas.height = h;

      // Parchment background
      const grad = c.createRadialGradient(w * 0.3, h * 0.2, 40, w * 0.5, h * 0.5, w * 0.9);
      grad.addColorStop(0, '#f3ead8');
      grad.addColorStop(1, '#dfd2ba');
      c.fillStyle = grad;
      c.fillRect(0, 0, w, h);

      c.strokeStyle = 'rgba(90, 68, 45, 0.45)';
      c.lineWidth = 3;
      c.strokeRect(24, 24, w - 48, h - 48);

      // Header
      c.fillStyle = '#5c4632';
      c.font = '600 15px sans-serif';
      c.fillText('LITERACONITE • BLACKOUT POETRY ALTAR', pad, pad + 12);

      // Words
      c.font = '28px Georgia, serif';
      lines.forEach((line, rowIdx) => {
        let x = pad;
        const y = pad + 68 + rowIdx * lineH;
        line.forEach(item => {
          if (item.redacted) {
            c.fillStyle = '#141115';
            c.fillRect(x - 2, y - 28, item.width + 4, 36);
          } else {
            c.fillStyle = '#1c1612';
            c.fillText(item.text, x + 2, y);
          }
          x += item.width + spaceW;
        });
      });

      // Footer attribution
      c.fillStyle = '#5c4632';
      c.font = 'italic 18px Georgia, serif';
      c.fillText('Source: ' + BLACKOUT_PASSAGES[currentIdx].source, pad, h - pad + 10);

      const link = document.createElement('a');
      link.download = 'literaconite-blackout-poem.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast('✦ Parchment broadside exported as PNG');
    });

    renderPassage(0);
  }

  /* ═════════════════════════════════════════════════════════════
     5. THE GOTHIC WAX SEAL FOUNDRY (High-DPI Canvas + PNG Export)
     ═════════════════════════════════════════════════════════════ */
  const WAX_PIGMENTS = [
    { name: 'Crimson', base: '#7f111b', mid: '#a81c29', light: '#f06472', dark: '#380409', ink: '#ffdbe0' },
    { name: 'Obsidian', base: '#1a1626', mid: '#2c2540', light: '#8b7cb3', dark: '#08060d', ink: '#e2d9f7' },
    { name: 'Verdigris', base: '#123d33', mid: '#1c5c4d', light: '#68c7b0', dark: '#061c17', ink: '#d4f7ee' },
    { name: 'Imperial Plum', base: '#3d1038', mid: '#5e1a56', light: '#d16bc4', dark: '#1a0417', ink: '#f7d9f3' },
    { name: 'Antique Gold', base: '#704f14', mid: '#9c7121', light: '#f2ca74', dark: '#362405', ink: '#fff3d1' },
    { name: 'Bone Ivory', base: '#bfb39b', mid: '#d9ceb8', light: '#ffffff', dark: '#756a55', ink: '#3d3324' }
  ];

  const SEAL_CRESTS = [
    { id: 'none', label: 'Monogram Only', glyph: '' },
    { id: 'fleur', label: 'Fleur-de-lis ⚜', glyph: '⚜' },
    { id: 'moon', label: 'Crescent ☽', glyph: '☽' },
    { id: 'star', label: 'Aconite Star ✦', glyph: '✦' },
    { id: 'cross', label: 'Abbey Cross ☩', glyph: '☩' },
    { id: 'diamond', label: 'Sigil ◈', glyph: '◈' }
  ];

  const SEAL_MOTTOS = [
    'EX LIBRIS • LITERACONITE •',
    'MEMENTO MORI • SUB ROSA •',
    'ARS LONGA • VITA BREVIS •',
    'IN TENEBRIS • LUX VERBI •'
  ];

  function initWaxSeal(container) {
    let pigmentIdx = 0;
    let seedPhase = 0.4;

    container.innerHTML = `
      <div class="lc-wax-seal">
        <p class="lc-sanctum-sub">Customize wax pigment, crest, motto, &amp; initials &mdash; press and export your Ex-Libris signet.</p>
        <div class="lc-seal-controls">
          <div class="lc-seal-field">
            <label for="seal-input">Monogram</label>
            <input type="text" id="seal-input" class="lc-seal-text-input" maxlength="3" value="EK" autocomplete="off">
          </div>
          <div class="lc-seal-field">
            <label for="seal-crest">Heraldic Crest</label>
            <select id="seal-crest" class="lc-seal-select">
              ${SEAL_CRESTS.map(c => `<option value="${c.glyph}">${c.label}</option>`).join('')}
            </select>
          </div>
          <div class="lc-seal-field">
            <label for="seal-motto">Ring Motto</label>
            <select id="seal-motto" class="lc-seal-select">
              ${SEAL_MOTTOS.map(m => `<option value="${m}">${m.replace(/ •$/, '')}</option>`).join('')}
            </select>
          </div>
          <div class="lc-seal-field" style="grid-column: 1 / -1;">
            <span class="lc-seal-field-label">Molten Wax Pigment</span>
            <div class="lc-seal-swatches" id="seal-swatches">
              ${WAX_PIGMENTS.map((p, i) => `
                <button type="button" class="lc-swatch ${i === 0 ? 'active' : ''}" data-index="${i}" style="background:radial-gradient(circle at 35% 35%, ${p.light}, ${p.base})" aria-label="${p.name} wax" title="${p.name}"></button>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="lc-seal-stage">
          <canvas id="seal-render-canvas" class="lc-seal-render-canvas" width="440" height="440"></canvas>
        </div>

        <div class="lc-seal-actions">
          <button type="button" class="lc-sanctum-btn" id="stamp-btn">⚜ Stamp the Seal</button>
          <button type="button" class="lc-sanctum-btn lc-btn-ghost" id="download-seal-btn">Download PNG Signet</button>
        </div>
        <div class="lc-seal-result" id="seal-result" aria-live="polite"></div>
      </div>
    `;

    const canvas = document.getElementById('seal-render-canvas');
    const c = canvas.getContext('2d');
    const input = document.getElementById('seal-input');
    const crestSelect = document.getElementById('seal-crest');
    const mottoSelect = document.getElementById('seal-motto');
    const resultEl = document.getElementById('seal-result');

    function drawSeal() {
      const pig = WAX_PIGMENTS[pigmentIdx];
      const initials = (input.value.trim().toUpperCase() || '✦').slice(0, 3);
      const crest = crestSelect.value;
      const motto = mottoSelect.value;

      c.clearRect(0, 0, 440, 440);
      const cx = 220, cy = 220;

      // 1. Organic molten outer wax pool
      c.save();
      c.beginPath();
      const steps = 120;
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        const wobble =
          8 * Math.sin(a * 5 + seedPhase) +
          5 * Math.cos(a * 8 - seedPhase * 1.7) +
          3 * Math.sin(a * 13 + seedPhase * 2.3);
        const rad = 188 + wobble;
        const x = cx + Math.cos(a) * rad;
        const y = cy + Math.sin(a) * rad;
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.closePath();

      const outerGrad = c.createRadialGradient(cx - 52, cy - 58, 20, cx, cy, 205);
      outerGrad.addColorStop(0, pig.light);
      outerGrad.addColorStop(0.38, pig.mid);
      outerGrad.addColorStop(0.82, pig.base);
      outerGrad.addColorStop(1, pig.dark);
      c.fillStyle = outerGrad;
      c.fill();

      c.lineWidth = 4;
      c.strokeStyle = pig.dark;
      c.stroke();
      c.restore();

      // 2. Raised ridge around stamped depression
      c.beginPath();
      c.arc(cx, cy, 146, 0, Math.PI * 2);
      c.lineWidth = 12;
      const rimGrad = c.createLinearGradient(cx - 140, cy - 140, cx + 140, cy + 140);
      rimGrad.addColorStop(0, pig.light);
      rimGrad.addColorStop(0.5, pig.mid);
      rimGrad.addColorStop(1, pig.dark);
      c.strokeStyle = rimGrad;
      c.stroke();

      // 3. Recessed intaglio face
      c.beginPath();
      c.arc(cx, cy, 138, 0, Math.PI * 2);
      const faceGrad = c.createRadialGradient(cx + 35, cy + 35, 10, cx, cy, 145);
      faceGrad.addColorStop(0, pig.mid);
      faceGrad.addColorStop(0.75, pig.base);
      faceGrad.addColorStop(1, pig.dark);
      c.fillStyle = faceGrad;
      c.fill();

      // 4. Beaded inner border
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        const bx = cx + Math.cos(a) * 129;
        const by = cy + Math.sin(a) * 129;
        c.beginPath();
        c.arc(bx, by, 2.2, 0, Math.PI * 2);
        c.fillStyle = pig.ink;
        c.globalAlpha = 0.55;
        c.fill();
      }
      c.globalAlpha = 1;

      // 5. Circular motto text
      c.save();
      c.font = '600 13px Cinzel, Georgia, serif';
      c.fillStyle = pig.ink;
      c.globalAlpha = 0.72;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      const chars = motto.split('');
      const stepAngle = (Math.PI * 2) / chars.length;
      chars.forEach((ch, idx) => {
        const angle = -Math.PI / 2 + idx * stepAngle;
        c.save();
        c.translate(cx + Math.cos(angle) * 109, cy + Math.sin(angle) * 109);
        c.rotate(angle + Math.PI / 2);
        c.fillText(ch, 0, 0);
        c.restore();
      });
      c.restore();

      // 6. Crest & Monogram embossing
      c.save();
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.shadowColor = pig.dark;
      c.shadowOffsetX = 2;
      c.shadowOffsetY = 3;
      c.shadowBlur = 4;
      c.fillStyle = pig.ink;

      if (crest) {
        c.globalAlpha = 0.85;
        c.font = '34px Georgia, serif';
        c.fillText(crest, cx, cy - 42);
        c.font = '700 66px Cinzel, Georgia, serif';
        c.fillText(initials, cx, cy + 20);
      } else {
        c.globalAlpha = 0.88;
        c.font = '700 78px Cinzel, Georgia, serif';
        c.fillText(initials, cx, cy + 4);
      }
      c.restore();
    }

    input.addEventListener('input', drawSeal);
    crestSelect.addEventListener('change', drawSeal);
    mottoSelect.addEventListener('change', drawSeal);

    document.getElementById('seal-swatches').addEventListener('click', e => {
      const sw = e.target.closest('.lc-swatch');
      if (!sw) return;
      pigmentIdx = parseInt(sw.getAttribute('data-index'), 10) || 0;
      container.querySelectorAll('.lc-swatch').forEach(b => b.classList.remove('active'));
      sw.classList.add('active');
      drawSeal();
    });

    document.getElementById('stamp-btn').addEventListener('click', () => {
      seedPhase = Math.random() * Math.PI * 2;
      canvas.classList.add('is-stamping');
      playTone(110, 0.25, 'triangle', 0.14);
      setTimeout(() => playTone(440, 0.5, 'sine', 0.05), 90);
      setTimeout(() => {
        drawSeal();
        canvas.classList.remove('is-stamping');
        resultEl.textContent = `✦ ${WAX_PIGMENTS[pigmentIdx].name} Ex-Libris seal forged and pressed.`;
      }, 210);
    });

    document.getElementById('download-seal-btn').addEventListener('click', () => {
      const link = document.createElement('a');
      const code = (input.value.trim().toLowerCase() || 'seal').replace(/[^a-z0-9]/g, '');
      link.download = `literaconite-seal-${code || 'signet'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast('✦ Transparent PNG wax seal downloaded');
    });

    drawSeal();
  }

  /* ═════════════════════════════════════════════════════════════
     6. THE CURSED TYPEWRITER (Mechanical Audio + Persistent Vault)
     ═════════════════════════════════════════════════════════════ */
  const TYPEWRITER_PROMPTS = [
    'The night I broke the wax seal on the third letter, I realized…',
    'She stood by the rain-streaked casement and did not turn when I spoke her name…',
    'Beneath the floorboards of the east study, wrapped in velvet, lay…',
    'For three nights the abbey bell has struck thirteen at midnight…',
    'My dearest friend, if this manuscript reaches you after my departure…',
    'The portrait in the gallery had altered in only a single, terrible detail…',
    'No map of the coast records the cove where the black water stands still…',
    'The prompter whispered the final line from an empty orchestra pit…'
  ];

  function getVaultEntries() {
    try {
      const list = JSON.parse(localStorage.getItem('lc-tw-vault') || '[]');
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function saveVaultEntries(list) {
    try { localStorage.setItem('lc-tw-vault', JSON.stringify(list)); } catch (e) {}
  }

  function initTypewriter(container) {
    let soundOn = true;
    let promptIdx = Math.floor(Math.random() * TYPEWRITER_PROMPTS.length);
    let burnConfirmTimer = null;
    onCleanup(() => clearTimeout(burnConfirmTimer));

    let savedDraft = '';
    try { savedDraft = localStorage.getItem('lc-tw-draft') || ''; } catch (e) {}

    container.innerHTML = `
      <div class="lc-typewriter">
        <div class="lc-typewriter-topbar">
          <div class="lc-typewriter-stats">
            <span id="tw-count">0 words</span>
            <span>&bull;</span>
            <span id="tw-chars">0 chars</span>
          </div>
          <button type="button" class="lc-tw-mini-btn" id="tw-sound-toggle" aria-pressed="true">Keys Audio: On</button>
        </div>

        <div class="lc-tw-prompt-bar">
          <span>Prompt: <em id="tw-prompt-text">${TYPEWRITER_PROMPTS[promptIdx]}</em></span>
          <button type="button" class="lc-tw-mini-btn" id="tw-prompt-new">Next Prompt &#8635;</button>
        </div>

        <div class="lc-typewriter-paper" id="tw-paper">
          <textarea class="lc-typewriter-textarea" id="typewriter-input" placeholder="Strike the keys — your draft auto-saves locally until burned or sealed..."></textarea>
        </div>

        <div class="lc-typewriter-controls">
          <div class="lc-typewriter-controls-group">
            <button type="button" class="lc-sanctum-btn lc-btn-ghost lc-btn-danger" id="tw-burn">Burn to Ash</button>
            <button type="button" class="lc-sanctum-btn lc-btn-ghost" id="tw-export-txt">Download .txt</button>
          </div>
          <div class="lc-typewriter-controls-group">
            <button type="button" class="lc-sanctum-btn" id="tw-save">✦ Seal in Vault</button>
          </div>
        </div>

        <div class="lc-tw-vault" id="tw-vault">
          <span class="lc-tw-vault-title">Sealed Confessions Vault</span>
          <div id="tw-vault-list" style="display:flex;flex-direction:column;gap:0.5rem;"></div>
        </div>
      </div>
    `;

    const textarea = document.getElementById('typewriter-input');
    const paper = document.getElementById('tw-paper');
    const countEl = document.getElementById('tw-count');
    const charsEl = document.getElementById('tw-chars');
    const soundBtn = document.getElementById('tw-sound-toggle');
    const burnBtn = document.getElementById('tw-burn');
    const vaultList = document.getElementById('tw-vault-list');

    textarea.value = savedDraft;

    function updateMetrics() {
      const raw = textarea.value;
      const trimmed = raw.trim();
      const words = trimmed ? trimmed.split(/\s+/).length : 0;
      countEl.textContent = `${words} word${words === 1 ? '' : 's'}`;
      charsEl.textContent = `${raw.length} chars`;
      try { localStorage.setItem('lc-tw-draft', raw); } catch (e) {}
    }

    function renderVault() {
      const entries = getVaultEntries();
      vaultList.innerHTML = '';
      if (entries.length === 0) {
        const empty = document.createElement('span');
        empty.className = 'lc-tw-vault-meta';
        empty.textContent = 'No confessions sealed yet. Click “Seal in Vault” to preserve manuscripts locally.';
        vaultList.appendChild(empty);
        return;
      }

      entries.forEach((entry, idx) => {
        const row = document.createElement('div');
        row.className = 'lc-tw-vault-item';

        const snippet = document.createElement('span');
        snippet.className = 'lc-tw-vault-snippet';
        snippet.textContent = entry.text.replace(/\s+/g, ' ').slice(0, 90);

        const meta = document.createElement('span');
        meta.className = 'lc-tw-vault-meta';
        meta.textContent = entry.date;

        const btns = document.createElement('div');
        btns.className = 'lc-tw-vault-btns';

        const loadBtn = document.createElement('button');
        loadBtn.type = 'button';
        loadBtn.className = 'lc-tw-mini-btn';
        loadBtn.textContent = 'Load';
        loadBtn.addEventListener('click', () => {
          textarea.value = entry.text;
          updateMetrics();
          toast('Manuscript restored to platen');
        });

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'lc-tw-mini-btn';
        delBtn.textContent = '×';
        delBtn.setAttribute('aria-label', 'Delete sealed manuscript');
        delBtn.addEventListener('click', () => {
          const all = getVaultEntries();
          all.splice(idx, 1);
          saveVaultEntries(all);
          renderVault();
        });

        btns.appendChild(loadBtn);
        btns.appendChild(delBtn);

        row.appendChild(snippet);
        row.appendChild(meta);
        row.appendChild(btns);
        vaultList.appendChild(row);
      });
    }

    textarea.addEventListener('keydown', e => {
      if (!soundOn || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Enter') {
        playKeyClack(true);
      } else if (e.key.length === 1 || e.key === 'Backspace') {
        const lineLen = textarea.value.split('\n').pop()?.length || 0;
        playKeyClack(lineLen > 0 && lineLen % 68 === 0);
      }
    });

    textarea.addEventListener('input', updateMetrics);

    soundBtn.addEventListener('click', () => {
      soundOn = !soundOn;
      soundBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
      soundBtn.textContent = 'Keys Audio: ' + (soundOn ? 'On' : 'Off');
    });

    document.getElementById('tw-prompt-new').addEventListener('click', () => {
      promptIdx = (promptIdx + 1) % TYPEWRITER_PROMPTS.length;
      document.getElementById('tw-prompt-text').textContent = TYPEWRITER_PROMPTS[promptIdx];
    });

    let confirmingBurn = false;
    burnBtn.addEventListener('click', () => {
      if (!textarea.value.trim()) {
        toast('The page is already blank.');
        return;
      }
      if (!confirmingBurn) {
        confirmingBurn = true;
        burnBtn.classList.add('is-confirming');
        burnBtn.textContent = 'Confirm Burn?';
        burnConfirmTimer = setTimeout(() => {
          confirmingBurn = false;
          burnBtn.classList.remove('is-confirming');
          burnBtn.textContent = 'Burn to Ash';
        }, 3200);
        return;
      }
      clearTimeout(burnConfirmTimer);
      confirmingBurn = false;
      burnBtn.classList.remove('is-confirming');
      burnBtn.textContent = 'Burn to Ash';
      paper.classList.add('is-burning');
      playTone(130, 0.5, 'sawtooth', 0.04);
      setTimeout(() => {
        textarea.value = '';
        updateMetrics();
        paper.classList.remove('is-burning');
        toast('Consumed by flame — only ash remains.');
      }, 430);
    });

    document.getElementById('tw-export-txt').addEventListener('click', () => {
      const content = textarea.value.trim();
      if (!content) {
        toast('Write a passage before exporting.');
        return;
      }
      const blob = new Blob([content + '\n\n— Inscribed via The Cursed Typewriter, Literaconite\n'], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'literaconite-manuscript.txt';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('✦ Manuscript downloaded as .txt');
    });

    document.getElementById('tw-save').addEventListener('click', () => {
      const content = textarea.value.trim();
      if (!content) {
        toast('Inscribe at least one line before sealing.');
        return;
      }
      const entries = getVaultEntries();
      const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      entries.unshift({ text: content, date: dateStr });
      saveVaultEntries(entries.slice(0, 20));
      textarea.value = '';
      updateMetrics();
      renderVault();
      playTone(523.25, 0.45, 'sine', 0.06);
      toast('✦ Manuscript sealed in your local vault');
    });

    updateMetrics();
    renderVault();
  }

  /* ═════════════════════════════════════════════════════════════
     7. THE RELIQUARY CABINET (9 Canonical Relics + Provenance)
     ═════════════════════════════════════════════════════════════ */
  const RELICS = [
    {
      cat: 'CAT. I',
      icon: '🥀',
      name: 'The Karnstein Brooch',
      provenance: 'Styria, c. 1872 • Velvet & Tarnished Silver',
      desc: 'Recovered from the ruined chapel of Karnstein. Its clasp still carries a faint trace of dried rose-oil and iron.',
      quote: '“Strange love! that in the very moment of its dawning should have burst upon me with such power.”',
      source: 'J. S. Le Fanu — Carmilla',
      link: '/poetry/carmilla/',
      linkLabel: 'Read “Carmilla” Poem →'
    },
    {
      cat: 'CAT. II',
      icon: '🧱',
      name: 'Montresor’s Silver Trowel',
      provenance: 'Palazzo Catacombs • Mortar & Nitre Crust',
      desc: 'Produced hurriedly from beneath a roquelaure at the height of carnival season; encrusted with white cavern nitre.',
      quote: '“A wrong is unredressed when retribution overtakes its redresser.”',
      source: 'Edgar Allan Poe — The Cask of Amontillado',
      link: '/review/on-the-relation-between-poes-the-cask-of-amontillado-and-vengeance-as-a-subject-matter/',
      linkLabel: 'Read Poe Vengeance Essay →'
    },
    {
      cat: 'CAT. III',
      icon: '⚖️',
      name: 'Warrant of Salem Court',
      provenance: 'Massachusetts, 1692 • Rag Paper & Gall Ink',
      desc: 'Creased court deposition bearing seventeen signatures and one torn margin where a defendant refused to sign away his name.',
      quote: '“Because it is my name! Because I cannot have another in my life!”',
      source: 'Arthur Miller — The Crucible',
      link: '/review/the-crucible-allegory-witchcraft-and-mob-hysteria/',
      linkLabel: 'Read The Crucible Essay →'
    },
    {
      cat: 'CAT. IV',
      icon: '🌊',
      name: 'Pebble of Xanadu',
      provenance: 'Porlock Coast, 1797 • Black Basalt',
      desc: 'Smooth river stone cold as sunless ice, lifted beside a waking dream interrupted by an untimely visitor.',
      quote: '“Where Alph, the sacred river, ran through caverns measureless to man down to a sunless sea.”',
      source: 'S. T. Coleridge — Kubla Khan',
      link: '/poetry/kubla-khan-by-samuel-taylor-coleridge-a-translation-into-turkish-and-a-reflection/',
      linkLabel: 'Read Kubla Khan Reflection →'
    },
    {
      cat: 'CAT. V',
      icon: '🎹',
      name: 'Moonlit Manuscript Leaf',
      provenance: 'Paris, 1890 • Suite Bergamasque III',
      desc: 'A score sheet penciled in D-flat major whose arpeggios dissolve bar-lines into pure shimmering mist.',
      quote: '“Music begins where the word fails.”',
      source: 'Claude Debussy — Clair de Lune',
      link: '/review/claude-debussys-clair-de-lune-and-musical-impressionism/',
      linkLabel: 'Read Debussy Essay →'
    },
    {
      cat: 'CAT. VI',
      icon: '🏺',
      name: 'Lapis Shard of Uruk',
      provenance: 'Mesopotamia • Cuneiform Clay & Lapis',
      desc: 'Fragment of the eleventh tablet recording a king’s vigil at the edge of the world’s dark waters.',
      quote: '“He who saw the Deep, the foundation of the country, knew the ways and was wise in all things.”',
      source: 'The Epic of Gilgamesh',
      link: '/review/today-i-am-choosing-an-eastern-hero-for-myself-to-examine/',
      linkLabel: 'Read Gilgamesh Essay →'
    },
    {
      cat: 'CAT. VII',
      icon: '🧭',
      name: 'Mariner’s Salt Compass',
      provenance: 'London, 1719 • Brass & Cracked Glass',
      desc: 'Its needle points not north, but toward uncharted archipelagos where early prose fiction invented realism.',
      quote: '“Travel strips the protagonist of inherited station, testing the solitary self against contingency.”',
      source: 'The Rise of the English Novel',
      link: '/review/the-rise-of-the-english-novel-and-the-theme-of-travel/',
      linkLabel: 'Read Rise of the Novel →'
    },
    {
      cat: 'CAT. VIII',
      icon: '🎭',
      name: 'Mask of Dionysus & Globe',
      provenance: 'Athens / Bankside • Terracotta & Oak',
      desc: 'Split tragic mask uniting Sophoclean fate with Shakespearean inwardness and fatal ambition.',
      quote: '“Where Classical tragedy bends beneath cosmic necessity, Elizabethan tragedy fractures from within.”',
      source: 'Greek vs. Elizabethan Tragedy',
      link: '/review/a-comparison-between-classical-greek-tragedy-and-elizabethan-tragedy/',
      linkLabel: 'Read Tragedy Comparison →'
    },
    {
      cat: 'CAT. IX',
      icon: '🩸',
      name: 'Phial of Mircalla',
      provenance: 'Nocturnal Archive • Ruby Glass',
      desc: 'Warm to the touch even in winter; resonates faintly whenever spoken verse is read aloud in the room.',
      quote: '“Make of my veins a graveyard. Make of my ruin your bed.”',
      source: 'Emrecan Koç — Mircalla',
      link: '/poetry/mircalla/',
      linkLabel: 'Read “Mircalla” Poem →'
    }
  ];

  function initReliquary(container) {
    container.innerHTML = `
      <div class="lc-reliquary">
        <p class="lc-sanctum-sub">Select a numbered vitrine to inspect its provenance &amp; linked Literaconite inscription.</p>
        <div class="lc-relic-grid" id="relic-grid">
          ${RELICS.map((r, i) => `
            <button type="button" class="lc-relic ${i === 0 ? 'active' : ''}" data-index="${i}">
              <span class="lc-relic-cat">${r.cat}</span>
              <span class="lc-relic-icon" aria-hidden="true">${r.icon}</span>
              <span class="lc-relic-name">${r.name}</span>
            </button>
          `).join('')}
        </div>
        <div class="lc-relic-detail visible" id="relic-detail" aria-live="polite"></div>
      </div>
    `;

    const detail = document.getElementById('relic-detail');
    const chimeNotes = [440, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77];

    function renderRelicDetail(index, withSound) {
      const r = RELICS[index];
      if (!r) return;
      if (withSound) playTone(chimeNotes[index % chimeNotes.length], 0.55, 'sine', 0.055);

      detail.innerHTML = `
        <div class="lc-relic-detail-inner">
          <span class="lc-relic-provenance">${r.cat} &bull; ${r.provenance}</span>
          <h3 class="lc-relic-detail-name">${r.name}</h3>
          <p class="lc-relic-detail-desc">${r.desc}</p>
          <blockquote class="lc-relic-detail-quote">${r.quote}<cite>&mdash; ${r.source}</cite></blockquote>
          <a class="lc-spirit-canon-link" href="${r.link}" style="margin-top:0.4rem;">${r.linkLabel}</a>
        </div>
      `;
    }

    document.getElementById('relic-grid').addEventListener('click', e => {
      const btn = e.target.closest('.lc-relic');
      if (!btn) return;
      container.querySelectorAll('.lc-relic').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderRelicDetail(parseInt(btn.getAttribute('data-index'), 10) || 0, true);
    });

    renderRelicDetail(0, false);
  }

  /* ═════════════════════════════════════════════════════════════
     8. THE CRYPT LABYRINTH (12 Chambers, SVG Archways & Automap)
     ═════════════════════════════════════════════════════════════ */
  // 3 cols x 4 rows grid (indices 0..11)
  const CRYPT_CHAMBERS = [
    { name: 'I. The Iron Lichgate', desc: 'Rusted wrought-iron gates groan behind you. Cold mist coils down worn limestone steps.', flavor: 'Use buttons or Arrow / WASD keys to explore.', exits: { l: -1, f: 3, r: 1, b: -1 } },
    { name: 'II. Gallery of Effigies', desc: 'Recumbent marble knights line the vaulted aisle, their stone hands clasped over chiselled Latin.', flavor: 'One visor has been pried open from within.', exits: { l: 0, f: 4, r: 2, b: -1 } },
    { name: 'III. The Weeping Cistern', desc: 'Black rainwater drips steadily from the abbey nave above into an octagonal basin.', flavor: 'Ripples form where no drop has fallen.', exits: { l: 1, f: 5, r: -1, b: -1 }, relic: 'The Xanadu Scroll' },
    { name: 'IV. Nitre Passageway', desc: 'White crystalline nitre furs the damp ashlar masonry like frozen cobwebs.', flavor: '“Nemo me impune lacessit” is scratched into a brick.', exits: { l: -1, f: 6, r: 4, b: 0 } },
    { name: 'V. The Crossing Rotunda', desc: 'Four ribbed Gothic arches converge beneath a cracked oculus of stained violet glass.', flavor: 'Every whisper returns half a tone lower.', exits: { l: 3, f: 7, r: 5, b: 1 } },
    { name: 'VI. Scriptorium Vault', desc: 'Chained folios rest upon sloped oak lecterns coated in centuries of tallow wax.', flavor: 'An inkhorn sits freshly uncapped.', exits: { l: 4, f: 8, r: -1, b: 2 } },
    { name: 'VII. Ossuary Niche', desc: 'Tiered alcoves hold neatly arranged femurs and parchment name-tags faded to sepia.', flavor: 'A cold draft breathes from the south.', exits: { l: -1, f: 9, r: 7, b: 3 }, relic: 'Montresor’s Ledger' },
    { name: 'VIII. The Sunken Chancel', desc: 'Shattered flagstones tilt toward a black altar draped in moth-eaten crimson velvet.', flavor: 'Three votive tapers still burn without smoke.', exits: { l: 6, f: 10, r: 8, b: 4 } },
    { name: 'IX. Belfry Undercroft', desc: 'Hemp bell-ropes descend through holes in the vaulting, swaying imperceptibly.', flavor: 'Far overhead, bronze hums in sympathy.', exits: { l: 7, f: 11, r: -1, b: 5 } },
    { name: 'X. Chapel of Karnstein', desc: 'Moonlight pierces a narrow lancet slit, illuminating an empty porphyry sarcophagus.', flavor: 'Velvet violets lie fresh upon the plinth.', exits: { l: -1, f: -1, r: 10, b: 6 } },
    { name: 'XI. Sanctum Sanctorum', desc: 'At the heart of the catacomb stands a lectern bearing the Illuminated Canon of Literaconite.', flavor: 'All subterranean corridors converge here.', exits: { l: 9, f: -1, r: 11, b: 7 }, relic: 'Stanza of Mircalla' },
    { name: 'XII. The Mirror Vault', desc: 'Tall mercury-silvered mirrors reflect your torchlight down an infinite receding arcade.', flavor: 'Your reflection turns a fraction too late.', exits: { l: 10, f: -1, r: -1, b: 8 } }
  ];

  function getCryptRelics() {
    try {
      const r = JSON.parse(localStorage.getItem('lc-crypt-relics') || '[]');
      return Array.isArray(r) ? r : [];
    } catch (e) {
      return [];
    }
  }

  function saveCryptRelic(name) {
    const list = getCryptRelics();
    if (!list.includes(name)) {
      list.push(name);
      try { localStorage.setItem('lc-crypt-relics', JSON.stringify(list)); } catch (e) {}
      return true;
    }
    return false;
  }

  function buildCorridorSVG(exits) {
    const leftArch = exits.l !== -1
      ? `<path d="M26 210 V92 Q52 68 74 96 V186 Z" fill="#040207" stroke="rgba(192,132,252,0.45)" stroke-width="1.5"/>`
      : '';
    const frontArch = exits.f !== -1
      ? `<path d="M158 182 V88 Q200 52 242 88 V182 Z" fill="#030106" stroke="rgba(192,132,252,0.55)" stroke-width="1.8"/>`
      : `<rect x="166" y="88" width="68" height="82" rx="3" fill="none" stroke="rgba(255,255,255,0.1)" stroke-dasharray="4 4"/>`;
    const rightArch = exits.r !== -1
      ? `<path d="M326 186 V96 Q348 68 374 92 V210 Z" fill="#040207" stroke="rgba(192,132,252,0.45)" stroke-width="1.5"/>`
      : '';

    return `
      <svg class="lc-crypt-corridor-svg" viewBox="0 0 400 250" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1="0" x2="115" y2="68" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
        <line x1="400" y1="0" x2="285" y2="68" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
        <line x1="0" y1="250" x2="115" y2="182" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
        <line x1="400" y1="250" x2="285" y2="182" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
        <rect x="115" y="68" width="170" height="114" fill="rgba(10,6,18,0.55)" stroke="rgba(255,255,255,0.16)" stroke-width="1"/>
        ${leftArch}
        ${frontArch}
        ${rightArch}
      </svg>
    `;
  }

  function initCrypt(container) {
    let roomIdx = 0;
    let steps = 0;
    const visited = new Set([0]);

    container.innerHTML = `
      <div class="lc-crypt">
        <div class="lc-crypt-hud">
          <span id="crypt-explored">Explored: 1 / 12 Chambers</span>
          <span id="crypt-relics-hud">Manuscripts: 0 / 3</span>
          <span id="crypt-steps">Steps: 0</span>
        </div>

        <div class="lc-crypt-stage">
          <div class="lc-crypt-view" id="crypt-view">
            <div id="crypt-svg-holder"></div>
            <div class="lc-crypt-text" aria-live="polite">
              <div class="lc-crypt-room-name" id="crypt-room-name"></div>
              <div class="lc-crypt-desc" id="crypt-desc"></div>
              <div class="lc-crypt-flavor" id="crypt-flavor"></div>
            </div>
          </div>

          <div class="lc-crypt-map-card">
            <span class="lc-crypt-map-title">Catacomb Map</span>
            <div class="lc-crypt-automap" id="crypt-automap" aria-label="Visited chambers map"></div>
            <span class="lc-crypt-map-title" style="opacity:0.7">Arrows / WASD</span>
          </div>
        </div>

        <div class="lc-crypt-controls">
          <button type="button" class="lc-crypt-btn" id="crypt-l">&larr; Left</button>
          <button type="button" class="lc-crypt-btn" id="crypt-f">&uarr; Forward</button>
          <button type="button" class="lc-crypt-btn" id="crypt-b">&darr; Retreat</button>
          <button type="button" class="lc-crypt-btn" id="crypt-r">Right &rarr;</button>
        </div>
      </div>
    `;

    const viewEl = document.getElementById('crypt-view');
    const svgHolder = document.getElementById('crypt-svg-holder');
    const nameEl = document.getElementById('crypt-room-name');
    const descEl = document.getElementById('crypt-desc');
    const flavorEl = document.getElementById('crypt-flavor');
    const mapEl = document.getElementById('crypt-automap');
    const exploredEl = document.getElementById('crypt-explored');
    const relicsHudEl = document.getElementById('crypt-relics-hud');
    const stepsEl = document.getElementById('crypt-steps');

    const btnL = document.getElementById('crypt-l');
    const btnF = document.getElementById('crypt-f');
    const btnB = document.getElementById('crypt-b');
    const btnR = document.getElementById('crypt-r');

    function renderChamber() {
      const room = CRYPT_CHAMBERS[roomIdx];
      visited.add(roomIdx);

      if (room.relic && saveCryptRelic(room.relic)) {
        playTone(587.33, 0.5, 'sine', 0.08);
        toast('✦ Lost Manuscript Recovered: ' + room.relic);
      }

      svgHolder.innerHTML = buildCorridorSVG(room.exits);
      nameEl.textContent = room.name;
      descEl.textContent = room.desc;
      flavorEl.textContent = room.relic ? `✦ Relic Chamber (${room.relic}) — ${room.flavor}` : room.flavor;

      btnL.disabled = room.exits.l === -1;
      btnF.disabled = room.exits.f === -1;
      btnB.disabled = room.exits.b === -1;
      btnR.disabled = room.exits.r === -1;

      exploredEl.textContent = `Explored: ${visited.size} / 12 Chambers`;
      relicsHudEl.textContent = `Manuscripts: ${Math.min(3, getCryptRelics().length)} / 3`;
      stepsEl.textContent = `Steps: ${steps}`;

      mapEl.innerHTML = '';
      for (let i = 0; i < 12; i++) {
        const cell = document.createElement('span');
        cell.className = 'lc-map-cell' + (i === roomIdx ? ' current' : visited.has(i) ? ' visited' : '');
        cell.textContent = i === roomIdx ? '✦' : (visited.has(i) ? (CRYPT_CHAMBERS[i].relic ? '◈' : '·') : '');
        mapEl.appendChild(cell);
      }
    }

    function step(dirKey) {
      const next = CRYPT_CHAMBERS[roomIdx].exits[dirKey];
      if (next === -1 || next === undefined) {
        playTone(95, 0.16, 'triangle', 0.05);
        return;
      }
      viewEl.classList.add('transitioning');
      playTone(165 + (next * 12), 0.2, 'sine', 0.045);
      setTimeout(() => {
        roomIdx = next;
        steps++;
        renderChamber();
        viewEl.classList.remove('transitioning');
      }, 150);
    }

    btnL.addEventListener('click', () => step('l'));
    btnF.addEventListener('click', () => step('f'));
    btnB.addEventListener('click', () => step('b'));
    btnR.addEventListener('click', () => step('r'));

    const keyHandler = e => {
      if (document.querySelector('dialog[open]')) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') { e.preventDefault(); step('l'); }
      else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') { e.preventDefault(); step('f'); }
      else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') { e.preventDefault(); step('b'); }
      else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') { e.preventDefault(); step('r'); }
    };
    window.addEventListener('keydown', keyHandler);
    onCleanup(() => window.removeEventListener('keydown', keyHandler));

    renderChamber();
  }

  /* ═════════════════════════════════════════════════════════════
     9. THE SCRYING MIRROR OF VERSE (Prosody, Scansion & Harp Cadence)
     ═════════════════════════════════════════════════════════════ */
  const SCRYING_PRESETS = [
    {
      label: 'Carmilla (Koç)',
      text: `The warm welcome of the grave faces,\nAs if they are alive, as if they are dead.\nNo! this realm of the drags, not on heavens,\nNot on earth, for the hearts are sad,\nAnd cracked, cracked in two, cracked more,\nThey shouldered the burden of a heavy lore.`
    },
    {
      label: 'Mircalla (Koç)',
      text: `Come. Up from the loam-choked dark, you.\nHeavy with velvet and the silent thirst of long sleep.\nMake of my veins a graveyard.\nMake of my ruin your bed.`
    },
    {
      label: 'Adrasan Shore (Koç)',
      text: `Sinuous strings Present, aureate gets it,\nWhen those agleam rays humbly hit.\nVision-lover, the gleam magnet,\nItself a treasure, to a thought pregnant.`
    },
    {
      label: 'Kubla Khan (Coleridge)',
      text: `In Xanadu did Kubla Khan\nA stately pleasure-dome decree:\nWhere Alph, the sacred river, ran\nThrough caverns measureless to man`
    },
    {
      label: 'The Raven (Poe)',
      text: `Once upon a midnight dreary, while I pondered, weak and weary,\nOver many a quaint and curious volume of forgotten lore,\nWhile I nodded, nearly napping, suddenly there came a tapping,\nAs of some one gently rapping, rapping at my chamber door.`
    }
  ];

  const GOTHIC_LEXICON = new Set([
    'dark', 'darkness', 'grave', 'graveyard', 'dead', 'death', 'night', 'midnight',
    'shadow', 'shadows', 'blood', 'velvet', 'ruin', 'veins', 'bone', 'grief', 'mourning',
    'sad', 'cracked', 'lore', 'spirit', 'heaven', 'heavens', 'sacred', 'sunless',
    'caverns', 'haunted', 'waning', 'moon', 'dreary', 'weary', 'forgotten', 'ghost',
    'macabre', 'weeping', 'thirst', 'sleep', 'marble', 'silence', 'silent', 'aureate'
  ]);

  function countWordSyllables(rawWord) {
    let w = rawWord.toLowerCase().replace(/[^a-z]/g, '');
    if (!w) return 0;
    if (w.length <= 3) return 1;
    w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    w = w.replace(/^y/, '');
    const groups = w.match(/[aeiouy]{1,2}/g);
    return Math.max(1, groups ? groups.length : 1);
  }

  function extractRhymeTail(line) {
    const words = line.toLowerCase().replace(/[^a-z\s]/g, '').trim().split(/\s+/).filter(Boolean);
    const last = words[words.length - 1] || '';
    if (!last) return '';
    const m = last.match(/[aeiouy]+[bcdfghjklmnpqrstvwxz]*$/);
    return m ? m[0] : last.slice(-2);
  }

  function classifyMeter(avgSyl, variance) {
    if (variance > 9) return 'Free / Rhapsodic';
    if (avgSyl < 6.5) return 'Dimeter / Trimeter';
    if (avgSyl < 9.2) return 'Tetrameter';
    if (avgSyl < 11.4) return 'Pentameter';
    if (avgSyl < 13.5) return 'Alexandrine';
    return 'Fourteener / Long';
  }

  function initScryingMirror(container) {
    let playingTimers = [];
    let isPlayingCadence = false;

    function stopCadence() {
      playingTimers.forEach(t => clearTimeout(t));
      playingTimers = [];
      isPlayingCadence = false;
      const playBtn = document.getElementById('scrying-play-btn');
      if (playBtn) playBtn.textContent = '♪ Intone Cadence';
      container.querySelectorAll('.lc-scrying-line-row').forEach(r => r.classList.remove('is-sounding'));
    }
    onCleanup(stopCadence);

    container.innerHTML = `
      <div class="lc-scrying">
        <p class="lc-sanctum-sub">Select a canonical stanza or paste your own verse to scry its syllabic pulse, rhyme echoes, &amp; musical cadence.</p>

        <div class="lc-scrying-presets" id="scrying-presets">
          ${SCRYING_PRESETS.map((p, i) => `
            <button type="button" class="lc-scrying-preset-btn ${i === 0 ? 'active' : ''}" data-preset="${i}">${p.label}</button>
          `).join('')}
        </div>

        <textarea id="scrying-input" class="lc-scrying-input" aria-label="Verse stanza to analyze" spellcheck="false">${SCRYING_PRESETS[0].text}</textarea>

        <div class="lc-scrying-stats">
          <div class="lc-scrying-stat-card">
            <span class="lc-scrying-stat-val" id="scry-meter">—</span>
            <span class="lc-scrying-stat-lbl">Dominant Cadence</span>
          </div>
          <div class="lc-scrying-stat-card">
            <span class="lc-scrying-stat-val" id="scry-syl-avg">0</span>
            <span class="lc-scrying-stat-lbl">Syllables / Line</span>
          </div>
          <div class="lc-scrying-stat-card">
            <span class="lc-scrying-stat-val" id="scry-scheme">—</span>
            <span class="lcrying-stat-lbl lc-scrying-stat-lbl">Rhyme Echo</span>
          </div>
          <div class="lc-scrying-stat-card">
            <span class="lc-scrying-stat-val" id="scry-register">—</span>
            <span class="lc-scrying-stat-lbl">Gothic Resonance</span>
          </div>
        </div>

        <div class="lc-scrying-lines" id="scrying-lines"></div>

        <div class="lc-scrying-actions">
          <button type="button" class="lc-sanctum-btn" id="scrying-play-btn">&#9834; Intone Cadence</button>
          <button type="button" class="lc-sanctum-btn lc-btn-ghost" id="scrying-copy-btn">Copy Prosody Report</button>
        </div>
      </div>
    `;

    const input = document.getElementById('scrying-input');
    const linesBox = document.getElementById('scrying-lines');
    const meterEl = document.getElementById('scry-meter');
    const sylAvgEl = document.getElementById('scry-syl-avg');
    const schemeEl = document.getElementById('scry-scheme');
    const registerEl = document.getElementById('scry-register');
    const playBtn = document.getElementById('scrying-play-btn');

    const RHYME_COLORS = ['#c084fc', '#fb7185', '#38bdf8', '#fbbf24', '#34d399', '#f472b6', '#a78bfa'];
    let currentAnalysis = [];

    function analyze() {
      stopCadence();
      const rawLines = input.value.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 16);
      linesBox.innerHTML = '';

      if (rawLines.length === 0) {
        meterEl.textContent = '—';
        sylAvgEl.textContent = '0';
        schemeEl.textContent = '—';
        registerEl.textContent = '—';
        currentAnalysis = [];
        return;
      }

      const rhymeMap = new Map();
      let nextLetterCode = 65; // 'A'
      let totalSyl = 0;
      let totalWords = 0;
      let gothicHits = 0;

      currentAnalysis = rawLines.map(line => {
        const words = line.split(/\s+/).filter(Boolean);
        let syls = 0;
        words.forEach(w => {
          syls += countWordSyllables(w);
          totalWords++;
          const clean = w.toLowerCase().replace(/[^a-z]/g, '');
          if (GOTHIC_LEXICON.has(clean)) gothicHits++;
        });
        totalSyl += syls;

        const tail = extractRhymeTail(line);
        let letter = 'A';
        if (tail) {
          let matchedKey = null;
          for (const [k, v] of rhymeMap.entries()) {
            if (k === tail || (k.length >= 2 && tail.length >= 2 && k.slice(-2) === tail.slice(-2))) {
              matchedKey = k;
              letter = v;
              break;
            }
          }
          if (!matchedKey) {
            letter = String.fromCharCode(Math.min(90, nextLetterCode++));
            rhymeMap.set(tail, letter);
          }
        }
        return { line, syls, letter };
      });

      const avg = totalSyl / currentAnalysis.length;
      const variance = currentAnalysis.reduce((acc, x) => acc + Math.pow(x.syls - avg, 2), 0) / currentAnalysis.length;
      const scheme = currentAnalysis.map(x => x.letter).join('');
      const density = totalWords > 0 ? Math.min(100, Math.round((gothicHits / totalWords) * 320)) : 0;

      meterEl.textContent = classifyMeter(avg, variance);
      sylAvgEl.textContent = avg.toFixed(1);
      schemeEl.textContent = scheme.slice(0, 8) + (scheme.length > 8 ? '…' : '');
      registerEl.textContent = density >= 55 ? `Deep Nocturne (${density}%)` : density >= 25 ? `Elegiac (${density}%)` : `Lucid (${density}%)`;

      currentAnalysis.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'lc-scrying-line-row';
        row.setAttribute('data-line-idx', String(idx));

        const badge = document.createElement('span');
        badge.className = 'lc-scrying-syl-badge';
        badge.textContent = item.syls + 's';

        const textSpan = document.createElement('span');
        textSpan.className = 'lc-scrying-line-text';
        textSpan.textContent = item.line;

        const dots = document.createElement('span');
        dots.className = 'lc-scrying-pulse-dots';
        dots.setAttribute('aria-hidden', 'true');
        const dotCount = Math.min(16, item.syls);
        for (let d = 0; d < dotCount; d++) {
          const dot = document.createElement('span');
          dot.className = 'lc-scrying-dot';
          dots.appendChild(dot);
        }

        const rTag = document.createElement('span');
        rTag.className = 'lc-scrying-rhyme-tag';
        const color = RHYME_COLORS[(item.letter.charCodeAt(0) - 65) % RHYME_COLORS.length];
        rTag.style.borderColor = color;
        rTag.style.color = color;
        rTag.textContent = item.letter;

        row.appendChild(badge);
        row.appendChild(textSpan);
        row.appendChild(dots);
        row.appendChild(rTag);
        linesBox.appendChild(row);
      });
    }

    // Dorian harp scale (D3..A4)
    const DORIAN_HZ = [293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33];

    playBtn.addEventListener('click', () => {
      if (isPlayingCadence) {
        stopCadence();
        return;
      }
      if (currentAnalysis.length === 0) return;

      isPlayingCadence = true;
      playBtn.textContent = '■ Stop Intonation';

      let elapsed = 60;
      currentAnalysis.forEach((item, lineIdx) => {
        const lineStart = elapsed;
        playingTimers.push(setTimeout(() => {
          container.querySelectorAll('.lc-scrying-line-row').forEach(r => r.classList.remove('is-sounding'));
          const activeRow = container.querySelector(`[data-line-idx="${lineIdx}"]`);
          if (activeRow) activeRow.classList.add('is-sounding');
        }, lineStart));

        const beats = Math.min(14, Math.max(1, item.syls));
        for (let b = 0; b < beats; b++) {
          const isStressed = b % 2 === 1 || b === beats - 1;
          const noteIdx = (lineIdx * 2 + b) % DORIAN_HZ.length;
          const freq = b === beats - 1
            ? DORIAN_HZ[(item.letter.charCodeAt(0) - 65) % DORIAN_HZ.length]
            : DORIAN_HZ[noteIdx];
          playingTimers.push(setTimeout(() => {
            playTone(freq, isStressed ? 0.42 : 0.24, isStressed ? 'triangle' : 'sine', isStressed ? 0.065 : 0.038);
          }, elapsed));
          elapsed += isStressed ? 210 : 165;
        }
        elapsed += 280;
      });

      playingTimers.push(setTimeout(() => {
        stopCadence();
      }, elapsed + 100));
    });

    document.getElementById('scrying-copy-btn').addEventListener('click', () => {
      if (currentAnalysis.length === 0) return;
      const report = [
        `Literaconite Prosody Scrying — ${meterEl.textContent} (${sylAvgEl.textContent} syl/line, Rhyme: ${schemeEl.textContent})`,
        ...currentAnalysis.map(x => `[${String(x.syls).padStart(2, ' ')}s | ${x.letter}] ${x.line}`)
      ].join('\n');
      navigator.clipboard.writeText(report).then(() => toast('✦ Prosody scansion copied to clipboard')).catch(() => {});
    });

    document.getElementById('scrying-presets').addEventListener('click', e => {
      const btn = e.target.closest('.lc-scrying-preset-btn');
      if (!btn) return;
      container.querySelectorAll('.lc-scrying-preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const idx = parseInt(btn.getAttribute('data-preset'), 10) || 0;
      input.value = SCRYING_PRESETS[idx].text;
      analyze();
    });

    input.addEventListener('input', analyze);
    analyze();
  }

  /* ═════════════════════════════════════════════════════════════
     ROUTER & LIFECYCLE BOOTSTRAP
     ═════════════════════════════════════════════════════════════ */
  function initSanctum() {
    runCleanups();

    const appContainer = document.getElementById('lc-sanctum-app');
    if (!appContainer) return;

    appContainer.innerHTML = '';
    const appType = appContainer.getAttribute('data-app');

    switch (appType) {
      case 'spirit-board':   initSpiritBoard(appContainer); break;
      case 'alembic':        initAlembic(appContainer); break;
      case 'ephemeris':      initEphemeris(appContainer); break;
      case 'blackout':       initBlackoutAltar(appContainer); break;
      case 'wax-seal':       initWaxSeal(appContainer); break;
      case 'typewriter':     initTypewriter(appContainer); break;
      case 'reliquary':      initReliquary(appContainer); break;
      case 'crypt':          initCrypt(appContainer); break;
      case 'scrying-mirror': initScryingMirror(appContainer); break;
    }
  }

  window.LiteraconiteSanctum = {
    init: initSanctum
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSanctum);
  } else {
    initSanctum();
  }

  document.addEventListener('lc:navigate', initSanctum);
})();
