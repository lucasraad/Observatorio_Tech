import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { messages } = req.body

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Você é o Assistente do Observatório Tech, um portal sobre tecnologia, IA, filmes e jogos. 
        Responda de forma concisa e informativa em português. Se a pergunta não for relacionada a essas áreas, 
        redirecione gentilmente para os temas do portal.`
      },
      ...messages
    ],
    max_tokens: 500
  })

  return res.status(200).json({
    reply: completion.choices[0].message.content
  })
}