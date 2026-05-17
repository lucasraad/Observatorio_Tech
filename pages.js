/* ── Article page ── */
function initArticlePage() {
  const page = document.getElementById('articlePage');
  if (!page || typeof ARTICLES === 'undefined') return;

  const id = new URLSearchParams(window.location.search).get('id');
  const article = getArticleById(id);

  if (!article) {
    page.innerHTML = `
      <div class="section-inner" style="padding-top:8rem;text-align:center;">
        <h1 class="section-title">Artigo não encontrado</h1>
        <p class="section-desc" style="margin:1.5rem auto 2rem;">O conteúdo solicitado não existe ou foi removido.</p>
        <a href="index.html" class="btn-primary">Voltar ao início</a>
      </div>
    `;
    return;
  }

  const cat = CATEGORIES[article.cat];
  document.title = `${article.title} — Observatório Tech`;

  const crumbTitle = document.getElementById('articleBreadcrumbTitle');
  if (crumbTitle) crumbTitle.textContent = article.title.length > 48 ? article.title.slice(0, 48) + '…' : article.title;

  page.setAttribute('data-cat', article.cat);
  page.innerHTML = `
    <nav class="breadcrumbs" aria-label="Navegação estrutural">
      <a href="index.html">Início</a>
      <span class="breadcrumb-sep" aria-hidden="true">›</span>
      <a href="categoria.html?c=${article.cat}">${cat.name}</a>
      <span class="breadcrumb-sep" aria-hidden="true">›</span>
      <span class="breadcrumb-current">${escapeHtml(article.title)}</span>
    </nav>

    <header class="article-header">
      <div class="section-inner">
        <a href="categoria.html?c=${article.cat}" class="article-cat-link">
          <span class="news-tag" data-cat="${article.cat}">${cat.icon} ${cat.name}</span>
        </a>
        <h1 class="article-title">${escapeHtml(article.title)}</h1>
        <p class="article-subtitle">${escapeHtml(article.subtitle)}</p>
        <div class="article-meta">
          <span class="article-author">Por ${escapeHtml(article.author)}</span>
          <span class="article-meta-sep" aria-hidden="true">·</span>
          <time datetime="${article.date}">${formatDate(article.date)}</time>
          <span class="article-meta-sep" aria-hidden="true">·</span>
          <span>${article.readTime} min de leitura</span>
        </div>
      </div>
    </header>

    <figure class="article-cover">
      <img src="${article.cover}" alt="" loading="eager" />
      <figcaption class="article-cover-credit">Imagem: Unsplash</figcaption>
    </figure>

    <div class="article-layout section-inner">
      <article class="article-prose reveal">${article.body}</article>
      <aside class="article-sidebar reveal">
        <div class="sidebar-card">
          <h3 class="sidebar-title">Nesta categoria</h3>
          <a href="categoria.html?c=${article.cat}" class="btn-secondary sidebar-cta">Ver mais em ${cat.name}</a>
        </div>
        <div class="sidebar-card">
          <h3 class="sidebar-title">Compartilhe</h3>
          <p class="sidebar-desc">Gostou? Envie para quem acompanha o futuro da tech.</p>
        </div>
      </aside>
    </div>
  `;

  window.refreshReveal?.();
  window.refreshLikes?.();
}

/* ── Search results page ── */
function initSearchPage() {
  const page = document.getElementById('searchPage');
  if (!page || typeof ARTICLES === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  let query = params.get('q') || '';
  let activeCat = params.get('c') || 'all';

  const input = document.getElementById('searchPageInput');
  const countEl = document.getElementById('searchCount');
  const grid = document.getElementById('searchResultsGrid');
  const empty = document.getElementById('searchEmpty');
  const filters = document.querySelectorAll('.search-filter-btn');

  if (input) input.value = query;

  function updateUrl() {
    const url = getSearchUrl(query, activeCat);
    history.replaceState(null, '', url);
  }

  function renderResults() {
    const results = searchArticles(query, activeCat);
    const qDisplay = query ? ` para "<strong>${escapeHtml(query)}</strong>"` : '';

    if (countEl) {
      const n = results.length;
      countEl.innerHTML = `${n} ${n === 1 ? 'resultado' : 'resultados'}${qDisplay}`;
    }

    filters.forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.cat === activeCat);
    });

    if (!results.length) {
      if (grid) grid.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }

    if (empty) empty.hidden = true;
    if (grid) {
      grid.innerHTML = results.map(a => renderNewsCard(a)).join('');
      window.refreshLikes?.();
      window.refreshReveal?.();
    }
  }

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      activeCat = btn.dataset.cat || 'all';
      updateUrl();
      renderResults();
    });
  });

  document.getElementById('searchPageForm')?.addEventListener('submit', e => {
    e.preventDefault();
    query = input?.value.trim() || '';
    updateUrl();
    renderResults();
  });

  renderResults();
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function initPages() {
  initArticlePage();
  initSearchPage();
}

document.addEventListener('DOMContentLoaded', initPages);
