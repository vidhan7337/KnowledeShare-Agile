import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AskQuestion from './pages/AskQuestion'
import QuestionDetails from './pages/QuestionDetails'
import Profile from './pages/Profile'
import { useAuth } from './context/AuthContext'

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="container py-5">Loading...</div>
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/ask" element={<PrivateRoute><AskQuestion /></PrivateRoute>} />
        <Route path="/questions/:id" element={<QuestionDetails />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="*" element={<div className="container py-5">Not found</div>} />
      </Routes>
    </>
  )
}
