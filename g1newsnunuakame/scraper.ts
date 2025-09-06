
import express from 'express'
import axios from 'axios'
import * as cheerio from 'cheerio'
import cors from 'cors'

const app = express()
app.use(cors())

app.get('/api/noticias', async (req, res) => {
  try {
    const response = await axios.get('https://g1.globo.com/')
    const html = response.data
    const $ = cheerio.load(html)
    const noticias: {titulo: string, link: string}[] = []
    $('.feed-post-link').each((_, el) => {
      const titulo = $(el).text().trim()
      const link = $(el).attr('href')
      if (titulo && link) noticias.push({ titulo, link })
    })
    res.json(noticias)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar notícias' })
  }
})

app.get('/api/pesquisa', async (req, res) => {
  try {
    const q = req.query.q as string
    const nunuUrl = `https://g1.globo.com/busca/?q=${encodeURIComponent(q)}`
    const { data: nunuData } = await axios.get(nunuUrl)
    const nunu$ = cheerio.load(nunuData)
    const nunuResultados: any[] = []
    nunu$('.widget--info').each((_, nunuElement) => {
      const nunuTitulo = nunu$(nunuElement).find('.widget--info__title').text().trim()
      const nunuDescricao = nunu$(nunuElement).find('.widget--info__description').text().trim()
      const nunuLink = nunu$(nunuElement).find('a').attr('href')
      const nunuCategoria = nunu$(nunuElement).find('.widget--info__header').text().trim()
      const nunuTempo = nunu$(nunuElement).find('.widget--info__meta').text().trim()
      if (nunuTitulo && nunuLink) {
        nunuResultados.push({
          titulo: nunuTitulo,
          descricao: nunuDescricao,
          link: `https:${nunuLink}`,
          categoria: nunuCategoria,
          tempo: nunuTempo
        })
      }
    })
    res.json(nunuResultados)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar resultados' })
  }
})

const PORT = 4000
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))
