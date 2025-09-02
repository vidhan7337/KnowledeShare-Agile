import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../api/client'

export default function AskQuestion() {
  const [form, setForm] = useState({ title: '', body: '', tags: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        title: form.title,
        body: form.body,
        tags: form.tags.split(',').map(s=>s.trim()).filter(Boolean)
      }
      const res = await apiFetch('/questions', { method: 'POST', body: payload, withAuth: true })
      const id = res.data?._id || res._id || res.id || (res.data && res.data._id)
      navigate(`/questions/${id}`)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="container py-4" style={{maxWidth: 800}}>
      <h3 className="mb-3">Ask a Question</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form className="row g-3" onSubmit={onSubmit}>
        <div className="col-12">
          <label className="form-label">Title</label>
          <input className="form-control" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
        </div>
        <div className="col-12">
          <label className="form-label">Body</label>
          <textarea className="form-control" rows="6" value={form.body} onChange={e=>setForm({...form, body:e.target.value})} required />
        </div>
        <div className="col-12">
          <label className="form-label">Tags (comma separated)</label>
          <input className="form-control" value={form.tags} onChange={e=>setForm({...form, tags:e.target.value})} />
        </div>
        <div className="col-12">
          <button className="btn btn-primary" type="submit">Post Question</button>
        </div>
      </form>
    </div>
  )
}
