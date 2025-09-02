import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiFetch } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        // Try fetching current user (API: GET /users/profile without id returns current user)
        const me = await apiFetch('/users/profile')
        setUser(me.data || me.user || me)
      } catch (err) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function login(credentials) {
    const res = await apiFetch('/auth/login', { method: 'POST', body: credentials })
    if (res?.token) localStorage.setItem('token', res.token)
    // After cookie set, fetch profile
    const userId=res._id
    const me = await apiFetch(`/users/profile/${userId}`)
    setUser(me.data || me.user || me)
    return me
  }

  async function register(payload) {
    const res = await apiFetch('/auth/signup', { method: 'POST', body: payload })
    if (res?.token) localStorage.setItem('token', res.token)
    const userId=res._id
    const me = await apiFetch(`/users/profile/${userId}`)
    setUser(me.data || me.user || me)
    return me
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
