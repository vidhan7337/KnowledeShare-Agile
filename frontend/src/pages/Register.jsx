import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name:'', email: '', password: '' })
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Registration failed')
    }
  }

  return (
    <div className="container py-4" style={{maxWidth: 520}}>
      <h2 className="mb-3">Register</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit} className="row g-3">
        <div className="col-12">
          <label className="form-label">Name</label>
          <input type="text" className="form-control" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
        </div>
        <div className="col-12">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
        </div>
        <div className="col-12">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required />
        </div>
        <div className="col-12 d-flex gap-2">
          <button className="btn btn-primary" type="submit">Create account</button>
          <Link className="btn btn-link" to="/login">Have an account? Login</Link>
        </div>
        <div className="form-text">This app supports cookie-based auth. Register should set a JWT cookie via Set-Cookie.</div>
      </form>
    </div>
  )
}
