import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function QuestionDetails() {
  const { id } = useParams()
  const [question, setQuestion] = useState(null)
  const [answers, setAnswers] = useState([])
  const [comments, setComments] = useState([])
  const [newAnswer, setNewAnswer] = useState('')
  const [newComment, setNewComment] = useState('')
  const [error, setError] = useState('')
  const { isAuthenticated } = useAuth()

  async function loadAll() {
    try {
      const q = await apiFetch(`/questions/${id}`)
      setQuestion(q.data || q)
      const a = await apiFetch(`/answers/questions/${id}/answers`)
      setAnswers(a.data?.answers || a.answers || a.data || a)
      const c = await apiFetch(`/comments/Question/${id}?page=1&limit=20`)
      setComments(c.data?.comments || c.comments || c.data || c)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => { loadAll() }, [id])

  async function voteQuestion(voteType) {
    try {
      await apiFetch(`/questions/${id}/vote`, { method: 'POST', body: { voteType }, withAuth: true })
      await loadAll()
    } catch (err) { setError(err.message) }
  }

  async function postAnswer() {
    try {
      await apiFetch(`/answers/questions/${id}/answers`, { method: 'POST', body: { body: newAnswer }, withAuth: true })
      setNewAnswer('')
      await loadAll()
    } catch (err) { setError(err.message) }
  }

  async function commentOnQuestion() {
    try {
      await apiFetch(`/comments/Question/${id}`, { method: 'POST', body: { body: newComment }, withAuth: true })
      setNewComment('')
      await loadAll()
    } catch (err) { setError(err.message) }
  }

  async function voteAnswer(ansId, voteType) {
    try {
      await apiFetch(`/answers/${ansId}/vote`, { method: 'POST', body: { voteType }, withAuth: true })
      await loadAll()
    } catch (err) { setError(err.message) }
  }

  return (
    <div className="container py-4">
      {error && <div className="alert alert-danger">{error}</div>}
      {!question ? <div>Loading...</div> : (
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">{question.title}</h4>
            <div className="mb-2 d-flex gap-2">
              {(question.tags || []).map(t => <span key={t} className="badge text-bg-secondary">{t}</span>)}
            </div>
            <p className="card-text">{question.body}</p>
            <p className="card-text">Votes : {question.votes}</p>
            <div className="d-flex gap-2">
              <button className={`btn btn-sm ${question.userVote === 'upvote' ? 'btn-success' : 'btn-outline-success'}`} onClick={()=>voteQuestion('upvote')}>Upvote</button>
              <button className={`btn btn-sm ${question.userVote === 'downvote' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={()=>voteQuestion('downvote')}>Downvote</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <h5>Answers</h5>
        {(answers || []).map(ans => (
          <div key={ans._id || ans.id} className="card mb-2">
            <div className="card-body">
              <p className="card-text">{ans.body}</p>
              <p className="card-text">Votes : {ans.votes}</p>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-success btn-sm" onClick={()=>voteAnswer(ans._id || ans.id, 'upvote')}>Upvote</button>
                <button className="btn btn-outline-danger btn-sm" onClick={()=>voteAnswer(ans._id || ans.id, 'downvote')}>Downvote</button>
              </div>
            </div>
          </div>
        ))}

        {isAuthenticated && (
          <div className="card mt-3">
            <div className="card-body">
              <h6>Post an answer</h6>
              <textarea className="form-control mb-2" rows="4" value={newAnswer} onChange={e=>setNewAnswer(e.target.value)} />
              <button className="btn btn-primary" onClick={postAnswer} disabled={!newAnswer.trim()}>Submit</button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <h5>Comments</h5>
        {(comments || []).map(c => (
          <div key={c._id || c.id} className="border rounded p-2 mb-2">
            <div>{c.body}</div>
          </div>
        ))}
        {isAuthenticated && (
          <div className="input-group mt-2">
            <input className="form-control" placeholder="Add a comment..." value={newComment} onChange={e=>setNewComment(e.target.value)} />
            <button className="btn btn-outline-primary" onClick={commentOnQuestion} disabled={!newComment.trim()}>Comment</button>
          </div>
        )}
      </div>
    </div>
  )
}
