/**
 * LITERACONITE CORE INTERACTIVE ENGINE
 * Pure Vanilla JS, zero external dependencies.
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     1. THEME & ATMOSPHERE ENGINE
     ───────────────────────────────────────────────────────────── */
  const THEMES = ['midnight', 'candlelight', 'crimson'];
  const THEME_NAMES = {
    midnight: 'Midnight Obsidian',
    candlelight: 'Candlelight Parchment',
    crimson: 'Gothic Crimson'
  };
  const THEME_ICONS = {
    midnight: '🌑',
    candlelight: '🕯️',
    crimson: '🍷'
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
    if (document.body) {
      document.body.setAttribute('data-theme', theme);
    }
    try {
      localStorage.setItem('lc-theme', theme);
    } catch(e) {}

    // Update theme toggle button icons
    document.querySelectorAll('.lc-theme-btn').forEach(btn => {
      btn.setAttribute('title', `Theme: ${THEME_NAMES[theme]} (Click to cycle)`);
      const iconSpan = btn.querySelector('.lc-theme-icon');
      if (iconSpan) iconSpan.textContent = THEME_ICONS[theme] || '✦';
    });
  }

  function cycleTheme() {
    const current = getStoredTheme();
    const nextIndex = (THEMES.indexOf(current) + 1) % THEMES.length;
    const nextTheme = THEMES[nextIndex];
    applyTheme(nextTheme);
    showToast(`✦ Atmosphere: ${THEME_NAMES[nextTheme]}`);
    return nextTheme;
  }

  // Initial apply
  applyTheme(getStoredTheme());

  /* ─────────────────────────────────────────────────────────────
     2. GOTHIC PROCEDURAL AUDIO SANCTUARY (Web Audio API)
     ───────────────────────────────────────────────────────────── */
  let audioCtx = null;
  let isAudioPlaying = false;
  let noiseNode = null;
  let filterNode = null;
  let droneGain = null;
  let masterGain = null;

  function initWebAudio() {
    if (audioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      audioCtx = new AudioContext();

      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);

      // Pink/Brown noise generator for rainfall
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

      // Lowpass filter for muffled rain
      filterNode = audioCtx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(750, audioCtx.currentTime);

      noiseNode.connect(filterNode);
      filterNode.connect(masterGain);

      // Atmospheric drone oscillator (55Hz A1)
      const droneOsc = audioCtx.createOscillator();
      droneOsc.type = 'sine';
      droneOsc.frequency.setValueAtTime(55, audioCtx.currentTime);

      droneGain = audioCtx.createGain();
      droneGain.gain.setValueAtTime(0.04, audioCtx.currentTime);

      droneOsc.connect(droneGain);
      droneGain.connect(masterGain);

      noiseNode.start(0);
      droneOsc.start(0);
    } catch(e) {
      console.warn('Web Audio error', e);
    }
  }

  function toggleAudio() {
    if (!audioCtx) initWebAudio();
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!isAudioPlaying) {
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 1.0);
      isAudioPlaying = true;
      showToast('🌧️ Gothic Soundscape: Active');
    } else {
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
      isAudioPlaying = false;
      showToast('Soundscape: Paused');
    }

    document.querySelectorAll('.lc-audio-btn').forEach(btn => {
      btn.classList.toggle('is-active', isAudioPlaying);
    });
  }

  /* ─────────────────────────────────────────────────────────────
     3. TOAST NOTIFICATIONS
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
     4. COMMAND PALETTE (Cmd+K / Ctrl+K / /)
     ───────────────────────────────────────────────────────────── */
  let paletteEl = null;
  let searchIndex = [];
  let isIndexLoaded = false;

  const STATIC_COMMANDS = [
    { title: 'Home', subtitle: 'Return to front page', url: '/', icon: '🏛️' },
    { title: 'Poetry', subtitle: 'Read Gothic & Romantic verse', url: '/poetry/', icon: '📜' },
    { title: 'Reviews & Criticism', subtitle: 'Close readings and essays', url: '/review/', icon: '🖋️' },
    { title: 'Archives', subtitle: 'Chronological archive of all writings', url: '/archives/', icon: '📂' },
    { title: 'Search', subtitle: 'Open full search page', url: '/search/', icon: '🔍' },
    { title: 'Miscellaneous', subtitle: 'Fragments, notes, and visual scraps', url: '/miscellaneous/', icon: '✨' },
    { title: 'Atmosphere: Cycle Theme', subtitle: 'Toggle Midnight / Candlelight / Crimson', action: 'theme', icon: '🕯️' },
    { title: 'Soundscape: Toggle Rain Sanctuary', subtitle: 'Procedural Web Audio rainfall', action: 'audio', icon: '🌧️' },
    { title: 'Letterboxd Diary', subtitle: 'Film diary by Emrecan Koç', url: 'https://letterboxd.com/scyllaborder', icon: '🎞️', external: true },
    { title: 'GitHub Code', subtitle: 'Literaconite repository', url: 'https://github.com/emrecankoc6', icon: '💻', external: true }
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
      console.warn('Search index load', e);
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
          <input type="text" class="lc-palette-input" placeholder="Search poetry, essays, or jump to section (Esc to exit)..." autocomplete="off" spellcheck="false" />
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
            window.location.href = item.url;
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

  // Keyboard shortcut listener
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
     5. VERSE FOCUS MODE (Stanza Illumination)
     ───────────────────────────────────────────────────────────── */
  function initVerseFocus() {
    // Detect poetry container or poetry path
    const container = document.querySelector('.lc-verse-container') ||
                      document.querySelector('.is-poetry .post-content') ||
                      (window.location.pathname.includes('/poetry/') ? document.querySelector('.post-content') : null);

    if (!container) return;

    container.classList.add('lc-verse-container');
    const paragraphs = Array.from(container.querySelectorAll('p'));
    if (paragraphs.length === 0) return;

    paragraphs.forEach(p => {
      p.classList.add('lc-stanza');

      function focusStanza() {
        container.classList.add('is-focused-mode');
        paragraphs.forEach(other => {
          if (other === p) {
            other.classList.add('is-illuminated');
            other.classList.remove('is-dimmed');
          } else {
            other.classList.add('is-dimmed');
            other.classList.remove('is-illuminated');
          }
        });
      }

      p.addEventListener('mouseenter', focusStanza);
      p.addEventListener('click', focusStanza);
    });

    container.addEventListener('mouseleave', () => {
      container.classList.remove('is-focused-mode');
      paragraphs.forEach(p => p.classList.remove('is-dimmed', 'is-illuminated'));
    });

    document.addEventListener('click', e => {
      if (!container.contains(e.target)) {
        container.classList.remove('is-focused-mode');
        paragraphs.forEach(p => p.classList.remove('is-dimmed', 'is-illuminated'));
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────
     6. GOTHIC EXCERPT & QUOTE CLIPPING TOOL
     ───────────────────────────────────────────────────────────── */
  let quoteTooltip = null;

  function initQuoteTooltip() {
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
     7. READING PROGRESS & SCROLL-TO-TOP INDICATOR
     ───────────────────────────────────────────────────────────── */
  function initReadingProgress() {
    let progressBar = document.querySelector('#reading-progress');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.id = 'reading-progress';
      document.body.appendChild(progressBar);
    }

    let topBtn = document.querySelector('.lc-back-to-top');
    if (!topBtn) {
      topBtn = document.createElement('button');
      topBtn.className = 'lc-back-to-top';
      topBtn.setAttribute('aria-label', 'Back to top');
      topBtn.innerHTML = `
        <svg viewBox="0 0 36 36" class="lc-progress-circle">
          <path class="lc-progress-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
          <path class="lc-progress-val" stroke-dasharray="0, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
        </svg>
        <span class="lc-top-arrow">↑</span>
      `;
      document.body.appendChild(topBtn);

      topBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    const circleVal = topBtn.querySelector('.lc-progress-val');

    function updateProgress() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      progressBar.style.width = `${progress}%`;

      if (circleVal) {
        circleVal.setAttribute('stroke-dasharray', `${Math.min(100, Math.round(progress))}, 100`);
      }

      if (scrollTop > 250) {
        topBtn.classList.add('is-visible');
      } else {
        topBtn.classList.remove('is-visible');
      }
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    updateProgress();
  }

  /* ─────────────────────────────────────────────────────────────
     8. STREAM CATEGORY FILTER (Homepage)
     ───────────────────────────────────────────────────────────── */
  function initStreamFilter() {
    const filterContainer = document.querySelector('.lc-stream-filter');
    const streamItems = document.querySelectorAll('.lc-stream-item');
    if (!filterContainer || streamItems.length === 0) return;

    filterContainer.addEventListener('click', e => {
      const btn = e.target.closest('.lc-filter-btn');
      if (!btn) return;

      filterContainer.querySelectorAll('.lc-filter-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const filter = btn.getAttribute('data-filter');

      streamItems.forEach(item => {
        if (filter === 'all' || item.classList.contains(`lc-section-${filter}`)) {
          item.style.display = 'flex';
          item.classList.remove('is-hidden');
        } else {
          item.style.display = 'none';
          item.classList.add('is-hidden');
        }
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
     9. GOTHIC ROTATING EPIGRAPHS (Homepage)
     ───────────────────────────────────────────────────────────── */
  const EPIGRAPHS = [
    { text: "Deep into that darkness peering, long I stood there wondering, fearing...", author: "Edgar Allan Poe" },
    { text: "For he on honey-dew hath fed, and drunk the milk of Paradise.", author: "Samuel Taylor Coleridge" },
    { text: "You will think me cruel, very selfish, but love is always selfish; the more ardent the more selfish.", author: "Sheridan Le Fanu, Carmilla" },
    { text: "She walks in beauty, like the night of cloudless climes and starry skies.", author: "Lord Byron" },
    { text: "There is something at work in my soul, which I do not understand.", author: "Mary Shelley, Frankenstein" },
    { text: "There are times when one must choose between living one's own life fully and dragging out a false existence.", author: "Arthur Miller" },
    { text: "Whatever is dark, romantic, and haunted by the canon shall never sleep.", author: "Literaconite" }
  ];

  function initEpigraph() {
    const epigraphText = document.querySelector('.lc-epigraph-text');
    const epigraphAuthor = document.querySelector('.lc-epigraph-author');
    const refreshBtn = document.querySelector('.lc-epigraph-cycle');
    if (!epigraphText || !epigraphAuthor) return;

    let currentIndex = 0;

    function renderQuote(index) {
      const q = EPIGRAPHS[index];
      epigraphText.style.opacity = '0';
      epigraphAuthor.style.opacity = '0';

      setTimeout(() => {
        epigraphText.textContent = `“${q.text}”`;
        epigraphAuthor.textContent = `— ${q.author}`;
        epigraphText.style.opacity = '1';
        epigraphAuthor.style.opacity = '1';
      }, 200);
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % EPIGRAPHS.length;
        renderQuote(currentIndex);
      });
    }

    currentIndex = Math.floor(Math.random() * EPIGRAPHS.length);
    renderQuote(currentIndex);
  }

  /* ─────────────────────────────────────────────────────────────
     10. DOM INITIALIZATION
     ───────────────────────────────────────────────────────────── */
  function init() {
    applyTheme(getStoredTheme());

    // Header buttons
    document.querySelectorAll('.lc-theme-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        cycleTheme();
      });
    });

    document.querySelectorAll('.lc-palette-trigger').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        openPalette();
      });
    });

    document.querySelectorAll('.lc-audio-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        toggleAudio();
      });
    });

    initReadingProgress();
    initQuoteTooltip();
    initVerseFocus();
    initStreamFilter();
    initEpigraph();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.Literaconite = {
    cycleTheme,
    toggleAudio,
    openPalette,
    closePalette,
    showToast
  };
})();
