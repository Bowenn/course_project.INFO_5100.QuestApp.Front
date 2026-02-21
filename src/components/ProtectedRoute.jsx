import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../constants/routes'

/**
 * Protects routes that require authentication (Giver, Admin).
 * Redirects to login if not authenticated.
 */
export function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, hasRole } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return (
      <Navigate to={ROUTES.LOGIN} state={{ from: location, requiredRole }} replace />
    )
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return children
}
