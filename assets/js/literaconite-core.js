/**
 * LITERACONITE CORE INTERACTIVE SYSTEM & CONTINUOUS AUDIO SANCTUARY
 * Pure Vanilla JavaScript — Zero Dependencies, 100% Seamless PJAX
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
     2. GOTHIC PROCEDURAL AUDIO SANCTUARY (Web Audio API)
     Continuous procedural rainfall that never unloads or stops
     ───────────────────────────────────────────────────────────── */
  let audioCtx = null;
  let isAudioPlaying = false;
  let noiseNode = null;
  let filterNode = null;
  let droneGain = null;
  let masterGain = null;

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

      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);

      // Pink/Brown noise buffer for gentle rainfall
      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      noiseNode = audioCtx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;

      filterNode = audioCtx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(680, audioCtx.currentTime);

      noiseNode.connect(filterNode);
      filterNode.connect(masterGain);

      // Deep cathedral 55Hz drone oscillator
      const droneOsc = audioCtx.createOscillator();
      droneOsc.type = 'sine';
      droneOsc.frequency.setValueAtTime(55, audioCtx.currentTime);

      droneGain = audioCtx.createGain();
      droneGain.gain.setValueAtTime(0.038, audioCtx.currentTime);

      droneOsc.connect(droneGain);
      droneGain.connect(masterGain);

      noiseNode.start(0);
      droneOsc.start(0);
    } catch(e) {
      console.warn('Web Audio init error', e);
    }
  }

  function startAudio(silent = false) {
    if (!audioCtx) initWebAudio();
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.22, audioCtx.currentTime + 1.0);
    isAudioPlaying = true;
    try {
      localStorage.setItem('lc-audio', 'active');
    } catch(e) {}

    updateAudioUI();
    if (!silent) showToast('🌧️ Rain Soundscape: Active');
  }

  function pauseAudio(silent = false) {
    if (!audioCtx || !isAudioPlaying) return;

    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
    isAudioPlaying = false;
    try {
      localStorage.setItem('lc-audio', 'paused');
    } catch(e) {}

    updateAudioUI();
    if (!silent) showToast('Rain Soundscape: Paused');
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
        document.removeEventListener('click', resumeHandler);
        document.removeEventListener('keydown', resumeHandler);
        document.removeEventListener('touchstart', resumeHandler);
      };
      document.addEventListener('click', resumeHandler, { once: true, capture: true });
      document.addEventListener('keydown', resumeHandler, { once: true, capture: true });
      document.addEventListener('touchstart', resumeHandler, { once: true, capture: true });
    }
  }

  /* ─────────────────────────────────────────────────────────────
     3. BULLETPROOF CAPTURE-PHASE PJAX NAVIGATION
     Intercepts ALL internal link clicks before anything can stop propagation
     ───────────────────────────────────────────────────────────── */
  let isNavigating = false;

  async function navigateTo(url, pushHistory = true) {
    if (isNavigating) return;
    isNavigating = true;

    // Ensure audio stays alive
    if (isAudioPlaying && audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const mainContainer = document.querySelector('.lc-container');
    if (mainContainer) mainContainer.classList.add('is-transitioning');

    try {
      const response = await fetch(url, { headers: { 'X-Requested-With': 'Literaconite-PJAX' } });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const htmlText = await response.text();

      const parser = new DOMParser();
      const newDoc = parser.parseFromString(htmlText, 'text/html');

      // Update Document Title
      document.title = newDoc.title;

      // Update Body Classes (single-view vs list-view, section-*, etc.)
      document.body.className = newDoc.body.className;

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
      const cleanPath = window.location.pathname.replace(/\/$/, '') || '/';
      document.querySelectorAll('.lc-nav-list a').forEach(link => {
        const linkPath = link.getAttribute('href')?.replace(/\/$/, '') || '/';
        if (linkPath === cleanPath || (linkPath !== '/' && cleanPath.startsWith(linkPath))) {
          link.classList.add('is-active');
        } else {
          link.classList.remove('is-active');
        }
      });

      // Scroll smoothly to top
      window.scrollTo(0, 0);

      // Re-initialize dynamic page interactive components
      initReadingProgress();
      initVerseFocus();
      initStreamFilter();

    } catch (err) {
      console.warn('PJAX fallback to hard navigation', err);
      window.location.href = url;
    } finally {
      setTimeout(() => {
        if (mainContainer) mainContainer.classList.remove('is-transitioning');
        isNavigating = false;
      }, 50);
    }
  }

  function initPjax() {
    // CAPTURE PHASE LISTENER: catches every click before child stopPropagation
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
          // Normalize paths for hashless self-navigation
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
    }, true); // TRUE = Capture phase!

    window.addEventListener('popstate', () => {
      navigateTo(window.location.href, false);
    });
  }

  /* ─────────────────────────────────────────────────────────────
     4. TOAST NOTIFICATIONS
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
     5. COMMAND PALETTE (Cmd+K / Ctrl+K / /)
     ───────────────────────────────────────────────────────────── */
  let paletteEl = null;
  let searchIndex = [];
  let isIndexLoaded = false;

  const STATIC_COMMANDS = [
    { title: 'Frontispiece', subtitle: 'Return to front page', url: '/', icon: '✦' },
    { title: 'Poetry & Verse', subtitle: 'Original Gothic and Romantic verse', url: '/poetry/', icon: '📜' },
    { title: 'Criticism & Close Readings', subtitle: 'Dramatic essays and literary theory', url: '/review/', icon: '🖋️' },
    { title: 'Chronological Archive', subtitle: 'Full index of all writings', url: '/archives/', icon: '📂' },
    { title: 'Fragments & Miscellaneous', subtitle: 'Scraps, fragments, and art', url: '/miscellaneous/', icon: '✨' },
    { title: 'Atmosphere: Toggle Theme', subtitle: 'Switch Midnight / Candlelight / Crimson', action: 'theme', icon: '🕯️' },
    { title: 'Soundscape: Toggle Rain', subtitle: 'Ambient procedural rainfall', action: 'audio', icon: '🌧️' },
    { title: 'Letterboxd Diary', subtitle: 'Film diary by Emrecan Koç', url: 'https://letterboxd.com/scyllaborder', icon: '🎞️', external: true }
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
            subtitle: item.description || item.summary || item.section || 'Article',
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
          <input type="text" class="lc-palette-input" placeholder="Search inscriptions or jump to section (Esc to exit)..." autocomplete="off" spellcheck="false" />
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

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (paletteEl && paletteEl.classList.contains('is-open')) {
        closePalette();
      } else {
        openPalette();
      }
    } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      openPalette();
    } else if (e.key === 'Escape' && paletteEl && paletteEl.classList.contains('is-open')) {
      closePalette();
    }
  });

  /* ─────────────────────────────────────────────────────────────
     6. VERSE FOCUS & STANZA INTERACTION
     ───────────────────────────────────────────────────────────── */
  function initVerseFocus() {
    const proseContainer = document.querySelector('.lc-verse-mode') || document.querySelector('.is-poetry-article .lc-prose');
    if (!proseContainer) return;

    const paragraphs = Array.from(proseContainer.querySelectorAll('p')).filter(p => !p.closest('figcaption'));

    paragraphs.forEach((p, idx) => {
      p.onclick = e => {
        // If clicking a link inside the stanza, do not lock stanza
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
     7. GOTHIC EXCERPT & CITATION TOOLTIP
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
     8. READING PROGRESS BAR
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
     9. HOMEPAGE STREAM FILTER
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
     10. DOM INITIALIZATION
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
    openPalette,
    closePalette,
    showToast,
    navigateTo
  };
})();
