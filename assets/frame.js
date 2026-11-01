// Shared page frame: theme toggle, the fitted wordmark, and the "who" line that follows the cursor over the name.
(function () {
  const root = document.documentElement;

  // ─── THEME ─────────────────────────────────────────────────
  const themeBtn = document.getElementById('theme-btn');
  // Lucide "moon" and "sun" (ISC licence), drawn like the expand/collapse glyphs in home.js.
  const svg = d => `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" aria-hidden="true">${d}</svg>`;
  const ICON_MOON = svg('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>');
  const ICON_SUN = svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>');
  function syncTheme() {
    if (!themeBtn) return;
    const night = root.dataset.theme === 'night';
    themeBtn.innerHTML = night ? ICON_SUN : ICON_MOON;
    themeBtn.setAttribute('aria-label', night ? 'Switch to light theme' : 'Switch to dark theme');
  }
  themeBtn?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'night' ? 'day' : 'night';
    try { localStorage.setItem('nico-theme', root.dataset.theme); } catch (e) {}
    syncTheme();
    window.dispatchEvent(new CustomEvent('themechange'));
  });
  syncTheme();

  // ─── WORDMARK ──────────────────────────────────────────────
  // The name is stroked, overlapping, stretched type at one fixed stretch (the SVG's 2.13).
  // Only the kerning moves: narrow screens overlap the letters most, wide screens least.
  // It spans the column on phones and stops at 60% of it from 641px up.
  const name = document.getElementById('wordmark');
  const STRETCH = 2.13;
  const lerp = (a, b, t) => a + (b - a) * t;
  function fitName() {
    const col = name.closest('.masthead').clientWidth;
    if (!col) return;
    const W = col > 640 ? col * 0.6 : col;
    const t = Math.min(1, Math.max(0, (W - 340) / (760 - 340)));
    name.style.letterSpacing = lerp(-0.12, -0.08, t).toFixed(3) + 'em';
    name.style.transform = 'none';
    name.style.fontSize = '100px';
    const fs = (100 * W) / (name.offsetWidth * STRETCH);
    name.style.fontSize = fs.toFixed(2) + 'px';
    name.style.transform = `scaleX(${STRETCH})`;
  }
  if (name) {
    fitName();
    new ResizeObserver(fitName).observe(name.closest('.masthead'));
    document.fonts?.ready.then(fitName);
  }

  // ─── WHO LINE ──────────────────────────────────────────────
  // Fine pointers get the line in a chip under the cursor, in the inverse of the page.
  // Touch and keyboard users get the same line as static text (CSS shows .who).
  const mark = document.getElementById('wordmark');
  const who = document.getElementById('who');
  const float = document.getElementById('who-float');
  if (!mark || !who || !float || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  float.textContent = who.textContent;
  const OFFSET = 18;
  function place(e) {
    const w = float.offsetWidth, h = float.offsetHeight;
    const x = Math.min(e.clientX + OFFSET, innerWidth - w - 8);
    const y = Math.min(e.clientY + OFFSET, innerHeight - h - 8);
    float.style.transform = `translate(${x}px, ${y}px)`;
  }
  mark.addEventListener('pointerenter', e => { place(e); float.classList.add('is-on'); });
  mark.addEventListener('pointermove', place);
  mark.addEventListener('pointerleave', () => float.classList.remove('is-on'));
})();
