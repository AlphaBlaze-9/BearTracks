import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * ProtectedRoute
 * --------------
 * Wrap any route that should require login.
 *
 * If the user is not logged in, we redirect to /login and
 * remember where they were going so we can send them back after.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthed, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hero">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand-blue/20 border-t-brand-blue" />
          <div className="absolute inset-x-0 -bottom-8 text-center text-xs font-bold uppercase tracking-widest text-brand-blue animate-pulse">
            Authenticating
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
