import { createContext, useContext, useState, useCallback } from 'react'
import { ROLES } from '../constants/roles'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // { id, email, role }

  const login = useCallback((email, password, role) => {
    // TODO: Replace with real API call
    const id = role === ROLES.GIVER ? 'g1' : role === ROLES.ADMIN ? 'admin1' : '1'
    setUser({
      id,
      email,
      role,
    })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole: (role) => user?.role === role,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
