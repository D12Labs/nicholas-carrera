// Home: grid of cards with hard-cut carousels, and the detail card (dialog).
(function () {
  const CARDS = window.CARDS || [];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const CUT_MS = 1800;       // time each frame holds before the hard cut
  const STAGGER_MS = 300;    // offset between cards so they do not cut in unison

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  // ─── URAP DESCRIPTOR SKETCH ────────────────────────────────
  // A wireframe sphere displaced by per-descriptor presets. Used on the grid card
  // (cycles descriptors with a hard cut) and in the detail card (with controls).
  const PRESETS = {
    smoothness: { freq: 1.2, ampRatio: 0.10, speed: 0.30, harmonics: 1, ys: 1.0 },
    complexity: { freq: 4.0, ampRatio: 0.28, speed: 1.00, harmonics: 4, ys: 1.0 },
    tension:    { freq: 2.0, ampRatio: 0.18, speed: 0.25, harmonics: 2, ys: 1.6 },
    joyfulness: { freq: 3.0, ampRatio: 0.32, speed: 1.80, harmonics: 3, ys: 1.0 },
    elegance:   { freq: 0.8, ampRatio: 0.08, speed: 0.50, harmonics: 1, ys: 1.0 },
    dynamism:   { freq: 3.5, ampRatio: 0.25, speed: 2.50, harmonics: 3, ys: 1.0 },
  };

  function urapSketch(canvas) {
    const ctx = canvas.getContext('2d');
    const s = { descriptor: 'complexity', intensity: 7, t: 0.6, running: false, raf: 0 };

    function size() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
    }

    function draw() {
      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      const pr = PRESETS[s.descriptor];
      // Fit the form at full intensity (widest reach, times the vertical stretch) inside the canvas,
      // so no descriptor clips and the slider never rescales it.
      let reach = 1;
      for (let k = 1; k <= pr.harmonics; k++) reach += pr.ampRatio / k;
      const R = Math.min(w * 0.4, h * 0.42 / pr.ys) / reach;
      const amp = pr.ampRatio * ((s.intensity - 1) / 9) * R;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = cssVar('--fg');
      ctx.lineWidth = Math.max(1, w / 900);
      ctx.globalAlpha = 0.55;
      const disp = (phi, th) => {
        let d = 0;
        for (let k = 1; k <= pr.harmonics; k++) d += amp * Math.sin(pr.freq * k * phi + pr.freq * th + s.t * k) / k;
        return d;
      };
      const SL = 16, ST = 24;
      const pt = (phi, th) => {
        const r = R + disp(phi, th);
        return [cx + r * Math.sin(phi) * Math.cos(th), cy + r * Math.cos(phi) * pr.ys];
      };
      for (let i = 1; i < SL; i++) {
        const phi = (i / SL) * Math.PI;
        ctx.beginPath();
        for (let j = 0; j <= ST; j++) { const [x, y] = pt(phi, (j / ST) * 2 * Math.PI); j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke();
      }
      for (let j = 0; j < ST; j += 2) {
        const th = (j / ST) * 2 * Math.PI;
        ctx.beginPath();
        for (let i = 0; i <= SL; i++) { const [x, y] = pt((i / SL) * Math.PI, th); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function loop() {
      if (!s.running) return;
      s.t += PRESETS[s.descriptor].speed * 0.016;
      draw();
      s.raf = requestAnimationFrame(loop);
    }

    const api = {
      set(k, v) { s[k] = v; if (!s.running) draw(); },
      get: k => s[k],
      play() { if (s.running || reduceMotion.matches) return; s.running = true; loop(); },
      pause() { s.running = false; cancelAnimationFrame(s.raf); },
      redraw() { size(); draw(); },
    };
    new ResizeObserver(() => api.redraw()).observe(canvas);
    window.addEventListener('themechange', () => draw());
    return api;
  }

  // Reel: rolls the strip upward at a steady speed, loading each screen just before it shows.
  const REEL_PX_S = 40;
  function reelDriver(strip, n) {
    const imgs = strip.children;
    let y = 0, last = 0, raf = 0;
    const slot = () => imgs[1].offsetTop - imgs[0].offsetTop;
    function load(from) {
      for (let k = from; k < from + 4 && k < imgs.length; k++) {
        const im = imgs[k];
        if (im.dataset.src) { im.src = im.dataset.src; delete im.dataset.src; }
      }
    }
    function frame(t) {
      const h = slot();
      y += Math.min(t - last, 100) / 1000 * REEL_PX_S;
      last = t;
      if (y >= n * h) y -= n * h;
      load(Math.floor(y / h));
      strip.style.transform = `translateY(${-y}px)`;
      raf = requestAnimationFrame(frame);
    }
    return {
      play() { if (!raf) raf = requestAnimationFrame(t => { last = t; frame(t); }); },
      pause() { cancelAnimationFrame(raf); raf = 0; },
    };
  }

  // Clips: each plays to its end, then a hard cut to the next; the one after is fetched while this one plays.
  function clipsDriver(vids) {
    let k = 0, on = false;
    vids.forEach(v => v.addEventListener('ended', () => {
      v.classList.remove('is-on');
      k = (k + 1) % vids.length;
      const nx = vids[k];
      nx.classList.add('is-on');
      nx.currentTime = 0;
      if (on) start();
    }));
    function start() {
      vids[(k + 1) % vids.length].preload = 'auto';
      vids[k].play().catch(() => {});
    }
    return {
      play() { on = true; start(); },
      pause() { on = false; vids[k].pause(); },
    };
  }

  // ─── GRID ──────────────────────────────────────────────────
  // Frames wider than 900px ship a -700.webp sibling for phones and the two-column grid.
  const SIZES = '(max-width: 760px) calc(100vw - 32px), 50vw';
  const srcset = f => f.w > 900
    ? ` srcset="${f.src.replace(/\.webp$/, '-700.webp')} 700w, ${f.src} ${f.w}w" sizes="${SIZES}"`
    : '';
  const grid = document.getElementById('grid');
  const carousels = [];

  CARDS.forEach((c, i) => {
    const li = document.createElement('li');
    li.className = 'card';
    let media;
    if (c.grid === 'urap') {
      media = `<div class="card-media" data-urap><canvas aria-hidden="true"></canvas></div>`;
    } else if (c.grid.reel) {
      // a vertical strip of every screen, the first few repeated at the end for a seamless loop
      const r = c.grid.reel, tail = r.slice(0, 3);
      media = `<div class="card-media" data-reel role="img" aria-label="${esc(c.grid.alt)}"><div class="reel">${
        [...r, ...tail].map((f, k) => `<img ${k < 3 || k >= r.length ? 'src' : 'data-src'}="${f.src}" width="${f.w}" height="${f.h}" alt="" decoding="async">`).join('')
      }</div></div>`;
    } else if (c.grid.clips) {
      media = `<div class="card-media" role="img" aria-label="${esc(c.grid.alt)}">${c.grid.clips.map((v, k) =>
        `<video class="${k ? '' : 'is-on'}" src="${v.src}" poster="${v.poster}" width="${v.w}" height="${v.h}" muted playsinline preload="${k ? 'none' : 'metadata'}" aria-hidden="true"></video>`
      ).join('')}</div>`;
    } else if (c.grid.video) {
      const v = c.grid;
      media = `<div class="card-media"><video class="is-on" src="${v.src || v.video}" poster="${v.poster}" width="${v.w}" height="${v.h}" muted loop playsinline preload="${i > 1 ? 'none' : 'auto'}" aria-label="${esc(v.alt)}"></video></div>`;
    } else if (!c.grid.length) {
      media = `<div class="card-media is-empty"><p>${esc(c.sentence)}</p></div>`;
    } else {
      media = `<div class="card-media">${c.grid.map((f, k) =>
        `<img src="${f.src}"${srcset(f)} width="${f.w}" height="${f.h}" alt="${k ? '' : esc(f.alt)}"${k ? ' aria-hidden="true"' : ''} class="${k ? '' : 'is-on'}${f.fit === 'contain' ? ' is-contain' : ''}" ${k || i > 1 ? 'loading="lazy" ' : ''}${!k && !i ? 'fetchpriority="high" ' : ''}decoding="async">`
      ).join('')}</div>`;
    }
    li.innerHTML = `
      <a class="card-a" href="#/${c.slug}" data-slug="${c.slug}">
        ${media}
        <div class="card-text">
          <p class="card-brand">${esc(c.brand)}</p>
          <h2 class="card-title">${esc(c.title)}</h2>
          <p class="card-kind">${esc(c.kind)}</p>
        </div>
      </a>`;
    grid.appendChild(li);

    const box = li.querySelector('.card-media');
    if (c.grid === 'urap') {
      const sk = urapSketch(box.querySelector('canvas'));
      const names = Object.keys(PRESETS);
      let k = names.indexOf('complexity');
      carousels.push({ el: li, delay: i * STAGGER_MS, step: () => { k = (k + 1) % names.length; sk.set('descriptor', names[k]); }, sketch: sk });
    } else if (c.grid.reel) {
      carousels.push({ el: li, delay: 0, step: () => {}, reel: reelDriver(box.querySelector('.reel'), c.grid.reel.length) });
    } else if (c.grid.clips) {
      carousels.push({ el: li, delay: 0, step: () => {}, reel: clipsDriver([...box.querySelectorAll('video')]) });
    } else if (c.grid.video) {
      // a single looping clip: the same pause rules, applied as play and pause
      const vid = box.querySelector('video');
      carousels.push({ el: li, delay: 0, step: () => {}, clip: vid });
    } else if (c.grid.length > 1) {
      const frames = [...box.querySelectorAll('img')];
      let k = 0;
      carousels.push({ el: li, delay: i * STAGGER_MS, step: () => {
        frames[k].classList.remove('is-on');
        k = (k + 1) % frames.length;
        frames[k].classList.add('is-on');
      } });
    }
  });

  // One driver per carousel. Plays whether or not it is hovered; paused offscreen, in a hidden tab,
  // an open detail card, and always under prefers-reduced-motion (first frame stays).
  let detailOpen = false;
  carousels.forEach(cz => { cz.visible = false; });
  function paused(cz) {
    return reduceMotion.matches || !cz.visible || document.hidden || detailOpen;
  }
  function sync(cz) {
    const stop = paused(cz);
    if (stop && cz.timer) { clearTimeout(cz.timer); clearInterval(cz.timer); cz.timer = 0; }
    if (!stop && !cz.timer && !cz.clip && !cz.reel) {
      cz.timer = setTimeout(() => { cz.step(); cz.timer = setInterval(cz.step, CUT_MS); }, CUT_MS + cz.delay);
    }
    if (cz.sketch) stop ? cz.sketch.pause() : cz.sketch.play();
    if (cz.reel) stop ? cz.reel.pause() : cz.reel.play();
    if (cz.clip) stop ? cz.clip.pause() : cz.clip.play().catch(() => {});
  }
  const syncAll = () => carousels.forEach(sync);
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    const cz = carousels.find(c => c.el === e.target);
    if (cz) { cz.visible = e.isIntersecting; sync(cz); }
  }), { threshold: 0.25 });
  carousels.forEach(cz => io.observe(cz.el));
  document.addEventListener('visibilitychange', syncAll);
  reduceMotion.addEventListener?.('change', syncAll);

  // ─── DETAIL CARD ───────────────────────────────────────────
  // Expand and collapse glyphs: Lucide "maximize-2" and "minimize-2" (ISC licence), 1.5px stroke.
  const svg = d => `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" aria-hidden="true">${d}</svg>`;
  const ICON_EXPAND = svg('<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>');
  const ICON_COLLAPSE = svg('<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>');
  const dlg = document.createElement('dialog');
  dlg.className = 'detail';
  dlg.setAttribute('aria-labelledby', 'dtitle');
  document.body.appendChild(dlg);

  let current = -1, mIndex = 0, opener = null, pushed = false, demo = null;

  function mediaHTML(m) {
    if (m.type === 'image') return `<img src="${m.src}" width="${m.w}" height="${m.h}" alt="${esc(m.caption)}"${m.round ? ' class="is-round"' : ''}>`;
    if (m.type === 'video') {
      // Every clip has controls (pause, scrub, unmute). sound: waits for play, with sound; the rest loop muted.
      // Only the showing slide is in the DOM, so the other (large) chapters never load or play.
      const attrs = m.sound ? 'controls preload="metadata"'
        : reduceMotion.matches ? 'muted controls'
        : 'muted autoplay loop controls preload="metadata"';   // every detail video can be paused and scrubbed
      return `<video src="${m.src}" ${m.poster ? `poster="${m.poster}"` : ''} width="${m.w}" height="${m.h}" playsinline ${attrs}${m.pixel ? ' class="is-pixel"' : ''} aria-label="${esc(m.caption)}"></video>`;
    }
    if (m.type === 'flow') return `<div class="flow-slot" data-flow="${m.flow}"></div>`;
    if (m.type === 'metric') {
      // Wabash: the ratio shift index and the weighted typologies, as text so it reflows with the stage
      const frac = y => `<span>R<sub>${y}</sub> / O<sub>${y}</sub></span>`;
      return `
      <div class="metric">
        <section>
          <h3 class="metric-h">Ratio shift index</h3>
          <p class="metric-eq" role="math" aria-label="S equals the renter to owner ratio in 2018 divided by the renter to owner ratio in 1990, times 10">
            <b>S</b><span class="metric-op">=</span><span class="metric-frac">${frac(2018)}${frac(1990)}</span><span class="metric-op">&times; 10</span></p>
          <ul class="metric-bands">${m.bands.map(([t, k]) => `<li${k ? ` class="is-${k}"` : ''}>${esc(t)}</li>`).join('')}</ul>
        </section>
        <section>
          <h3 class="metric-h">Typology levels</h3>
          <table class="metric-table">
            <thead><tr><th scope="col"><span class="sr">Color</span></th><th scope="col">Typology</th><th scope="col">Wt</th></tr></thead>
            <tbody>${m.typologies.map(([t, c, w]) => `<tr><td><i style="background:${c}"></i></td><th scope="row">${esc(t)}</th><td>${w}</td></tr>`).join('')}</tbody>
          </table>
        </section>
      </div>`;
    }
    if (m.type === 'urap') return `
      <div class="urap-demo">
        <div class="urap-canvas"><canvas role="img" aria-label="Wireframe form for the chosen descriptor"></canvas></div>
        <div class="urap-controls">
          <div><label for="urap-d">Descriptor</label>
            <select id="urap-d">${Object.keys(PRESETS).map(n => `<option${n === 'complexity' ? ' selected' : ''}>${n}</option>`).join('')}</select></div>
          <div><label for="urap-i">Intensity <span id="urap-iv">7.0</span></label>
            <input id="urap-i" type="range" min="1" max="10" step="0.1" value="7"></div>
        </div>
      </div>`;
    return '';
  }

  function renderMedia() {
    const c = CARDS[current];
    const stage = dlg.querySelector('.dmedia-stage');
    if (!stage) return;
    demo?.pause(); demo = null;
    const m = c.media[mIndex];
    stage.innerHTML = mediaHTML(m);
    // long image runs (CAT): fetch the next frame so the hard cut does not wait on the network
    const nx = c.media[(mIndex + 1) % c.media.length];
    if (c.media.length > 3 && nx.type === 'image') new Image().src = nx.src;
    dlg.querySelector('.dmedia-bar .cap').textContent = m.caption || '';
    const n = dlg.querySelector('.dmedia-bar .n');
    if (n) n.textContent = `${String(mIndex + 1).padStart(2, '0')} / ${String(c.media.length).padStart(2, '0')}`;
    if (m.type === 'flow') window.renderFlow?.(stage.querySelector('.flow-slot'), m.flow);
    if (m.type === 'urap') {
      demo = urapSketch(stage.querySelector('canvas'));
      demo.redraw(); demo.play();
      stage.querySelector('#urap-d').addEventListener('change', e => demo.set('descriptor', e.target.value));
      stage.querySelector('#urap-i').addEventListener('input', e => {
        demo.set('intensity', +e.target.value);
        stage.querySelector('#urap-iv').textContent = (+e.target.value).toFixed(1);
      });
    }
  }

  function render() {
    const c = CARDS[current];
    const prev = CARDS[(current - 1 + CARDS.length) % CARDS.length];
    const next = CARDS[(current + 1) % CARDS.length];
    const hasMedia = c.media.length > 0;
    const many = c.media.length > 1;
    dlg.innerHTML = `
      <div class="detail-shell">
        <div class="detail-top">
          <p class="crumb">Nicholas Carrera / Work / <b>${c.num}</b></p>
          <button class="ctl" data-act="close" type="button">Close <span aria-hidden="true">&times;</span></button>
        </div>
        <article class="dcard${hasMedia ? '' : ' no-media'}">
          ${hasMedia ? `
          <section class="dmedia" aria-label="Media">
            <button class="ctl expand icon" data-act="expand" type="button" aria-pressed="false" aria-label="Expand media">${ICON_EXPAND}</button>
            <div class="dmedia-stage"></div>
            <div class="dmedia-bar">
              <span class="cap"></span>
              <span class="count">
                ${many ? `<button class="step" data-act="mprev" type="button" aria-label="Previous media">&larr;</button>` : ''}
                <span class="n"${many ? ' aria-live="polite"' : ''}></span>
                ${many ? `<button class="step" data-act="mnext" type="button" aria-label="Next media">&rarr;</button>` : ''}
              </span>
            </div>
          </section>` : ''}
          <div class="dtext">
            <header>
              <p class="dtag">${esc(c.tag)}</p>
              <h2 class="dtitle" id="dtitle">${esc(c.title)}</h2>
              <p class="dstatus">${esc(c.status)}</p>
            </header>
            <p class="dsentence">${esc(c.sentence)}</p>
            <div><p class="dlabel">My contribution</p><p>${esc(c.contribution)}</p></div>
            <ol class="dwork">${c.work.map(w => `<li>${esc(w)}</li>`).join('')}</ol>
            ${c.credit ? `<p class="dcredit">${esc(c.credit)}</p>` : ''}
            ${c.links.length ? `<p class="dlinks">${c.links.map(l => `<a class="ctl" href="${l.href}" target="_blank" rel="noopener">${esc(l.label)} <span aria-hidden="true">&#8599;</span></a>`).join('')}</p>` : ''}
          </div>
        </article>
        <div class="detail-bottom">
          <button class="ctl" data-act="prev" type="button" aria-label="Previous: ${esc(prev.title)}">&larr; ${prev.num}</button>
          <div class="mid"><button class="ctl" data-act="close" type="button">Back to work</button></div>
          <button class="ctl" data-act="next" type="button" aria-label="Next: ${esc(next.title)}">${next.num} &rarr;</button>
        </div>
      </div>`;
    if (hasMedia) renderMedia();
  }

  function open(i, fromClick) {
    current = i; mIndex = 0;
    render();
    if (!dlg.open) {
      dlg.showModal();
      document.documentElement.style.overflow = 'hidden';
      detailOpen = true; syncAll();
    }
    pushed = pushed || fromClick;
    dlg.querySelector('[data-act="close"]').focus();
  }

  function close() {
    if (!dlg.open) return;
    demo?.pause(); demo = null;
    dlg.querySelectorAll('video').forEach(v => v.pause());   // a closed dialog stays in the DOM, so its sound would carry on
    dlg.close();
    document.documentElement.style.overflow = '';
    detailOpen = false; syncAll();
    if (location.hash.startsWith('#/')) history.replaceState(null, '', location.pathname + location.search);
    pushed = false;
    (opener || grid.querySelector(`[data-slug="${CARDS[current].slug}"]`))?.focus();
    opener = null;
  }

  function go(delta) {
    const i = (current + delta + CARDS.length) % CARDS.length;
    history.replaceState(null, '', `#/${CARDS[i].slug}`);
    open(i);
    dlg.querySelector(`[data-act="${delta < 0 ? 'prev' : 'next'}"]`)?.focus();
  }

  dlg.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) { if (e.target === dlg) close(); return; }
    const act = b.dataset.act;
    if (act === 'close') close();
    else if (act === 'prev') go(-1);
    else if (act === 'next') go(1);
    else if (act === 'mprev' || act === 'mnext') {
      const n = CARDS[current].media.length;
      mIndex = (mIndex + (act === 'mnext' ? 1 : -1) + n) % n;
      renderMedia();
    } else if (act === 'expand') {
      const card = dlg.querySelector('.dcard');
      const flip = () => {
        const on = card.classList.toggle('is-expanded');
        b.setAttribute('aria-pressed', String(on));
        b.setAttribute('aria-label', on ? 'Collapse media' : 'Expand media');
        b.innerHTML = on ? ICON_COLLAPSE : ICON_EXPAND;
        demo?.redraw();
      };
      // The panel morphs to full size with the View Transitions API where it exists;
      // elsewhere, and under reduced motion, it simply switches.
      if (document.startViewTransition && !reduceMotion.matches) document.startViewTransition(flip);
      else flip();
    }
  });
  dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });
  dlg.addEventListener('keydown', e => {
    if (e.target.matches('input, select')) return;
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  });

  grid.addEventListener('click', e => {
    const a = e.target.closest('.card-a');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    opener = a;
    history.pushState(null, '', a.getAttribute('href'));
    open(CARDS.findIndex(c => c.slug === a.dataset.slug), true);
  });

  function fromHash() {
    const slug = location.hash.startsWith('#/') ? location.hash.slice(2) : '';
    const i = CARDS.findIndex(c => c.slug === slug);
    if (i >= 0) open(i);
    else close();
  }
  window.addEventListener('popstate', fromHash);
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
