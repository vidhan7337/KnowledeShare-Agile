import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  // const handleSearchSubmit = async (e) => {
  //   e.preventDefault();
  //   const q = e.currentTarget.search.value; window.location.href = '/?q=' + encodeURIComponent(q)
  // }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">Knowledge</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarsExample" aria-controls="navbarsExample" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarsExample">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/ask">Ask</Link></li>
            {isAuthenticated && <li className="nav-item"><Link className="nav-link" to="/profile">Profile</Link></li>}
          </ul>
          {/* <form className="d-flex" role="search" onSubmit={handleSearchSubmit}>
            <input className="form-control me-2" name="search" type="search" placeholder="Search..." aria-label="Search"/>
            <button className="btn btn-outline-success" type="submit">Search</button>
          </form> */}
          <ul className="navbar-nav ms-3">
            {!isAuthenticated ? (
              <>
                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
              </>
            ) : (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  {user?.name || 'User'}
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
