const CATEGORIES = {
  tech: { slug: 'tech', name: 'Tecnologia', icon: '🔭', desc: 'Lançamentos, tendências e análises sobre o que está moldando o mundo digital agora.' },
  ia: { slug: 'ia', name: 'Inteligência Artificial', icon: '🤖', desc: 'Da pesquisa ao impacto real: LLMs, automação, ética e o futuro do trabalho com IA.' },
  filmes: { slug: 'filmes', name: 'Filmes', icon: '🎬', desc: 'Ficção científica, tech noir e tudo que o cinema tem a dizer sobre tecnologia e humanidade.' },
  jogos: { slug: 'jogos', name: 'Jogos', icon: '🎮', desc: 'Reviews, notícias e análises de um mercado que não para de crescer e inovar.' },
};

const ARTICLE_COVERS = {
  1: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80',
  2: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80',
  3: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80',
  4: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
  5: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80',
  6: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80',
  7: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0e?w=1200&q=80',
  8: 'https://images.unsplash.com/photo-1635070041078-e43dde08840c?w=1200&q=80',
  9: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&q=80',
  10: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&q=80',
  11: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80',
  12: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
};

const NEWS_THUMBS = Object.fromEntries(
  Object.entries(ARTICLE_COVERS).map(([id, url]) => [id, url.replace('w=1200', 'w=400')])
);

const ARTICLES_RAW = [
  { id: 1, cat: 'ia', title: 'GPT-5 e o novo paradigma de agentes autônomos na produção de software', subtitle: 'Como laboratórios e startups redefinem fluxos de desenvolvimento com modelos que planejam, executam e iteram sozinhos.', date: '2025-05-15', likes: 312, readTime: 12, author: 'Marina Costa' },
  { id: 2, cat: 'filmes', title: 'Blade Runner 2099: o que a série revela sobre IA e memória', subtitle: 'A expansão do universo de Ridley Scott chega à TV com perguntas urgentes sobre identidade digital.', date: '2025-05-14', likes: 198, readTime: 9, author: 'Rafael Mendes' },
  { id: 3, cat: 'jogos', title: 'GTA VI: engine, mundo aberto e o futuro do streaming de jogos', subtitle: 'Rockstar prepara o maior lançamento da década — e a indústria inteira observa cada detalhe técnico.', date: '2025-05-13', likes: 445, readTime: 11, author: 'Ana Luíza Ribeiro' },
  { id: 4, cat: 'tech', title: 'Apple anuncia chip M5 com foco em inferência local para IA generativa', subtitle: 'Neural Engine de nova geração promete rodar modelos complexos sem depender da nuvem.', date: '2025-05-15', likes: 156, readTime: 8, author: 'Pedro Almeida' },
  { id: 5, cat: 'ia', title: 'OpenAI e Anthropic firmam acordo de segurança com governos da UE', subtitle: 'Novo marco regulatório pode definir como modelos de fronteira são testados antes do lançamento público.', date: '2025-05-14', likes: 89, readTime: 7, author: 'Marina Costa' },
  { id: 6, cat: 'filmes', title: 'Duna: Parte Três entra em pré-produção com orçamento recorde', subtitle: 'Denis Villeneuve encerra a saga de Arrakis em um projeto que já mobiliza estúdios globais.', date: '2025-05-13', likes: 203, readTime: 6, author: 'Rafael Mendes' },
  { id: 7, cat: 'jogos', title: 'Nintendo Switch 2 bate recorde de pré-vendas na primeira semana', subtitle: 'Híbrido portátil/console volta a dominar conversas sobre hardware e estratégia de exclusivos.', date: '2025-05-12', likes: 378, readTime: 8, author: 'Ana Luíza Ribeiro' },
  { id: 8, cat: 'tech', title: 'Quantum computing atinge novo marco com 1000 qubits estáveis', subtitle: 'Pesquisadores reduzem taxa de erro e aproximam era de aplicações comerciais reais.', date: '2025-05-11', likes: 124, readTime: 10, author: 'Pedro Almeida' },
  { id: 9, cat: 'ia', title: 'Fine-tuning local: rodando LLMs open-source no seu hardware', subtitle: 'Guia prático para desenvolvedores que querem privacidade e controle sem abrir mão de performance.', date: '2025-05-10', likes: 167, readTime: 14, author: 'Marina Costa' },
  { id: 10, cat: 'filmes', title: 'Os 10 melhores filmes de ficção científica sobre IA', subtitle: 'De 2001 a Ex Machina — obras que anteciparam o debate que vivemos hoje.', date: '2025-05-09', likes: 241, readTime: 15, author: 'Rafael Mendes' },
  { id: 11, cat: 'jogos', title: 'Elden Ring DLC: análise técnica da engine e performance', subtitle: 'FromSoftware empurra os limites do hardware atual com mundo expandido e iluminação revisada.', date: '2025-05-08', likes: 192, readTime: 11, author: 'Ana Luíza Ribeiro' },
  { id: 12, cat: 'tech', title: 'Starlink e a democratização da internet via satélite', subtitle: 'Conectividade global de baixa latência muda economia rural e geopolítica da banda larga.', date: '2025-05-07', likes: 98, readTime: 9, author: 'Pedro Almeida' },
];

function getArticleUrl(id) {
  return `artigo.html?id=${id}`;
}

function getSearchUrl(query, cat = 'all') {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (cat && cat !== 'all') params.set('c', cat);
  const qs = params.toString();
  return `busca.html${qs ? `?${qs}` : ''}`;
}

function buildArticleBody(article) {
  const catName = CATEGORIES[article.cat].name;
  return `
    <p class="article-lead">${article.subtitle}</p>
    <p>O Observatório Tech acompanha de perto as movimentações em <strong>${catName}</strong>. O tema desta reportagem — <em>${article.title}</em> — reflete uma mudança que já aparece nas conversas de desenvolvedores, criadores e formuladores de política pública.</p>
    <h2>O contexto</h2>
    <p>Nos últimos meses, sinais convergentes indicam que estamos diante de uma transição mais profunda do que um ciclo de hype isolado. Empresas que antes observavam de longe agora alocam orçamento, talentos e narrativa de produto em torno dessa agenda.</p>
    <blockquote>“A pergunta deixou de ser <em>se</em> isso vai acontecer, e passou a ser <em>como</em> reorganizamos nossos fluxos quando acontecer.” — analista do setor</blockquote>
    <h2>Impactos práticos</h2>
    <p>Para o público do Observatório, três frentes merecem atenção: custo de adoção, mudanças de habilidade exigidas das equipes e o quadro regulatório em formação. Cada uma dessas dimensões evolui em velocidades diferentes — e é justamente essa assincronia que gera ruído nas manchetes.</p>
    <ul>
      <li>Adoção acelerada em produtos consumer e enterprise</li>
      <li>Pressão por transparência e auditoria de sistemas automatizados</li>
      <li>Convergência entre entretenimento, hardware e plataformas de software</li>
    </ul>
    <h2>O que vem a seguir</h2>
    <p>Continuaremos monitorando desdobramentos, entrevistas com especialistas e dados primários que ajudem a separar tendência estrutural de modismo passageiro. Se você acompanha ${catName}, este é um daqueles momentos para olhar o horizonte com calma — e curiosidade.</p>
  `;
}

const ARTICLES = ARTICLES_RAW.map(a => ({
  ...a,
  url: getArticleUrl(a.id),
  cover: ARTICLE_COVERS[a.id],
  excerpt: a.subtitle,
  body: buildArticleBody(a),
}));

function getArticleById(id) {
  return ARTICLES.find(a => a.id === Number(id));
}

function searchArticles(query, cat = 'all') {
  const q = (query || '').trim().toLowerCase();
  let items = [...ARTICLES];

  if (cat && cat !== 'all') {
    items = items.filter(a => a.cat === cat);
  }

  if (!q) return items;

  return items.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.subtitle.toLowerCase().includes(q) ||
    a.excerpt.toLowerCase().includes(q) ||
    CATEGORIES[a.cat].name.toLowerCase().includes(q)
  );
}

function renderNewsCard(article, options = {}) {
  const thumbUrl = options.thumb || NEWS_THUMBS[article.id] || article.cover;
  const thumb = thumbUrl
    ? `<div class="news-thumb" style="background-image:url('${thumbUrl}')"></div>`
    : '';

  return `
    <article class="news-card reveal" data-article-id="${article.id}" data-cat="${article.cat}">
      <a href="${article.url}" class="news-card__link">
        ${thumb}
        <div class="news-body">
          <span class="news-tag" data-cat="${article.cat}">${CATEGORIES[article.cat].name}</span>
          <h3 class="news-title">${article.title}</h3>
          <time class="news-date" datetime="${article.date}">${formatDate(article.date)}</time>
        </div>
      </a>
      <button type="button" class="like-btn" data-article-id="${article.id}" aria-label="Curtir artigo" aria-pressed="false">
        <svg class="like-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span class="like-count">0</span>
      </button>
    </article>
  `;
}

function formatDate(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function getArticlesByCategory(cat) {
  return ARTICLES.filter(a => a.cat === cat);
}
