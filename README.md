# Observatório Tech

Site editorial sobre tecnologia, IA, filmes e jogos.

## Executar localmente

```bash
npm install
cp .env.example .env
# Edite .env e adicione sua ANTHROPIC_API_KEY
npm start
```

Abra [http://localhost:3000](http://localhost:3000).

## Páginas internas

| Página | URL |
|--------|-----|
| Artigo completo | `artigo.html?id=1` … `id=12` |
| Busca | `busca.html?q=termo&c=tech` |
| Categoria | `categoria.html?c=tech` |
| 404 temática | qualquer rota inexistente via `npm start` |

## Ferramentas de IA (Claude)

Requer servidor Node (`npm start`) — as chamadas passam pelo proxy em `server.js` para não expor a API key no navegador.

| Ferramenta | Endpoint |
|------------|----------|
| Assistente do Observatório (chat) | `POST /api/chat` |
| Resumidor de notícias | `POST /api/summarize` |
| Gerador de títulos | `POST /api/titles` |

Variáveis de ambiente (`.env`):

- `ANTHROPIC_API_KEY` — chave da API Anthropic (obrigatória)
- `CLAUDE_MODEL` — modelo Claude (padrão: `claude-sonnet-4-20250514`)
- `PORT` — porta do servidor (padrão: `3000`)
