import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '../api/client'
import { debounce } from '../utils/debounce'

export default function Dashboard() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const q = params.get('q') || ''
  const [search, setSearch] = useState(q)
  const [questions, setQuestions] = useState([])
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const doSearch = useMemo(() => debounce(async (term) => {
    setLoading(true); setError('')
    try {
      let data
      if (term && term.trim()) {
        data = await apiFetch(`/questions/search/text?q=${encodeURIComponent(term)}&page=1&limit=100`)
      } else {
        data = await apiFetch('/questions/recent?page=1&limit=100')
      }
      setQuestions(data.questions || data.data?.questions || data.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, 400), [])

  useEffect(() => { doSearch(q) }, [q])

  useEffect(() => {
    (async () => {
      try {
        const t = await apiFetch('/questions/trending?limit=100')
        setTrending(t.data || t.tags || t)
      } catch {}
    })()
  }, [])

  // Update search input when URL changes
  useEffect(() => { setSearch(q) }, [q])

  // Handle search input change
  function handleSearchChange(e) {
    setSearch(e.target.value)
    navigate(`?q=${encodeURIComponent(e.target.value)}`)
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="m-0">Recent Questions</h3>
        <Link className="btn btn-primary" to="/ask">Ask Question</Link>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search questions..."
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? <div>Loading...</div> : (
        <div className="list-group">
          {questions.map((q) => (
            <Link key={q._id || q.id} to={`/questions/${q._id || q.id}`} className="list-group-item list-group-item-action">
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">{q.title}</h5>
                <small>{new Date(q.createdAt || q.created_at || Date.now()).toLocaleString()}</small>
              </div>
              <p className="mb-1 text-truncate">{q.body}</p>
              <div className="d-flex gap-2">
                {(q.tags || []).map(tag => <span key={tag} className="badge text-bg-secondary">{tag}</span>)}
              </div>
            </Link>
          ))}
          {questions.length === 0 && <div className="text-muted">No questions.</div>}
        </div>
      )}
    </div>
  )
}
