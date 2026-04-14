import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authAPI, usersAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // user: { id, username, email, role, createdAt } or null
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    usersAPI.me()
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  // Listen for token expiration events
  useEffect(() => {
    const handleTokenExpired = () => {
      setUser(null)
    }
    window.addEventListener('token-expired', handleTokenExpired)
    return () => window.removeEventListener('token-expired', handleTokenExpired)
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login(email, password)
    localStorage.setItem('token', res.data.token)
    // Fetch full profile (id, username, role, etc.)
    const meRes = await usersAPI.me()
    setUser(meRes.data)
    return meRes.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  // Call after a successful profile update to store the new token and user
  const updateUser = useCallback((newToken, newUserData) => {
    if (newToken) {
      localStorage.setItem('token', newToken)
    }
    setUser(newUserData)
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    hasRole: (role) => user?.role === role,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
