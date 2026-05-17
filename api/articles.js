import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const { category } = req.query

  let query = supabase
    .from('articles')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json(data)
}