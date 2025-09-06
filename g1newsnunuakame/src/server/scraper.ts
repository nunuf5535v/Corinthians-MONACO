import axios from 'axios'
import cheerio from 'cheerio'

export async function scrapeTop() {
  const response = await axios.get('https://g1.globo.com/')
  const html = response.data
  const $ = cheerio.load(html)
  const noticias: { titulo: string; link: string }[] = []

  $('.feed-post-link').each((i, el) => {
    const titulo = $(el).text().trim()
    const link = $(el).attr('href')
    if (titulo && link) {
      noticias.push({ titulo, link })
    }
  })

  return noticias
}

export async function scrapeSearch(q: string) {
  const nunuUrl = `https://g1.globo.com/busca/?q=${encodeURIComponent(q)}`
  const { data: nunuData } = await axios.get(nunuUrl)
  const nunu$ = cheerio.load(nunuData)
  const nunuResultados: any[] = []

  nunu$('.widget--info').each((_, nunuElement) => {
    const nunuTitulo = nunu$(nunuElement).find('.widget--info__title').text().trim()
    const nunuDescricao = nunu$(nunuElement).find('.widget--info__description').text().trim()
    const nunuLinkRel = nunu$(nunuElement).find('a').attr('href')
    const nunuCategoria = nunu$(nunuElement).find('.widget--info__header').text().trim()
    const nunuTempo = nunu$(nunuElement).find('.widget--info__meta').text().trim()
    if (nunuTitulo && nunuLinkRel) {
      const nunuLink = nunuLinkRel.startsWith('http') ? nunuLinkRel : `https:${nunuLinkRel}`
      nunuResultados.push({ titulo: nunuTitulo, descricao: nunuDescricao, link: nunuLink, categoria: nunuCategoria, tempo: nunuTempo })
    }
  })

  return nunuResultados
}

export async function scrapeArticle(url: string) {
  const { data } = await axios.get(url)
  const $ = cheerio.load(data)
  const title = $('h1.content-head__title').first().text().trim() || $('h1').first().text().trim()
  const summary = $('h2.content-head__subtitle').text().trim() || $('.materia-subtitulo').text().trim()
  const paragraphs: string[] = []
  $('.content-text__container p, .mc-body p').each((_, el) => {
    const p = $(el).text().trim()
    if (p) paragraphs.push(p)
  })
  const image = $('meta[property="og:image"]').attr('content') || $('img').first().attr('src') || ''
  const published = $('meta[property="article:published_time"]').attr('content') || $('time').attr('datetime') || ''
  return { title, summary, content: paragraphs.join('\n\n'), image, published, url }
}