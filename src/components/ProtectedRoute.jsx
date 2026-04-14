import { useEffect } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../constants/routes'

export function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, hasRole, loading, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  if (loading) return null

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return children
}
