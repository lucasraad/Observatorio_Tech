/* ── SUPABASE: buscar artigos ── */
async function fetchArticles(category = null) {
    const url = category ? `/api/articles?category=${category}` : '/api/articles'
    const res  = await fetch(url)
    const data = await res.json()
    return data
  }
  
  function getCategoryLabel(cat) {
    const map = {
      tecnologia: { label: 'Tecnologia',             color: '#1a8fff' },
      ia:         { label: 'Inteligência Artificial', color: '#a855f7' },
      filmes:     { label: 'Filmes',                  color: '#ef4444' },
      jogos:      { label: 'Jogos',                   color: '#22c55e' },
    }
    return map[cat] || { label: cat, color: '#c9a84c' }
  }
  
  function renderArticles(articles) {
    const grid = document.querySelector('#noticias .news-grid')
    if (!grid) return
  
    grid.innerHTML = ''
  
    if (!articles.length) {
      grid.innerHTML = '<p style="color:var(--fg-muted)">Nenhum artigo encontrado.</p>'
      return
    }
  
    articles.forEach(article => {
      const cat  = getCategoryLabel(article.category)
      const date = new Date(article.created_at).toLocaleDateString('pt-BR')
  
      grid.innerHTML += `
        <article class="news-card">
          <div class="news-tag" style="color:${cat.color};border-color:${cat.color}">
            ${cat.label}
          </div>
          <h3 class="news-title">${article.title}</h3>
          <p class="news-summary">${article.summary || ''}</p>
          <div class="news-footer">
            <span class="news-author">${article.author}</span>
            <span class="news-date">${date}</span>
          </div>
        </article>
      `
    })
  }
  
  async function initArticles() {
    const section = document.getElementById('noticias')
    if (!section) return
  
    const grid = section.querySelector('.news-grid')
    grid.innerHTML = '<p style="color:var(--fg-muted);letter-spacing:0.1em">Carregando...</p>'
  
    const articles = await fetchArticles()
    renderArticles(articles)
  
    section.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        section.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
  
        const cat  = btn.dataset.filter
        const data = await fetchArticles(cat === 'todos' ? null : cat)
        renderArticles(data)
      })
    })
  }
  
  initArticles()