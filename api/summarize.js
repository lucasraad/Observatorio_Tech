import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { text } = req.body

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Você resume textos sobre tecnologia, IA, filmes e jogos. 
        Responda APENAS com JSON no formato: {"summary":"resumo em 2 frases","category":"tech|ia|filmes|jogos"}.
        Sem markdown, sem texto fora do JSON.`
      },
      { role: 'user', content: text }
    ],
    max_tokens: 200
  })

  try {
    const parsed = JSON.parse(completion.choices[0].message.content)
    return res.status(200).json(parsed)
  } catch {
    return res.status(200).json({
      summary: completion.choices[0].message.content,
      category: 'tech'
    })
  }
}