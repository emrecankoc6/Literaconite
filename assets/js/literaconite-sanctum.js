/**
 * LITERACONITE SANCTUM
 * Interactive Gothic features and occult widgets
 */
(function() {
  'use strict';

  function initSanctum() {
    const appContainer = document.getElementById('lc-sanctum-app');
    if (!appContainer) return;

    const appType = appContainer.getAttribute('data-app');
    
    switch (appType) {
      case 'spirit-board': initSpiritBoard(appContainer); break;
      case 'alembic': initAlembic(appContainer); break;
      case 'ephemeris': initEphemeris(appContainer); break;
      case 'blackout': initBlackoutAltar(appContainer); break;
      case 'wax-seal': initWaxSeal(appContainer); break;
      case 'typewriter': initTypewriter(appContainer); break;
      case 'reliquary': initReliquary(appContainer); break;
      case 'crypt': initCrypt(appContainer); break;
    }
  }

  /* 1. SPIRIT BOARD */
  function initSpiritBoard(container) {
    container.innerHTML = `
      <div class="lc-spirit-board">
        <div class="lc-board-surface">
          <div class="lc-planchette" id="planchette">🜂</div>
          <div class="lc-board-letters">
            A B C D E F G H I J K L M<br>
            N O P Q R S T U V W X Y Z<br>
            1 2 3 4 5 6 7 8 9 0<br>
            YES &nbsp;&nbsp;&nbsp;&nbsp; NO<br>
            GOODBYE
          </div>
        </div>
        <input type="text" id="spirit-input" class="lc-spirit-input" placeholder="Ask the spirits a question...">
        <button class="btn" onclick="window.LiteraconiteSanctum.summonSpirit()">Summon</button>
        <div class="lc-spirit-output" id="spirit-output"></div>
      </div>
    `;
  }
  const spiritQuotes = [
    "I have loved to the point of madness; that which is called madness, that which to me, is the only sensible way to love. — F. Sagan",
    "We wake while dying angels sleep. — Carmilla",
    "A wrong is unredressed when retribution overtakes its redresser. — E.A. Poe",
    "I was a child and she was a child, in this kingdom by the sea... — E.A. Poe",
    "He's more myself than I am. Whatever our souls are made of, his and mine are the same. — Wuthering Heights"
  ];
  function summonSpirit() {
    const output = document.getElementById('spirit-output');
    const planchette = document.getElementById('planchette');
    if (!output || !planchette) return;
    
    output.style.opacity = '0';
    planchette.style.transform = `translate(${Math.random() * 200 - 100}px, ${Math.random() * 100 - 50}px)`;
    
    setTimeout(() => {
      planchette.style.transform = `translate(0px, 0px)`;
      output.textContent = spiritQuotes[Math.floor(Math.random() * spiritQuotes.length)];
      output.style.opacity = '1';
    }, 1500);
  }

  /* 2. ALEMBIC CAULDRON */
  function initAlembic(container) {
    container.innerHTML = `
      <div class="lc-alembic">
        <p class="sub">Select two ingredients to brew.</p>
        <div class="lc-ingredients" id="ingredients">
          <div class="lc-ingredient" onclick="window.LiteraconiteSanctum.toggleIngredient(this, 'Wolfsbane')">Wolfsbane</div>
          <div class="lc-ingredient" onclick="window.LiteraconiteSanctum.toggleIngredient(this, 'Gravedust')">Gravedust</div>
          <div class="lc-ingredient" onclick="window.LiteraconiteSanctum.toggleIngredient(this, 'Tears')">Tears</div>
          <div class="lc-ingredient" onclick="window.LiteraconiteSanctum.toggleIngredient(this, 'Hemlock')">Hemlock</div>
          <div class="lc-ingredient" onclick="window.LiteraconiteSanctum.toggleIngredient(this, 'Ink')">Black Ink</div>
        </div>
        <div class="lc-cauldron" id="cauldron">
          <span class="lc-vapor">🌫️</span>
          ⚗️
        </div>
        <button class="btn" onclick="window.LiteraconiteSanctum.brewPotion()">Transmute</button>
        <div class="lc-alembic-result" id="alembic-result"></div>
      </div>
    `;
  }
  let selectedIngredients = [];
  function toggleIngredient(el, name) {
    if (selectedIngredients.includes(name)) {
      selectedIngredients = selectedIngredients.filter(i => i !== name);
      el.classList.remove('selected');
    } else {
      if (selectedIngredients.length >= 2) return;
      selectedIngredients.push(name);
      el.classList.add('selected');
    }
  }
  function brewPotion() {
    if (selectedIngredients.length < 2) return window.Literaconite.showToast("Select 2 ingredients first.");
    const cauldron = document.getElementById('cauldron');
    const result = document.getElementById('alembic-result');
    cauldron.classList.add('brewing');
    result.style.display = 'none';
    
    setTimeout(() => {
      cauldron.classList.remove('brewing');
      result.textContent = `A dark vapor rises. The mixture of ${selectedIngredients[0]} and ${selectedIngredients[1]} reveals a hidden truth: "The boundaries which divide Life from Death are at best shadowy and vague."`;
      result.style.display = 'block';
      selectedIngredients = [];
      document.querySelectorAll('.lc-ingredient').forEach(el => el.classList.remove('selected'));
    }, 2000);
  }

  /* 3. NOCTURNAL EPHEMERIS */
  function initEphemeris(container) {
    const phases = ["New Moon 🌑", "Waxing Crescent 🌒", "First Quarter 🌓", "Waxing Gibbous 🌔", "Full Blood Moon 🌕", "Waning Gibbous 🌖", "Last Quarter 🌗", "Waning Crescent 🌘"];
    const omens = [
      "A time for shadow work. The ink is dry, but the ghosts remain.",
      "Beginnings sprout from the dark earth. Beware what you plant.",
      "Balance is an illusion. The scales tip towards chaos.",
      "The light grows, and with it, the length of the shadows.",
      "The veil is thin. Spirits walk among the waking.",
      "Relinquish what no longer serves the narrative.",
      "A period of cutting away the dead wood.",
      "Return to the void. Silence is the ultimate poem."
    ];
    
    // Simulate moon phase based on current day of month
    const day = new Date().getDate();
    const phaseIndex = Math.floor((day / 31) * 8) % 8;
    
    container.innerHTML = `
      <div class="lc-ephemeris">
        <div class="lc-moon">${phases[phaseIndex].split(' ')[2]}</div>
        <div class="lc-moon-phase">${phases[phaseIndex].split(' ').slice(0,2).join(' ')}</div>
        <div class="lc-omen">"${omens[phaseIndex]}"</div>
      </div>
    `;
  }

  /* 4. BLACKOUT POETRY ALTAR */
  function initBlackoutAltar(container) {
    const text = "The most merciful thing in the world, I think, is the inability of the human mind to correlate all its contents. We live on a placid island of ignorance in the midst of black seas of infinity, and it was not meant that we should voyage far. The sciences, each straining in its own direction, have hitherto harmed us little; but some day the piecing together of dissociated knowledge will open up such terrifying vistas of reality, and of our frightful position therein, that we shall either go mad from the revelation or flee from the deadly light into the peace and safety of a new dark age.";
    const words = text.split(' ').map(w => `<span class="lc-blackout-word" onclick="this.classList.toggle('redacted')">${w}</span>`).join(' ');
    
    container.innerHTML = `
      <div class="lc-blackout">
        <p class="sub">Click words to redact them. Reveal the hidden poem.</p>
        <div class="lc-blackout-text" id="blackout-text">${words}</div>
        <div class="lc-blackout-controls">
          <button class="btn" onclick="document.querySelectorAll('.lc-blackout-word').forEach(w => w.classList.add('redacted'))">Redact All</button>
          <button class="btn" onclick="document.querySelectorAll('.lc-blackout-word').forEach(w => w.classList.remove('redacted'))">Clear All</button>
        </div>
      </div>
    `;
  }

  /* 5. GOTHIC WAX SEAL */
  function initWaxSeal(container) {
    container.innerHTML = `
      <div class="lc-wax-seal">
        <p class="sub">Forge your monogram into the hot wax.</p>
        <div class="lc-seal-controls">
          <input type="text" id="seal-input" maxlength="2" value="EK" oninput="document.getElementById('seal-canvas').textContent = this.value.toUpperCase()">
          <button class="btn" onclick="window.LiteraconiteSanctum.stampSeal()">Stamp</button>
        </div>
        <div class="lc-seal-canvas-container">
          <div class="lc-seal-canvas" id="seal-canvas">EK</div>
        </div>
      </div>
    `;
  }
  function stampSeal() {
    const seal = document.getElementById('seal-canvas');
    seal.style.transform = 'scale(0.9)';
    window.Literaconite.tollAbbeyBell(0);
    setTimeout(() => seal.style.transform = 'scale(1)', 200);
  }

  /* 6. CURSED TYPEWRITER */
  function initTypewriter(container) {
    container.innerHTML = `
      <div class="lc-typewriter">
        <p class="sub">The keys stick. The ink bleeds. Write your confession.</p>
        <div class="lc-typewriter-paper">
          <textarea class="lc-typewriter-textarea" id="typewriter-input" placeholder="Type here..." oninput="window.Literaconite.startAudio()"></textarea>
        </div>
        <div class="lc-typewriter-controls">
          <button class="btn" onclick="document.getElementById('typewriter-input').value = ''">Burn Page</button>
          <button class="btn" onclick="window.LiteraconiteSanctum.saveTypewriter()">Save to Ledger</button>
        </div>
      </div>
    `;
  }
  function saveTypewriter() {
    const val = document.getElementById('typewriter-input').value.trim();
    if (val) {
      document.getElementById('typewriter-input').value = '';
      window.Literaconite.showToast("Your confession has been archived in the dark.");
    }
  }

  /* 7. RELIQUARY CABINET */
  function initReliquary(container) {
    const relics = [
      { icon: '🦴', desc: 'A saint\'s finger bone.' },
      { icon: '🗝️', desc: 'An iron key to a forgotten door.' },
      { icon: '🩸', desc: 'A vial of dried crimson.' },
      { icon: '🥀', desc: 'A black rose from an unmarked grave.' },
      { icon: '📜', desc: 'A fragment of a condemned poem.' },
      { icon: '🪞', desc: 'A mirror that reflects no living thing.' }
    ];
    let html = '<div class="lc-reliquary">';
    relics.forEach(r => {
      html += `
        <div class="lc-relic" onclick="window.LiteraconiteSanctum.touchRelic(this)">
          <div class="lc-relic-icon">${r.icon}</div>
          <div class="lc-relic-desc">${r.desc}</div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  }
  function touchRelic(el) {
    window.Literaconite.tollAbbeyBell(0);
    el.style.borderColor = '#c084fc';
    setTimeout(() => { el.style.borderColor = ''; }, 1000);
  }

  /* 8. CRYPT LABYRINTH */
  const cryptRooms = [
    "You stand at the entrance. The air is damp.",
    "A narrow corridor. Rat skulls crunch underfoot.",
    "A dead end. Or is it? A faint draft touches your cheek.",
    "A circular room with an empty sarcophagus.",
    "Shadows dance on the walls, mimicking your movements.",
    "You have found the center. The labyrinth shifts behind you."
  ];
  let cryptRoomIndex = 0;
  function initCrypt(container) {
    cryptRoomIndex = 0;
    container.innerHTML = `
      <div class="lc-crypt">
        <p class="sub">Navigate the endless catacombs.</p>
        <div class="lc-crypt-view">
          <div class="lc-crypt-wall active" id="crypt-wall">
            <div class="lc-crypt-desc" id="crypt-desc">${cryptRooms[0]}</div>
          </div>
        </div>
        <div class="lc-crypt-controls">
          <button onclick="window.LiteraconiteSanctum.moveCrypt(-1)">←</button>
          <button onclick="window.LiteraconiteSanctum.moveCrypt(1)">↑</button>
          <button onclick="window.LiteraconiteSanctum.moveCrypt(1)">→</button>
        </div>
      </div>
    `;
  }
  function moveCrypt(dir) {
    cryptRoomIndex = Math.max(0, Math.min(cryptRooms.length - 1, cryptRoomIndex + dir));
    // add random element
    if (Math.random() > 0.5 && dir > 0 && cryptRoomIndex < cryptRooms.length - 1) {
       cryptRoomIndex = Math.floor(Math.random() * (cryptRooms.length - 1));
    }
    
    const wall = document.getElementById('crypt-wall');
    const desc = document.getElementById('crypt-desc');
    
    wall.classList.remove('active');
    wall.classList.add('inactive');
    
    setTimeout(() => {
      desc.textContent = cryptRooms[cryptRoomIndex];
      wall.classList.remove('inactive');
      wall.classList.add('active');
    }, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSanctum);
  } else {
    initSanctum();
  }

  window.LiteraconiteSanctum = {
    summonSpirit,
    toggleIngredient,
    brewPotion,
    stampSeal,
    saveTypewriter,
    touchRelic,
    moveCrypt
  };
})();
