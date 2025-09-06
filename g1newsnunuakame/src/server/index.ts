import express from 'express'
import cors from 'cors'
import { scrapeTop, scrapeSearch, scrapeArticle } from './scraper'
import { createCache } from './cache'

const app = express()
app.use(cors())
app.use(express.json())
const cache = createCache()
const PORT = process.env.PORT || 4000

app.get('/api/top', async (_, res) => {
  const cached = cache.get('top')
  if (cached) return res.json(cached)
  try {
    const articles = await scrapeTop()
    cache.set('top', articles, 60)
    res.json(articles)
  } catch {
    res.status(500).json({ error: 'scrape failed' })
  }
})

app.get('/api/search', async (req, res) => {
  const q = String(req.query.q || '')
  if (!q) return res.json([])
  const cacheKey = `search:${q}`
  const cached = cache.get(cacheKey)
  if (cached) return res.json(cached)
  try {
    const results = await scrapeSearch(q)
    cache.set(cacheKey, results, 60)
    res.json(results)
  } catch {
    res.status(500).json({ error: 'search failed' })
  }
})

app.get('/api/article', async (req, res) => {
  const raw = String(req.query.url || '')
  if (!raw) return res.status(400).json({ error: 'missing url' })
  try {
    const article = await scrapeArticle(raw)
    res.json(article)
  } catch {
    res.status(500).json({ error: 'article scrape failed' })
  }
})

app.listen(PORT, () => {
  console.log(`Monaco Univers server running on port ${PORT}`)
})