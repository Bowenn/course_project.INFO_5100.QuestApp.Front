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
        <h1 className="landing-title">Quest App</h1>
        <p className="landing-tagline">The simple way to create tasks, find help, and get things done together.</p>
        <div className="landing-actions">
          <Link to={ROUTES.LOGIN} className="landing-cta">Get Started</Link>
          <Link to={ROUTES.REGISTER} className="landing-cta-secondary">Create an Account</Link>
        </div>
      </div>

      <div className="landing-features">
        <div className="landing-feature">
          <div className="landing-feature-icon">&#128221;</div>
          <h3>Post Tasks</h3>
          <p>Create tasks you need help with and post them</p>
        </div>
        <div className="landing-feature">
          <div className="landing-feature-icon">&#128269;</div>
          <h3>Browse &amp; Accept</h3>
          <p>Accept tasks that you are interested in</p>
        </div>
        <div className="landing-feature">
          <div className="landing-feature-icon">&#9989;</div>
          <h3>Track Progress</h3>
          <p>Track status in real time</p>
        </div>
      </div>
    </div>
  )
}
