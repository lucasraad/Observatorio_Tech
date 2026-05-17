import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

const SITE_SYSTEM = `Você é o Assistente do Observatório Tech, portal editorial brasileiro sobre tecnologia, inteligência artificial, filmes e jogos.
Responda sempre em português do Brasil, com tom curioso, claro e acessível — como uma revista digital de cultura tech.
Mantenha respostas concisas (2–4 parágrafos curtos no máximo, salvo se o usuário pedir detalhes).
Foque nos temas: tecnologia, IA, cinema/ficção científica e games. Se a pergunta for fora do escopo, redirecione gentilmente.`;

app.use(express.json({ limit: '48kb' }));

async function callClaude({ system, messages, max_tokens = 1024 }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const err = new Error('Configure ANTHROPIC_API_KEY no arquivo .env');
    err.code = 'API_KEY_MISSING';
    throw err;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens,
      system,
      messages,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.error?.message || 'Erro na API Anthropic');
    err.status = response.status;
    throw err;
  }

  const text = data.content?.find(b => b.type === 'text')?.text?.trim() || '';
  return text;
}

function parseJsonBlock(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Resposta inválida da IA');
  return JSON.parse(match[0]);
}

function handleError(res, err) {
  console.error(err);
  if (err.code === 'API_KEY_MISSING') {
    return res.status(503).json({ error: err.message });
  }
  if (err.status === 429) {
    return res.status(429).json({ error: 'Limite de requisições atingido. Tente novamente em instantes.' });
  }
  return res.status(500).json({ error: err.message || 'Erro interno do servidor' });
}

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: 'Mensagens inválidas' });
    }

    const sanitized = messages.slice(-20).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, 4000),
    }));

    const reply = await callClaude({
      system: SITE_SYSTEM,
      messages: sanitized,
      max_tokens: 1024,
    });

    res.json({ reply });
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/api/summarize', async (req, res) => {
  try {
    const text = String(req.body.text || '').trim();
    if (text.length < 80) {
      return res.status(400).json({ error: 'Cole um texto com pelo menos 80 caracteres.' });
    }
    if (text.length > 12000) {
      return res.status(400).json({ error: 'Texto muito longo (máx. 12.000 caracteres).' });
    }

    const raw = await callClaude({
      system: `Você classifica e resume notícias para o Observatório Tech.
Responda APENAS com JSON válido, sem markdown, no formato:
{"summary":"resumo em 2-3 frases em pt-BR","category":"tech|ia|filmes|jogos","categoryLabel":"nome da categoria em pt-BR"}
Categorias: tech=Tecnologia, ia=Inteligência Artificial, filmes=Filmes, jogos=Jogos.`,
      messages: [{ role: 'user', content: `Resuma e categorize:\n\n${text}` }],
      max_tokens: 512,
    });

    const parsed = parseJsonBlock(raw);
    const validCats = ['tech', 'ia', 'filmes', 'jogos'];
    if (!validCats.includes(parsed.category)) parsed.category = 'tech';

    res.json({
      summary: parsed.summary || raw,
      category: parsed.category,
      categoryLabel: parsed.categoryLabel || parsed.category,
    });
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/api/titles', async (req, res) => {
  try {
    const description = String(req.body.description || '').trim();
    if (description.length < 20) {
      return res.status(400).json({ error: 'Descreva a notícia com pelo menos 20 caracteres.' });
    }
    if (description.length > 2000) {
      return res.status(400).json({ error: 'Descrição muito longa (máx. 2.000 caracteres).' });
    }

    const raw = await callClaude({
      system: `Você é editor de manchetes do Observatório Tech — tom sofisticado, curioso, com peso editorial (estilo Cinzel/Raleway).
Gere títulos em português do Brasil, impactantes mas não clickbait extremo.
Responda APENAS com JSON válido: {"titles":["título 1","título 2","título 3"]}`,
      messages: [{ role: 'user', content: `Sugira 3 títulos para esta notícia:\n\n${description}` }],
      max_tokens: 512,
    });

    const parsed = parseJsonBlock(raw);
    const titles = (parsed.titles || []).filter(Boolean).slice(0, 3);
    if (titles.length < 1) throw new Error('Não foi possível gerar títulos');

    res.json({ titles });
  } catch (err) {
    handleError(res, err);
  }
});

app.use(express.static(__dirname));

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.status(404).sendFile(path.join(__dirname, '404.html'));
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Observatório Tech → http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠ ANTHROPIC_API_KEY não definida — ferramentas de IA indisponíveis.');
  }
});
