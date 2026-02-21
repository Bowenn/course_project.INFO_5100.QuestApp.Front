import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TasksProvider } from './context/TasksContext'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { TakerHome } from './pages/taker/TakerHome'
import { TakerPickedTasks } from './pages/taker/TakerPickedTasks'
import { TakerFinishedTasks } from './pages/taker/TakerFinishedTasks'
import { GiverHome } from './pages/giver/GiverHome'
import { AdminHome } from './pages/admin/AdminHome'
import { ROUTES } from './constants/routes'
import { ROLES } from './constants/roles'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TasksProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path={ROUTES.HOME} element={<LandingPage />} />
              <Route path={ROUTES.TAKER} element={<TakerHome />} />
              <Route path={ROUTES.TAKER_PICKED} element={<TakerPickedTasks />} />
              <Route path={ROUTES.TAKER_FINISHED} element={<TakerFinishedTasks />} />
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route
                path={ROUTES.GIVER}
                element={
                  <ProtectedRoute requiredRole={ROLES.GIVER}>
                    <GiverHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN}
                element={
                  <ProtectedRoute requiredRole={ROLES.ADMIN}>
                    <AdminHome />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
        </TasksProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
