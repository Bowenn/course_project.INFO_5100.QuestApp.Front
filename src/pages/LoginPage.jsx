import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../constants/routes'
import { ROLES } from '../constants/roles'
import './LoginPage.css'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(ROLES.GIVER)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || ROUTES.HOME
  const requiredRole = location.state?.requiredRole

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter email and password')
      return
    }

    // TODO: Replace with real API validation
    login(email, password, role)
    navigate(from, { replace: true })
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Login</h1>
        <p className="login-subtitle">
          Givers and Admins must log in to manage tasks.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value={ROLES.GIVER}>Giver</option>
              <option value={ROLES.ADMIN}>Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn">
            Log In
          </button>
        </form>

        <p className="login-note">
          Demo: Enter any email/password to log in. Backend auth coming soon.
        </p>
      </div>
    </div>
  )
}
