/* ── Reading progress ── */
function initReadingProgress() {
  const bar = document.getElementById('readingProgress');
  if (!bar) return;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    bar.style.width = `${pct}%`;
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* ── Header scroll opacity ── */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    const theme = document.documentElement.getAttribute('data-theme');
    const dark = theme !== 'light';
    header.style.background = window.scrollY > 40
      ? (dark ? 'rgba(4,6,15,0.97)' : 'rgba(238,241,248,0.98)')
      : '';
  }, { passive: true });
}

/* ── Smooth scroll for in-page anchors ── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMobileNav();
      const offset = 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      history.pushState(null, '', id);
    });
  });
}

/* ── Mobile nav / hamburger ── */
let mobileNavOpen = false;

function closeMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const overlay = document.getElementById('navOverlay');
  const mobileNav = document.getElementById('mobileNav');
  if (!hamburger || !overlay || !mobileNav) return;

  mobileNavOpen = false;
  hamburger.classList.remove('is-active');
  hamburger.setAttribute('aria-expanded', 'false');
  overlay.classList.remove('is-visible');
  mobileNav.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  mobileNav.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('nav-open');
}

function openMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const overlay = document.getElementById('navOverlay');
  const mobileNav = document.getElementById('mobileNav');
  if (!hamburger || !overlay || !mobileNav) return;

  closeSearch();
  mobileNavOpen = true;
  hamburger.classList.add('is-active');
  hamburger.setAttribute('aria-expanded', 'true');
  overlay.classList.add('is-visible');
  mobileNav.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  mobileNav.setAttribute('aria-hidden', 'false');
  document.body.classList.add('nav-open');
}

function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const overlay = document.getElementById('navOverlay');
  const mobileNav = document.getElementById('mobileNav');
  if (!hamburger || !overlay || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    mobileNavOpen ? closeMobileNav() : openMobileNav();
  });

  overlay.addEventListener('click', closeMobileNav);

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (!link.getAttribute('href')?.startsWith('#')) closeMobileNav();
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeMobileNav();
      closeSearch();
    }
  });
}

/* ── Expandable search ── */
let searchOpen = false;

function closeSearch() {
  const wrap = document.getElementById('searchWrap');
  const toggle = document.querySelector('.search-toggle');
  const results = document.getElementById('searchResults');
  if (!wrap || !toggle) return;

  searchOpen = false;
  wrap.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
  if (results) results.hidden = true;
}

function openSearch() {
  const wrap = document.getElementById('searchWrap');
  const toggle = document.querySelector('.search-toggle');
  const input = document.querySelector('.search-input');
  if (!wrap || !toggle) return;

  closeMobileNav();
  searchOpen = true;
  wrap.classList.add('is-open');
  toggle.setAttribute('aria-expanded', 'true');
  setTimeout(() => input?.focus(), 320);
}

function runSearch(query, category) {
  const resultsEl = document.getElementById('searchResults');
  if (!resultsEl || typeof ARTICLES === 'undefined') return;

  const q = query.trim();
  if (!q) {
    resultsEl.hidden = true;
    resultsEl.innerHTML = '';
    return;
  }

  const items = typeof searchArticles === 'function'
    ? searchArticles(q, category)
    : ARTICLES.filter(a => a.title.toLowerCase().includes(q.toLowerCase()));

  if (!items.length) {
    resultsEl.innerHTML = '<p class="search-empty">Nenhum resultado encontrado.</p>';
    resultsEl.hidden = false;
    return;
  }

  const cat = category || 'all';
  let html = items.slice(0, 6).map(a => `
    <a href="${a.url}" class="search-result-item">
      <span class="news-tag" data-cat="${a.cat}">${CATEGORIES[a.cat].name}</span>
      <span class="search-result-title">${a.title}</span>
    </a>
  `).join('');

  if (typeof getSearchUrl === 'function') {
    html += `<a href="${getSearchUrl(q, cat)}" class="search-view-all">Ver todos os resultados →</a>`;
  }

  resultsEl.innerHTML = html;
  resultsEl.hidden = false;
}

function initSearch() {
  const wrap = document.getElementById('searchWrap');
  const toggle = document.querySelector('.search-toggle');
  const input = document.querySelector('.search-input');
  const filter = document.getElementById('searchFilter');
  if (!wrap || !toggle || !input) return;

  const pageCat = new URLSearchParams(window.location.search).get('c');
  if (pageCat && filter && CATEGORIES[pageCat]) {
    filter.value = pageCat;
  }

  toggle.addEventListener('click', e => {
    e.stopPropagation();
    searchOpen ? closeSearch() : openSearch();
  });

  const onInput = () => runSearch(input.value, filter?.value);
  input.addEventListener('input', onInput);
  filter?.addEventListener('change', onInput);

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && typeof getSearchUrl === 'function') {
      e.preventDefault();
      const q = input.value.trim();
      if (q) window.location.href = getSearchUrl(q, filter?.value);
    }
  });

  const params = new URLSearchParams(window.location.search);
  const initialQ = params.get('q');
  if (initialQ && document.getElementById('searchPage')) {
    input.value = initialQ;
    runSearch(initialQ, filter?.value);
  }

  document.addEventListener('click', e => {
    if (!searchOpen) return;
    if (!wrap.contains(e.target)) closeSearch();
  });
}

/* ── Category page ── */
function initCategoryPage() {
  const page = document.getElementById('categoryPage');
  if (!page || typeof CATEGORIES === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const cat = params.get('c');
  const meta = CATEGORIES[cat];

  if (!meta) {
    page.innerHTML = `
      <div class="section-inner" style="padding-top:8rem;text-align:center;">
        <h1 class="section-title">Categoria não encontrada</h1>
        <p class="section-desc" style="margin:1.5rem auto 2rem;">A categoria solicitada não existe.</p>
        <a href="index.html" class="btn-primary">Voltar ao início</a>
      </div>
    `;
    return;
  }

  document.title = `${meta.name} — Observatório Tech`;

  const crumbCurrent = document.getElementById('breadcrumbCurrent');
  if (crumbCurrent) crumbCurrent.textContent = meta.name;

  const heroIcon = document.getElementById('catHeroIcon');
  const heroTitle = document.getElementById('catHeroTitle');
  const heroDesc = document.getElementById('catHeroDesc');
  if (heroIcon) heroIcon.textContent = meta.icon;
  if (heroTitle) heroTitle.textContent = meta.name;
  if (heroDesc) heroDesc.textContent = meta.desc;
  page.setAttribute('data-cat', cat);

  const list = document.getElementById('categoryArticles');
  if (!list) return;

  const articles = getArticlesByCategory(cat);
  list.innerHTML = articles.map(a => renderNewsCard(a)).join('');
  if (typeof refreshLikes === 'function') refreshLikes();
}

function initSiteNav() {
  initReadingProgress();
  initHeaderScroll();
  initSmoothScroll();
  initMobileNav();
  initSearch();
  initCategoryPage();
}

window.closeMobileNav = closeMobileNav;
window.closeSearch = closeSearch;

document.addEventListener('DOMContentLoaded', initSiteNav);
