import React, { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [topUsers, setTopUsers] = useState([])

  useEffect(() => {
    (async () => {
      try {
        const p = await apiFetch('/users/profile')
        setProfile(p.data || p)
      } catch {}
      try {
        const s = await apiFetch('/users/stats')
        setStats(s.data || s)
      } catch {}
      try {
        const t = await apiFetch('/users/top?limit=10')
        setTopUsers(t.data?.users || t.users || t.data || t)
      } catch {}
    })()
  }, [])

  return (
    <div className="container py-4">
      <h3>Profile</h3>
      {!profile ? <div>Loading...</div> : (
        <div className="card mb-3">
          <div className="card-body">
            <h4 className="card-title">{profile.name}</h4>
            <div>Email: {profile.email}</div>
            {'reputation' in profile && <div>Reputation: <span className="badge text-bg-info">{profile.reputation}</span></div>}
          </div>
        </div>
      )}

      {stats && (
        <div className="row g-3">
          <div className="col-md-4">
            <div className="card"><div className="card-body">
              <div className="h6">Questions</div>
              <div className="display-6">{stats.questionsCount ?? '-'}</div>
            </div></div>
          </div>
          <div className="col-md-4">
            <div className="card"><div className="card-body">
              <div className="h6">Answers</div>
              <div className="display-6">{stats.answersCount ?? '-'}</div>
            </div></div>
          </div>
          <div className="col-md-4">
            <div className="card"><div className="card-body">
              <div className="h6">Comments</div>
              <div className="display-6">{stats.commentsCount ?? '-'}</div>
            </div></div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <h5>Top Users</h5>
        <ul className="list-group">
          {topUsers.map(u => (
            <li key={u._id || u.id} className="list-group-item d-flex justify-content-between">
              <span>{u.name}</span>
              <span className="badge text-bg-secondary">{u.reputation ?? '-'}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
