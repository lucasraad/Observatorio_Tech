import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { description } = req.body

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Você gera títulos jornalísticos para o Observatório Tech, portal sobre tecnologia, IA, filmes e jogos.
        Responda APENAS com JSON no formato: {"titles":["título 1","título 2","título 3"]}.
        Títulos devem ser diretos, informativos e em português. Sem markdown, sem texto fora do JSON.`
      },
      { role: 'user', content: description }
    ],
    max_tokens: 200
  })

  try {
    const parsed = JSON.parse(completion.choices[0].message.content)
    return res.status(200).json(parsed)
  } catch {
    return res.status(200).json({ titles: [] })
  }
}