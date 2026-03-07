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
            {user && <NavLink to={ROUTES.DASHBOARD}>Dashboard</NavLink>}
            {user?.role === ROLES.ADMIN && (
              <NavLink to={ROUTES.ADMIN}>Admin</NavLink>
            )}
            {!user && <NavLink to={ROUTES.LOGIN}>Login</NavLink>}
            {!user && <NavLink to={ROUTES.REGISTER}>Register</NavLink>}
            {user && (
              <span className="layout-user">
                {user.username} ({user.role})
              </span>
            )}
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
