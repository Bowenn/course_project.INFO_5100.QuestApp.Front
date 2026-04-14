import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { ROUTES } from '../constants/routes'
import './LoginPage.css'

export function RegisterPage() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (field) => (e) => setFormData((d) => ({ ...d, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.confirm) {
      setError('Passwords do not match')
      return
    }
    setSubmitting(true)
    try {
      await authAPI.register(formData.username, formData.email, formData.password, 'GIVER')
      // Auto-login after registration
      await login(formData.email, formData.password)
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Create Account</h1>
        <p className="login-subtitle">Sign up to start posting and accepting tasks.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={set('username')}
              placeholder="yourname"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={set('email')}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={set('password')}
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              type="password"
              value={formData.confirm}
              onChange={set('confirm')}
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p className="login-note">
          Already have an account? <Link to={ROUTES.LOGIN}>Log in</Link>
        </p>
      </div>
    </div>
  )
}
