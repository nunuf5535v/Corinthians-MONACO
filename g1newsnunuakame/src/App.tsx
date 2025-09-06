import React, { useEffect, useState } from 'react'

type Article = {
  titulo?: string
  link?: string
  descricao?: string
  categoria?: string
  tempo?: string
}

export default function App() {
  const [top, setTop] = useState<Article[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/top')
      .then(r => r.json())
      .then(data => setTop(data))
      .catch(() => setTop([]))
  }, [])

  async function doSearch(q: string) {
    if (!q) return setResults([])
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const json = await res.json()
      setResults(json)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      doSearch(query)
    }, 500)
    return () => clearTimeout(timer)
  }, [query])

  function openExternal(link?: string) {
    if (!link) return
    window.open(link, '_blank')
  }

  const categories = ['Corinthians', 'Filmes', 'Jogos', 'Animes', 'Música']

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">Mônaco Univers</h1>
            <p className="text-sm text-slate-500">Notícias, cultura pop, esportes e mais</p>
          </div>
          <div className="flex gap-2">
            <input
              className="border rounded-md px-3 py-2 w-80"
              placeholder="Pesquisar no Monaco Univers"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md" onClick={() => doSearch(query)}>
              Buscar
            </button>
          </div>
        </div>

        <nav className="mt-4 flex gap-3">
          {categories.map(cat => (
            <button key={cat} onClick={() => { setQuery(cat); doSearch(cat) }} className="text-sm px-3 py-1 bg-white border rounded-md">
              {cat}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Principais notícias</h2>
          <div className="space-y-4">
            {top.map((a, i) => (
              <article key={i} className="bg-white p-4 rounded-md shadow-sm flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg cursor-pointer" onClick={() => openExternal(a.link)}>{a.titulo}</h3>
                  <div className="text-sm text-slate-500 mt-1">{a.link}</div>
                </div>
                <div>
                  <button className="text-sm text-indigo-600" onClick={() => openExternal(a.link)}>ver</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside>
          <h3 className="text-lg font-semibold mb-3">Resultados</h3>
          <div className="bg-white p-4 rounded-md shadow-sm min-h-[200px]">
            {loading && <div>carregando...</div>}
            {!loading && results.length === 0 && <div className="text-sm text-slate-500">Pesquise por algo ou clique em uma categoria</div>}
            <ul className="space-y-3">
              {results.map((r, i) => (
                <li key={i} className="border-b pb-2">
                  <a className="font-medium block cursor-pointer" onClick={() => openExternal(r.link)}>{r.titulo}</a>
                  <div className="text-xs text-slate-500 mt-1">{r.categoria} • {r.tempo}</div>
                  <p className="text-sm mt-1">{r.descricao}</p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>

      <footer className="max-w-6xl mx-auto mt-8 text-sm text-slate-500">
        <div>Feito para o Monaco Univers — use com responsabilidade</div>
      </footer>
    </div>
  )
}