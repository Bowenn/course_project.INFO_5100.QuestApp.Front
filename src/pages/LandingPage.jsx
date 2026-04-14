import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../constants/routes'
import { ROLES } from '../constants/roles'
import './LandingPage.css'

export function LandingPage() {
  const { user } = useAuth()

  // Logged-in users go straight to their destination
  if (user) {
    return <Navigate to={user.role === ROLES.ADMIN ? ROUTES.ADMIN : ROUTES.DASHBOARD} replace />
  }

  return (
    <div className="landing">
      <div className="landing-hero">
        <p className="landing-sup">Task payment made simple</p>
        <h1 className="landing-title">Quest App</h1>
        <p className="landing-tagline">Post tasks with a bounty, accept work, and confirm completion — all in one place.</p>
        <div className="landing-actions">
          <Link to={ROUTES.LOGIN} className="landing-cta">Log in</Link>
          <Link to={ROUTES.REGISTER} className="landing-cta landing-cta-secondary">Create account</Link>
        </div>
        <p className="landing-note">Free to use. No setup required.</p>
      </div>
    </div>
  )
}
