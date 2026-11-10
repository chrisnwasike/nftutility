// NFT Utility 1.0 landing page. No frameworks, no network calls, no cookies, no analytics. Everything runs in the browser.
// Scroll effects share ONE passive scroll listener that only marks the frame dirty; the work happens in requestAnimationFrame.
// Everything else (reveals, the tagline, the day clock, counters, the menu highlight) uses IntersectionObserver.
(() => {
  const root = document.documentElement;
  root.classList.remove('no-js');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad2 = (n) => String(n).padStart(2, '0');

  // ---- headings: each word rises out of a mask, one after another
  if (!reduced) {
    document.querySelectorAll('[data-split]').forEach((el) => {
      // a .nb group inside the heading stays together on one line
      const text = [...el.childNodes].map((n) => (n.nodeType === 1 && n.classList.contains('nb') ? n.textContent.replace(/\s+/g, ' ') : n.textContent)).join('');
      const words = text.trim().split(/[ \t\r\n]+/);
      el.textContent = '';
      words.forEach((w, i) => {
        const mask = document.createElement('span');
        mask.className = 'sw';
        mask.style.setProperty('--w', String(i));
        const inner = document.createElement('span');
        inner.textContent = w;
        mask.appendChild(inner);
        el.appendChild(mask);
        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      });
    });
  }

  // ---- scroll reveals: each block arrives once, when it first comes into view
  const reveal = document.querySelectorAll('.rv, .rv-pop, .rv-sheet, [data-split]');
  if (reduced || !hasIO) {
    reveal.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    reveal.forEach((el) => io.observe(el));
  }

  // ---- tagline: every word goes from muted to full as it crosses a line a little below the middle of the screen, in reading order
  const tag = document.querySelector('[data-words]');
  if (tag) {
    const words = tag.textContent.trim().split(/\s+/);
    tag.setAttribute('aria-label', words.join(' '));
    tag.textContent = '';
    const spans = words.map((w, i) => {
      const s = document.createElement('span');
      s.className = 'w';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = w + (i < words.length - 1 ? ' ' : '');
      tag.appendChild(s);
      return s;
    });
    if (reduced || !hasIO) {
      spans.forEach((s) => s.classList.add('on'));
    } else {
      const wio = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting || e.boundingClientRect.top < 0) { e.target.classList.add('on'); wio.unobserve(e.target); }
        }
      }, { rootMargin: '0px 0px -38% 0px', threshold: 0 }); // the trigger line sits 38% up from the bottom of the screen
      spans.forEach((s) => wio.observe(s));
    }
  }

  // ---- a number that counts up the first time it is seen
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    if (reduced || !hasIO || !Number.isFinite(target)) return;
    el.textContent = '0';
    const cio = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      cio.disconnect();
      const t0 = performance.now();
      const step = (now) => {
        const k = clamp((now - t0) / 1100, 0, 1);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    cio.observe(el);
  });

  // ---- a Tuesday: the clock follows the beat that is in the middle of the screen
  const beats = [...document.querySelectorAll('.beat')];
  const clock = document.querySelector('.clock');
  const clockText = document.querySelector('[data-clock]');
  if (beats.length && hasIO && !reduced) {
    const bio = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        beats.forEach((b) => b.classList.toggle('on', b === e.target));
        const label = e.target.querySelector('time')?.textContent.trim() ?? '';
        const m = /^(\d{1,2}):(\d{2})$/.exec(label);
        if (clockText) clockText.textContent = label;
        if (clock) clock.style.setProperty('--cp', m ? String((Number(m[1]) * 60 + Number(m[2])) / 1440) : '1');
      }
    }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 });
    beats.forEach((b) => bio.observe(b));
  } else {
    beats.forEach((b) => b.classList.add('on'));
  }

  // ---- navigation: the section on screen is marked in the bar
  const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  if (hasIO && map.size) {
    const sio = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          links.forEach((a) => a.removeAttribute('aria-current'));
          map.get(e.target.id)?.setAttribute('aria-current', 'true');
        }
      }
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    for (const id of map.keys()) { const s = document.getElementById(id); if (s) sio.observe(s); }
  }

  // ---- mobile menu: a full height panel, links arrive one after another
  const toggle = document.getElementById('menu-toggle');
  const panel = document.getElementById('menu-panel');
  if (toggle && panel) {
    const set = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      panel.classList.toggle('open', open);
      panel.inert = !open;
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) panel.querySelector('a')?.focus();
    };
    panel.inert = true;
    toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
    panel.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panel.classList.contains('open')) { set(false); toggle.focus(); } });
    window.matchMedia('(min-width: 900px)').addEventListener('change', (m) => { if (m.matches) set(false); });
  }

  // ---- scroll driven effects, one frame at a time ------------------------------------------------------------------------------
  const bar = document.querySelector('.progress i');
  const heroSheet = document.querySelector('.hero-sheet');
  const finalSheet = document.querySelector('.final-sheet');
  const pains = [...document.querySelectorAll('.pain')];
  const hs = document.querySelector('.hs');
  const track = hs?.querySelector('.systems');
  const view = hs?.querySelector('.hs-view');
  const hsIndex = hs?.querySelector('[data-hs-i]');
  const stepsWrap = document.querySelector('.steps-wrap');
  const panels = hs ? hs.querySelectorAll('.system').length : 0;
  const pinQuery = window.matchMedia('(min-width: 900px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)');
  let painTops = [];
  let lastScale = [];

  const measure = () => { painTops = pains.map((p) => parseFloat(getComputedStyle(p).top) || 0); };

  const frame = () => {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;

    const max = root.scrollHeight - vh;
    if (bar) bar.style.setProperty('--p', String(max > 0 ? clamp(y / max, 0, 1) : 0));

    if (!reduced) {
      if (heroSheet && y < vh * 1.5) heroSheet.style.setProperty('--sy', String(Math.round(y)));
      if (finalSheet) {
        const r = finalSheet.getBoundingClientRect();
        if (r.bottom > -200 && r.top < vh + 200) finalSheet.style.setProperty('--sy', String(Math.round(clamp(r.top + r.height / 2 - vh / 2, -900, 900))));
      }
      // pain cards: the one underneath shrinks a little as the next one slides over it
      pains.forEach((p, i) => {
        const next = pains[i + 1];
        let sc = 1;
        if (next) {
          const d = next.getBoundingClientRect().top - painTops[i];
          sc = 1 - 0.05 * clamp(1 - d / (p.offsetHeight + 24), 0, 1);
        }
        const v = sc.toFixed(3);
        if (lastScale[i] !== v) { lastScale[i] = v; p.style.setProperty('--sc', v); }
      });
    }

    // the line through the three steps draws itself
    if (stepsWrap) {
      const r = stepsWrap.getBoundingClientRect();
      stepsWrap.style.setProperty('--tp', String(reduced ? 1 : clamp((vh * 0.85 - r.top) / (vh * 0.45), 0, 1)));
    }

    // the four systems: while the section is pinned, the scroll slides the panels sideways and lingers on each one
    if (hs && track && view && root.classList.contains('pin')) {
      const r = hs.getBoundingClientRect();
      const total = hs.offsetHeight - vh;
      const p = clamp(total > 0 ? -r.top / total : 0, 0, 1);
      const idx = p * (panels - 1);
      const base = Math.floor(idx);
      const f = clamp((idx - base - 0.22) / 0.56, 0, 1);
      const pos = base >= panels - 1 ? panels - 1 : base + f * f * (3 - 2 * f);
      track.style.setProperty('--hx', (-pos * view.clientWidth).toFixed(1) + 'px');
      hs.style.setProperty('--hp', p.toFixed(3));
      if (hsIndex) hsIndex.textContent = pad2(Math.round(pos) + 1);
    }
  };

  let ticking = false;
  const schedule = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };

  const setPin = () => {
    root.classList.toggle('pin', pinQuery.matches);
    if (!pinQuery.matches && track) track.style.removeProperty('--hx');
    measure();
    schedule();
  };
  pinQuery.addEventListener('change', setPin);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => { measure(); schedule(); });
  window.addEventListener('load', () => { measure(); schedule(); });
  setPin();

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
