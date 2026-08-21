/**
 * LITERACONITE — THE SANCTUM
 * Interactive Gothic features, occult widgets, and dark curiosities.
 * All 8 tools fully implemented with clean state management.
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     SHARED STATE
     ───────────────────────────────────────────────────────────── */
  let selectedIngredients = [];
  let cryptRoomIndex = 0;

  /* ─────────────────────────────────────────────────────────────
     UTILITY
     ───────────────────────────────────────────────────────────── */
  function toast(msg) {
    if (window.Literaconite && window.Literaconite.showToast) {
      window.Literaconite.showToast(msg);
    }
  }

  function bellToll() {
    if (window.Literaconite && window.Literaconite.tollAbbeyBell) {
      window.Literaconite.tollAbbeyBell(0);
    }
  }

  function startAtmosphere() {
    if (window.Literaconite && window.Literaconite.startAudio) {
      window.Literaconite.startAudio();
    }
  }

  /* ─────────────────────────────────────────────────────────────
     1. SPIRIT BOARD
     ───────────────────────────────────────────────────────────── */
  const spiritQuotes = [
    { text: "He's more myself than I am. Whatever our souls are made of, his and mine are the same.", source: "Wuthering Heights" },
    { text: "I am not afraid of storms, for I am learning how to sail my ship.", source: "Carmilla" },
    { text: "A wrong is unredressed when retribution overtakes its redresser.", source: "The Cask of Amontillado" },
    { text: "I was a child and she was a child, in this kingdom by the sea.", source: "Annabel Lee" },
    { text: "The boundaries which divide Life from Death are at best shadowy and vague.", source: "The Premature Burial" },
    { text: "Nothing was more painful to me than the thought of losing him.", source: "Frankenstein" },
    { text: "I beheld the wretch — the miserable monster whom I had created.", source: "Frankenstein" },
    { text: "I have heard it all my life. Do you not feel it? The call of the dark.", source: "Manfred" },
    { text: "Strange love! that in the very moment of its dawning should have burst upon me with such power.", source: "Carmilla" },
    { text: "My heart is as black as the night that swallows this moor.", source: "Wuthering Heights" },
  ];

  function initSpiritBoard(container) {
    container.innerHTML = `
      <div class="lc-spirit-board">
        <div class="lc-board-surface">
          <div class="lc-planchette" id="planchette">&#128258;</div>
          <div class="lc-board-letters">
            <span>A B C D E F G H I J K L M</span>
            <span>N O P Q R S T U V W X Y Z</span>
            <span>1 2 3 4 5 6 7 8 9 0</span>
            <div class="lc-board-yesno"><span>YES</span><span>NO</span></div>
            <span class="lc-board-goodbye">GOODBYE</span>
          </div>
        </div>
        <div class="lc-spirit-controls">
          <input type="text" id="spirit-input" class="lc-spirit-input" placeholder="Ask the spirits a question..." autocomplete="off">
          <button class="lc-sanctum-btn" id="spirit-summon-btn">Summon</button>
        </div>
        <div class="lc-spirit-output" id="spirit-output"></div>
      </div>
    `;
    document.getElementById('spirit-summon-btn').addEventListener('click', summonSpirit);
    document.getElementById('spirit-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') summonSpirit();
    });
  }

  function summonSpirit() {
    const output = document.getElementById('spirit-output');
    const planchette = document.getElementById('planchette');
    if (!output || !planchette) return;

    output.classList.remove('visible');
    const maxX = 160, maxY = 80;
    planchette.style.transform = `translate(${(Math.random() * maxX * 2) - maxX}px, ${(Math.random() * maxY * 2) - maxY}px) rotate(${(Math.random() * 20) - 10}deg)`;

    setTimeout(() => {
      planchette.style.transform = 'translate(0, 0) rotate(0deg)';
      const q = spiritQuotes[Math.floor(Math.random() * spiritQuotes.length)];
      output.innerHTML = `<span class="lc-spirit-quote">&ldquo;${q.text}&rdquo;</span><span class="lc-spirit-source">— ${q.source}</span>`;
      output.classList.add('visible');
    }, 1600);
  }

  /* ─────────────────────────────────────────────────────────────
     2. ALEMBIC CAULDRON
     ───────────────────────────────────────────────────────────── */
  const potionResults = {
    'Wolfsbane+Gravedust': { title: 'Oil of Passage', text: '"Didst thou not hear it?" — No; it was but the wind, / Or the car rattling o\'er the stony street.' },
    'Wolfsbane+Tears': { title: 'Tincture of Grief', text: '"I wept not, so of stone grew I within." — Inferno, Dante Alighieri' },
    'Wolfsbane+Hemlock': { title: 'Essence of Night', text: '"My name is Night — I dwell amidst the dark." — Manfred, Byron' },
    'Wolfsbane+Ink': { title: 'Cursed Script', text: '"I, poor wretch — who came unfit to bear the burden of my sins." — Frankenstein' },
    'Gravedust+Tears': { title: 'Elixir of Memory', text: '"Whatever our souls are made of, his and mine are the same." — Wuthering Heights' },
    'Gravedust+Hemlock': { title: 'Poison of Forgetting', text: '"The boundaries which divide Life from Death are at best shadowy and vague." — Poe' },
    'Gravedust+Ink': { title: 'Ink of the Revenant', text: '"I have buried my sorrow in my heart, like a grave unseen." — Manfred' },
    'Tears+Hemlock': { title: 'Draught of Ending', text: '"I wish I could hold you till we were both dead." — Wuthering Heights' },
    'Tears+Ink': { title: 'Memoir of the Damned', text: '"My heart sank within me as, with closed eyes, I saw before me the face of Victor Frankenstein." — Frankenstein' },
    'Hemlock+Ink': { title: 'The Dark Tincture', text: '"Strange love! that in the very moment of its dawning should have burst upon me with such power." — Carmilla' },
  };

  function initAlembic(container) {
    container.innerHTML = `
      <div class="lc-alembic">
        <p class="lc-sanctum-sub">Select two ingredients, then transmute.</p>
        <div class="lc-ingredients" id="ingredients">
          <div class="lc-ingredient" data-name="Wolfsbane">🌿 Wolfsbane</div>
          <div class="lc-ingredient" data-name="Gravedust">💀 Gravedust</div>
          <div class="lc-ingredient" data-name="Tears">💧 Tears</div>
          <div class="lc-ingredient" data-name="Hemlock">🍃 Hemlock</div>
          <div class="lc-ingredient" data-name="Ink">🖋 Black Ink</div>
        </div>
        <div class="lc-cauldron-wrap">
          <div class="lc-cauldron" id="cauldron">
            <span class="lc-vapor" id="vapor">🌫️</span>
            <span class="lc-cauldron-icon">⚗️</span>
          </div>
        </div>
        <button class="lc-sanctum-btn" id="brew-btn">✦ Transmute</button>
        <div class="lc-alembic-result" id="alembic-result"></div>
      </div>
    `;

    document.querySelectorAll('.lc-ingredient').forEach(el => {
      el.addEventListener('click', () => toggleIngredient(el, el.dataset.name));
    });
    document.getElementById('brew-btn').addEventListener('click', brewPotion);
  }

  function toggleIngredient(el, name) {
    const idx = selectedIngredients.indexOf(name);
    if (idx > -1) {
      selectedIngredients.splice(idx, 1);
      el.classList.remove('selected');
    } else {
      if (selectedIngredients.length >= 2) {
        toast('Only two ingredients may be combined at once.');
        return;
      }
      selectedIngredients.push(name);
      el.classList.add('selected');
    }
  }

  function brewPotion() {
    if (selectedIngredients.length < 2) {
      toast('Select 2 ingredients first.');
      return;
    }
    const cauldron = document.getElementById('cauldron');
    const result = document.getElementById('alembic-result');
    const vapor = document.getElementById('vapor');

    result.classList.remove('visible');
    cauldron.classList.add('brewing');
    vapor.style.display = 'block';

    const key1 = `${selectedIngredients[0]}+${selectedIngredients[1]}`;
    const key2 = `${selectedIngredients[1]}+${selectedIngredients[0]}`;
    const potion = potionResults[key1] || potionResults[key2] || { title: 'Unknown Brew', text: '"Some alchemies resist classification." — The Book of Shadows' };

    setTimeout(() => {
      cauldron.classList.remove('brewing');
      vapor.style.display = 'none';
      result.innerHTML = `<span class="lc-potion-title">${potion.title}</span><span class="lc-potion-text">${potion.text}</span>`;
      result.classList.add('visible');
      selectedIngredients = [];
      document.querySelectorAll('.lc-ingredient').forEach(el => el.classList.remove('selected'));
    }, 2200);
  }

  /* ─────────────────────────────────────────────────────────────
     3. NOCTURNAL EPHEMERIS
     ───────────────────────────────────────────────────────────── */
  function initEphemeris(container) {
    const phases = [
      { icon: '🌑', name: 'New Moon', omen: 'A time for shadow work. The ink is dry, but the ghosts remain restless.' },
      { icon: '🌒', name: 'Waxing Crescent', omen: 'Beginnings sprout from dark earth. Beware what seeds you plant beneath this sky.' },
      { icon: '🌓', name: 'First Quarter', omen: 'Balance is an illusion. The scales tip always toward the abyss.' },
      { icon: '🌔', name: 'Waxing Gibbous', omen: 'The light grows — and with it, the length of shadows cast behind you.' },
      { icon: '🌕', name: 'Full Blood Moon', omen: 'The veil is at its thinnest. Spirits walk among the waking and the dead.' },
      { icon: '🌖', name: 'Waning Gibbous', omen: 'Relinquish what no longer serves the narrative. Some chapters must end in ash.' },
      { icon: '🌗', name: 'Last Quarter', omen: 'A period of cutting away the dead wood. The pruning knife is cold tonight.' },
      { icon: '🌘', name: 'Waning Crescent', omen: 'Return to the void. Silence is the ultimate form of the poem.' },
    ];

    // Proper lunar cycle calculation (synodic period ~29.53 days)
    const knownNew = new Date('2024-01-11T11:57:00Z');
    const now = new Date();
    const elapsed = (now - knownNew) / (1000 * 60 * 60 * 24);
    const cycleDay = ((elapsed % 29.53) + 29.53) % 29.53;
    const phaseIndex = Math.min(7, Math.floor(cycleDay / (29.53 / 8)));

    const phase = phases[phaseIndex];
    const day = now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    container.innerHTML = `
      <div class="lc-ephemeris">
        <div class="lc-moon">${phase.icon}</div>
        <div class="lc-moon-phase">${phase.name}</div>
        <div class="lc-moon-date">${day}</div>
        <div class="lc-omen">&ldquo;${phase.omen}&rdquo;</div>
        <div class="lc-ephemeris-canon">
          <p class="lc-canon-verse">"What is it about the night? The way it softens all the edges of the world, makes murder and love indistinguishable..."<br><span>— Carmilla, J. S. Le Fanu</span></p>
        </div>
      </div>
    `;
  }

  /* ─────────────────────────────────────────────────────────────
     4. BLACKOUT POETRY ALTAR
     ───────────────────────────────────────────────────────────── */
  const blackoutTexts = [
    { source: 'The Call of Cthulhu — H.P. Lovecraft', text: 'The most merciful thing in the world, I think, is the inability of the human mind to correlate all its contents. We live on a placid island of ignorance in the midst of black seas of infinity, and it was not meant that we should voyage far. The sciences, each straining in its own direction, have hitherto harmed us little; but some day the piecing together of dissociated knowledge will open up such terrifying vistas of reality, and of our frightful position therein, that we shall either go mad from the revelation or flee from the deadly light into the peace and safety of a new dark age.' },
    { source: 'Frankenstein — Mary Shelley', text: 'It was a dreary night of November that I beheld the accomplishment of my toils. With an anxiety that almost amounted to agony, I collected the instruments of life around me, that I might infuse a spark of being into the lifeless thing that lay at my feet. It was already one in the morning; the rain pattered dismally against the panes, and my candle was nearly burnt out, when, by the glimmer of the half-extinguished light, I saw the dull yellow eye of the creature open; it breathed hard, and a convulsive motion agitated its limbs.' },
    { source: 'Wuthering Heights — Emily Brontë', text: 'I have dreamt in my life, dreams that have stayed with me ever after, and changed my ideas; they have gone through and through me, like wine through water, and altered the color of my mind. And this is one: I was only going to say that heaven did not seem to be my home; and I broke my heart with weeping to come back to earth; and the angels were so angry that they flung me out into the middle of the heath on the top of Wuthering Heights; where I woke sobbing for joy.' },
  ];

  function initBlackoutAltar(container) {
    const excerpt = blackoutTexts[Math.floor(Math.random() * blackoutTexts.length)];
    const words = excerpt.text.split(' ').map((w, i) =>
      `<span class="lc-blackout-word" data-index="${i}">${w}</span>`
    ).join(' ');

    container.innerHTML = `
      <div class="lc-blackout">
        <div class="lc-blackout-header">
          <p class="lc-sanctum-sub">Click words to redact them. Reveal the hidden poem within.</p>
          <p class="lc-blackout-source">— ${excerpt.source}</p>
        </div>
        <div class="lc-blackout-text" id="blackout-text">${words}</div>
        <div class="lc-blackout-controls">
          <button class="lc-sanctum-btn lc-btn-ghost" id="blackout-redact-all">Redact All</button>
          <button class="lc-sanctum-btn lc-btn-ghost" id="blackout-clear">Clear</button>
          <button class="lc-sanctum-btn" id="blackout-new">New Passage</button>
        </div>
      </div>
    `;

    document.getElementById('blackout-text').addEventListener('click', function(e) {
      const word = e.target.closest('.lc-blackout-word');
      if (word) word.classList.toggle('redacted');
    });
    document.getElementById('blackout-redact-all').addEventListener('click', () =>
      document.querySelectorAll('.lc-blackout-word').forEach(w => w.classList.add('redacted'))
    );
    document.getElementById('blackout-clear').addEventListener('click', () =>
      document.querySelectorAll('.lc-blackout-word').forEach(w => w.classList.remove('redacted'))
    );
    document.getElementById('blackout-new').addEventListener('click', () => initBlackoutAltar(container));
  }

  /* ─────────────────────────────────────────────────────────────
     5. GOTHIC WAX SEAL
     ───────────────────────────────────────────────────────────── */
  const sealColors = [
    { name: 'Crimson', bg: '#8b0000', shadow: '#c0392b' },
    { name: 'Obsidian', bg: '#1a1a2e', shadow: '#6c5ce7' },
    { name: 'Verdigris', bg: '#1a4a3a', shadow: '#00b894' },
    { name: 'Dusk', bg: '#4a0030', shadow: '#c084fc' },
  ];
  let currentSealColor = 0;

  function initWaxSeal(container) {
    container.innerHTML = `
      <div class="lc-wax-seal">
        <p class="lc-sanctum-sub">Forge your monogram into the hot wax.</p>
        <div class="lc-seal-controls">
          <div class="lc-seal-input-group">
            <label>Monogram</label>
            <input type="text" id="seal-input" class="lc-seal-text-input" maxlength="3" value="EK" autocomplete="off">
          </div>
          <div class="lc-seal-color-group">
            <label>Wax</label>
            <div class="lc-seal-swatches" id="seal-swatches">
              ${sealColors.map((c, i) => `<button class="lc-swatch ${i === 0 ? 'active' : ''}" data-index="${i}" style="background:${c.bg}" title="${c.name}"></button>`).join('')}
            </div>
          </div>
        </div>
        <div class="lc-seal-canvas-container">
          <div class="lc-seal-canvas" id="seal-canvas">
            <span class="lc-seal-monogram" id="seal-monogram">EK</span>
          </div>
        </div>
        <button class="lc-sanctum-btn" id="stamp-btn">⚜ Stamp the Seal</button>
        <div class="lc-seal-result" id="seal-result"></div>
      </div>
    `;

    const canvas = document.getElementById('seal-canvas');
    const monogram = document.getElementById('seal-monogram');
    const input = document.getElementById('seal-input');

    function applySealColor() {
      const c = sealColors[currentSealColor];
      canvas.style.background = `radial-gradient(circle at 35% 35%, ${c.shadow}55, ${c.bg})`;
      canvas.style.boxShadow = `inset -8px -8px 16px rgba(0,0,0,0.6), inset 6px 6px 12px rgba(255,255,255,0.12), 0 12px 30px rgba(0,0,0,0.8), 0 0 40px ${c.shadow}33`;
    }
    applySealColor();

    input.addEventListener('input', () => {
      monogram.textContent = input.value.toUpperCase() || '✦';
    });

    document.getElementById('seal-swatches').addEventListener('click', function(e) {
      const swatch = e.target.closest('.lc-swatch');
      if (!swatch) return;
      currentSealColor = parseInt(swatch.dataset.index);
      document.querySelectorAll('.lc-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      applySealColor();
    });

    document.getElementById('stamp-btn').addEventListener('click', stampSeal);
  }

  function stampSeal() {
    const canvas = document.getElementById('seal-canvas');
    const result = document.getElementById('seal-result');
    if (!canvas) return;

    canvas.style.transform = 'scale(0.88) rotate(-3deg)';
    bellToll();

    setTimeout(() => {
      canvas.style.transform = 'scale(1) rotate(0deg)';
      const colorName = sealColors[currentSealColor].name;
      result.innerHTML = `<span class="lc-seal-stamp-text">Your ${colorName} seal has been pressed.</span>`;
      result.classList.add('visible');
    }, 250);
  }

  /* ─────────────────────────────────────────────────────────────
     6. CURSED TYPEWRITER
     ───────────────────────────────────────────────────────────── */
  const typewriterPrompts = [
    'The night I found the letter, I understood everything...',
    'She was standing at the window when I arrived. She did not turn...',
    'I have not slept in three days. The scratching at the walls...',
    'My dearest, by the time you read this I shall be...',
    'The house on the moor had been empty for forty years...',
  ];

  function initTypewriter(container) {
    const prompt = typewriterPrompts[Math.floor(Math.random() * typewriterPrompts.length)];
    container.innerHTML = `
      <div class="lc-typewriter">
        <div class="lc-typewriter-header">
          <p class="lc-sanctum-sub">The keys stick. The ink bleeds. Your confession awaits.</p>
          <div class="lc-typewriter-meta">
            <span class="lc-tw-word-count" id="tw-count">0 words</span>
            <span class="lc-tw-separator">·</span>
            <span class="lc-tw-prompt" id="tw-prompt">Prompt: <em>${prompt}</em></span>
          </div>
        </div>
        <div class="lc-typewriter-paper">
          <textarea class="lc-typewriter-textarea" id="typewriter-input" placeholder="Begin writing..."></textarea>
        </div>
        <div class="lc-typewriter-controls">
          <button class="lc-sanctum-btn lc-btn-ghost" id="tw-burn">🔥 Burn Page</button>
          <button class="lc-sanctum-btn lc-btn-ghost" id="tw-prompt-new">New Prompt</button>
          <button class="lc-sanctum-btn" id="tw-save">Archive Entry</button>
        </div>
      </div>
    `;

    const textarea = document.getElementById('typewriter-input');
    const countEl = document.getElementById('tw-count');

    textarea.addEventListener('input', () => {
      startAtmosphere();
      const words = textarea.value.trim().split(/\s+/).filter(Boolean).length;
      countEl.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    });

    document.getElementById('tw-burn').addEventListener('click', () => {
      if (textarea.value && confirm('Burn this page? It cannot be recovered.')) {
        textarea.value = '';
        countEl.textContent = '0 words';
      }
    });

    document.getElementById('tw-prompt-new').addEventListener('click', () => {
      const np = typewriterPrompts[Math.floor(Math.random() * typewriterPrompts.length)];
      document.getElementById('tw-prompt').innerHTML = `Prompt: <em>${np}</em>`;
    });

    document.getElementById('tw-save').addEventListener('click', saveTypewriter);
  }

  function saveTypewriter() {
    const val = document.getElementById('typewriter-input');
    if (!val || !val.value.trim()) {
      toast('Write something before archiving.');
      return;
    }
    val.value = '';
    document.getElementById('tw-count').textContent = '0 words';
    toast('Your confession has been sealed in the dark archive.');
  }

  /* ─────────────────────────────────────────────────────────────
     7. RELIQUARY CABINET
     ───────────────────────────────────────────────────────────── */
  const relics = [
    {
      icon: '🦴',
      name: "Saint's Finger Bone",
      desc: "Said to belong to a condemned monk who wrote his last sermon in his own blood.",
      quote: '"My name is Night."',
      source: 'Manfred, Byron'
    },
    {
      icon: '🗝️',
      name: "The Iron Key",
      desc: "Opens a door in a house that no longer stands. The door, however, remains.",
      quote: '"I will not say the chambers were without their horror."',
      source: 'The Fall of the House of Usher'
    },
    {
      icon: '🩸',
      name: "Vial of Crimson",
      desc: "Dried. Dating uncertain. The stopper bears a wax seal no one has identified.",
      quote: '"Strange love!"',
      source: 'Carmilla, Le Fanu'
    },
    {
      icon: '🥀',
      name: "Withered Black Rose",
      desc: "Found on the grave of a woman whose name has been deliberately effaced.",
      quote: '"Whatever our souls are made of, his and mine are the same."',
      source: 'Wuthering Heights'
    },
    {
      icon: '📜',
      name: "The Condemned Poem",
      desc: "Ink-stained, partially burned. The last three lines are illegible.",
      quote: '"I wept not, so of stone grew I within."',
      source: 'Inferno, Dante'
    },
    {
      icon: '🪞',
      name: "The Dark Mirror",
      desc: "Reflects the room, but never the one who looks. Estimated age: three centuries.",
      quote: '"The boundaries which divide Life from Death are at best shadowy and vague."',
      source: 'E.A. Poe'
    },
  ];

  let activeRelic = null;

  function initReliquary(container) {
    let html = `
      <div class="lc-reliquary">
        <p class="lc-sanctum-sub">Approach the cabinet. Touch what calls to you.</p>
        <div class="lc-relic-grid" id="relic-grid">
          ${relics.map((r, i) => `
            <div class="lc-relic" data-index="${i}">
              <div class="lc-relic-icon">${r.icon}</div>
              <div class="lc-relic-name">${r.name}</div>
            </div>
          `).join('')}
        </div>
        <div class="lc-relic-detail" id="relic-detail" aria-live="polite"></div>
      </div>
    `;
    container.innerHTML = html;

    document.getElementById('relic-grid').addEventListener('click', function(e) {
      const relic = e.target.closest('.lc-relic');
      if (!relic) return;
      const index = parseInt(relic.dataset.index);
      touchRelic(relic, index);
    });
  }

  function touchRelic(el, index) {
    document.querySelectorAll('.lc-relic').forEach(r => r.classList.remove('active'));
    el.classList.add('active');

    const r = relics[index];
    const detail = document.getElementById('relic-detail');
    detail.innerHTML = `
      <div class="lc-relic-detail-inner">
        <div class="lc-relic-detail-icon">${r.icon}</div>
        <h4 class="lc-relic-detail-name">${r.name}</h4>
        <p class="lc-relic-detail-desc">${r.desc}</p>
        <blockquote class="lc-relic-detail-quote">${r.quote}<cite>— ${r.source}</cite></blockquote>
      </div>
    `;
    detail.classList.add('visible');
    bellToll();
  }

  /* ─────────────────────────────────────────────────────────────
     8. CRYPT LABYRINTH
     ───────────────────────────────────────────────────────────── */
  const cryptRooms = [
    {
      desc: "You stand at the iron gate. Beyond, darkness breathes.",
      flavor: "The latch is cold to the touch.",
      exits: [1, -1, 2],
    },
    {
      desc: "A narrow corridor. The walls weep with moisture.",
      flavor: "Rat skulls crunch softly underfoot.",
      exits: [2, 0, 3],
    },
    {
      desc: "A dead end. Or is it? A faint draft presses at your cheek.",
      flavor: "Someone has drawn a door on the stone wall.",
      exits: [0, -1, 1],
    },
    {
      desc: "A circular chamber. An empty sarcophagus waits in the center.",
      flavor: "The lid has been moved from inside.",
      exits: [4, 1, 5],
    },
    {
      desc: "Shadows dance on the walls, mimicking your movements.",
      flavor: "You have not been moving.",
      exits: [5, 3, -1],
    },
    {
      desc: "The center. The labyrinth has no other name for this place.",
      flavor: "All paths lead here. None lead out.",
      exits: [3, 4, 0],
    },
  ];

  function initCrypt(container) {
    cryptRoomIndex = 0;
    container.innerHTML = `
      <div class="lc-crypt">
        <p class="lc-sanctum-sub">Navigate the catacombs. Not all exits are what they seem.</p>
        <div class="lc-crypt-view" id="crypt-view">
          <div class="lc-crypt-atmosphere" id="crypt-atm"></div>
          <div class="lc-crypt-text">
            <div class="lc-crypt-desc" id="crypt-desc">${cryptRooms[0].desc}</div>
            <div class="lc-crypt-flavor" id="crypt-flavor">${cryptRooms[0].flavor}</div>
          </div>
        </div>
        <div class="lc-crypt-controls">
          <button class="lc-crypt-btn" id="crypt-w" title="Go Left">&#8592;</button>
          <button class="lc-crypt-btn" id="crypt-n" title="Go Forward">&#8593;</button>
          <button class="lc-crypt-btn" id="crypt-e" title="Go Right">&#8594;</button>
        </div>
        <div class="lc-crypt-depth">Depth: <span id="crypt-depth">0</span></div>
      </div>
    `;

    let depth = 0;
    document.getElementById('crypt-w').addEventListener('click', () => moveCrypt(0, depth, d => { depth = d; }));
    document.getElementById('crypt-n').addEventListener('click', () => moveCrypt(1, depth, d => { depth = d; }));
    document.getElementById('crypt-e').addEventListener('click', () => moveCrypt(2, depth, d => { depth = d; }));
  }

  function moveCrypt(exitIndex, depth, setDepth) {
    const room = cryptRooms[cryptRoomIndex];
    const next = room.exits[exitIndex];

    const desc = document.getElementById('crypt-desc');
    const flavor = document.getElementById('crypt-flavor');
    const view = document.getElementById('crypt-view');
    const depthEl = document.getElementById('crypt-depth');

    view.classList.add('transitioning');

    setTimeout(() => {
      if (next === -1) {
        desc.textContent = "A solid wall. Your torch flickers.";
        flavor.textContent = "You have been turned around.";
      } else {
        cryptRoomIndex = next;
        depth++;
        setDepth(depth);
        desc.textContent = cryptRooms[next].desc;
        flavor.textContent = cryptRooms[next].flavor;
        if (depthEl) depthEl.textContent = depth;
      }
      view.classList.remove('transitioning');
      view.classList.add('flash');
      setTimeout(() => view.classList.remove('flash'), 300);
    }, 350);
  }

  /* ─────────────────────────────────────────────────────────────
     INIT ROUTER
     ───────────────────────────────────────────────────────────── */
  function initSanctum() {
    const appContainer = document.getElementById('lc-sanctum-app');
    if (!appContainer) return;

    // Clear any previously injected content so a fresh tool is rendered
    appContainer.innerHTML = '';

    const appType = appContainer.getAttribute('data-app');

    switch (appType) {
      case 'spirit-board':  initSpiritBoard(appContainer);  break;
      case 'alembic':       initAlembic(appContainer);      break;
      case 'ephemeris':     initEphemeris(appContainer);    break;
      case 'blackout':      initBlackoutAltar(appContainer); break;
      case 'wax-seal':      initWaxSeal(appContainer);      break;
      case 'typewriter':    initTypewriter(appContainer);   break;
      case 'reliquary':     initReliquary(appContainer);    break;
      case 'crypt':         initCrypt(appContainer);        break;
    }
  }

  /* ─────────────────────────────────────────────────────────────
     EXPOSE GLOBALS & BOOT
     ───────────────────────────────────────────────────────────── */
  // Expose globals BEFORE init so inline handlers created during init can call them
  window.LiteraconiteSanctum = {
    init: initSanctum,
    summonSpirit,
    toggleIngredient,
    brewPotion,
    stampSeal,
    saveTypewriter,
    touchRelic,
    moveCrypt,
  };

  // Boot on initial hard load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSanctum);
  } else {
    initSanctum();
  }

  // Re-boot after every PJAX navigation (lc:navigate fired by literaconite-core.js)
  document.addEventListener('lc:navigate', initSanctum);

})();
