import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import './LandingPage.css'

export function LandingPage() {
  return (
    <div className="landing">
      <h1>Quest App</h1>
      <p className="landing-tagline">Find tasks. Complete them. Get things done.</p>

      <div className="landing-roles">
        <Link to={ROUTES.TAKER} className="landing-card">
          <h2>Taker</h2>
          <p>Browse tasks, pick them up, and mark them done. No login required to browse.</p>
        </Link>
        <Link to={ROUTES.GIVER} className="landing-card">
          <h2>Giver</h2>
          <p>Create, modify, and cancel tasks. Login required.</p>
        </Link>
        <Link to={ROUTES.ADMIN} className="landing-card">
          <h2>Admin</h2>
          <p>Manage the platform. Login required.</p>
        </Link>
      </div>
    </div>
  )
}
