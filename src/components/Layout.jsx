import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../constants/routes'
import { ROLES } from '../constants/roles'
import './Layout.css'

export function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="layout">
      <header className="layout-header">
        <nav className="layout-nav">
          <NavLink to={ROUTES.HOME} className="layout-brand">
            Quest App
          </NavLink>
          <div className="layout-links">
            <NavLink to={ROUTES.TAKER} end>
              Browse Tasks
            </NavLink>
            <NavLink to={ROUTES.TAKER_PICKED}>My Picked</NavLink>
            <NavLink to={ROUTES.TAKER_FINISHED}>Finished</NavLink>
            {user?.role === ROLES.GIVER && (
              <NavLink to={ROUTES.GIVER}>My Tasks</NavLink>
            )}
            {user?.role === ROLES.ADMIN && (
              <NavLink to={ROUTES.ADMIN}>Admin</NavLink>
            )}
            {!user && <NavLink to={ROUTES.LOGIN}>Login (Giver/Admin)</NavLink>}
            {user && (
              <button type="button" onClick={logout} className="layout-logout">
                Logout
              </button>
            )}
          </div>
        </nav>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}
