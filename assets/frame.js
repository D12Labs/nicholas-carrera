// Shared page frame: theme toggle, the fitted wordmark, and the "who" line that follows the cursor over the name.
(function () {
  const root = document.documentElement;

  // ─── THEME ─────────────────────────────────────────────────
  const themeBtn = document.getElementById('theme-btn');
  function syncTheme() {
    if (!themeBtn) return;
    const night = root.dataset.theme === 'night';
    themeBtn.textContent = night ? 'Light' : 'Dark';
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
  // The name fills the masthead width as stroked, overlapping, stretched type.
  // Wide screens stretch it most (so it reads squashed); phones overlap the letters most.
  const name = document.getElementById('wordmark');
  const lerp = (a, b, t) => a + (b - a) * t;
  function fitName() {
    const W = name.parentElement.clientWidth;
    if (!W) return;
    const t = Math.min(1, Math.max(0, (W - 340) / (1400 - 340)));
    const stretch = lerp(1.15, 2.13, t);
    name.style.letterSpacing = lerp(-0.14, -0.1, t).toFixed(3) + 'em';
    name.style.transform = 'none';
    name.style.fontSize = '100px';
    const fs = (100 * W) / (name.offsetWidth * stretch);
    name.style.fontSize = fs.toFixed(2) + 'px';
    name.style.transform = `scaleX(${stretch.toFixed(3)})`;
  }
  if (name) {
    fitName();
    new ResizeObserver(fitName).observe(name.parentElement);
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
