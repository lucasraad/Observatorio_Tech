const CHAT_STORAGE = 'ot-chat-history';

const CATEGORY_LABELS = {
  tech: 'Tecnologia',
  ia: 'Inteligência Artificial',
  filmes: 'Filmes',
  jogos: 'Jogos',
};

/* ── API ── */
async function callApi(endpoint, body) {
  const res = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data;
}

function setLoading(el, loading, label = 'Processando…') {
  if (!el) return;
  el.disabled = loading;
  el.classList.toggle('is-loading', loading);
  if (loading) el.dataset.originalText = el.textContent;
  el.textContent = loading ? label : (el.dataset.originalText || el.textContent);
}

/* ── Chatbot ── */
function loadChatHistory() {
  try {
    return JSON.parse(localStorage.getItem(CHAT_STORAGE)) || [];
  } catch {
    return [];
  }
}

function saveChatHistory(messages) {
  localStorage.setItem(CHAT_STORAGE, JSON.stringify(messages.slice(-40)));
}

function injectChatbot() {
  if (document.getElementById('chatbotPanel')) return;

  document.body.insertAdjacentHTML('beforeend', `
    <button type="button" class="chatbot-fab" id="chatbotFab" aria-label="Abrir Assistente do Observatório">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>

    <div class="chatbot-panel" id="chatbotPanel" aria-hidden="true" role="dialog" aria-labelledby="chatbotTitle">
      <header class="chatbot-header">
        <div class="chatbot-header-text">
          <span class="chatbot-eyebrow">▸ Powered by Claude</span>
          <h2 class="chatbot-title" id="chatbotTitle">Assistente do Observatório</h2>
        </div>
        <button type="button" class="chatbot-close" id="chatbotClose" aria-label="Fechar chat">×</button>
      </header>
      <div class="chatbot-messages" id="chatbotMessages" aria-live="polite"></div>
      <form class="chatbot-form" id="chatbotForm">
        <input type="text" class="chatbot-input" id="chatbotInput" placeholder="Pergunte sobre tech, IA, filmes ou jogos…" autocomplete="off" maxlength="2000" />
        <button type="submit" class="chatbot-send" aria-label="Enviar">↑</button>
      </form>
    </div>
  `);
}

let chatMessages = [];

function renderChatMessages() {
  const box = document.getElementById('chatbotMessages');
  if (!box) return;

  if (!chatMessages.length) {
    box.innerHTML = `
      <div class="chat-msg chat-msg--assistant">
        <p>Olá! Sou o Assistente do Observatório. Pergunte sobre tecnologia, IA, cinema ou games — estou aqui para ajudar.</p>
      </div>
    `;
    return;
  }

  box.innerHTML = chatMessages.map(m => `
    <div class="chat-msg chat-msg--${m.role}">
      <p>${escapeHtml(m.content)}</p>
    </div>
  `).join('');

  box.scrollTop = box.scrollHeight;
}

function toggleChatbot(open) {
  const panel = document.getElementById('chatbotPanel');
  const fab = document.getElementById('chatbotFab');
  if (!panel) return;

  const isOpen = open ?? !panel.classList.contains('is-open');
  panel.classList.toggle('is-open', isOpen);
  panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  fab?.classList.toggle('is-hidden', isOpen);
  document.body.classList.toggle('chatbot-open', isOpen);

  if (isOpen) document.getElementById('chatbotInput')?.focus();
}

function initChatbot() {
  injectChatbot();
  chatMessages = loadChatHistory();
  renderChatMessages();

  document.getElementById('chatbotFab')?.addEventListener('click', () => toggleChatbot(true));
  document.getElementById('chatbotClose')?.addEventListener('click', () => toggleChatbot(false));

  document.getElementById('chatbotForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const input = document.getElementById('chatbotInput');
    const text = input?.value.trim();
    if (!text) return;

    chatMessages.push({ role: 'user', content: text });
    input.value = '';
    renderChatMessages();
    saveChatHistory(chatMessages);

    const sendBtn = document.querySelector('.chatbot-send');
    sendBtn.disabled = true;

    const typing = document.createElement('div');
    typing.className = 'chat-msg chat-msg--assistant chat-msg--typing';
    typing.innerHTML = '<p><span></span><span></span><span></span></p>';
    document.getElementById('chatbotMessages')?.appendChild(typing);

    try {
      const { reply } = await callApi('chat', { messages: chatMessages });
      typing.remove();
      chatMessages.push({ role: 'assistant', content: reply });
      saveChatHistory(chatMessages);
      renderChatMessages();
    } catch (err) {
      typing.remove();
      chatMessages.push({
        role: 'assistant',
        content: `Desculpe, não consegui responder: ${err.message}. Verifique se o servidor está rodando e se a API key está configurada.`,
      });
      renderChatMessages();
    } finally {
      sendBtn.disabled = false;
    }
  });
}

/* ── Summarizer ── */
function initSummarizer() {
  const form = document.getElementById('summarizeForm');
  const result = document.getElementById('summarizeResult');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const textarea = document.getElementById('summarizeInput');
    const btn = form.querySelector('button[type="submit"]');
    const text = textarea?.value.trim();
    if (!text) return;

    result.hidden = true;
    result.classList.remove('has-error');
    setLoading(btn, true, 'Resumindo…');

    try {
      const data = await callApi('summarize', { text });
      const cat = data.category || 'tech';
      const label = CATEGORY_LABELS[cat] || data.categoryLabel || cat;

      result.innerHTML = `
        <span class="news-tag" data-cat="${cat}">${escapeHtml(label)}</span>
        <p class="ai-result-text">${escapeHtml(data.summary)}</p>
      `;
      result.hidden = false;
    } catch (err) {
      result.innerHTML = `<p class="ai-error">${escapeHtml(err.message)}</p>`;
      result.classList.add('has-error');
      result.hidden = false;
    } finally {
      setLoading(btn, false);
      if (btn.dataset.originalText) btn.textContent = btn.dataset.originalText;
    }
  });
}

/* ── Title generator ── */
function initTitleGenerator() {
  const form = document.getElementById('titlesForm');
  const result = document.getElementById('titlesResult');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const textarea = document.getElementById('titlesInput');
    const btn = form.querySelector('button[type="submit"]');
    const description = textarea?.value.trim();
    if (!description) return;

    result.hidden = true;
    setLoading(btn, true, 'Gerando…');

    try {
      const data = await callApi('titles', { description });
      const titles = data.titles;
      result.innerHTML = `
        <ol class="titles-list">
          ${titles.map((t, i) => `
            <li class="titles-list-item">
              <span class="titles-num">0${i + 1}</span>
              <span class="titles-text">${escapeHtml(t)}</span>
              <button type="button" class="titles-copy" aria-label="Copiar título">⎘</button>
            </li>
          `).join('')}
        </ol>
      `;
      result.hidden = false;

      result.querySelectorAll('.titles-copy').forEach((copyBtn, i) => {
        copyBtn.addEventListener('click', () => {
          navigator.clipboard?.writeText(titles[i] || '');
          copyBtn.textContent = '✓';
          setTimeout(() => { copyBtn.textContent = '⎘'; }, 1500);
        });
      });
    } catch (err) {
      result.innerHTML = `<p class="ai-error">${escapeHtml(err.message)}</p>`;
      result.hidden = false;
    } finally {
      setLoading(btn, false);
      if (btn.dataset.originalText) btn.textContent = btn.dataset.originalText;
    }
  });
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function initAi() {
  initChatbot();
  initSummarizer();
  initTitleGenerator();
  window.refreshReveal?.();
}

document.addEventListener('DOMContentLoaded', initAi);
