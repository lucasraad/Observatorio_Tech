const STORAGE_LIKES = 'ot-likes';
const STORAGE_COMMENTS = 'ot-comments';
const STORAGE_NEWSLETTER = 'ot-newsletter';

/* ── Newsletter modal ── */
function injectNewsletterModal() {
  if (document.getElementById('newsletterModal')) return;

  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-overlay" id="newsletterOverlay" aria-hidden="true"></div>
    <div class="modal newsletter-modal" id="newsletterModal" role="dialog" aria-modal="true" aria-labelledby="newsletterTitle" aria-hidden="true">
      <button type="button" class="modal-close" id="newsletterClose" aria-label="Fechar">×</button>

      <div class="newsletter-form-view" id="newsletterFormView">
        <span class="modal-eyebrow">▸ Fique por dentro</span>
        <h2 class="modal-title" id="newsletterTitle">Newsletter Observatório</h2>
        <p class="modal-desc">Receba as melhores análises sobre tech, IA, cinema e jogos — direto no seu e-mail, toda semana.</p>
        <form class="newsletter-form" id="newsletterForm" novalidate>
          <label class="sr-only" for="newsletterEmail">E-mail</label>
          <input type="email" id="newsletterEmail" class="newsletter-input" placeholder="seu@email.com" required autocomplete="email" />
          <p class="newsletter-error" id="newsletterError" hidden>E-mail inválido. Tente novamente.</p>
          <button type="submit" class="btn-primary newsletter-submit">Inscrever-se</button>
        </form>
      </div>

      <div class="newsletter-success-view" id="newsletterSuccessView" hidden>
        <div class="success-icon" aria-hidden="true">✓</div>
        <h2 class="modal-title">Inscrição confirmada!</h2>
        <p class="modal-desc">Obrigado por se juntar ao Observatório. Em breve você receberá nossa primeira edição.</p>
        <button type="button" class="btn-secondary" id="newsletterDone">Fechar</button>
      </div>
    </div>
  `);
}

function openNewsletterModal() {
  const overlay = document.getElementById('newsletterOverlay');
  const modal = document.getElementById('newsletterModal');
  const formView = document.getElementById('newsletterFormView');
  const successView = document.getElementById('newsletterSuccessView');
  const form = document.getElementById('newsletterForm');
  const error = document.getElementById('newsletterError');
  if (!overlay || !modal) return;

  window.closeMobileNav?.();
  window.closeSearch?.();

  formView.hidden = false;
  successView.hidden = true;
  form?.reset();
  if (error) error.hidden = true;

  overlay.classList.add('is-visible');
  modal.classList.add('is-visible');
  overlay.setAttribute('aria-hidden', 'false');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  requestAnimationFrame(() => {
    document.getElementById('newsletterEmail')?.focus();
  });
}

function closeNewsletterModal() {
  const overlay = document.getElementById('newsletterOverlay');
  const modal = document.getElementById('newsletterModal');
  if (!overlay || !modal) return;

  overlay.classList.remove('is-visible');
  modal.classList.remove('is-visible');
  overlay.setAttribute('aria-hidden', 'true');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function initNewsletter() {
  document.querySelectorAll('.nav-cta, .newsletter-trigger').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      openNewsletterModal();
    });
  });

  const overlay = document.getElementById('newsletterOverlay');
  const closeBtn = document.getElementById('newsletterClose');
  const doneBtn = document.getElementById('newsletterDone');
  const form = document.getElementById('newsletterForm');

  overlay?.addEventListener('click', closeNewsletterModal);
  closeBtn?.addEventListener('click', closeNewsletterModal);
  doneBtn?.addEventListener('click', closeNewsletterModal);

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('newsletterEmail');
    const error = document.getElementById('newsletterError');
    const email = input?.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (error) error.hidden = false;
      input?.focus();
      return;
    }
    if (error) error.hidden = true;
    localStorage.setItem(STORAGE_NEWSLETTER, email);

    document.getElementById('newsletterFormView').hidden = true;
    document.getElementById('newsletterSuccessView').hidden = false;
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('newsletterModal')?.classList.contains('is-visible')) {
      closeNewsletterModal();
    }
  });
}

/* ── Likes ── */
function loadLikes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_LIKES)) || {};
  } catch {
    return {};
  }
}

function saveLikes(data) {
  localStorage.setItem(STORAGE_LIKES, JSON.stringify(data));
}

function getLikeCount(articleId) {
  const article = getArticleById(articleId);
  const base = article?.likes ?? 0;
  const liked = !!loadLikes()[articleId];
  return base + (liked ? 1 : 0);
}

function isLiked(articleId) {
  return !!loadLikes()[articleId];
}

function updateLikeButton(btn) {
  const id = btn.dataset.articleId;
  const countEl = btn.querySelector('.like-count');
  const liked = isLiked(id);

  btn.classList.toggle('is-liked', liked);
  btn.setAttribute('aria-pressed', liked ? 'true' : 'false');

  if (countEl) {
    countEl.textContent = getLikeCount(id);
    countEl.classList.remove('is-bumping');
    void countEl.offsetWidth;
    countEl.classList.add('is-bumping');
  }
}

function initLikes() {
  document.querySelectorAll('.like-btn').forEach(updateLikeButton);

  document.addEventListener('click', e => {
    const btn = e.target.closest('.like-btn');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    const id = btn.dataset.articleId;
    const likes = loadLikes();
    likes[id] = !likes[id];
    if (!likes[id]) delete likes[id];
    saveLikes(likes);

    btn.classList.add('is-popping');
    setTimeout(() => btn.classList.remove('is-popping'), 400);
    updateLikeButton(btn);
  });
}

/* ── Comments ── */
function loadComments() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_COMMENTS)) || [];
  } catch {
    return [];
  }
}

function saveComments(comments) {
  localStorage.setItem(STORAGE_COMMENTS, JSON.stringify(comments));
}

function formatCommentDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function renderComments() {
  const list = document.getElementById('commentList');
  const empty = document.getElementById('commentEmpty');
  if (!list) return;

  const comments = loadComments().sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!comments.length) {
    list.innerHTML = '';
    if (empty) empty.hidden = false;
    return;
  }

  if (empty) empty.hidden = true;
  list.innerHTML = comments.map(c => `
    <li class="comment-item">
      <p class="comment-text">${escapeHtml(c.text)}</p>
      <time class="comment-date" datetime="${c.date}">${formatCommentDate(c.date)}</time>
    </li>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function initComments() {
  const form = document.getElementById('commentForm');
  const input = document.getElementById('commentInput');
  if (!form || !input) return;

  renderComments();

  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    const comments = loadComments();
    comments.push({
      id: Date.now(),
      text,
      date: new Date().toISOString(),
    });
    saveComments(comments);
    input.value = '';
    renderComments();

    const list = document.getElementById('commentList');
    list?.querySelector('.comment-item')?.classList.add('comment-item--new');
  });
}

function initHomeNewsList() {
  const list = document.querySelector('#noticias .news-list');
  if (!list || typeof renderNewsCard === 'undefined') return;
  list.innerHTML = [4, 5, 6, 7].map(id => renderNewsCard(getArticleById(id))).join('');
}

function refreshLikes() {
  document.querySelectorAll('.like-btn').forEach(updateLikeButton);
}

window.refreshLikes = refreshLikes;

function initEngagement() {
  injectNewsletterModal();
  initHomeNewsList();
  initNewsletter();
  initLikes();
  initComments();
  window.refreshReveal?.();
}

document.addEventListener('DOMContentLoaded', initEngagement);
