const STORAGE_THEME = 'ot-theme';

/* ── Theme ── */
function applyTheme(theme) {
  const next = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(STORAGE_THEME, next);

  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.setAttribute('aria-pressed', next === 'light' ? 'true' : 'false');
    toggle.setAttribute('aria-label', next === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro');
  }
}

function initTheme() {
  const saved = localStorage.getItem(STORAGE_THEME);
  if (saved) applyTheme(saved);

  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'light' ? 'dark' : 'light');
  });
}

function injectThemeToggle() {
  const actions = document.querySelector('.header-actions');
  if (!actions || document.getElementById('themeToggle')) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'theme-toggle';
  btn.id = 'themeToggle';
  btn.setAttribute('aria-pressed', 'false');
  btn.setAttribute('aria-label', 'Ativar tema claro');
  btn.innerHTML = `
    <svg class="theme-icon theme-icon--sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
    <svg class="theme-icon theme-icon--moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  `;
  actions.insertBefore(btn, actions.firstChild);
}

/* ── News ticker ── */
function injectNewsTicker() {
  if (document.getElementById('newsTicker') || typeof ARTICLES === 'undefined') return;

  const items = ARTICLES.map(a => {
    const cat = CATEGORIES[a.cat]?.name || a.cat;
    return `<span class="ticker-item"><span class="ticker-tag" data-cat="${a.cat}">${cat}</span>${a.title}</span>`;
  }).join('<span class="ticker-sep" aria-hidden="true">◆</span>');

  const trackContent = items + '<span class="ticker-sep" aria-hidden="true">◆</span>' + items;

  const ticker = document.createElement('aside');
  ticker.className = 'news-ticker';
  ticker.setAttribute('aria-label', 'Últimas notícias em destaque');
  ticker.innerHTML = `
    <span class="ticker-label">Últimas Notícias</span>
    <div class="ticker-viewport">
      <div class="ticker-track" id="newsTicker">${trackContent}</div>
    </div>
  `;

  const header = document.querySelector('.site-header');
  if (header) header.after(ticker);
}

/* ── Scroll reveal ── */
let revealObserver;

function observeRevealElements() {
  if (!revealObserver) return;
  document.querySelectorAll('.reveal:not(.is-revealed)').forEach(el => {
    revealObserver.observe(el);
  });
}

function markRevealTargets() {
  const selectors = [
    '.feat-card',
    '.news-card',
    '.cat-card',
    '.trend-item',
    '.pilar-card',
    '.comment-item',
    '.ai-tool-card',
    '.section-inner > .section-title',
    '.category-hero .section-inner',
  ].join(',');

  document.querySelectorAll(selectors).forEach((el, i) => {
    if (el.classList.contains('reveal')) return;
    el.classList.add('reveal');
    el.style.setProperty('--reveal-delay', `${(i % 6) * 0.07}s`);
  });
}

function initReveal() {
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  markRevealTargets();
  observeRevealElements();
}

function refreshReveal() {
  markRevealTargets();
  observeRevealElements();
}

window.refreshReveal = refreshReveal;

/* ── Custom cursor ── */
function initCustomCursor() {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!finePointer) return;

  document.body.classList.add('has-custom-cursor');

  const wrap = document.createElement('div');
  wrap.className = 'custom-cursor';
  wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML = '<div class="cursor-glow"></div><div class="cursor-dot"></div>';
  document.body.appendChild(wrap);

  const dot = wrap.querySelector('.cursor-dot');
  const glow = wrap.querySelector('.cursor-glow');

  let mx = 0, my = 0, dx = 0, dy = 0, gx = 0, gy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    wrap.classList.add('is-visible');
  });

  document.addEventListener('mouseleave', () => {
    wrap.classList.remove('is-visible');
  });

  const hoverables = 'a, button, input, textarea, select, .like-btn, .feat-card, .news-card, .cat-card';
  document.addEventListener('mouseover', e => {
    wrap.classList.toggle('is-hovering', !!e.target.closest(hoverables));
  });

  function tick() {
    dx += (mx - dx) * 0.35;
    dy += (my - dy) * 0.35;
    gx += (mx - gx) * 0.12;
    gy += (my - gy) * 0.12;
    dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
    glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }
  tick();
}

/* ── Init ── */
function initVisual() {
  injectThemeToggle();
  initTheme();
  injectNewsTicker();
  initReveal();
  initCustomCursor();
}

document.addEventListener('DOMContentLoaded', initVisual);
