import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../constants/routes'
import { ROLES } from '../constants/roles'
import './LandingPage.css'

export function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="landing">
      <h1>Quest App</h1>
      <p className="landing-tagline">Create tasks. Accept them. Get things done.</p>

      <div className="landing-roles">
        <Link to={user ? ROUTES.DASHBOARD : ROUTES.LOGIN} className="landing-card">
          <h2>User</h2>
          <p>Create tasks, browse available tasks, and accept them. Login required.</p>
        </Link>
        <Link
          to={user?.role === ROLES.ADMIN ? ROUTES.ADMIN : ROUTES.LOGIN}
          className="landing-card"
        >
          <h2>Admin</h2>
          <p>View all tasks and users, delete tasks. Admin login required.</p>
        </Link>
      </div>

      {!user && (
        <Link to={ROUTES.LOGIN} className="landing-cta">
          Get Started — Log In
        </Link>
      )}
    </div>
  )
}
